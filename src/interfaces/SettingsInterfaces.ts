import { LangCode } from "../state/AppSettingsState.vue";


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
    selectedLanguages =[] as LangCode[];
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

// export interface IAppSettings{
//     isDarkMode:boolean,
//     isAcceptingAllLanguages: boolean,
//     isWhitelist: boolean,
//     isBlacklist: boolean,
//     selectedLanguages: LangCode[],
// }