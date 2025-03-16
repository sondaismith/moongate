<script lang="ts">
import { reactive } from 'vue';
import {FeedEnums} from '../enums/FeedEnums';
import { IFeedColumnSettings, IFeedDescription, IFeedListing, IFeedDBData } from '../interfaces/FeedInterfaces';
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { getAuthorFeed, getTagPosts } from '../lib/api/Feed.vue';
import { HandleAPIError, IsError } from '../helpers/errors';
import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { getUserProfile } from '../lib/api/User.vue';

//Code from Mulan at https://stackoverflow.com/a/27747377
function dec2hex (dec: number) {
    return dec.toString(16).padStart(2, "0")
}
//Code from Mulan at https://stackoverflow.com/a/27747377
export function GenerateUniqueId(len: number) : string{
    const arr = new Uint8Array((len || 40) / 2)
    crypto.getRandomValues(arr);
    const newId : string = Array.from(arr,dec2hex).join('');
    //Was supposed to be check to prevent dupes, not needed since this
    //wont be used live
    // feedListing.feedList.forEach(feed => {

    // });
    return newId;
}

export const FeedState = reactive({
    FeedList : [] as IFeedListing[],
    selectedFeed: '',
    isFeedOptionMenuVisible: false,
})

/**
 * Method used to create a Feed object in the FeedList State
 * based on data returned by the Bluesky API.
 * @param feed The Feed data returned by the Bluesky API.
 */
export function addUserFeed(description:IFeedDescription, feed:FeedViewPost[]){
    FeedState.FeedList.push({
        description:description,
        data:feed,
    })
}

/**
 * Method used to create a FeedDescription. Required when adding a Feed to the `FeedList`
 * state.
 * NOTE: Not really used anymore - the required `IFeedDescription` is just created before
 * being passed to the method that needs it.
 * @param userId The ID of the User stored in the `user_accounts` table this feed is associated with.
 * @param handle The Feed handle. If the Feed is for a user, this will just be their handle.
 * @param name The name/title of the Feed. The user can specify this to be whatever they want.
 * @param type The type of Feed this is. Used for categorization, changes icon used.
 * @param newPosts The number of unread posts.
 * @param totalPosts Total number of Posts in feed. Pretty sure this value is not needed.
 * @param feedColumnSettings Settings that determine the appearance of the `FeedColumn`.
 * @param sourceDid The "source" DID used to get Feed content. Used by User-type Feeds.
 */
export function createFeedDescription(userId:number,handle:string,name:string,type:FeedEnums.Types,
    icon:FeedEnums.Icons,newPosts:number,totalPosts:number,feedColumnSettings:IFeedColumnSettings,
    sourceDid:string = '',feedTags:string = ''){
    var desc : IFeedDescription = {
        feedId: GenerateUniqueId(10),
        userId:userId,
        feedSourceDID: sourceDid,
        feedTags: feedTags,
        feedHandle: handle,
        feedName: name,
        feedType: type,
        feedIcon: icon,
        newPosts: newPosts,
        totalPosts: totalPosts,
        feedColumnSettings: feedColumnSettings,
    }
    return desc;
}

/**
 * Method that finds a matching FeedList item and updates its `FeedColumn` settings.
 * @param feedToUpdate The Feed you wish to update the `FeedColumn` settings of.
 * @param newColumnSettings The new `FeedColumn` settings to update with.
 */
export function updateFeedColumnSettings(feedToUpdate:IFeedListing, newColumnSettings:IFeedColumnSettings){
    var feed = FeedState.FeedList.find(element => element.description.feedId == feedToUpdate.description.feedId);
    //If existing Feed is found...
    if(feed) feed.description.feedColumnSettings = newColumnSettings;
}

/**
 * DEBUG FUNCTION: Adds a dummy feed to the `FeedList` State
 * object.
 */
export function addDummyFeed(){
    const feedTypes = [FeedEnums.Icons.Art,FeedEnums.Icons.Friends,FeedEnums.Icons.News];
    var randomHandleNum = `${Math.floor((Math.random()*100))+1}_${Math.floor((Math.random()*100))+1}`;
    FeedState.FeedList.push({
        description:{
            feedId: GenerateUniqueId(10),
            feedHandle: `tester${randomHandleNum}`,
            feedName: 'CreatedByABtn',
            feedType: feedTypes[Math.floor(Math.random()*feedTypes.length)],
            newPosts: Math.floor(Math.random()*15),
            totalPosts: Math.floor(Math.random()*6),
            feedColumnSettings: {width:FeedEnums.Widths.Small}
        },
        data:[{
            post:{
                author:{
                    did:`test${GenerateUniqueId(10)}`,
                    handle: `tester${randomHandleNum}`,
                    displayName: `Tester${randomHandleNum}`
                },
                cid:`${GenerateUniqueId(10)}`,
                indexedAt: new Date().toISOString(),
                record:{
                    type: "app.bsky.feed.post",
                    text: "Test record. Hello World!"
                },
                uri: 'error',
                likeCount: Math.floor(Math.random()*55),
                replyCount: Math.floor(Math.random()*15),
                repostCount: Math.floor(Math.random()*15),
            }
        }]
    })
}

/**
 * DEBUG FUNCTION: Adds a dummy Post to a sepcific Feed.
 * @param feedId The `feedId` of the Feed you want to add the
 * dummy records to.
 */
