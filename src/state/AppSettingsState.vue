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
    // isAcceptingAllLanguages: true,
    // isWhitelist: true,
    // isBlacklist: false,
    // selectedLanguages:[] as LangCode[],
    Settings:{
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
     */
    prepareSettingsToSaveToDB(){
        return JSON.stringify(this.Settings);
    }
})
</script>