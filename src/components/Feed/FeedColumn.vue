<template>
    {{ void "feed column" }}
    <div :id="feedId" class="relative flex flex-col pr-1 h-full w-64 bg-slate-900">
        {{ void "feed title" }}
        <div class="flex h-14 w-full border-b-2 border-white pl-2 pr-1 items-center">
            <div class="flex w-full justify-between">
                <div class="flex flex-col">
                    <div class="text-xs leading-none h-1/2">@{{ userHandle }}</div>
                    <div class="font-semibold leading-none h-1/2 content-end">{{ feedName }}</div>
                </div>
                <div class="flex flex-col justify-between place-items-end overflow-hidden">
                    <div class="h-1/2 flex items-center">
                        <div title="Refresh" @click="generateRandomDate(new Date(2012, 0, 1), new Date)"><i-mingcute:refresh-3-fill class="text-xl cursor-pointer hover:text-cyan-400"/></div>
                        <div title="Reorder"><i-mingcute:menu-line title="Reorder" class="text-xl cursor-grab hover:text-cyan-400"/></div>
                    </div>
                    <!-- <div class="h-1/2 text-feedTimestamp leading-none text-nowrap content-end">Last Update: 12/23/24 12:55pm</div> -->
                    <div class="h-1/2 text-feedTimestamp leading-none text-nowrap content-end">Updated: {{ getTimeStampFormat(lastUpdate) }}</div>
                </div>
            </div>
        </div>
        <div class="h-full py-2 pl-2 pr-1 bg-slate-600 preload-gutter overflow-y-auto">
            <FeedPost v-for="n in postCount" />
            <div v-if="DebugFlags.showFeedColumnCenter" class="relative h-full w-0.5 left-1/2 bg-blue-900/60"></div>
        </div>
        <div class="absolute pointer-events-none h-full left-0 right-0 border-2 rounded-sm border-sky-500/0 transition-colors"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FeedPost from './FeedPost.vue';
import { DebugFlags } from '../../state/Debug.vue';

interface FeedCollection{
    feedName: string
    userHandle: string
    postCount: number
    lastUpdate: Date
}

export default defineComponent({
    // props: {
    //     feedCollection: {
    //         type: Object as PropType<FeedCollection>,
    //         required: true
    //     }
    // },
    data(){
        return{
            lastUpdate: new Date(),
            DebugFlags,
        }
    },
    props: {
        feedId: String,
        userHandle: String,
        feedName: String,
        postCount: Number
    },
    mounted() {
        this.userHandle
        this.feedName
        this.postCount
    },
    methods: {
        generateRandomDate(start: Date, end: Date){
            this.lastUpdate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
        },
        getTimeStampFormat(){
            return [this.lastUpdate.toLocaleDateString(),' ',
            this.lastUpdate.toLocaleTimeString().replace(' ','')].join('');
        }
    },
    created(){
        this.generateRandomDate(new Date(2012, 0, 1), new Date())
    },
    setup () {

        return {}
    }
})
</script>

<style scoped>
</style>