export function addDummyPostToFeed(feedId:String){
    var feed = FeedState.FeedList.find(x => x.description.feedId == feedId);
    if(feed){//Ensure matching Feed was found
        var randomHandleNum = `${Math.floor((Math.random()*100))+1}_${Math.floor((Math.random()*100))+1}`;
        feed.data.push({
            post:{
                author:{
                    did:`test${GenerateUniqueId(10)}`,
                    handle: `tester${randomHandleNum}`,
                    displayName: `Tester${randomHandleNum}`
                },
                cid:`${GenerateUniqueId(10)}`,
                indexedAt: new Date().toISOString(),
                record:{
                    type: "app.bsky.feed.post",
                    text: "Test record. Hello World!"
                },
                uri: 'error',
                likeCount: Math.floor(Math.random()*55),
                replyCount: Math.floor(Math.random()*15),
                repostCount: Math.floor(Math.random()*15),
            }
        })
    }
}

/**
 * Adds Feed to current feed list. Used to restore saved feeds on
 * app startup.
 * @param savedFeed Summary Feed info used to restore Feed in app.
 */
export async function AddSavedFeed(savedFeed:IFeedDBData){
    /**The object that will be added to the FeedList. */
    var feedResult;
    //Perform required API call based on Feed Type
    switch (savedFeed.type) {
        case FeedEnums.Types.User:
            // var userFeed = await getAuthorFeed(this.feedFilters.user.did);
            feedResult = await getAuthorFeed(savedFeed.did);
            break;
        case FeedEnums.Types.Tag:
            // feedResult = await getTagPosts(this.grabHashtags());
            feedResult = await getTagPosts(savedFeed.tags);
            break;
        default:
            break;
    }
    //Check if API call created Error
    if(IsError(feedResult)){
        this.$toast.add(HandleAPIError(feedResult as Error));
        return; //Stop further actions
    }
    console.log(feedResult);//DEBUG

    /**Default FeedColumn settings */
    var defaultAppearance:IFeedColumnSettings = {
        width: FeedEnums.Widths.Small,
    }
    /**Starting template for IFeedDescription used to create Feed. */
    var desc:IFeedDescription = {
        feedId:savedFeed.id,
        userId:savedFeed.userId,
        feedHandle:'hashtag',
        feedName:savedFeed.tags,
        feedType:FeedEnums.Types.User,
        feedIcon:FeedEnums.Icons.Art,
        newPosts:10,totalPosts:30,
        feedColumnSettings:defaultAppearance,
        feedSourceDID:'',
        feedTags:''
    }

    //Select correct returned Object value based on Feed Type
    switch(savedFeed.type) {
        case FeedEnums.Types.User:
            feedResult = feedResult.data.feed;
            //Get user profile
            var profile = await getUserProfile(savedFeed.did);
            profile = profile.data as ProfileView;
            //Update required values of starting `IFeedDescription` template
            desc = {...desc,
                feedHandle:profile.handle,
                feedName:profile.displayName,
                feedSourceDID:profile.did
            }
            break;
        case FeedEnums.Types.Tag:
            var posts = [];
            //Place Posts in a "Feed" shaped Object
            feedResult.data.posts.forEach(p => {
                posts.push({post:p})
            });
            feedResult = posts;
            //Update required values of starting `IFeedDescription` template
            desc = {...desc,
                feedType:FeedEnums.Types.Tag,
                feedIcon:FeedEnums.Icons.Hashtag,
                feedTags:savedFeed.tags
            }
            break;
        default:
            break;
    }
    addUserFeed(desc,feedResult);
}

/**
 * Method that returns a specific Feed's IFeedListing object.
 * @param feedId Id of the Feed you wish get the IFeedListing object of.
 */
export function GetFeed(feedId:string){
    var feed = FeedState.FeedList.find(x => x.description.feedId == feedId);
    return feed;
}

/**
 *
 * @param feedId Id of the Feed you wish to update the specifications for.
 * @param description The updated IFeedDescription for the Feed.
 * @param feedData The new Feed content retrieved using the updated specifications.
 */
export function UpdateFeed(feedId:string, description:IFeedDescription, feedData:FeedViewPost[]){
    var feed = FeedState.FeedList.find(x => x.description.feedId == feedId);
    //If feed found
    if(feed){
        feed.description = description;
        feed.data = feedData;
    }
}

/**
 * Removes specific Feed from FeedList.
 * @param feedId The `feedId` of the Feed you want to remove.
 */
export function RemoveFeed(feedId:String){
    var feed = FeedState.FeedList.find(x => x.description.feedId == feedId);
    if(feed){//Ensure matching Feed was found
        var removeIndex = FeedState.FeedList.indexOf(feed);
        //Remove item
        FeedState.FeedList.splice(removeIndex,1);
    }
}

/**
 * Method that toggles the visibility of the `FeedOptionsMenu`.
 */
export function ToggleFeedOptionsMenu(){
    FeedState.isFeedOptionMenuVisible = !FeedState.isFeedOptionMenuVisible;
}

/**
 * Method that updates the stored DID of the Feed that has just been
 * interacted with.
 * @param newVal The new value of the selected feed.
 */
export function UpdateSelectedFeed(newVal:string){
    FeedState.selectedFeed = newVal;
}

export const userFeedList : IFeedListing = reactive({
    feedList: [
        {feedId:GenerateUniqueId(10), feedName:'Friends', feedHandle:'friends', feedType:FeedEnums.Types.User, newPosts: 3, totalPosts: 2},
        // {feedId:GenerateUniqueId(10), feedName:'Local News', feedHandle:'bbcNews', feedType:FeedEnums.Icons.News, newPosts: 5, totalPosts: 3},
        // {feedId:GenerateUniqueId(10), feedName:'Artists', feedHandle:'artists', feedType:FeedEnums.Icons.Art, newPosts: 7, totalPosts: 1},
    ]
})
</script>