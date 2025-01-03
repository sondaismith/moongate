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

export const feedListing : FeedListing = reactive({
    feedList: [
        {feedName:'Friends', feedHandle:'friends', feedType:FeedEnums.Types.Friends, newPosts: 3, totalPosts: 2},
        {feedName:'Local News', feedHandle:'bbcNews', feedType:FeedEnums.Types.News, newPosts: 5, totalPosts: 3},
        {feedName:'Artists', feedHandle:'artists', feedType:FeedEnums.Types.Art, newPosts: 7, totalPosts: 1},
    ]
})
</script>