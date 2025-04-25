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
    isAcceptingAllLanguages: true,
    isWhitelist: true,
    isBlacklist: false,
    selectedLanguages:[] as LangCode[],
    /**
     * Returns a comma-separated list containing the shorthand language codes of the
     * selected languages. Returns an empty string if no languages have been selected.
     */
    prepareSelectedLanguages(){
        // return this.selectedLanguages.map(x=>x.code).toString();
        if(this.selectedLanguages.length>1) return '';
        return this.selectedLanguages.map(x=>x.code)[0];
    }
})
</script>