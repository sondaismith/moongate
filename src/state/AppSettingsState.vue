<script lang="ts">
import { reactive } from 'vue'
import { AppSettingsArray, AppSettingsClass, IAppSettings, LangCode } from '../interfaces/SettingsInterfaces';
import { load, Store } from '@tauri-apps/plugin-store';
import { isTauri } from '@tauri-apps/api/core';
import { WebDBAppSettings, web_db } from '../lib/db/web_db';
import { ATPlatform, LoginState } from '../interfaces/AccountInterfaces';
import { AppState } from './AppState.vue';
import { BroadcastChannelTarget, BroadcastObject, toRawDeep } from '../types/BroadcastChannelTypes';

export default{
    name:"AppSettingsState"
}

export interface OptionHolder<T>{
    option: T,
    selected:boolean
}

export const AppSettingsState = reactive({
    ///Used to check if App Settings have been loaded - mainly used to
    ///only show certain elements if the required variable value has
    ///been loaded.
    isSettingsLoaded:false,
    /**
     * Based on {@link IAppSettings} derived from AppSettingsClass.
     */
    Settings:{
        isDarkMode:false,
        isAcceptingAllLanguages: true,
        isWhitelist: true,
        isBlacklist: false,
        selectedLanguages:[] as LangCode[],
        isShowingIntroMessage: true,
        isHidingComments: false,
        isHidingShares: false,
        isHidingLikes: false,
        isHidingFollowers: false,
        isHidingFollowing: false,
        savedAccountState: {
            state: LoginState.Unset,
            currentAccount: -1,
            accounts:[]
            // [
            //     {id:'ashjdhasjdh',handle:'test.com',name:'Test User ahsdjkhasdjhadsidhasudasasasadasdasdasdasd',avatar:'src/assets/test-media/posts/image04.png',did:'this_wont_work',platform:ATPlatform.Bluesky},
            //     {id:'asscccweeee',handle:'dummyplug.bsky.social',name:'dummyplug',avatar:'src/assets/test-media/posts/image07.png',did:'this_wont_work2',platform:ATPlatform.Bluesky},
            //     {id:'urwhjweheie',handle:'dev.fourfour.one',name:'im on v1.0',avatar:'src/assets/test-media/posts/image01.png',did:'this_wont_work3',platform:ATPlatform.Bluesky},
            // ]
        }
    } as IAppSettings,
    AppStore:Store,
    /**
     * Returns a comma-separated list containing the shorthand language codes of the
     * selected languages. Returns an empty string if no languages have been selected.
     */
    prepareSelectedLanguages(){
        // return this.selectedLanguages.map(x=>x.code).toString();
        if(this.Settings.selectedLanguages.length>1) return '';
        return this.Settings.selectedLanguages.map(x=>x.code)[0];
    },
    /**
     * Method used to prepare application setting values so that they can be
     * saved to the app database.
     * @returns A stringified JSON object containing all the application settings.
     */
    prepareSettingsToSaveToDB():string{
        return JSON.stringify(this.Settings);
    },
    /**
     * Method used to load saved application settings data from the Database
     * and load it into the `AppSettingsState`.
     * @param appSettingsJSON The JSON string saved to the Database that contains the saved application settings.
     * @deprecated now using plugin `store` - use [loadSettingsFromStore()]({@link AppSettingsState.loadSettingsFromStore})
     */
    loadSettingsFromDB(appSettingsJSON:string|undefined){
        if(appSettingsJSON){
            let loadedJSON:{} = JSON.parse(appSettingsJSON);
            //Ensure loaded JSON object matches shape of object held in `AppSettingsState.Settings`.
            if(Object.keys(loadedJSON).filter(x=>!Object.keys(this.Settings).includes(x)).length == 0){
                // console.log("JSON objects match");
                // console.log(loadedJSON);
                //Even though the underline is being displayed below, the 2 objects should be
                //the same "type" since we checked above. Should probably use an interface or
                //type in the future.
                this.Settings = loadedJSON as IAppSettings;
            }
            else{
                console.log(`Settings could not be loaded - the loaded object is empty or contains unexpected data. Default settings will be used.`);
            }
        }
        else{
            console.log(`Settings could not be loaded - no data found. Default settings will be used.`);
        }
    },
    /**
     * Method used to initialize the "store file" used to hold the
     * application settings. Should be called if the file does not
     * exist, or you wish to reset the application settings.
     */
    async initializeAppSettingsStore(settingsStore:Store){
        // const appSettings = await load('moongate_settings.json',{autoSave:false,createNew:true});
        let defaultValues = new AppSettingsClass;
        //For each app setting key, initialize the key-value pair with default values
        for (let i = 0; i < AppSettingsArray.length; i++) {
            //Debug
            // console.log('Key name:');
            // console.log(AppSettingsArray[i]);
            // console.log('Key default value:');
            // console.log(Object.entries(defaultValues).find(x=>x[0]==AppSettingsArray[i])?.[1])
            await settingsStore.set(AppSettingsArray[i],{value: Object.entries(defaultValues).find(x=>x[0]==AppSettingsArray[i])?.[1]})
        }
        console.log(`Initialized default application settings.`);
        await settingsStore.save();//save initialization to file
    },
    /**
     * Returns copy of values held inside the `AppSettingsState.Setting` object at
     * the current moment. Intended to be used to check if changes have been made.
     */
    getCurrentSettingsState():IAppSettings{
        return {...this.Settings};
    },
    /**
     * Method used to load the application settings from the Store.
     * Checks to see if Store file exists and is initialized - if it is not
     * will call [initializeAppSettingsStore()]({@link AppSettingsState.initializeAppSettingsStore})
     * before loading the settings.
     */
    async loadSettingsFromStore(){
        if(isTauri()){
            //Use to check if store file exists, creates file if does not exist
            //File will then be overwritten during initialization method
            let doesAppSettingsExist = false;
            const appSettings = await load('moongate_settings.json',{autoSave:false});
            //Check if app settings values exist
            if(AppSettingsArray.length>0 && await appSettings.has(AppSettingsArray[0])){
                console.log(AppSettingsArray);
                doesAppSettingsExist = true;
            }
            //If no settings values, initialize settings values
            if(!doesAppSettingsExist){
                await AppSettingsState.initializeAppSettingsStore(appSettings);
            }
            //Load settings from file into app
            await appSettings.reload();//ensure that we have changes from any initialization
            //Debug - show loaded values
            // let settings = await appSettings.entries();
            // console.log(settings);
            //Used to get list of keys ↓
            let defaultValues = new AppSettingsClass;
            //For each app setting key, load that key's value into `AppSettingState`
            for (let i = 0; i < AppSettingsArray.length; i++) {
                let valueType = defaultValues[AppSettingsArray[i]];//Used to get type
                let settingValue = await appSettings.get<{value:typeof valueType}>(AppSettingsArray[i]);
                //Debug
                // console.log(settingValue);
                // console.log(`Setting Key: ${AppSettingsArray[i]}`);
                // console.log(`Store value: ${settingValue?.value}`);//debug
                // console.log(`State value: ${this.Settings[AppSettingsArray[i]]}`);
                if(settingValue && settingValue.value != undefined){
                    (this.Settings[AppSettingsArray[i]] as typeof valueType) = settingValue.value
                }
            }
        }
        else{//Web App
            await web_db.appSettings.toArray()
            .then(res => {
                console.log('Loading AppSettings from IndexedDB');
                console.log(res);
                let appSettings = AppSettingsState.Settings;
                let loadedSettings = res[0] as WebDBAppSettings;
                appSettings.isAcceptingAllLanguages = loadedSettings.isAcceptingAllLanguages;
                appSettings.isBlacklist = loadedSettings.isBlacklist;
                appSettings.isDarkMode = loadedSettings.isDarkMode;
                appSettings.isWhitelist = loadedSettings.isWhitelist;
                appSettings.selectedLanguages = JSON.parse(loadedSettings.selectedLanguages);
                appSettings.isShowingIntroMessage = loadedSettings.isShowingIntroMessage;
                appSettings.isHidingComments = loadedSettings.isHidingComments;
                appSettings.isHidingShares = loadedSettings.isHidingShares;
                appSettings.isHidingLikes = loadedSettings.isHidingLikes;
                appSettings.isHidingFollowers = loadedSettings.isHidingFollowers;
                appSettings.isHidingFollowing = loadedSettings.isHidingFollowing;
                appSettings.savedAccountState = JSON.parse(loadedSettings.savedAccountState);
            })
            .catch(err => {
                console.log(err);
            })
        }
        //check for guest browsing setting - if set change to that mode
        //we can't do auth browsing yet :(
        if(AppSettingsState.Settings.savedAccountState.state == LoginState.Guest) AppState.browseAsGuest();
        else{
            //Since we cannot restore an auth account, we will unset the browsing state when last used was not Guest
            //This is not saved to disk
            AppSettingsState.Settings.savedAccountState = {
                ...AppSettingsState.Settings.savedAccountState,
                currentAccount:-1,
                state:LoginState.Unset
            }
        }

        this.isSettingsLoaded = true;
    },
    /**
     * Method used to save the current values held in {@link AppSettingsState.Settings}
     * to the application data store file on disk. Should be called when closing the
     * [SettingsPanel]({@link file://./../components/Settings/SettingsPanel.vue}) component.
     */
    async saveSettingsToStore(){
        if(isTauri()){
            const appSettings = await load('moongate_settings.json',{autoSave:false});
            //Save settings to store
            //For each `AppSettingState` setting variable, save that value to the store
            for (let i = 0; i < AppSettingsArray.length; i++) {
                appSettings.set(AppSettingsArray[i],{value:this.Settings[AppSettingsArray[i]]});
            }
            //DEBUG
            // let settings = await appSettings.entries();
            // console.log(settings);
            //Save
            appSettings.save();
        }
        else{
            let cs = AppSettingsState.Settings;
            console.log(`Saving FeedList changes w/ Dexie.js...`);
            web_db.appSettings.put({
                id:1,
                isAcceptingAllLanguages:cs.isAcceptingAllLanguages,
                isBlacklist:cs.isBlacklist,
                isDarkMode:cs.isDarkMode,
                isWhitelist:cs.isWhitelist,
                selectedLanguages:JSON.stringify(cs.selectedLanguages),
                isShowingIntroMessage:cs.isShowingIntroMessage,
                isHidingComments: cs.isHidingComments,
                isHidingShares: cs.isHidingShares,
                isHidingLikes: cs.isHidingLikes,
                isHidingFollowers: cs.isHidingFollowers,
                isHidingFollowing: cs.isHidingFollowing,
                savedAccountState:JSON.stringify(cs.savedAccountState),
            })
            .then(res => {
                console.log(res);
                //sync between tabs/windows on success
                let feedSyncMessage:BroadcastObject = {target:BroadcastChannelTarget.AppSettings, data:toRawDeep(cs)};
                AppState.SendAppSyncMessage(feedSyncMessage);
            })
            .catch(err => {
                console.log(`Error trying to save settings to IndexedDB`);
                console.log(err);
            })
        }
    }
})
</script>