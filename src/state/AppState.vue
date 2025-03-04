<script lang="ts">
import { reactive } from 'vue'
import { postDetails } from './PostDetails.vue';

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
     * The name of the currently logged in user.
     * This variable might belong in another State.
     */
    currentUsername: "Login Here",
    /**Is the user currently trying to create a new Feed to add to the
     * view.
     */
    isCreatingFeed: false,
    /**Is the LoginModal currently open. */
    isLoggingIntoAccount: false,
    /**Is the UserFocusModal currently open. */
    isViewingUserAccount: false,
    /**Toggles display of `FeedCreateModal` component. */
    ToggleCreateFeedModal(){
        AppState.isCreatingFeed = !AppState.isCreatingFeed;
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
    }
})
</script>