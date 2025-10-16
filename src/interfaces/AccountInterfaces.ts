/**
 * Values indicating if the User is browsing as a guest,
 * browsing with an account or hasn't made a selection yet.
 */
export enum LoginState{
    Unset,
    Guest,
    Authorized
}

/**
 * Values indicating what platform the User Account is
 * connecting to.
 */
export enum ATPlatform{
    Bluesky,
    Blacksky,
    Other
}

/**
 * Interface describing account information used to
 * login to an ATProtocol platform.
 */
export interface IAccount{
    /**Unique identifier for user account. */
    id:string,
    /**The handle associated with the user account. */
    handle:string,
    /**The display name associated with the user account. */
    name:string,
    /**The DID associated with the user account on the relevant platform. */
    did:string,
    /**The avatar/PFP associated with the user account. */
    avatar:string,
    /**The platform this user account is used to access. */
    platform:ATPlatform
}

/**
 * Interface describing the application's current
 * "Account State" - how the User is browsing, along
 * with a list of accounts available.
 */
export interface IAppAccountState{
    /**Is the User is browsing as a guest, browsing with an account or undecided yet. */
    state:LoginState,
    /**The current User account being used. Value is -1 if a choice has not been made or no saved accounts exist. */
    currentAccount:number,
    /**List of saved user accounts. */
    accounts:Array<IAccount>|[]
}