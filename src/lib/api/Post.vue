<script lang="ts">
import { AppBskyFeedDefs, AppBskyFeedGetPostThread, isDid } from "@atproto/api";
import { GetBrowsingAgent } from "../api.vue";
import { FeedViewPost, PostView, ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { AppState, toast } from "../../state/AppState.vue";
import { Record } from "@atproto/api/dist/client/types/app/bsky/feed/post";
import { showFocusModal } from "../../state/PostDetails.vue";

export class InvalidPostDIDError extends Error{
    constructor(did = ""){
        super(did);
        this.message = did + " is an Invalid Post DID"
    }
}

/**
 * DO NOT USE - use getPostThread or [agent].getPostThread
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
            thread = await GetBrowsingAgent().app.bsky.feed.getPostThread({
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


/**
 * Method that retrieves a Post ThreadView object from the Bluesky API based on
 * a Post selected in a Feed view.
 * @param postToShow The Post Thread to show based on the Post clicked in a Feed.
 */
export async function getPostThread(postToShow:FeedViewPost):Promise<AppBskyFeedGetPostThread.Response>{
    var result = await GetBrowsingAgent().getPostThread({uri:postToShow.post.uri});
    return result;
}

/**
 * Method that creates a new standalone post to the currently selected User's account.
 * @param postData A `Record`-type object describing the content of the new Post.
 */
export async function CreateNewPost(postData:Record){
    console.log(postData);
    if(AppState.checkIfLoggedIn('post')){
        await GetBrowsingAgent().post({
            text: postData.text,
            langs: ["en-US"],
            createdAt: postData.createdAt
        })
        .then(async res => {
            toast.add({summary:'Success',detail:'Post Created!',severity:'success',group:'tr',life:3000});
            //show newly created post
            await GetBrowsingAgent().getPostThread({uri: res.uri})
            .then(res => {
                AppState.hideCreatePost();
                showFocusModal({post: res.data.thread.post as PostView},0);
            })
            .catch((err) =>
                toast.add({summary:'Error',detail:`Error navigating to new post: ${err}`,severity:'error',group:'tr',life:3000})
            )
        })
        .catch((err) =>
            toast.add({summary:'Error',detail:`Error creating new post: ${err}`,severity:'error',group:'tr',life:3000})
        );
    }
}
</script>