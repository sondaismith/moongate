<script lang="ts">
import { reactive } from 'vue'
import { IConfirmationTask } from '../components/Utilities/ConfirmModal.vue';
import { ToastEventBus } from 'primevue';
import { authAgent, guestAgent } from '../lib/api.vue';
import { Agent, AppBskyEmbedImages, AppBskyEmbedExternal, AppBskyActorDefs, AppBskyFeedDefs } from '@atproto/api';
import { UserFocusModalState } from './UserFocusModalState.vue';
import { postDetails } from './PostDetails.vue';
import { FeedState, RefreshAllFeeds } from './FeedList.vue';
import { AppSettingsState } from './AppSettingsState.vue';
import { LoginState } from '../interfaces/AccountInterfaces';
import { FeedEnums } from '../enums/FeedEnums';
import { router } from '../main';
import { BroadcastChannelTarget, BroadcastObject } from '../types/BroadcastChannelTypes';
import { AccountPeekState } from './AccountPeekState.vue';

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
    let tabbable = el.querySelectorAll("button:not([disabled]), input, select, textarea, [href], [tabindex]:not([tabindex='-1'])") as NodeListOf<HTMLElement>;
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

/**List of the accepted external GIF sources. */
export const externalGIFSources:string[] = ['https://media.tenor.com','https://static.klipy.com','https://giphy.com/gifs/','localhost:1420/'];
//Might be better to make an enum of the supported sources, and then make an array from that enum

export default{
    name:"AppState"
}

/**
 * Object that defines the current App state. Controls values such
 * as theming, current user, etc.
 */
