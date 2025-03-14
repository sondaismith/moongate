import { FunctionalComponent } from "vue"
import { FeedEnums } from "../enums/FeedEnums"
import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"

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
 * @property {FeedEnums.Types} feedType - The category type of the feed. Used to determine how to retrieve feed data.
 * @property {FeedEnums.Icons} feedIcon - The icon used alongside the feed title.
 * @property {number} newPosts - Number of unread posts.
 * @property {number} totalPosts - The total number of posts that are part of the feed.
 */
interface IFeedDescription{
    /**The unique identifier of the Feed. */
    feedId: String
    /**
     * The DID source of the Feed content. Only used for User feeds currently.
     * User Feeds will not work with an empty value.
     */
    feedSourceDID:String,
    /**The Display Name of the Feed. */
    feedName: string
    /**The handle of the Feed. */
    feedHandle: string
    /**The category type of the feed. Used to determine how to retrieve feed data. */
    feedType: FeedEnums.Types,
    /**The Icon used alongside the feed title. */
    feedIcon: FeedEnums.Icons,
    /**Number of unread posts. */
    newPosts: number,
    /**The total number of posts that are part of the feed. */
    totalPosts: number,
    /**
     * Collection of values used to adjust the appearance of the Feed
     * when placed in a `FeedColumn`.
     */
    feedColumnSettings: IFeedColumnSettings,
}

/**
 * Collection of Feed Description and Feed data.
 * @property {IFeedDescription} description - Object that hold values that help summarize a Feed's contents, as
 * well as the `FeedColumn` settings.
 * @property {FeedViewPost[]} data - Collection of Posts that are part of the Feed.
 */
interface IFeedListing{
    /**Object that hold values that help summarize a Feed's contents, as well as the `FeedColumn` settings. */
    description : IFeedDescription,
    /**Collection of Posts that are part of the Feed. */
    data : FeedViewPost[],
}

interface IFeedColumnSettings{
    width: FeedEnums.Widths,
}
interface IFeedDBData{
    id:string,
    // user:IUser,
    did:string,
    type:FeedEnums.Types,
    icon:FeedEnums.Icons,
    settings:IFeedColumnSettings
}

interface IFeedIconTypes{
    name : FeedEnums.Icons,
    icon : FunctionalComponent
}

export type {IFeedDescription, IFeedListing, IFeedColumnSettings, IFeedDBData, IFeedIconTypes}