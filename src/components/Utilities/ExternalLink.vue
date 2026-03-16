<template>
    <a v-if="!isTauri()" target="_blank"
    :href="linkUrl"
    class="text-blue-500 hover:text-blue-300 cursor-pointer">{{ linkText }}</a>
    <a v-else
    @click="(e) => showOptionsMenu(e,linkUrl)"
    class="text-blue-500 hover:text-blue-300 cursor-pointer">{{ linkText }}</a>
</template>

<script lang="ts">
import MingcuteCopyLine from '~icons/mingcute/copy-line';
import MingcuteWorld2Line from '~icons/mingcute/world-2-line';

import { defineComponent } from 'vue';
import { isTauri } from '@tauri-apps/api/core';
import { OptionsMenuState } from '../../state/OptionsMenuState.vue';
import { CopyTextToClipboard } from '../../state/AppState.vue';
import { IOptionMenuItem, ItemType } from './OptionsMenu.vue';
import { openUrl } from '@tauri-apps/plugin-opener';

/**
 * Method used to open link in the system's default browser.
 * @param url The URL to open in the default browser.
 */
async function OpenLink(url:string){
    await openUrl(url);
}

export default defineComponent({
    props:{
        /**The text label to use for the external link. */
        linkText:{
            type:String,
            default:'Please Set Link Text'
        },
        /**The URL link to open when the control is clicked. */
        linkUrl:{
            type:String,
            required:true
        },
    },
    data(){
        return{
            isTauri,
        }
    },
    methods:{
        /**
         * Shows Options Menu allowing user to perform different actions
         * relating to the selected link.
         */
        showOptionsMenu(e:MouseEvent, linkURL:string){
            e.preventDefault();
            OptionsMenuState.currentMenuItems = [
                {Icon:MingcuteWorld2Line,Label:'Open in Default Browser',Action:function(){OpenLink(linkURL)},Type:ItemType.Option},
                {Icon:MingcuteCopyLine,Label:'Copy link to clipboard',Action:function(){CopyTextToClipboard(linkURL,'link')},Type:ItemType.Option},
            ] as IOptionMenuItem[]
            OptionsMenuState.showOptionMenu(e);
        },
    }
})
</script>

<style scoped>
</style>