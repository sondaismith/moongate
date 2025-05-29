<script lang="ts">
import { reactive } from 'vue';
import {FeedEnums} from '../enums/FeedEnums';
import { IFeedColumnSettings, IFeedDescription, IFeedListing, IFeedDBData, IFeedReturnedPostResults } from '../interfaces/FeedInterfaces';
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { getAuthorFeed, getTagPosts } from '../lib/api/Feed.vue';
import { HandleAPIError, IsError } from '../helpers/errors';
import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { getUserProfile } from '../lib/api/User.vue';
import { ToastEventBus } from 'primevue';
import { AppState } from './AppState.vue';
import { IUserSearchResult } from '../interfaces/UserInterfaces';
import { GetBrowsingAgent } from '../lib/api.vue';
import { Notification } from '@atproto/api/dist/client/types/app/bsky/notification/listNotifications';

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

const toast = {
    add: (message) => ToastEventBus.emit('add', message),
    removeGroup: (group) => ToastEventBus.emit('remove-group', group),
    removeAllGroups: () => ToastEventBus.emit('remove-all-groups'),
};

export const FeedState = reactive({
    FeedList : [] as IFeedListing[],
    selectedFeed: '',
    isFeedOptionMenuVisible: false,
    /**Value indicating if application is waiting for an API response related to Feed data.*/
    isAwaitingFeedData:false,
})

/**
 * Method used to create a Feed object in the FeedList State
 * based on data returned by the Bluesky API.
 * @param description Details about the Feed (type, DID source, etc.).
 * @param feed The Feed data returned by the Bluesky API.
 * @param cursor Cursor to use when attempting to paginate displayed Posts.
 * @param awaitingData Indicates if the Feed is waiting for data to display.
 */
export function AddFeedToList(description:IFeedDescription, feed:FeedViewPost[]|Notification[], cursor:string='', seenAt:string='', awaitingData:boolean=true){
    FeedState.FeedList.push({
        description:description,
        data:feed,
        cursor:cursor,
        seenAt:seenAt,
        isAwaitingFeedData:awaitingData,
    })
}

/**
 * Method used to prepare the data needed to add a Feed to `FeedList`. Creates the
 * description and post collection needed and returns it as an `IFeedListing`.
 * NOTE: Must toggle AppState.isCreatingFeed before calling method.
 * @param feedType The type of Feed to prepare data for.
 * @param userData If this is to be a User-type Feed this parameter needs to be passed in.
 * @param tags If this is to be a Tag-type Feed this parameter needs to be passed in - is a space
 * separated collection of hashtags.
 */
