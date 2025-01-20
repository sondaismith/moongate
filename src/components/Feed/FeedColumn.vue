<template>
    {{ void "feed column" }}
    <div :id="feedId" class="relative flex flex-col h-full w-72 bg-slate-900 overflow-hidden min-w-72 max-w-[600px]">
        {{ void "feed title" }}
        <div class="flex h-14 w-full border-b-2 border-white pl-2 pr-1 items-center">
            <FeedIcon :icon="feedData?.feedType"/>
            <div class="flex w-full justify-between">
                <div class="flex flex-col text-nowrap">
                    <div class="flex items-center text-nowrap">
                        <div class="font-semibold pr-1 content-end">{{ feedData?.feedName }}</div>
                        <div class="text-xs leading-none h-1/2">@{{ feedData?.feedHandle }}</div>
                    </div>
                    <div class="text-feedTimestamp leading-none text-nowrap content-end">Updated: {{ getTimeStampFormat() }}</div>
                </div>
                <div class="flex flex-col self-center">
                    <div class="flex items-center">
                        <!-- <div title="Add - DEBUG" @click="addNewPost" class="cursor-pointer hover:text-cyan-400"><i-mingcute:plus-fill/></div> -->
                        <div title="Refresh" @click="generateRandomDate(new Date(2012, 0, 1), new Date)"><i-mingcute:refresh-3-fill class="text-xl cursor-pointer hover:text-cyan-400"/></div>
                        <div title="Reorder"><i-mingcute:menu-line title="Reorder" class="text-xl cursor-grab hover:text-cyan-400"/></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="h-full py-2 pl-2 pr-1 bg-slate-600 preload-gutter overflow-y-auto">
            <!-- <FeedPost v-for="n in feedData?.totalPosts" /> -->
            <FeedPost v-for="n in PostCollection" :postData="n" />
            <div v-if="DebugFlags.showFeedColumnCenter" class="relative h-full w-0.5 left-1/2 bg-blue-900/60"></div>
        </div>
        <div class="absolute pointer-events-none h-full left-0 right-0 border-2 rounded-sm border-sky-500/0 transition-colors"></div>
    </div>
    <div data-test="feedColumn-resizer" draggable="true" @drag="resizeColumn()" class="bg-blue-900 w-1 cursor-ew-resize"></div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { DebugFlags } from '../../state/Debug.vue';
import { IFeedData } from '../../interfaces/FeedInterfaces';
import { IPostDetails } from '../../interfaces/PostInterfaces';
import { createPost } from '../../fake-data/PostFactory'

var isDragging = true;

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
            PostCollection: [] as IPostDetails[],
        }
    },
    props: {
        feedId: String,
        userHandle: String,
        feedName: String,
        postCount: Number,
        feedData: Object as PropType<IFeedData>,
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
        },
        addNewPost(){
            this.PostCollection.push(createPost(1));
        },
        refreshFeed(){
            this.addNewPost();
        },
        startDrag(){
            console.log('Drag start');
            isDragging = true;
            document.addEventListener('pointermove', this.resizeColumn);
        },
        resizeColumn(){
            if(isDragging){
                console.log('Dragging');
            }
        },
        endDrag(){
            console.log('Drag end');
            // isDragging = false;
            document.removeEventListener('mousemove', this.endDrag);
        }
    },
    created(){
        this.generateRandomDate(new Date(2012, 0, 1), new Date())
        for (let i = 0; i < this.feedData.totalPosts; i++) {
            this.PostCollection.push(createPost(8));
        }
    },
    setup () {

        return {}
    }
})
</script>

<style scoped>
</style>