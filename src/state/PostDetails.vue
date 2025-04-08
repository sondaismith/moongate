<script lang="ts">
import { reactive } from 'vue'
import { IPostDetails, IPostDetailsList } from '../interfaces/PostInterfaces';
import { IconTypes } from '../enums/PostEnums';
import { emptyPostModalData, emptyPostThread } from '../fake-data/dumPostData';

//DetailIcon Icons
import SolarChatDotsOutline from '~icons/solar/chat-dots-outline';
import MingcuteRepeatLine from '~icons/mingcute/repeat-line';
import MingcuteHeartFill from '~icons/mingcute/heart-fill';
import SolarShareBold from '~icons/solar/share-bold';
import MdiDotsHorizontal from '~icons/mdi/dots-horizontal';
import { FeedViewPost, ThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { getPostThread } from '../lib/api/Post.vue';
import { toast } from './AppState.vue';
import { HandleAPIError } from '../helpers/errors';

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
    getClickedMediaIndex() {
        return this.clickedMediaIndex;
    },
    setClickedMediaIndex(newVal:number) {
        this.clickedMediaIndex = newVal;
    },
    menuClickPos: [0, -500],
    postData: emptyPostModalData,
    postThread : emptyPostThread,
    currentThreadView : emptyPostThread,
    setCurrentThreadView(cid: string) {
        var result = findThreadView(cid,this.postThread);

        if(result){
            this.currentThreadView = result;
        }
        else{
            //go back to Post origin ThreadView
            console.log('Finding Post ThreadView failed :(');
            this.currentThreadView = this.postThread;
        }
        this.updateCurrentBreadcrumbs();
    },
    /**
     * Method that resets the current ThreadView back to the Post
     * origin.
     */
    returnToThreadOrigin() {
        this.currentThreadView = this.postThread;
        this.updateCurrentBreadcrumbs();
    },
    currentBreadcrumb : [{userName:"Origin",postCID:"this_cid_is_unset"}],
    /**
     * Method that updates currently displayed reply breadcrumb labels.
     * Should be called any time the currentThreadView is changed.
     */
    updateCurrentBreadcrumbs(){
        //If there the reply object containing the parent ref does not exist
        if(!postDetails.currentThreadView.post.record.reply){
            postDetails.currentBreadcrumb.splice(0, postDetails.currentBreadcrumb.length, ...[{userName:"Origin",postCID:"root"}]);
        }
        else{
            //reset breadcrumbs
            postDetails.currentBreadcrumb.splice(0, postDetails.currentBreadcrumb.length, ...[]);
            discoverBreadcrumbs(this.currentThreadView.post.cid, this.currentThreadView);
            //add origin "home button" to start of breadcrumbs
            postDetails.currentBreadcrumb.unshift({userName:"Origin",postCID:"this_cid_is_unset"});
        }
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
        this.postData = postToShow;
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
     * Method that shows "Focus" modal - media on left with comments
     * in right sidebar. This is the live version that accesses the
     * Bluesky API
     */
    showFocusModalIndex(mediaIndex:number){
        postDetails.isFocusVisible = true;
        this.clickedMediaIndex = mediaIndex;
    },
    /**
     * Method that hides "Focus" modal - media on left with comments
     * in right sidebar.
     */
    hideFocusModal(){
        postDetails.isFocusVisible = false;
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
    /**
     * DID of the user account details that are currently being shown in
     * the `UserFocusModal` component.
     */
    currentUserAccountDID:'',
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
    await getPostThread(postToShow)
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
    await getPostThread(postToShow)
    .then(res => {
        postDetails.postThread = res.data.thread as ThreadViewPost;
        postDetails.currentThreadView = res.data.thread as ThreadViewPost;
        postDetails.isAwaitingFocusData = false;
    })
    .catch(err => toast.add(HandleAPIError(err, 'Error getting Post thread for focus modal')));
}
</script>