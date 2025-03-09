import { AppBskyFeedDefs } from "@atproto/api";
import { agent } from "../api";

export async function getUserHomeFeed(){
    var result;
    try{
        result = await agent.getTimeline();
        console.log(result?.data);
    }
    catch(error){
        result = error;
    }
    return result;
}

/**
 * Method the uses the Bluesky API to return a list of User/Author
 * accounts that match the entered term(s). NOTE: The search function
 * provided by the API is very basic ATM - no advanced searches can be
 * done (as of Mar 6th 2025).
 * @param searchTerm String the user has entered to find User Accounts.
 * @returns Collection of User Accounts that match the search term entered
 * if successful, an Error if not.
 */
export async function SearchForAccounts(searchTerm : string){
    var result;
    try{
        result = await agent.searchActors({q: `${searchTerm}`,limit:10});
    }
    catch(error){
        result = error;
    }
    return result;
}

/**
 * Method that gets posts created by a specifc User.
 * @param did The unique DID identifier of the User you want to return Posts from.
 * @returns Collection of posts from the User's feed if successful, an error if not.
 */
export async function getAuthorFeed(did:string){
    var result;
    try{
        result = await agent.getAuthorFeed(
            {
                actor:did,
                filter:"posts_no_replies",
                limit:30,
            }
        )
    }
    catch(error){
        result = error;
    }
    return result;
}

/**
 * Method that gets Posts containing specific hashtags.
 * @param tags String of hashtags, space-separated.
 * @returns Search results returned from the Bluesky API.
 */
export async function getTagPosts(tags:string){
    var result;
    try{
        console.log(tags)
        result = await agent.app.bsky.feed.searchPosts(
            {
                q:`${tags}`,
            }
        )
    }
    catch(error){
        result = error;
    }
    return result;
}