<template>
    <div data-testid="embed-external" class="max-w-full">
        {{ void "External link in Web App and Desktop App" }}
        <a v-if="!isTenorGIF && !isTauri()" tabindex="0"
        :href="embed.external.uri" target="_blank"
        class="flex flex-col rounded-lg border text-primary transition-colors
        border-outline hover:border-embedHoverBorder hover:bg-embedHoverBG bg-postBG
        overflow-hidden text-xs cursor-pointer">
            <div class="relative border-b-[1px] border-outline aspect-[1.91/1]">
                <img class="absolute w-full h-full object-center object-cover"
                :src="embed && embed.external ? embed.external.thumb : ''"/>
            </div>
            <div class="p-2 font-normal">
                <div class="text-sm font-semibold">{{ embed.external.title}}</div>
                <div class="line-clamp-2" :title="embed.external.description">
                    {{embed.external.description}}
                </div>
                <div class="h-[1px] bg-slate-600 my-1"></div>
                <div class="flex text-nowrap gap-1 items-center">
                    <i-solar:earth-outline class="size-4 shrink-0"/>
                    <div class="overflow-hidden text-ellipsis" :title="embed.external.uri">{{ embed.external.uri }}</div>
                </div>
            </div>
        </a>
        <div v-else-if="!isTenorGIF && isTauri()" @contextmenu.prevent
        @click="(e) => showOptionsMenu(e, embed.external.uri)"
        @keyup.enter="showOptionsMenu(mouseEventFromKeyboardEvent, embed.external.uri)" tabindex="0"
        class="flex flex-col rounded-lg border text-primary transition-colors
        border-outline hover:border-embedHoverBorder hover:bg-embedHoverBG bg-postBG
        overflow-hidden text-xs cursor-pointer">
            <div class="relative border-b-[1px] border-outline aspect-[1.91/1]">
                <img class="absolute w-full h-full object-center object-cover"
                :src="embed && embed.external ? embed.external.thumb : ''"/>
            </div>
            <div class="p-2 font-normal">
                <div class="text-sm font-semibold">{{ embed.external.title}}</div>
                <div class="line-clamp-2" :title="embed.external.description">
                    {{embed.external.description}}
                </div>
                <div class="h-[1px] bg-slate-600 my-1"></div>
                <div class="flex text-nowrap gap-1 items-center">
                    <i-solar:earth-outline class="size-4 shrink-0"/>
                    <div class="overflow-hidden text-ellipsis" :title="embed.external.uri">{{ embed.external.uri }}</div>
                </div>
            </div>
        </div>
        <div v-else @keyup.enter="showEmbedImageInModal" tabindex="0"
        :href="embed.external.uri" target="_blank"
        class="flex flex-col rounded-lg border text-primary transition-colors
        border-outline hover:bg-embedHoverBG bg-postBG
        overflow-hidden text-xs cursor-pointer">
            <div data-testid="embedExternal-GIF-imageContainer" class="relative border-outline aspect-[1.91/1]">
                <ImageContainer
                @image-clicked="img => $emit('imageClicked',img)"
                @media-click="i => $emit('media-click',i)"
                :author="author" :post-id="postId"
                :show-fullsize="showFullsize" :images-to-display="embed" :media-embed="embed"/>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import MingcuteCopyLine from '~icons/mingcute/copy-line';
import MingcuteWorld2Line from '~icons/mingcute/world-2-line';
import MingcuteIncognitoModeLine from '~icons/mingcute/incognito-mode-line';

import { View, ViewExternal } from '@atproto/api/dist/client/types/app/bsky/embed/external';
import { defineComponent, PropType } from 'vue'
import ImageContainer from './ImageContainer.vue';
import { ViewImage } from '@atproto/api/dist/client/types/app/bsky/embed/images';
import { isTauri } from '@tauri-apps/api/core';
import { OptionsMenuState } from '../../state/OptionsMenuState.vue';
import { IOptionMenuItem, ItemType } from './OptionsMenu.vue';
import { CopyTextToClipboard } from '../../state/AppState.vue';
import { openUrl } from '@tauri-apps/plugin-opener';

/**
 * Method used to open link in the system's default browser.
 * @param url The URL to open in the default browser.
 */
async function OpenLink(url:string){
    await openUrl(url);
}

export default defineComponent({
    components:{
        ImageContainer
    },
    props:{
        embed: {
            type: Object as PropType<View>,
            required: true,
            default(){
                return {};
            }
        },
        /**
         * Setting this to `true` will cause the `ImageContainer` use the fullsize styling.
         * Usually set when placing component in `PostFocusModal`.
         */
        showFullsize: {
            type: Boolean,
            default: false
        },
        author:{
            type: String,
            required: true,
        },
        postId:{
            type: String,
            required: true,
        },
    },
    data(){
        return{
            isTauri
        }
    },
    computed:{
        isTenorGIF(){
            return this.embed.external.uri.includes("tenor.com");
        },
        /**
         * Creates a `MouseEvent` from the `KeyboardEvent` used to "click" the `EmbedExternal` element.
         * Used to position the displayed `OptionsMenu`.
         * @returns The created `MouseEvent` object.
         */
        mouseEventFromKeyboardEvent():MouseEvent{
            let elRect = (this.$el as HTMLElement).getBoundingClientRect();
            return ({clientX:elRect.x, clientY:elRect.y, preventDefault:()=>{}} as MouseEvent);
        },
    },
    emits:{
        /**
         * Emit event called when clicking on image when in `showFullsize` mode.
         * Used to show image at "fullscreen" size when in the `PostFocusModal`.
         * Passes emit sent by `ImageContainer` component.
         * @param image Object representing the image to display in fullscreen view.
         */
        imageClicked(image:ViewImage|ViewExternal){
            if(image) return true;
        },
        /**
         * Emit event called to open `PostFocusModal` at relevant media index.
         * @param index The index value representing the media to display.
        */
        'media-click'(index:number){
            if(index>-1) return true;
        }
    },
    methods:{
        openEmbedLink(){
            window.open(this.embed.external.uri, '_blank');
        },
        showEmbedImageInModal(){
            this.$emit('media-click',0);
        },
        /**
         * Shows Options Menu allowing user to perform different actions
         * relating to the selected embeded content.
         */
        showOptionsMenu(e:MouseEvent, linkURL:string){
            e.preventDefault();
            OptionsMenuState.currentMenuItems = [
                {Icon:MingcuteWorld2Line,Label:'Open in Default Browser',Action:function(){OpenLink(linkURL)},Type:ItemType.Option},
                // {Icon:MingcuteIncognitoModeLine,Label:'Open in Default Browser (Private/Incognito)',Action:function(){alert(`Opened '${linkURL}'' secretly!`)}},
                {Icon:MingcuteCopyLine,Label:'Copy link to clipboard',Action:function(){CopyTextToClipboard(linkURL,'link')},Type:ItemType.Option},
            ] as IOptionMenuItem[]
            OptionsMenuState.showOptionMenu(e);
        },
    },
})
</script>

<style scoped>
</style>