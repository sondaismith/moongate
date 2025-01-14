import { FunctionalComponent } from "vue"
import { FeedEnums } from "../enums/FeedEnums"

// interface IFeedCollection{
//     feedName: string
//     userHandle: string
//     postCount: number
//     lastUpdate: Date
// }

/**
 * Shape of data returned that details the contents of a specific feed.
 * @property {string} feedName - The Display Name of the Feed.
 * @property {string} feedHandle - The handle of the Feed.
 * @property {FeedEnums.Types} feedType - The category type of the feed. Used to determine icon used.
 * @property {number} newPosts - Number of unread posts.
 * @property {number} totalPosts - The total number of posts that are part of the feed.
 */
interface IFeedData{
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

interface IFeedListing{
    feedList : IFeedData[]
}

interface IFeedIconTypes{
    name : FeedEnums.Types,
    icon : FunctionalComponent
}

export type {IFeedData, IFeedListing, IFeedIconTypes}