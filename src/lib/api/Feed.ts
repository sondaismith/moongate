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
                limit:30,
            }
        )
    }
    catch(error){
        result = error;
    }
    return result;
}