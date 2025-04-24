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
})
</script>