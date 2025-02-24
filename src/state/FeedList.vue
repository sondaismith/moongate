<template>
    <div>

    </div>
</template>

<script lang="ts">
import { reactive } from 'vue';
import {FeedEnums} from '../enums/FeedEnums';
import { IFeedListing } from '../interfaces/FeedInterfaces';
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

export const FeedList : IFeedListing[] = reactive([
])

/**
 * Method used to create a Feed object in the FeedList State
 * based on data returned by the Bluesky API.
 * @param feed The Feed data returned by the Bluesky API.
 */
export function addUserFeed(feed:FeedViewPost[]){
    const feedTypes = [FeedEnums.Types.Art,FeedEnums.Types.Friends,FeedEnums.Types.News];
    var randomHandleNum = `${Math.floor((Math.random()*40))+1}_${Math.floor((Math.random()*40))+1}`;
    FeedList.push({
        description:{
            feedId: GenerateUniqueId(10),
            feedHandle: `LiveGrab${randomHandleNum}`,
            feedName: 'ThisOnesReal',
            feedType: feedTypes[Math.floor(Math.random()*feedTypes.length)],
            newPosts: Math.floor(Math.random()*15),
            totalPosts: Math.floor(Math.random()*6)
        },
        data:feed,
    })
}

/**
 * DEBUG FUNCTION: Adds a dummy feed to the `FeedList` State
 * object.
 */
export function addDummyFeed(){
    const feedTypes = [FeedEnums.Types.Art,FeedEnums.Types.Friends,FeedEnums.Types.News];
    var randomHandleNum = `${Math.floor((Math.random()*100))+1}_${Math.floor((Math.random()*100))+1}`;
    FeedList.push({
        description:{
            feedId: GenerateUniqueId(10),
            feedHandle: `tester${randomHandleNum}`,
            feedName: 'CreatedByABtn',
            feedType: feedTypes[Math.floor(Math.random()*feedTypes.length)],
            newPosts: Math.floor(Math.random()*15),
            totalPosts: Math.floor(Math.random()*6)
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
    var feed = FeedList.find(x => x.description.feedId == feedId);
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
export function removeLastFeedPost(feedId:String){
    var feed = FeedList.find(x => x.description.feedId == feedId);
    if(feed){//Ensure matching Feed was found
        feed.data.pop();
    }
}

export const userFeedList : IFeedListing = reactive({
    feedList: [
        {feedId:GenerateUniqueId(10), feedName:'Friends', feedHandle:'friends', feedType:FeedEnums.Types.Friends, newPosts: 3, totalPosts: 2},
        // {feedId:GenerateUniqueId(10), feedName:'Local News', feedHandle:'bbcNews', feedType:FeedEnums.Types.News, newPosts: 5, totalPosts: 3},
        // {feedId:GenerateUniqueId(10), feedName:'Artists', feedHandle:'artists', feedType:FeedEnums.Types.Art, newPosts: 7, totalPosts: 1},
    ]
})
</script>