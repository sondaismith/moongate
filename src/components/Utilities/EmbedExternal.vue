<template>
    <div class="flex flex-col rounded-lg border border-outline bg-postBG
    overflow-hidden text-xs">
        <div class="relative border-b-[1px] border-outline aspect-[1.91/1]">
            <img v-if="!isTenorGIF" class="absolute w-full h-full object-center object-cover"
            :src="embed && embed.external ? embed.external.thumb : ''"/>
            <ImageContainer v-else class="absolute w-full h-full object-center object-cover"
            :title="embed.external.title"
            :src="embed && embed.external ? embed.external.uri : ''"
            :images-to-display="embed.external"/>
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
import { View } from '@atproto/api/dist/client/types/app/bsky/embed/external';
import { defineComponent, PropType } from 'vue'
import ImageContainer from './ImageContainer.vue';

export default defineComponent({
    props:{
        embed: {
            type: Object as PropType<View>,
            required: true,
            default(){
                return {};
            }
        }
    },
    components:{
        ImageContainer
    },
    data(){
        return{

        }
    },
    computed:{
        isTenorGIF(){
            return this.embed.external.uri.includes("tenor.com");
        }
    }
})
</script>

<style scoped>
</style>