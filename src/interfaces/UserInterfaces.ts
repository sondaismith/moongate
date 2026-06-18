
import { IFeedReturnedPostResults } from '../interfaces/FeedInterfaces';
import { AppBskyActorDefs, AppBskyBookmarkDefs } from '@atproto/api';
import { FeedEnums } from '../enums/FeedEnums'

/**
 * Describes shape of data saved to the `user_accounts` table in
 * `moongate_app.db`.
 * @public
 */
interface IUser{
    /**Unique ID of User. */
    id:number,
    /**The User's display name. */
    name:string,
    /**The User's account handle. */
    handle:string,
    /**The unique identifier for the User on Bluesky. */
    did:string,
    /**Profile picture of User, if available. */
    pfp?:string,
}

/**
 * Interface used to describe the shape of data passed to the
 * `UserSearchBar` component.
 */
export interface IUserSearchResult{
    /**Profile data of returned User Account search result. */
    profileData:AppBskyActorDefs.ProfileView,
    /**Has the displayed User Account been selected (is it currently held in the "feed stack"?). */
    selected:boolean,
    /**Are we waiting for `ProfileViewDetailed` data related to the associated User to be retrieved for the "feed stack"? */
    awaitingDetailedData:boolean
}

export interface INavigationHistory{
    FeedData: IFeedReturnedPostResults,
    ProfileData:AppBskyActorDefs.ProfileViewDetailed,
    scrollPos:number,
    currentTab:FeedEnums.UserFeedTabs,
    Bookmarks?:AppBskyBookmarkDefs.BookmarkView[]
}