export async function PrepareFeedData(feedType:FeedEnums.Types,userData:IUserSearchResult={did:'',name:'',handle:''},tags:string=''):Promise<IFeedListing>{
    /**The object that will be added to the FeedList. */
    var feedResult;
    /**Object containing profile data on User. Used when creating User-type Feeds. */
    var profile:ProfileView = {did:'', handle:''};
    //Perform required API call based on Feed Type
    switch (feedType) {
        case FeedEnums.Types.User:
            var did:string = '';
            //check if we have a DID
            if(userData.did.trim() != ''){
                did = userData.did
            }
            //if no DID check for handle, then get DID
            else if(userData.handle.trim() != ''){
                await GetBrowsingAgent().resolveHandle(
                    {
                        handle:userData.handle
                    }
                ).then(res => userData.did = did = res.data.did)
                .catch(_ => did = '');
            }
            //If we do not have a profile name
            if(userData.name.trim() == ''){
                await GetBrowsingAgent().getProfile({actor:did})
                .then(res => profile = res.data);
                userData.name = profile.displayName ? profile.displayName : '';
            }

            feedResult = await getAuthorFeed(did);
            break;
        case FeedEnums.Types.Tag:
            feedResult = await getTagPosts(tags);
            break;
        default:
            break;
    }
    //Check if API call created Error
    if(IsError(feedResult)){
        toast.add(HandleAPIError(feedResult as Error));
        //this.attemptingToCreateFeed = false;
        return; //Stop further actions
    }
    console.log(feedResult);//DEBUG

    var defaultAppearance:IFeedColumnSettings = {
        width: FeedEnums.Widths.Small,
    }

    var usedFeedId:string = '';
    if(AppState.isUpdatingFeed) usedFeedId = FeedState.selectedFeed;
    else usedFeedId = GenerateUniqueId(10);
    //FIX: NEED TO GET REAL CURRENT USER ID FROM APP STATE EVENTUALLY
    /**Starting template for IFeedDescription used to create Feed. */
    var desc:IFeedDescription = {
        feedId: usedFeedId,
        userId:1,
        feedHandle:'hashtag',
        feedName:tags.replace(' ',','),
        feedType:FeedEnums.Types.User,
        feedIcon:FeedEnums.Icons.Art,
        newPosts:10,totalPosts:30,
        feedColumnSettings:defaultAppearance,
        feedSourceDID:'',
        feedTags:''
    }
    //Select correct returned Object value based on Feed Type
    switch (feedType) {
        case FeedEnums.Types.User:
            feedResult = feedResult.data.feed;
            //Generate Feed Description based on selected options
            desc = {...desc,
                feedHandle:userData.handle,
                feedName:userData.name,
                feedSourceDID:userData.did
            }
            break;
        case FeedEnums.Types.Tag:
            var posts = [];
            //Place Posts in a "Feed" shaped Object
            feedResult.data.posts.forEach(p => {
                posts.push({post:p})
            });
            feedResult = posts;
            //Generate Feed Description based on selected options
            desc = {...desc,
                feedType:FeedEnums.Types.Tag,
                feedIcon:FeedEnums.Icons.Hashtag,
                feedTags:tags
            }
            break;
        default:
            break;
    }

    AppState.isCreatingFeed = false;
    return {description:desc, data:feedResult};
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
        feed.data.splice(Math.floor(Math.random()*feed.data.length),0,{ //Place at random location
        // feed.data.push({ //Place at end
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
 * app startup. Does not populate Feed with Posts - use
 * `InitialLoadFeedPosts()`.
 * @param savedFeed Summary Feed info used to restore Feed in app.
 */
export async function AddSavedFeed(savedFeed:IFeedDBData){
    /**The object that will be added to the FeedList. */
    // var feedResult:FeedViewPost[] = [];
    // var feedResult:IFeedReturnedPostResults = {data:[],cursor:''};
    // await GetFeedDataForFeedType(savedFeed.type,savedFeed.did,savedFeed.tags,'',10)
    // .then(res => feedResult = res)
    // .catch(err => toast.add(HandleAPIError(err, 'Error getting posts for Saved Feed')));
    // console.log(feedResult);//DEBUG

    /**Default FeedColumn settings */
    var defaultAppearance:IFeedColumnSettings = {
        width: FeedEnums.Widths.Small,
    }
    /**Starting template for IFeedDescription used to create Feed. */
    var desc:IFeedDescription = {
        feedId:savedFeed.id,
        userId:savedFeed.userId,
        feedHandle:'loading_handle',
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
        // case FeedEnums.Types.User:
        //     //Get user profile
        //     let profile:ProfileView = {did:'',handle:''};
        //     await getUserProfile(savedFeed.did)
        //     .then(res => profile = res.data)
        //     .catch((err) => {
        //         //error occured try to get User Profile
        //         toast.add(HandleAPIError(err, 'Error getting User profile while adding saved feeds'));
        //     });
        //     //Update required values of starting `IFeedDescription` template
        //     desc = {...desc,
        //         feedHandle:profile.handle,
        //         feedName:profile.displayName ? profile.displayName : '[Empty Displayname]',
        //         feedSourceDID:profile.did
        //     }
        //     break;
        case FeedEnums.Types.User:
            //Update required values of starting `IFeedDescription` template
            desc = {...desc,
                feedName:'[Fetching Displayname...]',
                feedSourceDID:savedFeed.did
            }
            break;
        case FeedEnums.Types.Tag:
            //Update required values of starting `IFeedDescription` template
            desc = {...desc,
                feedType:FeedEnums.Types.Tag,
                feedIcon:FeedEnums.Icons.Hashtag,
                feedHandle:'hashtags',
                feedTags:savedFeed.tags
            }
            break;
        default:
            break;
    }
    // AddFeedToList(desc,feedResult.data,feedResult.cursor);
    AddFeedToList(desc,[],'');
}

export async function LoadFeedPostsAsync(feedDesc:IFeedDescription){
    var feed = FeedState.FeedList.find(x => x.description.feedId == feedDesc.feedId);
    if(feed){
        if(feedDesc.feedType == FeedEnums.Types.User){
            let profile:ProfileView = {did:'',handle:''};
            await getUserProfile(feedDesc.feedSourceDID)
            .then(res => profile = res.data)
            .catch((err) => {
                //error occured try to get User Profile
                toast.add(HandleAPIError(err, 'Error getting User profile while adding saved feeds'));
            });
            //Update required values of starting `IFeedDescription` template
            feed.description = {...feed.description,
                feedHandle:profile.handle,
                feedName:profile.displayName ? profile.displayName : '[Empty Displayname]',
                feedSourceDID:profile.did
            }
        }
        await GetFeedDataForFeedType(feedDesc.feedType,feedDesc.feedSourceDID,feedDesc.feedTags,'',10)
        .then(res => {
            if(feed){
                console.log(res);//DEBUG
                feed.data = res.data.slice()
                feed.cursor = res.cursor
                feed.isAwaitingFeedData = false;
            }
        })
        .catch(err => toast.add(HandleAPIError(err, 'Error getting posts for Saved Feed')));
    }
}

/**
 * Method used to get Feed data. It uses the Feed Type to choose the correct process needed
 * to return the correct data.
 * @param feedType The type of Feed this data is for. Of type `FeedEnums.Types`.
 * @param did The DID associated with the User Feed to retrieve.
 * @param tags The hashtags associated with the Tag Feed to retrieve.
 * @param cursor Used when requesting posts from a certain point (pagination).
 * @param postsToGet The number of Posts to return from the Author's Feed.
 */
export async function GetFeedDataForFeedType(feedType:FeedEnums.Types,did:string='',tags:string='',cursor:string='',postsToGet:number=30):Promise<IFeedReturnedPostResults>{
    /**Object that will hold the returned Feed data. */
    var feedResult:IFeedReturnedPostResults = {data:[], cursor:''};
    switch (feedType) {
        case FeedEnums.Types.User:
            await getAuthorFeed(did,cursor,postsToGet)
            .then(res => {
                feedResult.data = res.data.feed;
                if(res.data.cursor && res.data.cursor.trim()!='') feedResult.cursor = res.data.cursor;
            });
            break;
        case FeedEnums.Types.Tag:
            await getTagPosts(tags,cursor,postsToGet)
            .then(res => {
                if(res.data.cursor && res.data.cursor.trim()!='') feedResult.cursor = res.data.cursor;
                //Place Posts in a "Feed" shaped Object
                res.data.posts.forEach(p => {
                    (feedResult.data as FeedViewPost[]).push({post:p});
                })
            });
            break;
        case FeedEnums.Types.Notifications:
            if(AppState.isAuthBrowsing){
                await GetBrowsingAgent().listNotifications()
                .then(res => {
                    console.log('From GetFeedDataForFeedType:');
                    console.log(res.data);
                    res.data.notifications.forEach(n => {
                        (feedResult.data as Notification[]).push(n);
                    })
                    feedResult.seenAt = res.data.seenAt;
                })
                .catch(err => console.log(err));
            }
            break;
        default:
            break;
    }
    return feedResult;
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
export function UpdateFeedDetails(feedId:string, description:IFeedDescription, feedData:FeedViewPost[]|Notification[], cursor:string=''){
    var feed = FeedState.FeedList.find(x => x.description.feedId == feedId);
    //If feed found
    if(feed){
        feed.description = description;
        feed.data = feedData;
        if(cursor.trim() != '') feed.cursor = cursor;
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
 * Method used to refresh the data held in a currently displayed Feed.
 * @param feedId The ID of the loaded Feed that you want to refresh.
 */
export async function RefreshFeed(feedId:String, lastUpdate:Date, postsToGet:number=30){
    var feed = FeedState.FeedList.find(x => x.description.feedId == feedId);
    if(feed){//Ensure matching Feed was found
        //Code below was to cause the update to happen in a more smooth looking way
        feed.isAwaitingFeedData = true;
        feed.data = [];
        await new Promise(res => setTimeout(res,500));
        await GetFeedDataForFeedType(feed.description.feedType,feed.description.feedSourceDID,feed.description.feedTags,'',postsToGet)
        .then(res => {
            if(feed && feed.description.feedType == FeedEnums.Types.User ||
                feed?.description.feedType == FeedEnums.Types.Tag){
                //User and Tag Feed data should be in the shape of a FeedViewPost
                // let pinned = res.filter(post => post.reason && isReasonPin(post.reason));
                let newPosts = res.data.filter(post => new Date((post as FeedViewPost).post.indexedAt) >= lastUpdate)
                //Update only if there are new posts
                // if(newPosts.length > 0) feed.data = [...pinned, ...newPosts, ...feed.data.slice(pinned.length)];
                feed.data = res.data.slice();
                feed.description.newPosts = newPosts.length;
                feed.isAwaitingFeedData = false;
            }
            else if(feed && feed.description.feedType == FeedEnums.Types.Notifications){
                //Notification Feed data should be in the shape of a Notification
                // let pinned = res.filter(post => post.reason && isReasonPin(post.reason));
                let newPosts = res.data.filter(post => new Date((post as Notification).indexedAt) >= lastUpdate)
                //Update only if there are new posts
                // if(newPosts.length > 0) feed.data = [...pinned, ...newPosts, ...feed.data.slice(pinned.length)];
                feed.data = res.data.slice();
                feed.description.newPosts = newPosts.length;
                feed.isAwaitingFeedData = false;
            }
        })
        .catch(err => {
            toast.add(HandleAPIError(err, 'Error refreshing feed'));
            if(feed) feed.isAwaitingFeedData = false;
        });
    }
}

/**
 * Method used to refresh the data held in a currently displayed Feed.
 * @param feedId The ID of the loaded Feed that you want to refresh.
 */
 export async function LoadMoreFeedPosts(feedId:String,cursor:string|undefined){
    var feed = FeedState.FeedList.find(x => x.description.feedId == feedId);
    if(feed){//Ensure matching Feed was found
        //Code below was to cause the update to happen in a more smooth looking way
        // feed.data = [];
        // await new Promise(res => setTimeout(res,500));
        await GetFeedDataForFeedType(feed.description.feedType,feed.description.feedSourceDID,feed.description.feedTags,cursor)
        .then(res => {
            if(feed){
                res.data.forEach(post => {
                    feed.data.push(post);
                });
                feed.cursor = res.cursor;
            }
        })
        .catch(err => toast.add(HandleAPIError(err, 'Error loading older feed posts')));
    }
}

export function ClearFeed(feedId:String){
    var feed = FeedState.FeedList.find(x => x.description.feedId == feedId);
    if(feed){//Ensure matching Feed was found
        feed.data = [];
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