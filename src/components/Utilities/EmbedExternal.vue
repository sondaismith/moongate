<template>
    <div class="flex flex-col rounded-lg border border-slate-700 bg-slate-900
    overflow-hidden text-xs">
        <!-- <div class="border-b-[1px] border-slate-700">
            <img :src="embed.embeds && embed.embeds.length>0 && embed.embeds[0].external ? embed.embeds[0].external.thumb : ''"/>
        </div>
        <div class="p-2">
            <div class="text-sm font-semibold">{{ embed.value.embed.external.title}}</div>
            <div class="line-clamp-2" :title="embed.value.embed.external.description">
                {{embed.value.embed.external.description}}
            </div>
            <div class="h-[1px] bg-slate-600 my-1"></div>
            <div class="flex text-nowrap gap-1 items-center">
                <i-solar:earth-outline class="size-4 shrink-0"/>
                <div class="overflow-hidden text-ellipsis">{{ embed.value.embed.external.uri }}</div>
            </div>
        </div> -->

        <div class="border-b-[1px] border-slate-700">
            <img :src="embed && embed.external ? embed.external.thumb : ''"/>
        </div>
        <div class="p-2">
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
    data(){
        return{

        }
    },
    computed:{

    }
})
</script>

<style scoped>
</style>