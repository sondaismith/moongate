<template>
    <a ref="linkBtn" v-if="isTauri()" tabindex="0" @click="(e) => showOptionsMenu(e, URL)"
    @keydown.enter="e => showOptionsMenu(e,URL)" @keydown.space="e => showOptionsMenu(e,URL)"
    @contextmenu="e => showOptionsMenu(e,URL)" title="Display Link Options"
    class="underline font-light cursor-pointer text-left transition-colors text-blue-500 hover:text-blue-400 border-none outline outline-2
    outline-transparent active:bg-transparent focus-visible:!outline-blue-500 shadow-none rounded-none">
        <slot></slot>
    </a>
    <a v-else :title="`Open link in new tab`"
    class="underline font-light cursor-pointer transition-colors text-blue-500 hover:text-blue-400 border-2 border-transparent
    focus-visible:!border-blue-500 focus-visible:!outline-none"
    :href="URL" target="_blank">
        <slot></slot>
    </a>
</template>

<script lang="ts">
//Icons
import MingcuteCopyLine from '~icons/mingcute/copy-line';
import MingcuteWorld2Line from '~icons/mingcute/world-2-line';

import { defineComponent } from 'vue'
import { OptionsMenuState } from '../../state/OptionsMenuState.vue';
import { openUrl } from '@tauri-apps/plugin-opener';
import { CopyTextToClipboard } from '../../state/AppState.vue';
import { IOptionMenuItem, ItemType } from './OptionsMenu.vue';
import { isTauri } from '@tauri-apps/api/core';

/**
 * Method used to open link in the system's default browser.
 * @param url The URL to open in the default browser.
 */
async function OpenLink(url:string){
    await openUrl(url);
}

export default defineComponent({
    props:{
        urlLink:String
    },
    data(){
        return{
            URL:'',
            isTauri,
        }
    },
    methods:{
        /**
         * Used to allow button to open link in new tab.
         */
        openLink(){
            window.open(this.URL, '_blank')
        },
        /**
         * Shows Options Menu allowing user to perform different actions
         * relating to the clicked link.
         */
        showOptionsMenu(e:MouseEvent|KeyboardEvent, linkURL:string){
            e.preventDefault();
            OptionsMenuState.currentMenuItems = [
                {Icon:MingcuteWorld2Line,Label:'Open in Default Browser',Action:function(){OpenLink(linkURL)},Type:ItemType.Option},
                // {Icon:MingcuteIncognitoModeLine,Label:'Open in Default Browser (Private/Incognito)',Action:function(){alert(`Opened '${linkURL}'' secretly!`)}},
                {Icon:MingcuteCopyLine,Label:'Copy link to clipboard',Action:function(){CopyTextToClipboard(linkURL,'link')},Type:ItemType.Option},
            ] as IOptionMenuItem[]
            OptionsMenuState.showOptionMenu(e);
        },
    },
    mounted(){
        if(this.urlLink) this.URL = this.urlLink
    }
})
</script>