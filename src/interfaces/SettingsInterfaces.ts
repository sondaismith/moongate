import { FunctionalComponent } from "vue";
import { IAppAccountState, LoginState } from "./AccountInterfaces";
import { AppBskyActorDefs } from "@atproto/api";

export interface LangCode{
    name:string,
    code:string
}

export interface IAccountSettingsMenuItem{
    /**Text representing the settings option. Usually displayed to the User. */
    label:string,
    /**Iconify icon associated with the option. Optional. */
    icon:FunctionalComponent|undefined
    /**Used to identify menu item when running Unit tests. */
    testId:string,
    /**Whether or not this option has been selected. Not required - if provided usually means this option is togglable. */
    selected:boolean
    /**Any submenu options this option has. */
    submenu:IAccountSettingsMenuItem[]
    /**What action to perform when option is interacted with. Not required - if provided usually means this option is for displaying another menu. */
    action:Function|undefined
    /**Does the User need to be logged in in order to interact with this menu item? */
    requiresLogin:boolean
}

export interface IAccountModerationItem{
    /**The Profile data associated with muted account. */
    account: AppBskyActorDefs.ProfileView
    /**Is this account waiting for an action request to complete? */
    isAwaitingAction: boolean
}

/**
 * Class used to hold all the available Application Settings. This is then used
 * by {@link IAppSettings} to generate an Interface, which is then used by
 * {@link AppSettingsPropsArray} to create a Type, which is then used by
 * {@link AppSettingsArray} to have a list of all the keys to use to
 * store/retrieve the application settings.
 */
export class AppSettingsClass {
    isDarkMode = false;
    isAcceptingAllLanguages = true;
    isWhitelist = true;
    isBlacklist = false;
    selectedLanguages = [] as LangCode[];
    isShowingIntroMessage = true;
    isHidingComments = false;
    isHidingShares = false;
    isHidingLikes = false;
    isHidingFollowers = false;
    isHidingFollowing = false;
    enableAdultContent = false;
    spoilerImagesContainingSensitiveContent = true;
    savedAccountState:IAppAccountState = {
        state: LoginState.Unset,
        currentAccount: -1,
        accounts: []
    }
}
export interface IAppSettings extends AppSettingsClass{}
type AppSettingsPropsArray = Array<keyof IAppSettings>;
/**
 * Array of the keys to use when storing and loading the application
 * settings to the store. Available keys are dictated by the contents
 * of {@link AppSettingsClass}.
 */
export const AppSettingsArray:AppSettingsPropsArray =
    Object.keys(new AppSettingsClass()) as AppSettingsPropsArray;