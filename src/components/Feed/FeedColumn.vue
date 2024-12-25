<template>
    {{ void "feed column" }}
    <div class="flex flex-col pr-1 h-full w-64 bg-slate-900">
        {{ void "feed title" }}
        <div class="flex h-14 w-full border-b-2 border-white pl-2 pr-1 items-center">
            <div class="flex w-full justify-between">
                <div class="flex flex-col">
                    <div class="text-xs leading-none h-1/2">@feedName</div>
                    <div class="font-semibold leading-none h-1/2 content-end">Feed Name</div>
                </div>
                <div class="flex flex-col justify-between place-items-end overflow-hidden">
                    <div class="h-1/2 flex items-center">
                        <div title="Refresh"><i-mingcute:refresh-3-fill class="text-xl cursor-pointer hover:text-cyan-400"/></div>
                        <div title="Reorder"><i-mingcute:menu-line title="Reorder" class="text-xl cursor-grab hover:text-cyan-400"/></div>
                    </div>
                    <div class="h-1/2 text-feedTimestamp leading-none text-nowrap content-end">Last Update: 12/23/24 12:55pm</div>
                </div>
            </div>
        </div>
        <div class="h-full p-2 bg-slate-600 overflow-y-auto">
            <FeedPost />
            <FeedPost />
            <FeedPost />
            <FeedPost />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FeedPost from './FeedPost.vue';

export default defineComponent({
    setup () {        

        return {}
    }
})
</script>

<style scoped>
</style>