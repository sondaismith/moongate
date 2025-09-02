<script lang="ts">
import { reactive } from 'vue'
import { IConfirmationTask } from '../components/Utilities/ConfirmModal.vue';
import { ToastEventBus } from 'primevue';
import { authAgent, guestAgent } from '../lib/api.vue';
import { Agent } from '@atproto/api';
import { ViewImage } from '@atproto/api/dist/client/types/app/bsky/embed/images';
import { UserFocusModalState } from './UserFocusModalState.vue';
import { ViewExternal } from '@atproto/api/dist/client/types/app/bsky/embed/external';
import { postDetails } from './PostDetails.vue';
import { FeedState } from './FeedList.vue';
import { PostView, ThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

export const toast = {
    add: (message) => ToastEventBus.emit('add', message),
    removeGroup: (group) => ToastEventBus.emit('remove-group', group),
    removeAllGroups: () => ToastEventBus.emit('remove-all-groups'),
};

/**
 * Copies the passed in text value to the User's clipboard.
 * @param textToCopy The text to copy.
 * @param copyAction Affects the message displayed when copying is successful.
 * Default is 'text' (e.g. Text Copied).
 */
export function CopyTextToClipboard(textToCopy:string, copyAction:'text'|'link' = 'text'){
    if(navigator.clipboard){//Modern method - requires app to serve page(s) over HTTPS
        try{
            navigator.clipboard.writeText(textToCopy ? textToCopy : '');
            toast.add({summary:`${copyAction[0].toUpperCase()+copyAction.substring(1)} Copied`,
                severity:'success', group:'bc', life:1000});
        }
        catch(err){
            console.error('Unable to copy to clipboard', err);
            toast.add({summary:`Error copying ${copyAction}`,severity:'error', group:'bc', life:1000});
        }
    }
    else{
        //Unsecured text copy
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy ? textToCopy : '';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try{
            document.execCommand('copy');
            toast.add({summary:`${copyAction[0].toUpperCase()+copyAction.substring(1)} Copied`,
                severity:'success', group:'bc', life:1000});
        }
        catch(err){
            console.error('Unable to copy to clipboard', err);
            toast.add({summary:`Error copying ${copyAction}`,severity:'error', group:'bc', life:1000});
        }
        document.body.removeChild(textArea);
    }
}

/**
 * Method used to trap tab focus to an element, preventing
 * unwanted selection of elements behind it.
 * Thanks to Ben Nadel at
 * https://www.bennadel.com/blog/4096-trapping-focus-within-an-element-using-tab-key-navigation-in-javascript.htm.
 * @param el The element to trap focus in.
 * @param e The Keydown KeyboardEvent that the method is called with.
 */
export function TrapFocus(el:HTMLElement, e: KeyboardEvent){
    let tabbable = el.querySelectorAll("button, input, select, textarea, [href], [tabindex]:not([tabindex='-1'])") as NodeListOf<HTMLElement>;
    let target = e.target;
    if(e.key.toLowerCase() !== 'tab') return; //cancel further actions
    if(e.shiftKey){
        if(target == el || target == tabbable[0]){
            e.preventDefault();
            tabbable[tabbable.length-1].focus();
        }
    }
    else{
        if(target == tabbable[tabbable.length-1]){
            e.preventDefault();
            tabbable[0].focus();
        }
    }
}

export default{
    name:"AppState"
}

/**
 * Object that defines the current App state. Controls values such
 * as theming, current user, etc.
 */
export const AppState = reactive({
    /**Is the app in Dark Mode. If false, the light theme is used. */
    isDarkMode: true,
    /**
     * Is the user browsing Bluesky as a guest - not using a user
     * account. Will prevent the user from being able to see all
     * posts. NOTE: if this is true, `isAuthBrowsing` must be false.
     */
    isGuestBrowsing: false,
    /**
     * Is the user browsing Bluesky with a user account. NOTE: if this is
     * true, `isGuestBrowsing` must be false.
     */
    isAuthBrowsing: false,
    /**
     * Value indicating the user can interact with the app.
     * Confirms the user has either logged in or chosen to
     * browse as a guest.
     */
    canBrowse: false,
    /**
     * Method that checks if `canBrowse` is true (meaning the user has
     * selected a browsing mode) or false. Returns `canBrowse` value.
     * Used to ensure user has selected a browsing mode, so it will
     * display a Toast message and open the `LoginModal`.
     */
    checkIfCanBrowse(){
        //If the user cannot currently browse, have them select
        //how they would like to browse
        if(!this.canBrowse){
            toast.add({summary:"Error", detail:`Please choose how you would like to browse.`, severity:'error', group:'tr', life:3000})
            this.isLoggingIntoAccount = true;
            return this.canBrowse;
        }
        return this.canBrowse;
    },
    /**
     * Method used to check if the User is logged in. This is called when the User attempts to perform
     * and action that requires them to have authenicated access to the Bluesky API (e.g. making new Posts).
     * If they are not logged in a message is displayed and the Login Modal is displayed.
     * @param action String describing the action that needs authentication to be performed (e.g. post). Used with Toast error message.
     *
     */
    checkIfLoggedIn(action:string){
        if(!this.isAuthBrowsing){
            toast.add({summary:"Error", detail:`In order to ${action} you must be logged in.`, severity:'error', group:'tr', life:3000});
            this.isLoggingIntoAccount = true;
            return this.isAuthBrowsing;
        }
        return this.isAuthBrowsing;
    },
    /**
     * Returns the `Agent` to access the Bluesky API with based on
     * the current browsing mode the app is in.
     */
    getBrowsingAgent():Agent{
        if(AppState.isAuthBrowsing){
            return authAgent;
        }
        else{
            return guestAgent;
        }
    },
    /**
     * The name of the currently logged in user.
     * This variable might belong in another State.
     */
    currentUsername: "Login Here",
    currentPFP: '',
    /**Is the user currently trying to create a new Feed to add to the
     * view.
     */
    isCreatingFeed: false,
    /**Is the user currently editing an existing Feed. */
    isUpdatingFeed: false,
    /**Is the LoginModal currently open. */
    isLoggingIntoAccount: false,
    /**Is the UserFocusModal currently open. */
    isViewingUserAccount: false,
    /**Toggles display of `FeedEditModal` component. */
    ToggleCreateFeedModal(){
        AppState.isCreatingFeed = !AppState.isCreatingFeed;
    },
    HideEditFeedModal(){
       AppState.isCreatingFeed = AppState.isUpdatingFeed = false;
    },
    /**
     * Toggles display of `UserFocusModal` component.
     * @param userDID The User you want to view the profile page of.
     */
    ToggleUserFocusModal(userDID:string | undefined){
        AppState.isViewingUserAccount = !AppState.isViewingUserAccount;
        if(userDID && userDID.trim() != ''){
            UserFocusModalState.currentUserAccountDID = userDID;
        }
    },
    /**Method used to hide the `UserFocusModal`. */
    ShowUserFocusModal(userDID:string | undefined){
        if(userDID && userDID.trim() != ''){
            UserFocusModalState.currentUserAccountDID = userDID;
            AppState.isViewingUserAccount = true;
        }
    },
    /**Method used to hide the `UserFocusModal`. */
    HideUserFocusModal(){
        AppState.isViewingUserAccount = false;
    },
    ToggleLoginModal(){
        AppState.isLoggingIntoAccount = !AppState.isLoggingIntoAccount;
    },
    /**Determines whether or not the `ConfirmModal` is currently visible. */
    isAskingForConfirmation: false,
    /**Discribes the action that is awaiting confirmation via the `ConfirmModal`. */
    currentConfirmationTask: {Message:'Default Message: Confirm Action', Task:()=>void 0} as IConfirmationTask,
    /**Sets `ConfirmModal` to be displayed. */
    showConfirmModal(message:string, task:Function){
        this.currentConfirmationTask.Message = message;
        this.currentConfirmationTask.Task = task;
        this.isAskingForConfirmation = true;
    },
    /**Sets `ConfirmModal` to be hidden. */
    hideConfirmModal(){
        this.isAskingForConfirmation = false;
    },
    /**Determines whether or not the `CreatePost` component is currently visible. */
    isCreatingNewPost:false,
    /**Sets `CreatePost` to be displayed. */
    showCreatePost(){
        this.isCreatingNewPost = true;
    },
    /**Sets `CreatePost` to be hidden. */
    hideCreatePost(){
        this.isCreatingNewPost = false;
        postDetails.isReplyingToPost = postDetails.isQuotingPost = false;
    },
    //#region Reply creation
    /**
     * Method that adds 1 to the displayed `replyCount` of a reply's parent post.
     * Checks every Post in each currently displayed Feed.
     * @param replyParentCid The CID of the parent post of the reply.
     * @param currentReplyCount The current value of the parent post's `replyCount` variable.
     */
    updateReplyParentsInLists(replyParentCid:string, currentReplyCount:number){
        let feedUpdates = 0;
        //Update Feeds that may hold the post that was replied to
        FeedState.FeedList.forEach(feed => {
            //find all Posts in feed that match the parent of the reply
            let postsThatWereRepliedTo = feed.data.filter(x=>x.post.cid == replyParentCid);
            if(postsThatWereRepliedTo.length>0){
                feedUpdates++;
                postsThatWereRepliedTo.forEach(feedPost => {
                    feedPost.post.replyCount = currentReplyCount;//increase the reply count for each matching Post
                });
            }
            // postDetails.currentThreadView.post.replyCount = currentReplyCount+1;
        });
        // postDetails.currentThreadView.post.replyCount = currentReplyCount+1;
        console.log(`Updated reply count in ${feedUpdates} Feed(s).`);
    },
    //#endregion
    /**
     * Method that updates any other instances of the Post that was interacted with (replied to, reposted
     * or liked) in all visible Feeds. Used to keep the state of the Post consistent throughout the app.
     * @param updatedPostData The PostView object holding the data of the Post that was just interacted with.
     */
    UpdatePostsInFeedList(updatedPostData:PostView){
        let feedUpdates = 0;
            //Update Feeds that may hold the post that was replied to/reposted/liked
            FeedState.FeedList.forEach(feed => {
                //find all Posts in feeds that match
                let matchingPosts = feed.data.filter(x=>x.post.cid == updatedPostData.cid);
                if(matchingPosts.length>0){
                    feedUpdates++;
                    matchingPosts.forEach(feedPost => {
                        feedPost.post.replyCount = updatedPostData.replyCount;//increase the reply count
                        feedPost.post.repostCount = updatedPostData.repostCount;//increase the repost count
                        feedPost.post.likeCount = updatedPostData.likeCount;//increase the like count
                        feedPost.post.viewer = updatedPostData.viewer//add updated Reply/Repost/Like URI data to `post.viewer`
                    });
                }
            });
            console.log(`Updated Posts in ${feedUpdates} Feed(s).`);
    },
    //#region Post Deletion
    /**
     * Method that removes all references of a specific Post from every component that
     * might hold a reference to it. Currently checks `FeedState.FeedList` and
     * `postDetails.currentThreadView`.
     * @param deleteCid The CID of the Post to be removed from visible components.
     */
    removeDeletedPostFromLists(deleteCid:string){
        let feedDeletions = 0;
        //Update Feeds that may hold the post that was deleted
        FeedState.FeedList.forEach(feed => {
            if(feed.data.length != feed.data.filter(x=>x.post.cid != deleteCid).length){
                feedDeletions++;
            }
            feed.data = feed.data.filter(x=>x.post.cid != deleteCid);
        });
        console.log(`Removed deleted Post from ${feedDeletions} Feed(s).`);
        //Update Post thread view that may hold deleted Post
        //Check root post
        if(postDetails.currentThreadView.post.cid == deleteCid){
            postDetails.hideFocusModal();//close component if the deleted post is the one shown
            console.log(`Deleted post was being shown as focused Post in PostFocusModal - closed modal.`);
            return;
        }
        //Check replies
        else if(postDetails.currentThreadView.replies){
            let updatedThreadView = [];
            let isDeletedPostFound = false;
            for (let i = 0; i < postDetails.currentThreadView.replies.length; i++) {
                //Will remove deleted post if it is a direct reply
                if((postDetails.currentThreadView.replies[i] as ThreadViewPost).post.cid != deleteCid){
                    //add "parent" reply
                    updatedThreadView.push((postDetails.currentThreadView.replies[i] as ThreadViewPost));
                    if(!isDeletedPostFound){
                        //add replies to the reply if there are any (and haven't been deleted)
                        let numReplies = (postDetails.currentThreadView.replies[i] as ThreadViewPost).replies ? (postDetails.currentThreadView.replies[i] as ThreadViewPost).replies.length : 0;
                        for (let j = 0; j < numReplies; j++) {
                            if(((postDetails.currentThreadView.replies[i] as ThreadViewPost).replies[j] as ThreadViewPost).post.cid == deleteCid){
                                updatedThreadView[i].replies?.splice(j,1) //= (postDetails.currentThreadView.replies[i] as ThreadViewPost).replies?.splice(j,1);
                                //remove 1 reply count from parent
                                if(updatedThreadView[i].post.replyCount) updatedThreadView[i].post.replyCount--;
                                j = numReplies; //end search early
                                isDeletedPostFound = true;
                            }
                        }
                    }
                }
                else{
                    //we deleted a Post that was a reply to the "focused" Post - decrease its reply count
                    if(postDetails.currentThreadView.post.replyCount) postDetails.currentThreadView.post.replyCount--;
                    //Update reply count for parent posts of deleted post in each Feed
                    FeedState.FeedList.forEach(feed => {
                        //Find every instance of parent post in Feed
                        feed.data.filter(x=>x.post.cid == postDetails.currentThreadView.post.cid).forEach(parent => {
                            parent.post.replyCount--;
                        });
                    });
                }
            }
            //update display with deleted Post removed
            postDetails.currentThreadView.replies = updatedThreadView;
        }
    },
    //#endregion
    /**
     * Value used to determine if modal for saving Post media
     * is currently visible.
     */
    isSavingMediaModalVisible:false,
    /**Value holding details relating to the media to download/save. */
    saveMedia:{} as ViewImage|ViewExternal,
    /**Value used to hold the default file name to use for media being saved. */
    fileSaveDetails:{
        /**The full filename that will be used when saving the file. Can be updated by control on `SaveMediaModal`. */
        full:'',
        /**The original filename the image had on the server. */
        originalFilename:'',
        /**The file extension of the file to be downloaded. */
        extension:'.jpg',
        /**The handle of the account that posted/shared the image. */
        handle:'',
        /**The text (if any) that was posted along with the image. */
        postText:''
    },
    /**Value used to indicate the progress of downloading a media file. */
    fileSaveDownloadPercent:0,
    /**
     * Value used to store the last directory chosen to save
     * Post media to.
     */
    lastMediaSaveDirectory:'',
    /**Variable that indicates if the Settings Panel component is visible or not. */
    isSettingsPanelVisible: false,
    /**Method that causes the Settings Panel to be displayed. */
    ShowSettingsPanel(){ this.isSettingsPanelVisible = true;},
    /**Method that causes the Settings Panel to be hidden. */
    HideSettingsPanel(){ this.isSettingsPanelVisible = false;},
    /**
     * Method that handles focusing the most important component/element when
     * another is closed/hidden.
     */
    handleFocusOnComponentClose(){
        //Right now this handles `UserFocusModal` and `PostFocusModal`
        //since they are the only components that can overlay. In the
        //future the code here should handle focusing the right element
        //whenever it would be useful in relation to accessibility/usability.

        //`PostFocusModal` can overlay `UserFocusModal` - when it is closed we
        //should focus the `UserFocusModal` if it's still open
        if(this.isViewingUserAccount){
            let userFocusModal = document.getElementById('user-focus-container');
            if(userFocusModal) userFocusModal.focus();
        }
        else{
            //there's no modal/overlay open, focus whatever is useful in the
            //main application window
        }
    },
    /**
     * Value used to indicate if the "Feed Order Change" modal
     * is currently visible.
     */
    isUpdatingFeedPosition:true,
    /**Method that causes the "Feed Order Change" modal to be displayed. */
    showFeedOrderModal(){ this.isUpdatingFeedPosition = true; },
    /**Method that causes the "Feed Order Change" modal to be hidden. */
    hideFeedOrderModal(){ this.isUpdatingFeedPosition = false; },
})
</script>