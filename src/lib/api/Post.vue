<script lang="ts">
import { AppBskyFeedDefs, AppBskyFeedGetPostThread, isDid } from "@atproto/api";
import { GetBrowsingAgent } from "../api.vue";
import { FeedViewPost, isReasonPin, PostView, ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { AppState, toast } from "../../state/AppState.vue";
import { Record } from "@atproto/api/dist/client/types/app/bsky/feed/post";
import { postDetails, showFocusModal } from "../../state/PostDetails.vue";
import { FeedState } from "../../state/FeedList.vue";
import { PostActions } from "../../enums/PostEnums";

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
 * @param postURI The URI of the Post to get ThreadView for.
 */
export async function getPostThread(postURI:string):Promise<AppBskyFeedGetPostThread.Response>{
    var result = await GetBrowsingAgent().getPostThread({uri:postURI});
    return result;
}

/**
 * Method that creates a new post using the currently selected User's account.
 * Can be used to make standalone Posts as well as replies and quote posts.
 * @param postData A `Record`-type object describing the content of the new Post.
 * @param openPostAfterCreation Value indicating if the created post should be opened in `PostFocusModal` after being created.
 */
export async function CreateNewPost(postData:Record, openPostAfterCreation:boolean=true){
    console.log(postData);
    if(AppState.checkIfLoggedIn('post')){
        await GetBrowsingAgent().post(postData)
        .then(async res => {
            toast.add({summary:'Success',detail:'Post Created!',severity:'success',group:'tr',life:3000});
            //show newly created post
            await GetBrowsingAgent().getPostThread({uri: res.uri})
            .then(newPostRes => {
                AppState.hideCreatePost();
                if(openPostAfterCreation){
                    let postToShow:PostView = (newPostRes.data.thread as ThreadViewPost).post;
                    //If the created Post has a parent (it's a reply) show the parent Post
                    if((newPostRes.data.thread as ThreadViewPost).parent) postToShow = ((newPostRes.data.thread as ThreadViewPost).parent as ThreadViewPost).post
                    showFocusModal({post: postToShow},0);
                    postDetails.currentPostData.replyCount++;
                }
                else if(postDetails.isFocusVisible && postDetails.currentPostAction != PostActions.Quote){//if we can see the PostFocusModal
                    //we need to update the `PostThreadView` to include the new Post
                    let newPost = (newPostRes.data.thread as ThreadViewPost);
                    let parentToFindCID = ((newPostRes.data.thread as ThreadViewPost).parent as ThreadViewPost).post.cid;
                    let isParentFound = false;
                    if(postDetails.currentThreadView.post.cid == parentToFindCID){//if the focused Post is the parent, add to replies
                        if(postDetails.currentThreadView.replies) postDetails.currentThreadView.replies.unshift(newPost)
                        postDetails.currentThreadView.post.replyCount++;
                    }
                    else{//otherwise we need to check each reply
                        for (let i = 0; i < postDetails.currentThreadView.replies.length; i++){
                            //If post is a direct reply to a reply, we add it to the list and increase the parent post's replyCount
                            if((postDetails.currentThreadView.replies[i] as ThreadViewPost).post.cid == parentToFindCID){
                                //add new post to reply
                                (postDetails.currentThreadView.replies[i] as ThreadViewPost).replies?.push(newPost);
                                (postDetails.currentThreadView.replies[i] as ThreadViewPost).post.replyCount++;
                                i = postDetails.currentThreadView.replies.length;//end search
                                isParentFound = true;
                            }
                            //check each reply's list of replies - if the parent is in there increase the replyCount and add
                            //the reply to the `replies` variable, don't worry about the DOM
                            if(!isParentFound){
                                for (let j = 0; j < (postDetails.currentThreadView.replies[i] as ThreadViewPost).replies.length; j++){
                                    if(((postDetails.currentThreadView.replies[i] as ThreadViewPost).replies[j] as ThreadViewPost).post.cid == parentToFindCID){
                                        ((postDetails.currentThreadView.replies[i] as ThreadViewPost).replies[j] as ThreadViewPost).replies?.push(newPost);
                                        ((postDetails.currentThreadView.replies[i] as ThreadViewPost).replies[j] as ThreadViewPost).post.replyCount++;
                                        j = (postDetails.currentThreadView.replies[i] as ThreadViewPost).replies.length; //end search
                                        isParentFound = true;
                                    }
                                }
                            }
                        }
                    }
                }
                //focus not visible, so direct reply was made - only update `currentPostData`
                else if(!postDetails.isFocusVisible && postDetails.currentPostAction != PostActions.Quote){
                    postDetails.currentPostData.replyCount++;
                }
                // //Increase repost count
                // if(postDetails.isFocusVisible && postDetails.currentPostAction == PostActions.Quote){
                //     let searchResults = postDetails.searchThreadViewForMatchingPost((newPostRes.data.thread as ThreadViewPost).post.cid,postDetails.currentThreadView);
                //     if(searchResults.postFound) searchResults.foundPostThreadView.post.quoteCount++;
                // }
                //If any the currently visible Feeds are for the currently logged in User, update Feed to show new standalone Post
                if(!(newPostRes.data.thread as ThreadViewPost).parent){//no parent, is root post/not reply
                    let userFeeds = FeedState.FeedList.filter(feed => feed.description.feedSourceDID == GetBrowsingAgent().assertDid);
                    userFeeds.forEach(feed => {
                        if(isReasonPin(feed.data[0].reason)){
                            feed.data.splice(1,0,{post:(newPostRes.data.thread as ThreadViewPost).post})
                        }
                        else{
                            feed.data.unshift({post:(newPostRes.data.thread as ThreadViewPost).post})
                        }
                    });
                    console.log(`There are/is ${userFeeds.length} Feed(s) displaying Posts by the logged in User`);
                }
            })
            .catch((err) =>{
                toast.add({summary:'Error',detail:`Error navigating to new post: ${err}`,severity:'error',group:'tr',life:3000})
                console.log(`Error navigating to new post: ${err}`);
                console.log(err);
            })
        })
        .catch((err) =>
            toast.add({summary:'Error',detail:`Error creating new post: ${err}`,severity:'error',group:'tr',life:3000})
        );
    }
}

/**
 * Simple method that deletes a specific Post. Wraps up the process of
 * getting the browsing agent and then using it to delete. Returns a
 * Promise.
 * @param postData PostView of the Post to delete.
 * @returns The result of trying to delete the Post.
 */
export async function DeletePost(postData:PostView):Promise<void>{
    GetBrowsingAgent().deletePost(postData.uri);
}
</script>