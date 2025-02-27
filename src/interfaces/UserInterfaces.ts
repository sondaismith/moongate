/**
 * Interface used to describe the shape of data passed to the
 * `UserSearchBar` component.
 */
interface IUserSearchResult{
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