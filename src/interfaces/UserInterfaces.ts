
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
    /**
     * The unique identifier for the User.
     */
    did:string,
    /**
     * The User's display name.
     */
    name:string,
    /**
     * The User's account handle.
     */
    handle:string,
    /**
     * Profile picture of User, if available.
     */
    pfp?:string,
}