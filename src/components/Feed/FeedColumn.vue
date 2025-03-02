<template>
    <div data-test="feed-column" :id="feedData?.description.feedId"
    class="flex flex-col relative w-72 pr-1 bg-slate-900
    overflow-hidden min-w-72 max-w-[600px] origin-top-left">
        {{ void "feed title" }}
        <div class="flex w-full shrink-0 border-b-2 border-white pl-2 pr-1 pt-2 pb-1">
            <div class="flex w-full items-center">
                <div class="p-1">
                    <FeedIcon :icon="feedData?.description.feedType"/>
                </div>
                <div class="flex overflow-hidden flex-col">
                    <div class="flex flex-col text-nowrap">
                        <div class="font-semibold leading-none pr-1 truncate">{{ feedData?.description.feedName }}</div>
                        <div class="text-xs truncate">@{{ feedData?.description.feedHandle }}</div>
                    </div>
                    <div class="text-feedTimestamp leading-4 text-nowrap content-end text-slate-400">Updated: {{ getTimeStampFormat() }}</div>
                </div>
                <div class="flex self-center ml-auto">
                        <!-- <div title="Add - DEBUG" @click="addNewPost" class="cursor-pointer hover:text-cyan-400"><i-mingcute:plus-fill/></div> -->
                        <div title="Refresh" @click="refreshFeed"><i-mingcute:refresh-3-fill class="text-2xl cursor-pointer hover:text-cyan-400"/></div>
                        <div title="Options" @click="toggleFeedColumnOptionsMenu()" class="text-2xl cursor-pointer hover:text-cyan-400"><i-mingcute:settings-6-fill/></div>
                        <div title="Reorder" @click="removePost"><i-mingcute:menu-line title="Reorder" class="text-2xl cursor-grab hover:text-cyan-400"/></div>
                </div>
            </div>
        </div>
        <div data-test="feedcolumn-options-menu" :class="[{'hide' : !feedOptionsShown}]" class="flex flex-col px-2 py-1 bg-slate-800 feedOptions">
            <div @click="toggleFeedColumnContentCategory"
            :class="[{'show' : feedOptionContentSettingsShown}]"
            class="max-h-6 overflow-hidden select-none feedOptionCategory">
                <div class="flex h-6 justify-between items-centers cursor-pointer">
                    <div class="flex items-center">
                        <i-mdi:magnify-scan/>
                        <div class="pl-1">Feed Content</div>
                    </div>
                    <i-mdi:expand-more/>
                </div>
                <div class="h-6 bg-red-500">TBA</div>
            </div>
            <div @click="toggleFeedColumnAuthorsCategory"
            :class="[{'show' : feedOptionAuthorSettingsShown}]"
            class="max-h-6 overflow-hidden select-none feedOptionCategory">
                <div class="flex h-6 justify-between items-centers cursor-pointer">
                    <div class="flex items-center">
                        <i-mingcute:user-add-fill/>
                        <div class="pl-1">Feed Authors</div>
                    </div>
                    <i-mdi:expand-more/>
                </div>
                <div class="h-6 bg-red-500">TBA</div>
            </div>
            <div @click="toggleFeedColumnPreferencesCategory"
            :class="[{'show' : feedOptionPreferencesShown}]"
            class="max-h-6 overflow-hidden select-none feedOptionCategory">
                <div class="flex h-6 justify-between items-centers cursor-pointer">
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
            <TransitionGroup name="feedpost">
                <!-- <FeedPost v-for="n in PostCollection" :key="n" :postData="n" /> -->
                <FeedPost v-for="n in feedData?.data" :key="n" :postData="n" />
            </TransitionGroup>
            <div v-if="DebugFlags.showFeedColumnCenter" class="relative h-full w-0.5 left-1/2 bg-blue-900/60"></div>
            <div v-if="DebugFlags.showFeedColumnDragResizeStats" class="absolute left-0 top-16 px-2 py-1 bg-orange-500/80 content-center">
                <div>Dragging?: {{ isDragging }}</div>
                <div>MousePos: {{ mousePosition }}</div>
                <div>OriginalWidth: {{ columnWidth }}</div>
            </div>
        </div>
        <div data-test="feedColumn-highlight" class="absolute pointer-events-none h-full left-0 right-0 border-2 rounded-sm border-sky-500/0 transition-colors"></div>
    </div>
