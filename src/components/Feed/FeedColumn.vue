<template>
    {{ void "feed column" }}
    <!-- <div class="flex"> -->
    <div data-test="feed-column" :id="feedId" class="relative flex flex-col h-full w-72 pr-1 bg-slate-900 overflow-hidden min-w-72 max-w-[600px]">
        {{ void "feed title" }}
        <div class="flex min-h-14 w-full border-b-2 border-white pl-2 pr-1 items-center">
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
                        <div title="Options" @click="showFeedColumnOptions()" class="text-xl cursor-pointer hover:text-cyan-400"><i-mingcute:settings-6-fill/></div>
                        <div title="Reorder"><i-mingcute:menu-line title="Reorder" class="text-xl cursor-grab hover:text-cyan-400"/></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex flex-col px-2 py-1 bg-slate-800">
            <div class="max-h-6 overflow-hidden select-none feedOptionCategory">
                <div @click="toggleFeedColumnOptionCategory" class="flex h-6 justify-between items-centers cursor-pointer">
                    <div class="flex items-center">
                        <i-mdi:magnify-scan/>
                        <div class="pl-1">Feed Content</div>
                    </div>
                    <i-mdi:expand-more/>
                </div>
                <div class="h-6 bg-red-500">TBA</div>
            </div>
            <div class="max-h-6 overflow-hidden select-none feedOptionCategory">
                <div @click="toggleFeedColumnOptionCategory" class="flex h-6 justify-between items-centers cursor-pointer">
                    <div class="flex items-center">
                        <i-mingcute:user-add-fill/>
                        <div class="pl-1">Feed Authors</div>
                    </div>
                    <i-mdi:expand-more/>
                </div>
                <div class="h-6 bg-red-500">TBA</div>
            </div>
            <div class="max-h-6 overflow-hidden select-none feedOptionCategory">
                <div @click="toggleFeedColumnOptionCategory" class="flex h-6 justify-between items-centers cursor-pointer">
                    <div class="flex items-center">
                        <i-mdi:gear-box/>
                        <div class="pl-1">Preferences</div>
                    </div>
                    <i-mdi:expand-more/>
                </div>
                <div class="h-6 font-bold text-xs leading-6">Column Width Size</div>
                <div class="flex space-x-2">
                    <div @click="setSmallColumnWidth"
                        :class="[{'bg-blue-700' : selectedWidthSetting === 0},
                            {'hover:bg-blue-500' : selectedWidthSetting === 0}
                        ]"
                        class="border border-slate-700 rounded-md p-1 cursor-pointer
                            hover:bg-slate-600/20">
                        <div class="text-sm">Small</div>
                        <div>S</div>
                    </div>
                    <div @click="setMediumColumnWidth"
                        :class="[{'bg-blue-700' : selectedWidthSetting === 1},
                            {'hover:bg-blue-500' : selectedWidthSetting === 1}
                        ]"
                        class="border border-slate-700 rounded-md p-1 cursor-pointer
                            hover:bg-slate-600/20">
                        <div class="text-sm">Medium</div>
                        <div>M</div>
                    </div>
                    <div @click="setLargeColumnWidth"
                        :class="[{'bg-blue-700' : selectedWidthSetting === 2},
                                {'hover:bg-blue-500' : selectedWidthSetting === 2}
                            ]"
                        class="border border-slate-700 rounded-md p-1 cursor-pointer
                            hover:bg-slate-600/20">
                        <div class="text-sm">Large</div>
                        <div>L</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="h-full py-2 pl-2 pr-1 bg-slate-600 preload-gutter overflow-y-auto">
            <!-- <FeedPost v-for="n in feedData?.totalPosts" /> -->
            <FeedPost v-for="n in PostCollection" :postData="n" />
            <div v-if="DebugFlags.showFeedColumnCenter" class="relative h-full w-0.5 left-1/2 bg-blue-900/60"></div>
            <div v-if="DebugFlags.showFeedColumnDragResizeStats" class="absolute left-0 top-16 px-2 py-1 bg-orange-500/80 content-center">
                <div>Dragging?: {{ isDragging }}</div>
                <div>MousePos: {{ mousePosition }}</div>
                <div>OriginalWidth: {{ columnWidth }}</div>
            </div>
        </div>
        <div data-test="feedColumn-highlight" class="absolute pointer-events-none h-full left-0 right-0 border-2 rounded-sm border-sky-500/0 transition-colors"></div>
    </div>
    <!-- <div data-test="feedColumn-resizer" @mousedown="startDrag($event)" class="relative bg-slate-900 w-1 cursor-ew-resize"></div> -->
    <!-- </div> -->
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { DebugFlags } from '../../state/Debug.vue';
import { IFeedData } from '../../interfaces/FeedInterfaces';
import { IPostDetails } from '../../interfaces/PostInterfaces';
import { createPost } from '../../fake-data/PostFactory'

