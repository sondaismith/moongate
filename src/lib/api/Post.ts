import { AppBskyFeedDefs, isDid } from "@atproto/api";
import { agent } from "../api";

export class InvalidPostDIDError extends Error{
    constructor(did = ""){
        super(did);
        this.message = did + " is an Invalid Post DID"
    }
}

/**
 * Method used to return Post Thread data (a Post and all comments).
 * @param postDID The DID of the Post Thread to be retreieved.
 * @returns The ThreadViewPost data if successful, otherwise throws
 * an Error.
 */
export async function getBlueskyPostThread(postDID: string){
    var isValidDID = isDid(postDID);
    var thread;

    //Check if DID is valid
    if(isValidDID){
        try{
            //Try to get PostThread
            thread = await agent.app.bsky.feed.getPostThread({
                uri: "at://"+postDID,
            });
        }
        catch(error)
        {
            //Error probably related to at-uri
            throw error;
        }
        if(!AppBskyFeedDefs.isThreadViewPost(thread.data.thread)){
            throw new Error("This is not a ThreadViewPost record");
        }
        else{console.log("this is a ThreadViewPost record.")}

        //Return PostThreadData
        return thread.data;
    }
    //If FIF is not valid...
    else{
        throw new InvalidPostDIDError("fail test");
    }
}