<script lang="ts">
import { reactive } from 'vue'
import { postDetails } from './PostDetails.vue';
import { IConfirmationTask } from '../components/Utilities/ConfirmModal.vue';
import { ToastEventBus } from 'primevue';
import { authAgent, guestAgent } from '../lib/api.vue';
import { Agent } from '@atproto/api';

const toast = {
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
            postDetails.currentUserAccountDID = userDID;
        }
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
})
</script>