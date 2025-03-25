<script lang="ts">
import { AppBskyFeedDefs, isDid } from "@atproto/api";
import { GetBrowsingAgent } from "../api.vue";
import { FeedViewPost, ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
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
export async function getPostThread(postToShow:FeedViewPost){
    var threadResult = await GetBrowsingAgent().getPostThread({uri:postToShow.post.uri});
    var result = undefined;
    if(threadResult){
        // postDetails.postThread = threadResult.data.thread as ThreadViewPost;
        // postDetails.currentThreadView = postDetails.postThread;
        return threadResult.data.thread as ThreadViewPost;
    }
    return result;
}

export async function CreateNewPost(postData:Record){
    console.log(postData);
    // if(AppState.checkIfLoggedIn('post')){
    //     await GetBrowsingAgent().post({
    //         text: postData.text,
    //         langs: ["en-US"],
    //         createdAt: postData.createdAt
    //     })
    //     .then(async res => {
    //         toast.add({summary:'Success',detail:'Post (fake) Created!',severity:'success',group:'tr',life:3000});
    //         //show newly created post
    //         // let newPostThread = await getBlueskyPostThread(res.uri)
    //         // .then(res => {
    //         //     newPostThread = res.thread.replies
    //         //     showFocusModal(newPostThread,0)
    //         // })
    //         // showFocusModal();
    //     }
    //     )
    // }
}
</script>