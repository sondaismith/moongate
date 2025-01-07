<template>
    <div>

    </div>
</template>

<script lang="ts">
import { reactive } from 'vue';
import {FeedEnums} from '../enums/FeedEnums'

/**
 * Shape of data returned that details the contents of a specific feed.
 * @property {string} feedName - The Display Name of the Feed.
 * @property {string} feedHandle - The handle of the Feed.
 * @property {FeedEnums.Types} feedType - The category type of the feed. Used to determine icon used.
 * @property {number} newPosts - Number of unread posts.
 * @property {number} totalPosts - The total number of posts that are part of the feed.
 */
interface FeedData{
    /**The unique identifier of the Feed. */
    feedId: String
    /**The Display Name of the Feed. */
    feedName: string
    /**The handle of the Feed. */
    feedHandle: string
    /**The category type of the feed. Used to determine icon used. */
    feedType: FeedEnums.Types
    /**Number of unread posts. */
    newPosts: number,
    /**The total number of posts that are part of the feed. */
    totalPosts: number
}

interface FeedListing{
    feedList : FeedData[]
}

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

export const feedListing : FeedListing = reactive({
    feedList: [
        {feedId:GenerateUniqueId(10), feedName:'Friends', feedHandle:'friends', feedType:FeedEnums.Types.Friends, newPosts: 3, totalPosts: 2},
        {feedId:GenerateUniqueId(10), feedName:'Local News', feedHandle:'bbcNews', feedType:FeedEnums.Types.News, newPosts: 5, totalPosts: 3},
        {feedId:GenerateUniqueId(10), feedName:'Artists', feedHandle:'artists', feedType:FeedEnums.Types.Art, newPosts: 7, totalPosts: 1},
    ]
})
</script>