var colElement;

// function showFeedColumnOptions(){
//     console.log('Column'+feedId+'options shown');
// }

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
            isDragging: false,
            mousePosition: [0,0],
            columnWidth: 0,
            selectedWidthSetting: 0,
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
        startDrag(e: MouseEvent){
            if(!this.feedId) return;
            const column = document.getElementById(this.feedId);
            if(column){
                colElement = column;
                if(DebugFlags.showFeedColumnDragResizeStats){
                    this.isDragging = true;
                    this.columnWidth = colElement.clientWidth;
                }
            }
            document.addEventListener('mousemove', this.resizeColumn);
            document.addEventListener('mouseup', this.endDrag);
        },
        resizeColumn(e:MouseEvent){
            (colElement as HTMLElement).style.width = ((colElement as HTMLElement).clientWidth+e.movementX)+"px";
            if(DebugFlags.showFeedColumnDragResizeStats){
                this.mousePosition = [e.clientX,e.clientY];
                this.columnWidth = colElement.clientWidth;
            }
        },
        endDrag(){
            if(DebugFlags.showFeedColumnDragResizeStats){
                this.isDragging = false;
                this.mousePosition = [0,0];
            }
            document.removeEventListener('mousemove', this.resizeColumn);
            document.removeEventListener('mouseup', this.endDrag);
        },
        showFeedColumnOptions(){
            console.log('Column '+this.feedId+' options shown');
        },
        toggleFeedColumnOptionCategory(e:MouseEvent){
            var categoryDiv = ((e.currentTarget as HTMLElement).parentElement as HTMLElement);
            if(categoryDiv.classList.contains('show')){
                categoryDiv.classList.remove('show');
            }
            else{
                categoryDiv.classList.add('show');
            }
        },
        getFeedElement():HTMLElement{
            return document.getElementById(this.feedId) as HTMLElement;
        },
        /**
         * Method that changes the FeedColumn's width to "Small" (18rem).
         */
        setSmallColumnWidth(){
            this.getFeedElement().classList.remove('medium');
            this.getFeedElement().classList.remove('large');
            this.selectedWidthSetting = 0;
        },
        /**
         * Method that changes the FeedColumn's width to "Medium" (27.75rem).
         */
        setMediumColumnWidth(){
            this.getFeedElement().classList.add('medium');
            this.getFeedElement().classList.remove('large');
            this.selectedWidthSetting = 1;
        },
        /**
         * Method that changes the FeedColumn's width to "Medium" (27.75rem).
         */
         setLargeColumnWidth(){
            this.getFeedElement().classList.add('large');
            this.getFeedElement().classList.remove('medium');
            this.selectedWidthSetting = 2;
        },
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
.feedOptionCategory{
    transition: max-height 0.2s;
}
.feedOptionCategory.show{
    max-height: 148px;
}
.small{
    width: 18rem; /*288px*/
}
[data-test="feed-column"]{
    transition: width 0.2s;
}
[data-test="feed-column"].medium{
    width: 27.75rem; /*444px*/
}
[data-test="feed-column"].large{
    width: 37.5rem; /*600px*/
}
</style>