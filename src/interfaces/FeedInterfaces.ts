import { FunctionalComponent } from "vue"
import { FeedEnums } from "../enums/FeedEnums"
import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { Notification } from "@atproto/api/dist/client/types/app/bsky/notification/listNotifications"
import { TrendView } from "@atproto/api/dist/client/types/app/bsky/unspecced/defs"
import { AppBskyFeedDefs } from "@atproto/api/dist/client"
import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs"

// interface IFeedCollection{
//     feedName: string
//     userHandle: string
//     postCount: number
//     lastUpdate: Date
// }

/**
 * Shape of data returned that details the contents of a specific feed.
 * @public
 * @property {number} feedId - The unique identifier of the Feed.
 * @property {number} userId - The ID of the User in `user_accounts` this Feed is associated with.
 * @property {string} feedName - The Display Name of the Feed.
 * @property {string} feedHandle - The handle of the Feed.
 * @property {FeedEnums.Types} feedType - The category type of the feed. Used to determine how to retrieve feed data.
 * @property {FeedEnums.Icons} feedIcon - The icon used alongside the feed title.
 * @property {number} newPosts - Number of unread posts.
 * @property {number} totalPosts - The total number of posts that are part of the feed.
 * @property {IFeedColumnSettings} feedColumnSettings - Collection of values used to adjust the appearance of the Feed when placed in a `FeedColumn`.
 */
interface IFeedDescription{
    /**The unique identifier of the Feed. */
    feedId: string
    /**The ID of the User in `user_accounts` this Feed is associated with. */
    userId: number,
    /**
     * The DID source of the Feed content. Only used for User feeds currently.
     * User Feeds will not work with an empty value.
     */
    feedSourceDID:string,
    /**
     * List of hashtags used to filter Feed content. Only used by Tag feeds currently.
     * Tag Feeds will not work with an empty value.
     */
    feedTags:string,
    /**The Display Name of the Feed. */
    feedName: string
    /**The handle of the Feed. */
    feedHandle: string
    /**The category type of the feed. Used to determine how to retrieve feed data. */
    feedType: FeedEnums.Types,
    /**The Icon used alongside the feed title. */
    feedIcon: FeedEnums.Icons,
    /**URL string pointing to the avatar used by this Feed. */
    feedAvatar: string,
    /**Number of unread posts. */
    newPosts: number,
    /**
     * Value marking the most recent Post displayed in Feed. Used to determine how
     * many "new posts" have been retrieved when refreshing or loading up the
     * application again.
     */
    latestPostDate: string,
    /**Unique identifier of the most Recent Post loaded into Feed. */
    latestPostCID:string
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
    /**Collection of "records" that will be displayed in the Feed. */
    data : FeedViewPost[] | Notification[] | TrendView[],
    /**
     * Value used to indicate the point at which the current data collection ends, in
     * relation to data held on Bluesky.
     * Used when requesting additional Posts, or "paginating" through Posts.
     */
    cursor?: string,
    /**
     * Value used to indicate when the displayed Notifications were seen.
     * Only used when the {@link data} element holds {@link Notification} objects.
     */
    seenAt?: string,
    /**Value indicating if application is waiting for an API response related to Feed data.*/
    isAwaitingFeedData: boolean,
}

/**
 * Interface used to hold Post data returned from the Bluesky API.
 */
interface IFeedReturnedPostResults{
    /**Collection of Posts that are part of the Feed. */
    data : FeedViewPost[] | Notification[] | TrendView[],
    /**
     * Value used to indicate the point at which the current data collection ends, in
     * relation to data held on Bluesky.
     * Used when requesting additional Posts, or "paginating" through Posts.
     */
    cursor?: string,
    /**
     * Value used to indicate when the displayed Notifications were seen.
     * Only used when the {@link data} element holds {@link Notification} objects.
     */
    seenAt?: string,
}

interface IFeedColumnSettings{
    width: FeedEnums.Widths,
}
/**
 * Describes the shape of data saved to the `saved_feeds` table.
 * Is used to restore Feeds in the app feed list.
 */
interface IFeedDBData{
    /**Unique ID of saved feed. */
    id:string,
    /**ID of the User from the `user_accounts` table this Feed is associated with. */
    userId:number,
    /**DID used to get feed content for User-type feeds. */
    did:string,
    /**Hashtag filters used by Tag-type feeds. */
    tags:string,
    /**The type of Feed this is. */
    type:FeedEnums.Types,
    /**The icon used by this Feed. */
    icon:FeedEnums.Icons,
    /**Settings used by the `FeedColumn` component that displays this Feed. */
    settings:IFeedColumnSettings,
    /**Date string of the most recent Post loaded into Feed. */
    latestPostDate:string,
    /**Unique identifier of the most Recent Post loaded into Feed. */
    latestPostCID:string
}

interface IFeedIconTypes{
    name : FeedEnums.Icons,
    icon : FunctionalComponent
}

/**
 * Describes the shape of data used to allow Users to specify
 * which Feed Generators they would like to add to their Feed List.
 */
interface IFeedGeneratorSelection{
    generator:AppBskyFeedDefs.GeneratorView,
    selected:boolean
}

interface IFeedStackItem{
    /**Unique identifier for stack item. Recommended to use `generators.GenerateCID()` to assign value at object creation if no other unique identifier is available. */
    id:string,
    /**DID used to get feed content for User-type feeds. */
    did:string,
    /**The handle of the Feed. */
    handle: string,
    /**
     * Value used to identify/declare a Feed.
     *
     * NOTE: For User-type Feeds - if value is left undefined handle value should be used.
     *
     * NOTE: For Tag-type Feeds - this value is used as the search term to return Posts using the hashtags.
     * */
    name?:string,
    /**Profile Data associated with User-type feed. */
    profileData?:ProfileViewDetailed,
    /**GeneratorView data for a "Feed Generator" type Feed. */
    generatorData?:AppBskyFeedDefs.GeneratorView,
    /**Hashtag filters used by Tag-type feeds. */
    tags:string[],
    /**The type of Feed this is. */
    type:FeedEnums.Types,
    /**The icon used by this Feed. */
    icon:FeedEnums.Icons,
}

interface IFeedCreationStatus{
    message:string,
    attempted:boolean,
    success:boolean
}

export type {IFeedDescription, IFeedListing, IFeedReturnedPostResults, IFeedColumnSettings,
IFeedDBData, IFeedIconTypes, IFeedGeneratorSelection, IFeedStackItem, IFeedCreationStatus}