<script lang="ts">
import { reactive } from 'vue'
import { IConfirmationTask } from '../components/Utilities/ConfirmModal.vue';
import { ToastEventBus } from 'primevue';
import { authAgent, guestAgent } from '../lib/api.vue';
import { Agent } from '@atproto/api';
import { ViewImage } from '@atproto/api/dist/client/types/app/bsky/embed/images';
import { UserFocusModalState } from './UserFocusModalState.vue';

export const toast = {
    add: (message) => ToastEventBus.emit('add', message),
    removeGroup: (group) => ToastEventBus.emit('remove-group', group),
    removeAllGroups: () => ToastEventBus.emit('remove-all-groups'),
};

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
    },
    /**
     * Value used to determine if modal for saving Post media
     * is currently visible.
     */
    isSavingMediaModalVisible:false,
    /**Value holding details relating to the media to download/save. */
    saveMedia:{} as ViewImage,
    /**Value used to hold the default file name to use for media being saved. */
    fileSaveDefaultFilename:'',
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
    }
})
</script>