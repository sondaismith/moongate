<template>
    <div data-testid="embed-external" class="max-w-full" :class="{'self-start' : isExternalGIF}">
        {{ void "External link in Web App and Desktop App" }}
        <a v-if="!isExternalGIF && !isTauri()" tabindex="0"
        :href="embed.external.uri" target="_blank"
        class="flex flex-col rounded-lg border text-primary transition-colors
        border-outline hover:border-embedHoverBorder hover:bg-embedHoverBG bg-postBG
        overflow-hidden text-xs cursor-pointer">
            <div class="relative border-b-[1px] border-outline aspect-[1.91/1]">
                <ImageLoader :img-url="typeof embed != 'undefined' && typeof embed.external != 'undefined' && typeof embed.external.thumb != 'undefined' ? embed.external.thumb : ''"
                class="absolute w-full h-full object-center object-cover" :fill-container="true"/>
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
        <div v-else-if="!isExternalGIF && isTauri()" @contextmenu.prevent
        @click="(e) => showOptionsMenu(e, embed.external.uri)"
        @keyup.enter="showOptionsMenu(mouseEventFromKeyboardEvent, embed.external.uri)" tabindex="0"
        class="flex flex-col rounded-lg border text-primary transition-colors
        border-outline hover:border-embedHoverBorder hover:bg-embedHoverBG bg-postBG
        overflow-hidden text-xs cursor-pointer">
            <div class="relative border-b-[1px] border-outline">
                <ImageLoader :img-url="typeof embed != 'undefined' && typeof embed.external != 'undefined' && typeof embed.external.thumb != 'undefined' ? embed.external.thumb : ''"
                class="absolute w-full h-full object-center object-cover" :fill-container="true"/>
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
            <div v-if="isSupportedExternalGIFSource" data-testid="embedExternal-GIF-imageContainer" class="relative border-outline">
                <ImageContainer
                @image-clicked="img => $emit('imageClicked',img)"
                @media-click="i => $emit('media-click',i)"
                :author="author" :post-id="postId"
                :show-fullsize="showFullsize" :images-to-display="embed" :media-embed="embed"/>
            </div>
            <div v-else>
                <a href="https://github.com/sondaismith/moongate/issues?q=is%3Aissue%20state%3Aopen%20gif" target="_blank"
                class="flex flex-col rounded-lg border text-primary transition-colors
                border-outline hover:border-embedHoverBorder hover:bg-embedHoverBG bg-postBG
                overflow-hidden text-xs cursor-pointer">
                    <div class="p-2 font-normal">
                        <div class="flex gap-1 items-center text-sm font-semibold">
                            <i-mingcute:warning-fill class="text-xl"/>
                            <div>External GIF Error</div>
                        </div>
                        <div class="flex flex-col" title="Message explaining why you are currently not seeing a GIF where there should be one...sorry">
                            <div>Oops, Bluesky seems to have added a new GIF source that moongate currently does not support...</div>
                            <div>You can let me know by clicking here and creating an issue, if one doesn't already exist.</div>
                            <div class="flex flex-col">
                                <div>URL causing error:</div>
                                <a :href="embed.external.uri" target="_blank" title="Link to the URL that would be used to show you the GIF"
                                class="text-[10px] leading-3 break-all text-feedtypeBtnFocusHighlight hover:underline">{{ embed.external.uri }}</a>
                            </div>
                        </div>
                        <div class="h-[1px] bg-slate-600 my-1"></div>
                        <div class="flex text-nowrap gap-1 items-center">
                            <i-solar:earth-outline class="size-4 shrink-0"/>
                            <div class="overflow-hidden text-ellipsis" title="Link to `moongate` issues page">https://github.com/sondaismith/moongate/issues?q=is%3Aissue%20state%3Aopen%20gif</div>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import MingcuteCopyLine from '~icons/mingcute/copy-line';
import MingcuteWorld2Line from '~icons/mingcute/world-2-line';
import { AppBskyEmbedExternal, AppBskyEmbedImages } from '@atproto/api';
import { defineComponent, PropType } from 'vue'
import ImageContainer from './ImageContainer.vue';
import { isTauri } from '@tauri-apps/api/core';
import { OptionsMenuState } from '../../state/OptionsMenuState.vue';
import { IOptionMenuItem, ItemType } from './OptionsMenu.vue';
import { CopyTextToClipboard, externalGIFSources } from '../../state/AppState.vue';
import { openUrl } from '@tauri-apps/plugin-opener';
import ImageLoader from './ImageLoader.vue';

/**
 * Method used to open link in the system's default browser.
 * @param url The URL to open in the default browser.
 */
async function OpenLink(url:string){
    await openUrl(url);
}

export default defineComponent({
    components:{
        ImageContainer,
        Image,
        ImageLoader,
    },
    props:{
        embed: {
            type: Object as PropType<AppBskyEmbedExternal.View>,
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
        /**
         * Value indicating if the the object passed to the `embed` prop points to a resource that
         * is a `.webm` or `.mp4` file.
         */
        isExternalGIF(){
            let isExternalGif = false;
            const supportedExt = ['.gif','giphy.com/gifs/','.webm','.mp4'];
            for (let i = 0; i < supportedExt.length; i++) {
                if(this.embed.external.uri.includes(supportedExt[i])){
                    isExternalGif = true;
                    i = externalGIFSources.length;
                }
            }
            return isExternalGif;
        },
        /**
         * Value indicating if the object passed to the `embed` prop points to a resource
         * held on one of the supported "external GIF" sources.
         */
        isSupportedExternalGIFSource(){
            let isValidGifSource = false;
            for (let i = 0; i < externalGIFSources.length; i++) {
                let isValid = this.embed.external.uri.includes(externalGIFSources[i]);
                if(isValid){
                    isValidGifSource = isValid;
                    i = externalGIFSources.length;//exit loop
                }
            }
            return isValidGifSource;
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
        imageClicked(image:AppBskyEmbedImages.ViewImage|AppBskyEmbedExternal.ViewExternal){
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