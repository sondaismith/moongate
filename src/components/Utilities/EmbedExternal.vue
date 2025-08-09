<template>
    <div class="flex flex-col rounded-lg border border-outline bg-postBG
    overflow-hidden text-xs">
        <div class="relative border-outline aspect-[1.91/1]"
        :class="{'border-b-[1px]':!isTenorGIF}">
            <img v-if="!isTenorGIF" class="absolute w-full h-full object-center object-cover"
            :src="embed && embed.external ? embed.external.thumb : ''"/>
            <ImageContainer v-else
            @image-clicked="img => $emit('imageClicked',img)"
            @media-click="i => $emit('media-click',i)"
            :show-fullsize="showFullsize" :images-to-display="embed.external"/>
        </div>
        <div v-if="!isTenorGIF" class="p-2">
            <div class="text-sm font-semibold">{{ embed.external.title}}</div>
            <div class="line-clamp-2" :title="embed.external.description">
                {{embed.external.description}}
            </div>
            <div class="h-[1px] bg-slate-600 my-1"></div>
            <div class="flex text-nowrap gap-1 items-center">
                <i-solar:earth-outline class="size-4 shrink-0"/>
                <div class="overflow-hidden text-ellipsis">{{ embed.external.uri }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { View, ViewExternal } from '@atproto/api/dist/client/types/app/bsky/embed/external';
import { defineComponent, PropType } from 'vue'
import ImageContainer from './ImageContainer.vue';
import { ViewImage } from '@atproto/api/dist/client/types/app/bsky/embed/images';

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
        }
    },
    data(){
        return{

        }
    },
    computed:{
        isTenorGIF(){
            return this.embed.external.uri.includes("tenor.com");
        }
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
    }
})
</script>

<style scoped>
</style>