<template>
    <div>

    </div>
</template>

<script lang="ts">
import { reactive } from 'vue';
import {FeedEnums} from '../enums/FeedEnums';
import { IFeedColumnSettings, IFeedDescription, IFeedListing } from '../interfaces/FeedInterfaces';
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

//Code from Mulan at https://stackoverflow.com/a/27747377
function dec2hex (dec: number) {
    return dec.toString(16).padStart(2, "0")
}
//Code from Mulan at https://stackoverflow.com/a/27747377
export function GenerateUniqueId(len: number) : String{
    const arr = new Uint8Array((len || 40) / 2)
    crypto.getRandomValues(arr);
    const newId : String = Array.from(arr,dec2hex).join('');
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
    const feedTypes = [FeedEnums.Icons.Art,FeedEnums.Icons.Friends,FeedEnums.Icons.News];
    var randomHandleNum = `${Math.floor((Math.random()*40))+1}_${Math.floor((Math.random()*40))+1}`;
    FeedState.FeedList.push({
        description:description,
        data:feed,
    })
}

/**
 * Method used to create a FeedDescription. Required when adding a Feed to the `FeedList`
 * state.
 * @param handle The Feed handle. If the Feed is for a user, this will just be their handle.
 * @param name The name/title of the Feed. The user can specify this to be whatever they want.
 * @param type The type of Feed this is. Used for categorization, changes icon used.
 * @param newPosts The number of unread posts.
 * @param totalPosts Total number of Posts in feed. Pretty sure this value is not needed.
 * @param feedColumnSettings Settings that determine the appearance of the `FeedColumn`.
 */
export function createFeedDescription(handle:string,name:string,type:FeedEnums.Icons,
    newPosts:number,totalPosts:number,feedColumnSettings:IFeedColumnSettings){
    var desc : IFeedDescription = {
        feedId: GenerateUniqueId(10),
        feedHandle: handle,
        feedName: name,
        feedType: type,
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
 * DEBUG FUNCTION: Removes the last Post record held in array
 * from as specific Feed.
 * @param feedId The `feedId` of the Feed you want to remove the
 * last in array Post from.
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
        {feedId:GenerateUniqueId(10), feedName:'Friends', feedHandle:'friends', feedType:FeedEnums.Icons.Friends, newPosts: 3, totalPosts: 2},
        // {feedId:GenerateUniqueId(10), feedName:'Local News', feedHandle:'bbcNews', feedType:FeedEnums.Icons.News, newPosts: 5, totalPosts: 3},
        // {feedId:GenerateUniqueId(10), feedName:'Artists', feedHandle:'artists', feedType:FeedEnums.Icons.Art, newPosts: 7, totalPosts: 1},
    ]
})
</script>