</template>
<!-- <div v-if="false" data-test="feedColumn-resizer" @mousedown="startDrag($event)" class="relative bg-slate-900 w-1 cursor-ew-resize"></div> -->

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { DebugFlags } from '../../state/Debug.vue';
import { IFeedDescription, IFeedListing } from '../../interfaces/FeedInterfaces';
import { IPostDetails } from '../../interfaces/PostInterfaces';
import { createPost } from '../../fake-data/PostFactory'
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { addDummyPostToFeed, removeLastFeedPost } from '../../state/FeedList.vue';

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
            feedOptionsShown: false,
            feedOptionContentSettingsShown: false,
            feedOptionAuthorSettingsShown: false,
            feedOptionPreferencesShown: false,
        }
    },
    props: {
        // feedData: Object as PropType<IFeedDescription>,
        feedData: Object as PropType<IFeedListing>,
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
            // this.PostCollection.push(createPost(1));
            addDummyPostToFeed(this.feedData.description.feedId);
        },
        removePost(){
            // this.PostCollection.pop();
            removeLastFeedPost(this.feedData.description.feedId);
        },
        refreshFeed(){
            this.generateRandomDate(new Date(2012, 0, 1), new Date);
            this.addNewPost();
        },
        startDrag(e: MouseEvent){
            if(!this.feedId) return;
            const column = document.getElementById(this.feedData?.feedId);
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
        /**
         * Method that toggles the displaying of the FeedColumn's "Options Menu".
         */
        toggleFeedColumnOptionsMenu(){
            this.feedOptionsShown = !this.feedOptionsShown;
            if(!this.feedOptionsShown){
                //if options menu is hidden, collapse all option categories
                this.feedOptionContentSettingsShown = false;
                this.feedOptionAuthorSettingsShown = false;
                this.feedOptionPreferencesShown = false;
            }
        },
        /**
         * Toggles display of FeedColumn "Options Menu - Content Category".
         */
        toggleFeedColumnContentCategory(){
            this.feedOptionContentSettingsShown = !this.feedOptionContentSettingsShown;
        },
        /**
         * Toggles display of FeedColumn "Options Menu - Authors Category".
         */
         toggleFeedColumnAuthorsCategory(){
            this.feedOptionAuthorSettingsShown = !this.feedOptionAuthorSettingsShown;
        },
        /**
         * Toggles display of FeedColumn "Options Menu - Preferences Category".
         */
         toggleFeedColumnPreferencesCategory(){
            this.feedOptionPreferencesShown = !this.feedOptionPreferencesShown;
        },
        getFeedElement():HTMLElement{
            return document.getElementById(this.feedData?.description.feedId) as HTMLElement;
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
    mounted(){
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
.feedOptions{
    transition: padding-top 0.2s, padding-bottom 0.2s, max-height 0.2s;
    max-height: 400px; /**This max-height results in a non-smooth transition, since
    the height value is not acurate. Need to create a calulated value solution using
    height. */
}
.feedOptions.hide{
    max-height: 0px;
    padding-top: 0px;
    padding-bottom: 0px;
}
.feedOptionCategory{
    transition: max-height 0.2s;
}
.feedOptionCategory.show{
    max-height: 148px;
}
.small{
    width: 18rem; /*288px*/
}
/* [data-test="feed-column"]{
    transition: width 0.2s;
} */
[data-test="feed-column"].medium{
    width: 27.75rem; /*444px*/
}
[data-test="feed-column"].large{
    width: 37.5rem; /*600px*/
}

/* .feedpost-move, */
.feedpost-enter-active,
.feedpost-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.feedpost-enter-from,
.feedpost-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>