export const AppState = reactive({
    /**BroadcastChannel used to keep elements of applications in sync when using multiple tabs/windows. */
    moongateBroadcastChannel: new BroadcastChannel('moongate_bc'),
    /**
     * Method used to send messages used to sync the application state between tabs/windows
     * via the `BroadcastChannel`.
     * @param messagePayload The data to sync between tabs/windows.
     */
    SendAppSyncMessage(messagePayload:BroadcastObject){
        this.moongateBroadcastChannel.postMessage(messagePayload);
    },
    /**Is the app in Dark Mode. If false, the light theme is used. */
    isDarkMode: true,
    /**
     * Is the user browsing Bluesky as a guest - not using a user
     * account. Will prevent the user from being able to see all
     * posts. NOTE: if this is true, `isAuthBrowsing` must be false.
     */
    isGuestBrowsing: false,
    /**
     * Method used to switch browsing mode to "Guest Mode".
     * Updates `AppSettingsState` and prints toast message.
     */
    browseAsGuest(){
        this.isAuthBrowsing = false;
        this.isGuestBrowsing = true;
        this.currentUsername = "Guest";
        this.canBrowse = true;
        AppSettingsState.Settings.savedAccountState = {
            ...AppSettingsState.Settings.savedAccountState,
            currentAccount:-1,
            state:LoginState.Guest
        }
        toast.add({summary:'Browsing', detail:'Viewing content as guest.', severity:'info', group:'tr', life:3000})
    },
    /**
     * Method used to make sure the variables held in `AppState` for determining "Login Status"
     * are up to date and match what is held in `AppSettingsState.Settings.savedAccountState`.
     * This method should only need to be used when handling the "App Settings" `BroadcastChannel` message used
     * to sync application states over multiple tabs/windows.
     */
    updateAppStateLoginValues(){
        switch (AppSettingsState.Settings.savedAccountState.state) {
            case LoginState.Authorized:
                this.isAuthBrowsing = true;
                this.isGuestBrowsing = false;
                this.currentUsername = "Logged In";
                this.canBrowse = true;
                break;
            case LoginState.Guest:
                this.isAuthBrowsing = false;
                this.isGuestBrowsing = true;
                this.currentUsername = "Guest";
                this.canBrowse = true;
                break;
            default://Unset - no browsing mode choice made
                this.canBrowse = this.isGuestBrowsing = this.isAuthBrowsing = false;
                this.currentUsername = "Login Here";
                break;
        }
    },
    /**
     * Method used to update the Application state after logging out of a
     * guest or authorized account. Mainly used to update visual elements so
     * they correctly reflect the new "logged out" state. Refreshes displayed
     * Feeds as part of process. Syncs changes between app intances using
     * `BroadcastChannel` as well.
     */
    UpdateAppStateAfterLogout(){
        this.canBrowse = this.isGuestBrowsing = this.isAuthBrowsing = false;
        this.currentUsername = "Login Here";
        AppSettingsState.Settings.savedAccountState = {
            ...AppSettingsState.Settings.savedAccountState,
            currentAccount:-1,
            state:LoginState.Unset
        }
        AccountPeekState.lastMouseEvent = new MouseEvent('logout');
        AccountPeekState.profileData = {did:'',handle:''};
        //Send logout sync
        let authSyncMessage:BroadcastObject = {target:BroadcastChannelTarget.LoginState, data:undefined};
        AppState.SendAppSyncMessage(authSyncMessage);
        //Refresh displayed Feeds after logout
        RefreshAllFeeds();
    },
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
            toast.add({summary:"Browsing mode", detail:`Please choose how you would like to browse.`, severity:'info', group:'tr', life:3000})
            // this.isLoggingIntoAccount = true;
            // router.push(`/login`);
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
            toast.add({summary:"Requires login", detail:`In order to ${action} you must be logged in.`, severity:'info', group:'tr', life:3000});
            this.loginModalStartPage = 1;
            this.showLoginAccountSelect(router.currentRoute.value.path);
            return this.isAuthBrowsing;
        }
        return this.isAuthBrowsing;
    },
    /**
     * Method that displays the `LoginModal` on the "select account" or "enter credentials"
     * page.
     */
    showLoginAccountSelect(entryUrl:string){
        this.loginModalStartPage = 1;
        this.routeEntryURL = entryUrl;
        router.push(`/login`);
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
     * view (is `FeedEditModal` open?).
     */
    isCreatingFeed: false,
    /**Is the user currently editing an existing Feed. */
    isUpdatingFeed: false,
    /**Is the LoginModal currently open. */
    isLoggingIntoAccount: false,
    /**What page to open login modal to when displayed. Should be reset to -1 after opening. */
    loginModalStartPage:-1,
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
    /**Method used to show the `UserFocusModal`. You must pass in the handle of the account to display. */
    ShowUserFocusModal(userHandle:string | undefined){
        if(userHandle && userHandle.trim() != ''){
            router.push(`/profile/${userHandle}`);
        }
    },
    /**NOT USED ANYMORE - ROUTING IS USED TO CONTROL MODALS --- Method used to hide the `UserFocusModal`. */
    HideUserFocusModal(){
        AppState.isViewingUserAccount = false;
    },
    ToggleLoginModal(){
        AppState.isLoggingIntoAccount = !AppState.isLoggingIntoAccount;
    },
    /**Displays the `LoginModal` component. */
    ShowLoginModal(){
        router.push(`/login`);
    },
    /**
     * Determines whether or not the `ConfirmModal` is currently visible. This is used with the
     * non-Promise method of displaying the modal - usually called when displaying from
     * interacting with an `OptionsMenu`.
    */
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
        // this.isCreatingNewPost = true;
        router.push('/create/post');

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
    UpdatePostsInFeedList(updatedPostData:AppBskyFeedDefs.PostView){
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
    /**
     * Method used to update "author view" records for the account that was interacted with (mute/unmute,
     * block, etc.) in all visible Feeds. Used to keep the state of the Account consistent throughout the app.
     * @param accountProfileView ProfileView of account that was just updated (muted/unmute, block, etc.)
     */
    UpdateAccountsInFeedList(accountProfileView:AppBskyActorDefs.ProfileViewBasic|AppBskyActorDefs.ProfileView|AppBskyActorDefs.ProfileViewDetailed){
        let feedUpdates = 0;
        FeedState.FeedList.forEach(feed => {
            if(feed.description.feedType != FeedEnums.Types.Trending && feed.description.feedType != FeedEnums.Types.Mentions &&
            feed.description.feedType != FeedEnums.Types.Notifications){
                let matchingPosts = feed.data.filter(x=> (x as AppBskyFeedDefs.FeedViewPost).post.author.did == accountProfileView.did) as AppBskyFeedDefs.FeedViewPost[];
                if(matchingPosts.length>0){
                    feedUpdates++;
                    matchingPosts.forEach(feedPost => {
                        feedPost.post.author.viewer = {...feedPost.post.author.viewer, ...accountProfileView.viewer};
                    });
                }
            }
        })
        console.log(`Updated Posts in ${feedUpdates} Feed(s).`);
    },
    /**
     * Method used to update "author view" records for the account that was interacted with (mute/unmute,
     * block, etc.) in all "navigation history" records. Used to keep the state of the Account consistant
     * throughout the app.
     * @param accountProfileView ProfileView of account that was just updated (muted/unmute, block, etc.)
     */
    UpdateAccountsInUserFocusModalState(accountProfileView:AppBskyActorDefs.ProfileView|AppBskyActorDefs.ProfileViewBasic|AppBskyActorDefs.ProfileViewDetailed){
        let navHistoryUpdates = 0;
        UserFocusModalState.navigationHistory.forEach(navHistory => {
            if(navHistory.ProfileData.did == accountProfileView.did){
                navHistory.ProfileData = {...navHistory.ProfileData,viewer:accountProfileView.viewer};
                navHistoryUpdates++;
            }
        })
        console.log(`Updated Profiles in ${navHistoryUpdates} UserFocusModal NavHistory record(s).`);
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
                if((postDetails.currentThreadView.replies[i] as AppBskyFeedDefs.ThreadViewPost).post.cid != deleteCid){
                    //add "parent" reply
                    updatedThreadView.push((postDetails.currentThreadView.replies[i] as AppBskyFeedDefs.ThreadViewPost));
                    if(!isDeletedPostFound){
                        //add replies to the reply if there are any (and haven't been deleted)
                        let numReplies = (postDetails.currentThreadView.replies[i] as AppBskyFeedDefs.ThreadViewPost).replies ? (postDetails.currentThreadView.replies[i] as AppBskyFeedDefs.ThreadViewPost).replies.length : 0;
                        for (let j = 0; j < numReplies; j++) {
                            if(((postDetails.currentThreadView.replies[i] as AppBskyFeedDefs.ThreadViewPost).replies[j] as AppBskyFeedDefs.ThreadViewPost).post.cid == deleteCid){
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
     * Returns value indicating if the currently displayed account's avatar/account contains sensitive content.
     * @param accountInfo The account `ProfileView` to check.
     */
    getIfUserAccountContainsSensitiveContent(accountInfo:AppBskyActorDefs.ProfileView|AppBskyActorDefs.ProfileViewDetailed|AppBskyActorDefs.ProfileViewBasic):boolean{
        let result = false;
        if(typeof accountInfo.labels != 'undefined'){
            for (let i = 0; i < accountInfo.labels.length; i++) {
                if(accountInfo.labels[i].val == 'porn' || accountInfo.labels[i].val == 'sexual'){
                    result = true;
                    i = accountInfo.labels.length+1;
                }
            }
        }
        return result;
    },
    /**
     * Returns value indicating if the provided User Account is currently livestreaming.
     * @param userAccount The account `ProfileView` to check.
     */
    getIsUserAccountLive(userAccount:AppBskyActorDefs.ProfileView|AppBskyActorDefs.ProfileViewDetailed|AppBskyActorDefs.ProfileViewBasic){
        let result = false;
        if(typeof userAccount.status != 'undefined')
            result = userAccount.status.status == 'app.bsky.actor.status#live' &&
            typeof userAccount.status.isActive != 'undefined' && userAccount.status.isActive;
        return result;
    },
    /**
     * Value used to determine if modal for saving Post media
     * is currently visible.
     */
    isSavingMediaModalVisible:false,
    /**
     * Value holding details relating to the media to download/save. This object should always be a `ViewImage` object with all it's
     * variables set to 'unset' when `SaveMediaModal` is not open.
     */
    saveMedia:{alt:'unset',description:'unset',fullsize:'',title:'unset',uri:'unset',thumb:'unset'} as AppBskyEmbedImages.ViewImage|AppBskyEmbedExternal.View,
    /**Value used to hold the default file name to use for media being saved. */
    fileSaveDetails:{
        /**The full filename that will be used when saving the file. Can be updated by control on `SaveMediaModal`. */
        full:'',
        /**The original filename the image had on the server. */
        originalFilename:'',
        /**The file extension of the file to be downloaded. */
        extension:'.webp',
        /**The handle of the account that posted/shared the image. */
        handle:'',
        /**The text (if any) that was posted along with the image. */
        postText:''
    },
    /**
     * Method used to transform a URL that points to a GIF on a supported external source to
     * one that returns a WEBM from that same supported external source.
     * @param urlToTranslate The URL string to transform.
     */
    getExternalWebmUrlFromGifUri(urlToTranslate:string):string{
        if(urlToTranslate.includes('https://media.tenor.com')){
            let webmLink = urlToTranslate;
            webmLink = webmLink.slice('https://media.tenor.com'.length+1);
            let splitLink = webmLink.split('/');
            webmLink = webmLink.slice(0,webmLink.indexOf(splitLink[splitLink.length-1]));
            webmLink = webmLink.replace('AAAAC/','AAAP3/');//a route ending with AAAP3 seems to indicate WEBM
            let filename = splitLink[splitLink.length-1];
            filename = filename.slice(0,filename.indexOf('.gif?'))+'.webm';
            return `https://t.gifs.bsky.app/${webmLink}${filename}`;
        }
        else if(urlToTranslate.includes('https://static.klipy.com')){
            let webmLink = urlToTranslate;
            webmLink = webmLink.slice('https://static.klipy.com'.length+1);
            let splitLink = webmLink.split('/');
            webmLink = webmLink.slice(0,webmLink.indexOf(splitLink[splitLink.length-1]));
            const webmRegex = new RegExp(`${/(?<=webm=).*/.source}`,'g');
            let webmId = urlToTranslate.match(webmRegex);
            return `https://k.gifs.bsky.app/${webmLink}${webmId}.webm`;
        }
        else if(urlToTranslate.includes('https://giphy.com/gifs')){
            let webmLink = urlToTranslate;
            webmLink = webmLink.slice('https://giphy.com/gifs'.length+1);
            return `https://i.giphy.com/${webmLink}.webp`;
            return `https://i.giphy.com/media/${webmLink}/200.webp`;//lower res, what Bluesky Official uses
        }
        else if(urlToTranslate.includes('localhost:1420/')) return urlToTranslate;
        else return 'invalid link';
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
    /**NOT USED ANYMORE - ROUTING IS USED TO CONTROL MODALS --- Method that causes the Settings Panel to be displayed. */
    ShowSettingsPanel(){ this.isSettingsPanelVisible = true;},
    /**NOT USED ANYMORE - ROUTING IS USED TO CONTROL MODALS --- Method that causes the Settings Panel to be hidden. */
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
    isUpdatingFeedPosition:false,
    /**Method that causes the "Feed Order Change" modal to be displayed. */
    showFeedOrderModal(){ this.isUpdatingFeedPosition = true; },
    /**Method that causes the "Feed Order Change" modal to be hidden. */
    hideFeedOrderModal(){ this.isUpdatingFeedPosition = false; },
    /**Value used to indicate if App is currently running on a device with touchscreen support. */
    isAppOnMobileTouchscreenDevice:false,
    /**Variable that indicates if the "About App" modal is visible or not. */
    isAboutAppModalVisible: false,
    /**NOT USED ANYMORE - ROUTING IS USED TO CONTROL MODALS --- Method that causes the "About App" modal to be displayed. */
    ShowAboutAppModal(){ this.isAboutAppModalVisible = true;},
    /**NOT USED ANYMORE - ROUTING IS USED TO CONTROL MODALS --- Method that causes the "About App" modal to be hidden. */
    HideAboutAppModal(){ this.isAboutAppModalVisible = false;},
    /**
     * Value used to determine if Feed data has been loaded after the application is loaded for the first time.
     * Intended to be used to know if the Feed data needs to be requested when navigating to the main view (`'/'`),
     * after loading has been prevented because the app started on a route other than the main view (`'/'`).
     */
    hasFeedDataBeenLoadedAfterInitiallization:false,
    /**
     * Holds a `NavigationInfo` object that can be used to determine the last navigation action made using the
     * router - e.g. did the User navigate backwards or forwards. IMPORTANT: Should always be set to `null` after
     * processes have finished using value.
     */
    routeNavigationInfo:null,
    /**
     * Indicates if the event listener that tracks route navigation has been added. Should
     * be added by `PostFocusModal` only once.
     */
    hasRouteNavigationListenerBeenAdded:false,
    /**
     * Value holding the path/URL of a route request that was attempted before a route guard redirected the request.
     * Should be cleared between uses.
     */
    routeEntryURL:'',
    /**Records the current window width of the browser. */
    windowWidth:0,
    /**Variable that holds the value of the `timeoutID` used to limit the rate at which `windowWidth` will be updated. */
    windowResizeTimeout:-1,
    /**The value used to determine that the app is currently in the "mobile view" layout. A window width lower than this value means `usingMobileLayout` will be `true`. */
    mobileLayoutWidth:640,
    /**Value indicating whether or not the app is currently in the "mobile view" layout.*/
    usingMobileLayout:false,
    /**
     * Method used to update the value of the current browser window width.
     */
    windowResized(){
        AppState.windowWidth = window.innerWidth;
        if(AppState.windowWidth<AppState.mobileLayoutWidth) AppState.usingMobileLayout = true
        else AppState.usingMobileLayout = false;
        console.log(`Window Width: ${AppState.windowWidth} -- Using Mobile Layout: ${AppState.usingMobileLayout}`);
    },
    /**
     * Method used to restrict the rate the `windowWidth` variable is updated via `onresize` event.
     * @constructor
     */
    updateWindowResizedWithTimeout(){
        clearTimeout(AppState.windowResizeTimeout);
        AppState.windowResizeTimeout = setTimeout(AppState.windowResized,200);
    },
    /**
     * Method used to attach {@link AppState.updateWindowResizedWithTimeout() updateWindowResizedWithTimeout()} to the browser/application window
     * resize event.
     */
    setupWindowResizeListener(){
        //Calculate if app is being displayed with "mobile layout"
        AppState.windowWidth = window.innerWidth;
        if(AppState.windowWidth<AppState.mobileLayoutWidth) AppState.usingMobileLayout = true;
        window.addEventListener('resize', AppState.updateWindowResizedWithTimeout)
    },
    /**
     * Method used to remove {@link AppState.updateWindowResizedWithTimeout() updateWindowResizedWithTimeout()} from the browser/application window
     * resize event.
     */
    removeWindowResizeListener(){
        window.removeEventListener('resize', AppState.updateWindowResizedWithTimeout);
    }
})
</script>