<script lang="ts">
import { reactive } from 'vue'
import { IPostDetails } from '../interfaces/PostInterfaces';
import { IconTypes, PostActions } from '../enums/PostEnums';
import { emptyPostThread, emptyPostView } from '../fake-data/dumPostData';
import { FeedViewPost, isThreadViewPost, PostView, ThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { getPostThread } from '../lib/api/Post.vue';
import { toast } from './AppState.vue';
import { HandleAPIError } from '../helpers/errors';

//DetailIcon Icons
import SolarChatDotsOutline from '~icons/solar/chat-dots-outline';
import MingcuteRepeatLine from '~icons/mingcute/repeat-line';
import MingcuteHeartFill from '~icons/mingcute/heart-fill';
import SolarShareBold from '~icons/solar/share-bold';
import MdiDotsHorizontal from '~icons/mdi/dots-horizontal';
import { AppBskyFeedThreadgate } from '@atproto/api';

export default{
    name:"PostDetails State"
}

// export const postDetails : IPostDetailsList = reactive({
export const postDetails = reactive({
    isVisible: false,
    isFocusVisible: false,
    /**
     * Value indicating if app is waiting for a response from the API in regards to Post data.
     * Mainly used by `PostFocusModal`.
     */
    isAwaitingFocusData:false,
    clickedMediaIndex: 0,
    // getClickedMediaIndex() {
    //     return this.clickedMediaIndex;
    // },
    // setClickedMediaIndex(newVal:number) {
    //     this.clickedMediaIndex = newVal;
    // },
    menuClickPos: [0, -500],
    /**
     * Holds data relating to the most recently interacted-with Post.
     */
    currentPostData: emptyPostView,
    /**
     * Holds reference to the currently displayed Post thread context. Updated with values
     * held in the thread navigation history array - `threadNavHistory`.
     */
    currentThreadView : emptyPostThread,
    /**
     * Holds record of the Thread associated with the Post the User last
     * interacted with. Currently just used to find the "root" Post of last
     * interacted Post.
     */
    currentPostThreadData: {} as ThreadViewPost|undefined,
    uriOfPostToShow:'',
    /**
     * Indicates that we are waiting for a reference to the thread associated
     * with the Post being intereacted with. Mainly used with `CreatePost`
     * component.
     */
    isAwaitingPostThreadData:false,
    /**
     * Updates the reference to the Post that will have actions
     * performed to it (likes, reply, quote post, delete). Also
     * sets variable indicating what action is going to be performed.
     * @param post The Post that you wish to perform actions on.
     * @param action The type of Post that is being created.
     */
    async prepareForPostAction(post:PostView, action:PostActions=PostActions.Post){
        this.isAwaitingPostThreadData = true;
        this.currentPostAction = action;
        if(post && post.uri && post.uri.trim() != ''){
            this.currentPostData = post;
            await getPostThread(post.uri)
            //only will work with ThreadViewPost - no NotFoundPost or BlockedPost
            .then(res => this.currentPostThreadData = isThreadViewPost(res.data.thread) ? res.data.thread : undefined)
            .catch(err => toast.add(HandleAPIError(err, 'Error getting Post thread details')));
        }
        else{
            this.currentPostData = emptyPostView;
            this.currentPostThreadData = undefined;
        }
        this.isAwaitingPostThreadData = false;
    },
    currentPostAction:PostActions.Post,
    /**Boolean indicating that we are replying to a Post. */
    isReplyingToPost:false,
    /**Boolean indicating that we are quote posting a Post. */
    isQuotingPost:false,
    /**
     * Recursive method that attempts to find the "root" Post of a specified
     * Post/comment. Checks to see if the Post has a `parent` value. Returns itself
     * if it cannot be found.
     * @param post The Post you wish to find the "root" Post of.
     */
    getPostThreadRoot(post:ThreadViewPost):ThreadViewPost{
        if(post.parent && isThreadViewPost(post.parent)){
            return this.getPostThreadRoot(post.parent)
        }
        else{ return post; }
    },
    /**
     * Holds details of the "Thread" of the initial Post that was opened up in the Focus modal.
     * Should not be modified once set except to be cleared.
     */
    postThread : emptyPostThread,
    /**
     * Method that searches a `ThreadViewPost` object for a Post that
     * matches a passed in CID value. Initially made to be used when you need
     * to update the state of Posts held in `PostFocusModal`.
     * @param postCid The CID of the Post to find.
     */
    searchThreadViewForMatchingPost(postCid:string, threadToSearch:ThreadViewPost){
        /**Holds list of immediate replies to the focused Post. */
        let rootReplies = [] as ThreadViewPost[];
        if(threadToSearch.replies) rootReplies = threadToSearch.replies as ThreadViewPost[];
        // if(postDetails.currentThreadView.replies) rootReplies = postDetails.currentThreadView.replies as ThreadViewPost[];//old version tied to `currentThreadView`
        /**Has the Post been found. */
        let isPostFound = false;
        /**Indicates if the matching Post is the Root Post of the thread.*/
        let isPostRoot = false;
        /**Index position in currentThreadView where the matching Post is located.*/
        let postPosition = [0,0];
        /**The found ThreadViewPost Post data. */
        let foundPostThread = emptyPostThread;

        //first check if parent Post is what we're looking for
        if(threadToSearch.post.cid == postCid){
            isPostRoot = isPostFound = true;
            foundPostThread = threadToSearch;
        }
        //if not parent post, check immediate replies and their replies
        for (let i = 0; i < rootReplies.length; i++){
            //If post is a direct reply to a reply, we add it to the list and increase the parent post's replyCount
            if((rootReplies[i] as ThreadViewPost).post.cid == postCid){
                i = rootReplies.length;//end search
                foundPostThread = rootReplies[i];
                postPosition = [i,0];
                isPostFound = true;
            }
            //check each reply's list of replies
            /**Holds list of replies to the focused Post's immediate replies. */
            let replyReplies = [] as ThreadViewPost[];
            if(rootReplies[i].replies) replyReplies = rootReplies[i].replies as ThreadViewPost[];
            if(!isPostFound){
                for (let j = 0; j < replyReplies.length; j++){
                    if(replyReplies[j].post.cid == postCid){
                        j = replyReplies.length; //end search
                        foundPostThread = replyReplies[j];
                        postPosition = [i,j];
                        isPostFound = true;
                    }
                }
            }
        }
        return {postFound:isPostFound,foundPostThreadView:foundPostThread,isRoot:isPostRoot,postPosIndex:postPosition};
    },
    createPostData(data) {
        var postData = data.post;
        var post : IPostDetails = {
            userName : postData.author.displayName ? postData.author.displayName : "",
            userHandle: postData.author.handle,
            postText: postData.record.text,
            postType: PostEnums.PostTypes.Image,
            // postMedia: [postData.embed?.images[0] ? postData.embed?.images[0].fullSize : ""],
            postMedia: [postData.embed?.images[0].fullsize],
            // postMedia: [postData.author.avatar ? postData.author.avatar : ""],
            comments: [],
            totalComments: postData.replyCount ? postData.replyCount : 0,
            totalLikes: postData.likeCount ? postData.likeCount : 0,
            totalReposts: postData.repostCount ? postData.repostCount : 0,
        }
    },
    showModal(){
        this.isVisible = true;
    },
    showModalPost(postToShow:FeedViewPost){
        this.isVisible = true;
        // this.postData = updatePostDetails(postToShow);
        this.currentPostData = postToShow;
    },
    hideModal(){
        this.isVisible = false;
    },
    // /**
    //  * Method that shows "Focus" modal - media on left with comments
    //  * in right sidebar. This is the initial version created that used
    //  * dummy data.
    //  */
    // showFocusModal(postToShow:IPostDetails, mediaIndex:number){
    //     postDetails.isFocusVisible = true;
    //     this.clickedMediaIndex = mediaIndex;
    //     this.postData = updatePostDetails(postToShow)
    // },
    /**
     * DO NOT USE
     * ---------------
     * Method that shows "Focus" modal - media on left with comments
     * in right sidebar. This is the live version that accesses the
     * Bluesky API
     */
    showFocusModalIndex(mediaIndex:number){
        // postDetails.isFocusVisible = true;
        // this.clickedMediaIndex = mediaIndex;
    },
    /**
     * Method that hides "Focus" modal - media on left with comments
     * in right sidebar.
     */
    hideFocusModal(){
        postDetails.isFocusVisible = false;
        //Clear URI of Post Thread to show
        this.uriOfPostToShow = '';
        // this.threadNavIndex = 0; //Clear thread navigation history
        // this.threadNavHistory = [emptyPostThread];
    },
    isPostOptionsMenuVisible: false,
    /**
     * Shows the "Post Options" menu.
     */
    showPostOptionsMenu(event:PointerEvent){
        (event.target as HTMLElement).classList.add('text-white') //keep button "hover" state
        this.isPostOptionsMenuVisible = true;
        this.clickedElement = event.currentTarget;

        var el = document.getElementById('post-option-menu');
        var appViewport = document.getElementById('app-viewport')
        setTimeout(() => {
            if(!el || !appViewport) return;
            var menuHeight = el.clientHeight;
            var menuWidth = el.clientWidth;
            var viewportHeight = appViewport.offsetHeight;
            var viewportWidth = appViewport.offsetWidth;
            this.menuClickPos = [event.clientX, event.clientY];
            var xTarget = this.menuClickPos[0];
            var yTarget = this.menuClickPos[1];
            var menuYClearence = viewportHeight - (menuHeight+yTarget);
            var menuXClearence = viewportWidth - (menuWidth+xTarget);

            if(menuYClearence < 0){
                // this.menuClickPos = [event.clientX, event.clientY-menuHeight];
                yTarget = event.clientY-menuHeight;
            }
            if(menuXClearence < 0){
                xTarget = event.clientX-menuWidth;
            }
            this.menuClickPos = [xTarget, yTarget];
        }, 100);
    },
    /**
     * Hides the "Post Options" menu.
     */
    hidePostOptionsMenu(event:PointerEvent){
        // if((event.target === (event.currentTarget as HTMLElement).children[1])){
        if((event.target as HTMLElement).classList.contains('menu-closer')){
            //remove button "hover" state
            (event.target as HTMLElement).parentElement?.parentElement?.children[0].classList.remove('text-white');
            this.clickedElement.classList.remove('text-white');
            var el = document.getElementById('post-option-menu');
            el.style.top = '-500px';
            this.isPostOptionsMenuVisible = false;
        }
    },
    /**
     * Method that returns a string describing what type of Users can reply to the current post.
     * To be used wherever that info needs to be communicated to the User (`PostFocusModal`, `PostInteractionIcons`).
     */
    whoCanReply(postToCheck:PostView):String{
        if(postToCheck.threadgate){
            let tgRecord = postToCheck.threadgate.record as AppBskyFeedThreadgate.Record
            if(tgRecord.allow && tgRecord.allow.length>0){
                let replyString = '';
                for (let i = 0; i < tgRecord.allow.length; i++) {
                    if(i>0 && i<tgRecord.allow.length-1) replyString += ', ';
                    else if(i != 0 && i == tgRecord.allow.length-1) replyString += ' and ';
                    if(AppBskyFeedThreadgate.isMentionRule(tgRecord.allow[i])) replyString += "Mentioned"
                    else if(AppBskyFeedThreadgate.isFollowingRule(tgRecord.allow[i])) replyString += "Followed By"
                    else if(AppBskyFeedThreadgate.isFollowerRule(tgRecord.allow[i])) replyString += "Following"
                    else if(AppBskyFeedThreadgate.isListRule(tgRecord.allow[i])) replyString += "Listed"
                }
                replyString += ' Users may Reply'
                return replyString;
            }
            else return 'Replies Disabled';
        }
        else{return 'Everybody can Reply'}
    },
    clickedElement: document.children[0].children[1].children[1] as HTMLElement,
    postDetailIconValues: [
        { label: 'N/A', type:IconTypes.Comment, icon: SolarChatDotsOutline, color: 'group-hover:text-yellow-500' },
        { label: 'N/A', type:IconTypes.Reposts, icon: MingcuteRepeatLine, color: 'group-hover:text-blue-500' },
        { label: 'N/A', type:IconTypes.Likes, icon: MingcuteHeartFill, color: 'group-hover:text-red-500' },
        { label: '', type:IconTypes.Share, icon: SolarShareBold, color: 'group-hover:text-blue-500' },
        { label: '', type:IconTypes.Options, icon: MdiDotsHorizontal, color: 'group-hover:text-white-500' },
    ],
    updatePostDetailIconValues(comments:string = "", reposts:string = "", likes:string = ""){
        if(comments) this.postDetailIconValues[0].label = comments;
        if(reposts) this.postDetailIconValues[1].label = reposts;
        if(likes) this.postDetailIconValues[2].label = likes;
    },
})

function updatePostDetails(postToOpen:IPostDetails):IPostDetails{
    return postToOpen;
}
/**
 * Method that is used to return a Post thread matching a specific cid. Used
 * by PostFocusModal component.
 * @param cid The unique cid value of the ThreadViewPost object we're trying to find.
 * @param repliesArray The ThreadViewPost object representing the Post "thread" we will search.
 */
function findThreadView(cid:string, repliesArray:ThreadViewPost):ThreadViewPost|undefined {
    var result;
    //Check if current ThreadViewPost is the one we're looking for
    if(repliesArray.post.cid === cid) result = repliesArray;
    //If match found, skip replies check...
    if(result == undefined){
        //otherwise...
        //If match is not found, check if it has replies that can be searched
        if(Array.isArray(repliesArray.replies) && repliesArray.replies.length > 0){
            //replies is NOT empty - time to check each object in the array
            for (let i = 0; i < repliesArray.replies.length; i++) {
                result = findThreadView(cid, repliesArray.replies[i])
                //If a result has been returned, stop the for loops
                if(result != undefined){
                    i = repliesArray.replies.length;
                }
            }
        }
    }
    //Return final result
    return result;
}

/**
 * Method used to generate the "breadcrumb" labels used to illustrate the current "reply tree"
 * location relative to the originally loaded ThreadViewPost object.
 * @param parentCID The unique cid value of the "Parent" ThreadViewPost object we're trying to find.
 * @param currentPostThread The ThreadViewPost object representing the Post "thread" who's parent we are looking for.
 */
function discoverBreadcrumbs(parentCID:string, currentPostThread:ThreadViewPost){
    var result;
    //get the parent element
    var parentThread = findThreadView(parentCID, postDetails.postThread);
    //If this has a reply object we have not gotten to the top level ThreadViewPost
    if(parentThread.post.record.reply){
        result = parentThread.post.author.displayName;
        postDetails.currentBreadcrumb.unshift({userName:parentThread.post.author.displayName, postCID:parentThread?.post.cid});
        discoverBreadcrumbs(parentThread?.post.record.reply.parent.cid,parentThread);
    }
}

/**
 * Method that opens a "Post Detail Modal" (central display, text
 * focus) with data associated with the Post that was selected
 * in a Feed View (`FeedColumn`).
 * @param postToShow The Post you want to see the Thread View for.
 */
export async function showDetailModal(postToShow:FeedViewPost){
    postDetails.isVisible = true;
    await getPostThread(postToShow.post.uri)
    .then(res => {
        postDetails.postThread = res.data.thread as ThreadViewPost
        postDetails.currentThreadView = res.data.thread as ThreadViewPost;
    })
    .catch(err => toast.add(HandleAPIError(err, 'Error getting Post details for modal')));
}

/**
 * Method that shows "Focus" modal - media on left with comments
 * in right sidebar. This is the live version that pulls data through
 * the Bluesky API.
 */
export async function showFocusModal(postToShow:FeedViewPost, mediaIndex:number){
    postDetails.isAwaitingFocusData = true;
    postDetails.isFocusVisible = true;
    postDetails.clickedMediaIndex = mediaIndex;
    postDetails.uriOfPostToShow = postToShow.post.uri;
}
</script>