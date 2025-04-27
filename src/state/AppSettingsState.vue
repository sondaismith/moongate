<script lang="ts">
import { reactive } from 'vue'

export interface OptionHolder<T>{
    option: T,
    selected:boolean
}

export interface LangCode{
    name:string,
    code:string
}

export const AppSettingsState = reactive({
    Settings:{
        isDarkMode:false,
        isAcceptingAllLanguages: true,
        isWhitelist: true,
        isBlacklist: false,
        selectedLanguages:[] as LangCode[],
    },
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
                this.Settings = loadedJSON;
            }
            else{
                console.log(`Settings could not be loaded - the loaded object is empty or contains unexpected data. Default settings will be used.`);
            }
        }
        else{
            console.log(`Settings could not be loaded - no data found. Default settings will be used.`);
        }
    }
})
</script>