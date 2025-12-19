<script lang="ts">
import { $Typed, AppBskyEmbedRecordWithMedia, AppBskyFeedDefs, AppBskyFeedGetPostThread, AppBskyFeedPostgate, AppBskyFeedThreadgate, AtUri, ComAtprotoRepoUploadBlob, isDid } from "@atproto/api";
import { GetBrowsingAgent } from "../api.vue";
import { FeedViewPost, isPostView, isReasonPin, PostView, ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { AppState, toast } from "../../state/AppState.vue";
import { Record } from "@atproto/api/dist/client/types/app/bsky/feed/post";
import { postDetails, showFocusModal } from "../../state/PostDetails.vue";
import { FeedState } from "../../state/FeedList.vue";
import { PostActions } from "../../enums/PostEnums";
import { INestedPostOptions } from "../../interfaces/PostInterfaces";
import { FollowerRule, FollowingRule, MentionRule } from "@atproto/api/dist/client/types/app/bsky/feed/threadgate";
import { SelfLabel, SelfLabels } from "@atproto/api/dist/client/types/com/atproto/label/defs";
import { isImage, isView, Main, View as ViewForImages, ViewImage } from "@atproto/api/dist/client/types/app/bsky/embed/images";
import { AspectRatio } from "@atproto/api/dist/client/types/app/bsky/embed/defs";
import { isView as isViewForQRT, isViewRecord, ViewRecord } from "@atproto/api/dist/client/types/app/bsky/embed/record";
import { isView as isViewForRecordWithMedia, View as ViewForRecordWithMedia} from "@atproto/api/dist/client/types/app/bsky/embed/recordWithMedia";

export default{
    name:"Post API Methods"
}

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
 * Method that figures out what images exist in the passed in Post
 * based on what type of data configuration the current Post has.
 * @returns `ViewImage[]` containing Post images.
 */
// export function getPostImages(postData:ThreadViewPost):ViewImage[]{
// export function getPostImages(postData:PostView|ViewRecord):ViewImage[]{//View{
export function getPostImages(postData:PostView|ViewRecord):ViewForImages|ViewForRecordWithMedia{
    //This is a standalone/parent Post, not a QRT (Quote Retweet)
    // if(!isViewRecord(postData.post)){
    if(isPostView(postData)){
        // if(typeof postData.post?.embed != 'undefined' && typeof postData.post.embed.images != 'undefined'){
        if(typeof postData.embed != 'undefined' && isView(postData.embed)){
            //Is a parent Post with image(s)
            // return postData.post.embed.images as ViewImage[];
            return postData.embed;
        }
        // else if(typeof postData.post?.embed != 'undefined' && AppBskyEmbedRecordWithMedia.isView(postData.post.embed) && typeof postData.post.embed.media.images != 'undefined'){
        else if(typeof postData.embed != 'undefined' && AppBskyEmbedRecordWithMedia.isView(postData.embed) && isView(postData.embed.media)){
            //Is a parent Post with image(s) and a QRT
            // return postData.post.embed.media.images as ViewImage[];
            return postData.embed;
        }
    }
    if(isViewRecord(postData)){
        //This is a QRT
        // if(typeof postData.post?.embeds != 'undefined' && postData.post.embeds.length>0 && typeof postData.post.embeds[0].images != 'undefined'){
        if(typeof postData.embeds != 'undefined' && postData.embeds.length>0 && isView(postData.embeds[0]) && typeof postData.embeds[0].images != 'undefined'){
            //Is a QRT with image(s)
            // return postData.post.embeds[0].images as ViewImage[];
            return postData.embeds[0];
        }
        // else if(postData.post?.embeds && postData.post.embeds.length>0 && typeof postData.post.embeds[0].media != 'undefined' &&
            // typeof postData.post.embeds[0].media.images != 'undefined'){
        else if(typeof postData.embeds != 'undefined' && postData.embeds.length>0 && isViewForRecordWithMedia(postData.embeds[0]) && typeof postData.embeds[0].media != 'undefined'
            && isView(postData.embeds[0].media) && typeof postData.embeds[0].media.images != 'undefined'){
            //Is a QRT with image(s)
            // return postData.post.embeds[0].media.images as ViewImage[];
            return postData.embeds[0];
        }
    }

    //BELOW WILL WORK, BUT TYPE-CHECK ERRORS WILL PERSIST
    // if(isViewRecord(postData)){
    //     //This is a QRT
    //     // if(typeof postData.post?.embeds != 'undefined' && postData.post.embeds.length>0 && typeof postData.post.embeds[0].images != 'undefined'){
    //     if(typeof postData.embeds != 'undefined' && postData.embeds.length>0 && isView(postData.embeds[0]) && typeof postData.embeds[0].images != 'undefined'){
    //         //Is a QRT with image(s)
    //         // return postData.post.embeds[0].images as ViewImage[];
    //         return postData.embeds[0].images;
    //     }
    //     // else if(postData.post?.embeds && postData.post.embeds.length>0 && typeof postData.post.embeds[0].media != 'undefined' &&
    //         // typeof postData.post.embeds[0].media.images != 'undefined'){
    //     else if(typeof postData.embeds != 'undefined' && postData.embeds.length>0 && isViewForRecordWithMedia(postData.embeds[0]) && typeof postData.embeds[0].media != 'undefined'
    //         && isView(postData.embeds[0].media) && typeof postData.embeds[0].media.images != 'undefined'){
    //         //Is a QRT with image(s)
    //         // return postData.post.embeds[0].media.images as ViewImage[];
    //         return postData.embeds[0].media.images;
    //     }
    // }
    // //This is a standalone/parent Post, not a QRT (Quote Retweet)
    // // if(!isViewRecord(postData.post)){
    // else{
    //     // if(typeof postData.post?.embed != 'undefined' && typeof postData.post.embed.images != 'undefined'){
    //     if(typeof postData.embed != 'undefined' && isView(postData.embed)){
    //         //Is a parent Post with image(s)
    //         // return postData.post.embed.images as ViewImage[];
    //         return postData.embed.images;
    //     }
    //     // else if(typeof postData.post?.embed != 'undefined' && AppBskyEmbedRecordWithMedia.isView(postData.post.embed) && typeof postData.post.embed.media.images != 'undefined'){
    //     else if(typeof postData.embed != 'undefined' && AppBskyEmbedRecordWithMedia.isView(postData.embed) && isView(postData.embed.media)){
    //         //Is a parent Post with image(s) and a QRT
    //         // return postData.post.embed.media.images as ViewImage[];
    //         return postData.embed.media.images;
    //     }
    // }
    return [];
}

/**
 * Creates a Post URI formated as a URI beginning with 'at://'.
 * @param handle The handle of the User who created the Post.
 * @param postDid The unique DID identifier of the related Post.
 */
export function createPostUri(handle:string, postDid:string):string|undefined{
    if(handle.trim() != '' && isDid(postDid))
        return `at://${handle}/app.bsky.feed.post/${postDid}`;
    else return undefined;
}

/**
 * Creates a route URL that can be used to view a specific Post.'.
 * @param handle The handle of the User who created the Post.
 * @param postId The unique identifier of the related Post - should be taken from end of Post URI value.
 */
export function createPostRoute(handle:string, postId:string):string|undefined{
    if(handle.trim() != '' && postId.trim() != '')
        return `/profile/${handle}/post/${postId}`;
    else return undefined;
}

/**
 * Function that creates the embed object needed to attach an image or images to a Post.
 * @param images Array containing image Blobs returned after uploading the images to Bluesky.
 * @param imageAltText Array containing alt text for each image.
 * @param imageAspectRatio Array containing aspect ratio for each image.
 */
export function CreateImageMediaObject(images:ComAtprotoRepoUploadBlob.Response[],imageAltText:string[],imageAspectRatio:AspectRatio[]):$Typed<Main>|undefined{
    if(images.length != imageAltText.length){
        console.log('Length of provided arrays do not match - aborting');
        return undefined;
    }
    let result:$Typed<Main> = {$type:"app.bsky.embed.images",images:[]};
    for (let i = 0; i < images.length; i++) {
        result.images.push({
            image:images[i].data.blob,
            alt:imageAltText[i],
            aspectRatio:{
                width:imageAspectRatio[i].width,
                height:imageAspectRatio[i].height
            }
        })
    }
    return result;
}

/**
 * Function used to create the object data needed to to create a Thread Gate for a
 * specific Post, limiting who can reply. This function does not need to be called if
 * no restrictions need to be applied (i.e Everyone can reply).
 * @param postUri The URI of the Post that needs a Thread Gate applied.
 * @param selectedThreadGateOptions Collection of Thread Gate rules set - should usually be `CreatePost.threadGateOptions`.
 */
export function CreateThreadGateObject(postUri:string, selectedThreadGateOptions:INestedPostOptions[]):AppBskyFeedThreadgate.Record{
    let threadGate:AppBskyFeedThreadgate.Record = {
        $type:"app.bsky.feed.threadgate",
        post: postUri,
        createdAt: new Date().toISOString()
    }
    let subGates:($Typed<MentionRule> | $Typed<FollowerRule> | $Typed<FollowingRule>)[] = [];
    if(selectedThreadGateOptions[1].selected) threadGate = {...threadGate,allow:[]};//No replies allowed
    else if(!selectedThreadGateOptions[0].selected){
        let subOptions = selectedThreadGateOptions[0].options
        if(subOptions[0].selected) subGates.push({$type:"app.bsky.feed.threadgate#mentionRule"})
        if(subOptions[1].selected) subGates.push({$type:"app.bsky.feed.threadgate#followingRule"})
        if(subOptions[2].selected) subGates.push({$type:"app.bsky.feed.threadgate#followerRule"})
        threadGate = {...threadGate,allow:subGates}
    }
    return threadGate;
}

/**
 * Function used to create the object data needed to create Content Labels for a
 * specific Post.
 * @param accountDID The account DID of the User applying the content label.
 * @param postUri AT URI of the record, repository (account), or other resource that this label applies to. Not actually used at the moment.
 * @param labels String array containing the label values - should use `CreatePost.discoverSelectedContentLabels()`.
 */
export function CreateContentLabelObjects(labels:string[]):$Typed<SelfLabels>|undefined{
    if(labels.length<1) return;
    else{
        let labelObjects:SelfLabel[] = [];
        labels.forEach(l => {
            labelObjects.push({$type:"com.atproto.label.defs#selfLabel",val:l});
        });
        return {$type:"com.atproto.label.defs#selfLabels",values:labelObjects};
    }
}

/**
 * Method that creates a new post using the currently selected User's account.
 * Can be used to make standalone Posts as well as replies and quote posts.
 * @param postData A `Record`-type object describing the content of the new Post.
 * @param openPostAfterCreation Value indicating if the created post should be opened in `PostFocusModal` after being created.
 * @param selectedThreadGateOptions The thread gate options selected, usually taken from `CreatePost.threadGateOptions`.
 * @param allowQuotePosts Are quote posts allowed? If false, results in the creation of a "Post Gate".
 * @returns The URI pointing to the created Post.
 */
export async function CreateNewPost(postData:Record, openPostAfterCreation:boolean=true,
selectedThreadGateOptions:INestedPostOptions[]|undefined=undefined,allowQuotePosts:boolean=true):Promise<string>{
    console.log(postData);
    let postUri = '';
    if(AppState.checkIfLoggedIn('post')){
        await GetBrowsingAgent().post(postData)
        .then(async res => {
            toast.add({summary:'Success',detail:'Post Created!',severity:'success',group:'tr',life:3000});
            postUri = res.uri;
            let accountDID = GetBrowsingAgent().did;
            //create thread gate record if needed
            if(typeof selectedThreadGateOptions != 'undefined'){
                if(typeof accountDID != 'undefined'){
                    console.log('Adding thread gate...');
                    await GetBrowsingAgent().com.atproto.repo.createRecord({
                        repo:accountDID,
                        rkey:new AtUri(postUri).rkey,
                        collection: 'app.bsky.feed.threadgate',
                        record:CreateThreadGateObject(postUri,selectedThreadGateOptions)
                    })
                }
            }
            //create post gate record if needed
            if(!allowQuotePosts){
                if(typeof accountDID != 'undefined'){
                    console.log('Adding post gate...');
                    await GetBrowsingAgent().com.atproto.repo.createRecord({
                        repo:accountDID,
                        rkey:new AtUri(postUri).rkey,
                        collection: 'app.bsky.feed.postgate',
                        record:{
                            $type:"app.bsky.feed.postgate",
                            post: postUri,
                            createdAt: new Date().toISOString(),
                            embeddingRules:[{
                                $type:"app.bsky.feed.postgate#disableRule"
                            }]
                        }as AppBskyFeedPostgate.Record
                    })
                }
            }
            //show newly created post
            await GetBrowsingAgent().getPostThread({uri: res.uri})
            .then(newPostRes => {
                AppState.hideCreatePost();
                if(openPostAfterCreation){
                    let postToShow:PostView = (newPostRes.data.thread as ThreadViewPost).post;
                    //If the created Post has a parent (it's a reply) show the parent Post
                    if((newPostRes.data.thread as ThreadViewPost).parent) postToShow = ((newPostRes.data.thread as ThreadViewPost).parent as ThreadViewPost).post
                    showFocusModal(postToShow.uri,0);
                    // postDetails.currentPostData.replyCount++;//This is probably no longer needed, since the latest version of the Post is retrieved when the modal is displayed
                    AppState.UpdatePostsInFeedList(postDetails.currentPostData);
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
                        let firstPost = feed.data[0];
                        if(typeof firstPost != 'undefined' && isReasonPin((firstPost as FeedViewPost).reason)){
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
    return postUri;
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

/**
 *
 * @param postData PostView of the Post to Bookmark/Save.
 */
export async function BookmarkPost(postData:PostView):Promise<void>{
    await GetBrowsingAgent().app.bsky.bookmark.createBookmark({cid:postData.cid,uri:postData.uri});
}

/**
 *
 * @param postData PostView of the Post to remove from Bookmarks.
 */
export async function RemoveBookmark(postData:PostView):Promise<void>{
    await GetBrowsingAgent().app.bsky.bookmark.deleteBookmark({uri:postData.uri});
}
</script>