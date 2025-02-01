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
import { ThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

// export const postDetails : IPostDetailsList = reactive({
export const postDetails :IPostDetailsList = reactive({
    isVisible: false,
    isFocusVisible: false,
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
    setCurrentThreadView(cid: string, parentCID: string) {
        var returnedThreadView = findThreadView(cid,this.postThread);
        console.log(returnedThreadView);

        const parentContext = this.postThread.replies?.find((reply) => reply.post.cid === parentCID);
        console.log('Parent context:');
        console.log('ParentCID '+parentCID);
        var result;
        if(!parentContext){
            console.log('Reply ThreadView found through parent context failed, checking direct replies')
            result = this.postThread.replies?.find((reply) => reply.post.cid === cid);
        }else{
            console.log('Reply ThreadView found through parent, succeeded');
            result = parentContext.replies?.find((reply) => reply.post.cid === cid);
        }
        console.log(cid);
        console.log('Result:');
        console.log(result);
        if(result){
            this.currentThreadView = result;
        }
        else if(parentContext){
            this.currentThreadView = parentContext;
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
    currentBreadCrumb : ["Origin"],
    /**
     * Method that updates currently displayed reply breadcrumb labels.
     * Should be called any time the currentThreadView is changed.
     */
    updateCurrentBreadcrumbs(){
        //If there the reply object containing the parent ref does not exist
        if(!postDetails.currentThreadView.post.record.reply){
            postDetails.currentBreadCrumb.splice(0, postDetails.currentBreadCrumb.length, ...["Origin"]);
        }
        else{
            var breadcrumbs = [];
            postDetails.currentBreadCrumb.splice(0, postDetails.currentBreadCrumb.length, ...["Origin", postDetails.currentThreadView.post.author.handle]);
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
    showModalPost(postToShow:IPostDetails){
        this.isVisible = true;
        this.postData = updatePostDetails(postToShow);
    },
    hideModal(){
        this.isVisible = false;
    },
    /**
     * Method that shows "Focus" modal - media on left with comments
     * in right sidebar. This is the initial version created that used
     * dummy data.
     */
    showFocusModal(postToShow:IPostDetails, mediaIndex:number){
        postDetails.isFocusVisible = true;
        this.clickedMediaIndex = mediaIndex;
        this.postData = updatePostDetails(postToShow)
    },
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
    }
})

function updatePostDetails(postToOpen:IPostDetails):IPostDetails{
    return postToOpen;
}
function find2(id, array) {
    var result;
    array.some(o => o.id === id && (result = o) || (result = findThreadView(id, o.children || [])));
    return result;
}
function findThreadView(cid:string, repliesArray:ThreadViewPost) {
    var result;
    var loops = 0;
    var isResultFound = false;
    console.log('findThreadView() start:');
    console.log(repliesArray);
    //Check if passed object has a "replies" array
    if(Array.isArray(repliesArray.replies)){
        // for(let reply of repliesArray.replies) {
        for (let i = 0; i < repliesArray.replies.length; i++) {
            var reply = repliesArray.replies[i];
            // // console.log('findThreadView() start, cid value: '+cid)
            // if(repliesArray.post === undefined) break;// return undefined;
            // // if(repliesArray.post.cid == cid) result = repliesArray;
            // repliesArray.post.cid === cid ? result = repliesArray :
            // repliesArray.replies?.some(o => o.post.cid === cid && (result = o) || (result = findThreadView(cid, o.replies || [])));
            // // repliesArray.post.cid === cid ? result = repliesArray : findThreadView(cid, repliesArray.replies);
            // if(result != undefined) break;
            if(isResultFound) break;
            loops++;
            console.log('Loop: '+loops);

            // console.log('findThreadView() start, cid value: '+cid)
            // if(reply.post === undefined) return;
            // if(repliesArray.post.cid == cid) result = repliesArray;

            // reply.post.cid === cid ? result = repliesArray :
            // reply.replies?.some(o => o.post.cid === cid && (result = o) || (result = findThreadView(cid, o || [])));

            // repliesArray.post.cid === cid ? result = repliesArray : findThreadView(cid, repliesArray.replies);

            //Check Post first to see if it matches cid before moving
            //on to replies
            if(reply.post.cid === cid){
                result = reply.post;
                isResultFound = true;
                i = repliesArray.replies.length
                return result;
            }
            else{
                result = findThreadView(cid, reply);
            }

            // if(result != undefined){
            //     console.log('We found a record. Breaking out.');
            //     i = repliesArray.replies.length
            //     return result;
            // }
        }
    }
    else //If this object does not have a "replies" array, check if the "post" object has a matching cid
    {
        console.log('no replies, checking the "post" object')
        repliesArray.post.cid === cid ? result = repliesArray : result = undefined;
    }
    console.log('Result of findThreadView() search loop '+loops+':');
    return result;
}
</script>