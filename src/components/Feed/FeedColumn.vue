<template>
    <div data-testid="feed-column" :id="feedData?.description.feedId"
    class="flex flex-col shrink-0 relative w-72 pr-1 bg-banner
    overflow-hidden max-w-[600px] origin-top-left"
    :style="`width:${feedData?.description.feedColumnSettings.width}px`">
        {{ void "feed title" }}
        <div class="flex w-full shrink-0 border-b-2 border-outline bg-banner pl-2 pr-1 pt-2 pb-1 text-primary">
            <div class="flex w-full items-center">
                <div class="p-1 pr-3">
                    <FeedIcon :icon="feedData?.description.feedIcon"/>
                </div>
                <div class="flex overflow-hidden flex-col">
                    <div class="flex flex-col text-nowrap"
                    :class="{'animate-pulse' : feedData?.isAwaitingFeedData}">
                        <div class="font-semibold leading-none pr-1 truncate"
                        :title="feedData?.description.feedName">
                            {{ feedData?.description.feedName }}
                        </div>
                        <div class="text-xs truncate"
                        :title="'@'+feedData?.description.feedHandle">
                            @{{ feedData?.description.feedHandle }}
                        </div>
                    </div>
                    <div class="text-feedTimestamp leading-4 text-nowrap content-end text-secondary">Updated: {{ getTimeStampFormat() }}</div>
                </div>
                <div class="flex items-center ml-auto">
                        <!-- <div title="Add - DEBUG" @click="addNewPost" class="cursor-pointer hover:text-cyan-400"><i-mingcute:plus-fill/></div> -->
                        <SquareButton data-testid="feedColumn-refresh-button" title="Refresh" @click="refreshFeed(feedData?.description.feedId)" button-padding="0" focus-padding="0"
                        class="text-2xl cursor-pointer bg-transparent text-primary hover:text-cyan-400 bg-[auto_0] bg-gradient-to-t from-slate-400 to-slate-800
                        focus-visible:text-cyan-400 hover:border-transparent shadow-none disabled:!bg-transparent"
                        :class="{'!cursor-not-allowed !text-disabledBG hover:text-disabledBG refresh-timeout' : isAwaitingRefreshTimeout}"
                        :is-disabled="isAwaitingRefreshTimeout">
                            <i-mingcute:refresh-3-fill/>
                        </SquareButton>
                        <SquareButton title="Options" @click="toggleFeedColumnOptionsMenu()" button-padding="0" focus-padding="0"
                        class="text-2xl cursor-pointer bg-transparent text-primary hover:text-cyan-400  focus-visible:text-cyan-400
                        hover:border-transparent shadow-none">
                            <i-mingcute:settings-6-fill/>
                        </SquareButton>
                        <div v-if="!AppState.isAppOnMobileTouchscreenDevice" data-testid="feedcolumn-reorder-handle"
                        title="Reorder"
                        class="flex text-2xl cursor-grab hover:text-cyan-400 w-[34.8px]"
                        @pointerdown="handleFeedColumnMouseDown($event,listIndex)">
                            <i-mingcute:menu-line class="pointer-events-none h-full m-auto"/>
                        </div>
                        <div data-testid="feedcolumn-reorder-button" v-else title="Reorder"
                        class="flex text-2xl cursor-pointer hover:text-cyan-400 w-[34.8px]"
                        @click="openFeedOrderModal">
                            <i-mingcute:menu-line class="pointer-events-none h-full m-auto"/>
                        </div>
                </div>
            </div>
        </div>
        <div data-test="feedcolumn-options-menu" v-if="feedOptionsShown" class="flex flex-col px-2 py-1 bg-feedColumnSettingsBG text-primary border-b-2 border-primary feedOptions">
            <div v-if="false">
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
            </div>
            <button @click="toggleFeedColumnPreferencesCategory"
            class="rounded max-h-6 overflow-hidden select-none feedOptionCategory
            focus-visible:outline focus-visible:outline-searchbarFocusHightlight
            hover:bg-btnHover hover:border-transparent shadow-none">
                <div class="flex h-6 justify-between items-centers cursor-pointer">
                    <div class="flex items-center">
                        <i-mdi:gear-box/>
                        <div class="pl-1">Preferences</div>
                    </div>
                    <i-mdi:expand-more/>
                </div>
            </button>
            <div v-if="feedOptionPreferencesShown">
                <div class="flex flex-col items-center">
                    <div class="h-6 font-bold text-xs leading-6">Column Width Size</div>
                    <div class="flex space-x-2">
                        <button @click="setSmallColumnWidth"
                        :class="[{'bg-feedColumnSettingsBtnSelected' : selectedWidthSetting === 0},
                            {'hover:!bg-feedColumnSettingsBtnSelectedHover' : selectedWidthSetting === 0}
                        ]"
                        class="border border-outline rounded-md p-1 cursor-pointer
                        hover:bg-feedColumnSettingsBtnHover/10 hover:border-embedHoverBorder focus-visible:outline
                        focus-visible:outline-searchbarFocusHightlight shadow-none">
                            <div class="text-sm">Small</div>
                            <div>S</div>
                        </button>
                        <button @click="setMediumColumnWidth"
                        :class="[{'bg-feedColumnSettingsBtnSelected' : selectedWidthSetting === 1},
                            {'hover:!bg-feedColumnSettingsBtnSelectedHover' : selectedWidthSetting === 1}
                        ]"
                        class="border border-outline rounded-md p-1 cursor-pointer
                        hover:bg-feedColumnSettingsBtnHover/10 hover:border-embedHoverBorder focus-visible:outline
                        focus-visible:outline-searchbarFocusHightlight shadow-none">
                            <div class="text-sm">Medium</div>
                            <div>M</div>
                        </button>
                        <button @click="setLargeColumnWidth"
                        :class="[{'bg-feedColumnSettingsBtnSelected' : selectedWidthSetting === 2},
                                {'hover:!bg-feedColumnSettingsBtnSelectedHover' : selectedWidthSetting === 2}
                            ]"
                        class="border border-outline rounded-md p-1 cursor-pointer
                        hover:bg-feedColumnSettingsBtnHover/10 hover:border-embedHoverBorder focus-visible:outline
                        focus-visible:outline-searchbarFocusHightlight shadow-none">
                            <div class="text-sm">Large</div>
                            <div>L</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex flex-col h-full py-2 pl-1 pr-1 gap-2 bg-feedColumnBG preload-gutter overflow-y-auto"
        tabindex="-1"
        @scroll.passive="toggleScrollToTop">
            {{ void "Placeholder Post" }}
            <div v-if="feedData?.isAwaitingFeedData" class="flex rounded bg-slate-400 pl-1 pr-3 py-2 w-full">
                <div class="animate-pulse drop-shadow-md">
                    <div class="rounded-full bg-slate-500 aspect-square size-10"></div>
                </div>
                <div class="animate-pulse flex flex-col pl-2 w-full overflow-hidden gap-1">
                    <div class="flex gap-2 mb-1">
                        <div class="h-3 w-full rounded-sm bg-slate-500"></div>
                        <div class="h-3 w-10 rounded-sm bg-slate-500"></div>
                    </div>
                    <div class="h-4 w-full rounded-sm bg-slate-500"></div>
                    <div class="h-4 w-full rounded-sm bg-slate-500"></div>
                    <div class="h-4 w-4/5 rounded-sm bg-slate-500"></div>
                    <div class="aspect-square w-full mt-1 rounded-sm bg-slate-500"></div>
                    <div class="flex gap-4 mt-1 w-full">
                        <div class="size-5 rounded-md bg-slate-500"></div>
                        <div class="size-5 rounded-md bg-slate-500"></div>
                        <div class="size-5 rounded-md bg-slate-500"></div>
                    </div>
                </div>
            </div>
            <TransitionGroup name="feedpost">
                <div v-if="showStandardPostLayout"
                class="flex flex-col gap-2">
                    <div v-for="n in feedData?.data" data-test="feedColumn-post" :key="generateUniqueIdForPost(n)" class="rounded bg-feedColumnBG border border-outline w-full
                    drop-shadow-md justify-between text-sm">
                        <FocusFeedPost tabindex="-1" class="border-0" :post-data="({$type:'app.bsky.feed.defs#postView',...(n as FeedViewPost).post} as PostView)"
                        :post-reason="(n as FeedViewPost).reason" :reply-ref="(n as FeedViewPost).reply"
                        :is-feed-post-style="true"/>
                    </div>
                </div>
                <div v-else-if="feedData?.description.feedType == FeedEnums.Types.Notifications"
                class="flex flex-col gap-2">
                    <div v-for="n in feedData.data" :key="generateUniqueIdForPost(n)" class="rounded bg-feedColumnBG border border-outline w-full
                    drop-shadow-md justify-between text-sm">
                        <NotificationRecord :notif-data="n as Notification"/>
                    </div>
                </div>
                <div v-if="feedData?.description.feedType == FeedEnums.Types.Trending"
                class="flex flex-col gap-2">
                    <div v-for="(tt, index) in feedData.data" :key="generateUniqueIdForPost(tt)" class="rounded bg-feedColumnBG border border-outline w-full
                    drop-shadow-md justify-between text-sm">
                        <TrendingTopic :trend="tt as TrendView" :position="index+1"/>
                    </div>
                </div>
                <div v-if="(feedData?.description.feedType == FeedEnums.Types.User ||
                feedData?.description.feedType == FeedEnums.Types.FeedGenerator) && !feedData?.cursor"
                class="flex rounded justify-center p-1 bg-postMsg border border-outlineLighter text-disabled select-none">
                    End of Posts
                </div>
                <button @click="AppState.ToggleLoginModal"
                v-else-if="feedData?.description.feedType == FeedEnums.Types.Following && !AppState.isAuthBrowsing"
                class="flex rounded justify-center p-1 bg-postMsg hover:bg-btnHover border border-outlineLighter text-btnText select-none
                hover:border-transparent active:border-transparent focus-visible:outline focus-visible:outline-searchbarFocusHightlight">
                    Login to view Following Timeline
                </button>
                <button @click="AppState.ToggleLoginModal"
                v-else-if="feedData?.description.feedType == FeedEnums.Types.Notifications && !AppState.isAuthBrowsing"
                class="flex rounded justify-center p-1 bg-postMsg hover:bg-btnHover border border-outlineLighter text-btnText select-none
                hover:border-transparent active:border-transparent focus-visible:outline focus-visible:outline-searchbarFocusHightlight">
                    Login to view Notifications
                </button>
                <div v-else-if="isFeedOwnerBlocked"
                class="flex rounded justify-center p-1 bg-postMsg border border-outlineLighter text-disabled select-none">
                    Account Blocked
                </div>
                <button v-else-if="feedData.description.feedType != FeedEnums.Types.Tag &&
                feedData.description.feedType != FeedEnums.Types.Notifications &&
                feedData?.description.feedType != FeedEnums.Types.Trending &&
                !feedData.isAwaitingFeedData" @click="loadMorePosts(feedData.description.feedId)"
                class="flex rounded border border-outline justify-center items-center p-1 gap-1 bg-postMsg text-btnText
                cursor-pointer hover:bg-hover hover:text-slate-200 transition-colors select-none
                hover:border-transparent active:border-transparent focus-visible:outline
                focus-visible:outline-searchbarFocusHightlight"
                :class="{'!bg-outline hover:bg-hover text-hover hover:text-hover pointer-events-none' : isAwaitingLoadMore}">
                    <i-mingcute:loading-fill v-if="isAwaitingLoadMore" class="spinner"/>
                    <i-mingcute:plus-fill/>
                    <div>Load more</div>
                </button>
            </TransitionGroup>
            <div v-if="DebugFlags.showFeedColumnCenter" class="relative h-full w-0.5 left-1/2 bg-blue-900/60"></div>
            <div v-if="DebugFlags.showFeedColumnDragResizeStats" class="absolute left-0 top-16 px-2 py-1 bg-orange-500/80 content-center">
                <div>Dragging?: {{ isDragging }}</div>
                <div>MousePos: {{ mousePosition }}</div>
                <div>OriginalWidth: {{ columnWidth }}</div>
            </div>
            <Transition name="feedpost">
                <ToContainerTop v-show="isScrollToTopVisible"/>
            </Transition>
        </div>
        <div data-test="feedColumn-highlight" class="absolute pointer-events-none h-full
        left-0 right-0 border-2 rounded-sm border-sky-500/0 opacity-0s bg-transparent transition-colors duration-300"></div>
    </div>
</template>
<!-- <div v-if="false" data-test="feedColumn-resizer" @mousedown="startDrag($event)" class="relative bg-slate-900 w-1 cursor-ew-resize"></div> -->

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { DebugFlags } from '../../state/Debug.vue';
import { IFeedListing } from '../../interfaces/FeedInterfaces';
import { IPostDetails } from '../../interfaces/PostInterfaces';
import { ClearFeed, FeedState, LoadMoreFeedPosts, RefreshFeed, RemoveFeed, SaveFeedChanges, updateFeedColumnSettings, UpdateSelectedFeed } from '../../state/FeedList.vue';
import { FeedEnums } from '../../enums/FeedEnums';
import ToContainerTop from '../Utilities/ToContainerTop.vue';
import { debounce } from '../../helpers/debouncer';
import { FeedViewPost, isReasonPin, isReasonRepost, PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import FocusFeedPost from './FocusFeedPost.vue';
import FeedPost from './FeedPost.vue';
import { Notification } from '@atproto/api/dist/client/types/app/bsky/notification/listNotifications';
import { convertToShortTimestamp } from '../../helpers/converters';
import NotificationRecord from './NotificationRecord.vue';
import { AppState, toast } from '../../state/AppState.vue';
import { TrendView } from '@atproto/api/dist/client/types/app/bsky/unspecced/defs';
import TrendingTopic from './TrendingTopic.vue';
import { isOnMobileTouchscreen } from '../../helpers/states';
import SquareButton from '../Utilities/SquareButton.vue';
import { HandleAPIError } from '../../helpers/errors';

var colElement;

// function showFeedColumnOptions(){
//     console.log('Column'+feedId+'options shown');
// }

export default defineComponent({
    components:{
        ToContainerTop,
        FeedPost,
        FocusFeedPost,
        NotificationRecord,
        TrendingTopic,
        SquareButton,
    },
    data(){
        return{
            AppState,
            /**
             * Indicates if the component been mounded. Used to prevent the column
             * width setting from being updated when value is loaded during
             * creation.
             */
            isMounted: false,
            lastUpdate: new Date(),
            /**Determines if the refresh command is currently "on cooldown". */
            isAwaitingRefreshTimeout:false,
            /**Holds a collection of new Posts that are available but not shown in the Feed list. */
            newPostsWaiting: [] as FeedViewPost[],
            /**
             * Indicates if the application is still waiting for a response from the API returning
             * older Feed posts.
             * */
            isAwaitingLoadMore:false,
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
            isScrollToTopVisible:false,
            /**
             * Used to determine what type of object needs to be processed and
             * and displayed - e.g. FeedViewPost[] or Notification[]
             */
            FeedDataType:FeedEnums.Types.User,
            FeedEnums,
            FeedState,
            convertToShortTimestamp,
            isOnMobileTouchscreen,
        }
    },
    props: {
        // feedData: Object as PropType<IFeedDescription>,
        feedData: Object as PropType<IFeedListing>,
        /**
         * The current index of this FeedColumn component. Used to allow FeedColumn
         * components to be re-ordered.
         */
        listIndex:{
            type: Number,
            required: true
        },
    },
    watch:{
        selectedWidthSetting(newWidth){
            if(this.isMounted){
                switch (newWidth) {
                    case 0:
                        // this.getFeedElement().classList.remove('medium');
                        // this.getFeedElement().classList.remove('large');
                        if(this.feedData){
                            updateFeedColumnSettings(this.feedData, {width:FeedEnums.Widths.Small});
                        }
                        // this.feedData?.description.feedColumnSettings.width = FeedEnums.Widths.Small
                        break;
                    case 1:
                        // this.getFeedElement().classList.add('medium');
                        // this.getFeedElement().classList.remove('large');
                        if(this.feedData){
                            updateFeedColumnSettings(this.feedData, {width:FeedEnums.Widths.Medium});
                        }
                        break;
                    case 2:
                        // this.getFeedElement().classList.remove('medium');
                        // this.getFeedElement().classList.add('large');
                        if(this.feedData){
                            updateFeedColumnSettings(this.feedData, {width:FeedEnums.Widths.Large});
                        }
                        break;
                    default:
                        break;
                }
            }
        },
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
            // addDummyPostToFeed(this.feedData.description.feedId);
            //Testing "ClearFeed()" method
            if(this.feedData) ClearFeed(this.feedData?.description.feedId);
        },
        removePost(){
            // this.PostCollection.pop();
            RemoveFeed(this.feedData.description.feedId);
        },
        /**Method used to updated the list of Posts associated with this component's Feed. */
        async refreshFeed(feedId:string|undefined){
            if(feedId && !this.isAwaitingRefreshTimeout){
                this.isAwaitingRefreshTimeout = true;
                await RefreshFeed(feedId, this.lastUpdate);
                this.lastUpdate = new Date();
                //Disable ability to refresh for 3 seconds
                await setTimeout(() => {
                    this.isAwaitingRefreshTimeout = false;
                    console.log('refresh message inside timeout');
                }, 3000);
                console.log('refresh message outside timeout');
            }
        },
        async loadMorePosts(feedId:string|undefined){
            if(feedId && !this.isAwaitingLoadMore){
                this.isAwaitingLoadMore = true;
                console.log(feedId);
                //request older posts from feed
                await LoadMoreFeedPosts(feedId, this.feedData?.cursor);
                this.isAwaitingLoadMore = false;
            }
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
            // this.getFeedElement().classList.remove('medium');
            // this.getFeedElement().classList.remove('large');
            this.selectedWidthSetting = 0;
        },
        /**
         * Method that changes the FeedColumn's width to "Medium" (27.75rem).
         */
        setMediumColumnWidth(){
            // this.getFeedElement().classList.add('medium');
            // this.getFeedElement().classList.remove('large');
            this.selectedWidthSetting = 1;
        },
        /**
         * Method that changes the FeedColumn's width to "Medium" (27.75rem).
         */
         setLargeColumnWidth(){
            // this.getFeedElement().classList.add('large');
            // this.getFeedElement().classList.remove('medium');
            this.selectedWidthSetting = 2;
        },
        /**
         * Method used to scroll back to the top of a Feed list. Defined in the
         * "created()" section.
         */
        toggleScrollToTop(e:Event){},
        /**
         * Method used to generate a unique key/id for each Post being added
         * to the FeedColumn display. Handles situations where the CID will duplicated
         * in the case of reposts or pins. Helps with displaying content in a
         * TransitionGroup layout.
         * @param feedPost The Post that needs a key generated.
         */
        generateUniqueIdForPost(feedPost:FeedViewPost|Notification|TrendView):string{
            let id = 'if_you_see_me_something_broke';
            if(this.feedData?.description.feedType != FeedEnums.Types.Notifications &&
                this.feedData?.description.feedType != FeedEnums.Types.Trending
            ){
                let feedPostFV = (feedPost as FeedViewPost);
                id = feedPostFV.post.cid;
                if(feedPostFV.reason){
                    if(isReasonPin(feedPostFV.reason)) id+='_pinned'
                    if(isReasonRepost(feedPostFV.reason)) id+='_reposted'
                }
            }
            else if(this.feedData?.description.feedType == FeedEnums.Types.Notifications){
                id = (feedPost as Notification).cid;
            }
            else if(this.feedData?.description.feedType == FeedEnums.Types.Trending){
                id = (feedPost as TrendView).topic.replace(' ','_');
            }
            return id;
        },
        /**
         * Used to start the dragging of the selected {@link FeedColumn} component. Allows
         * the User to drag and reposition the Feed item.
         * @param e PointerEvent of user clicking on drag element.
         * @param oldIndex The index of the {@link FeedColumn} currently being dragged.
         */
        handleFeedColumnMouseDown(e:PointerEvent,oldIndex:number){
            if(FeedState.isGrabbingColumn) return;
            let grabbedColumn = (this.$el as HTMLElement);
            let feedContainer = document.getElementById('feedcolumnDisplay');
            //prevent drag from selecting text + elements
            feedContainer?.classList.add('select-none','cursor-grabbing');
            //start drag
            grabbedColumn.classList.add('drag-column-start','dragging');
            //update `FeedColumn` related variables in State
            FeedState.isGrabbingColumn = true;
            FeedState.oldFeedColumnIndex = oldIndex+1;
            FeedState.dragColumnStartingX = grabbedColumn.offsetLeft;
            FeedState.dragColumnClickXPos = e.layerX;
            //Update grab position when initially dragged
            let x = e.clientX;
            let scrollPos = feedContainer ? feedContainer.scrollLeft : 0;
            (grabbedColumn as HTMLElement).style.left = `${x-FeedState.dragColumnStartingX-grabbedColumn.clientWidth/2+scrollPos}px`;//will drag from center of column
            document.addEventListener("mousemove", this.dragMoveFeedColumn);//allows user to move column
            document.addEventListener("mouseup", this.dropFeedColumn);//when user "drops" column
        },
        /**
         * Used to "drop" the currently selected Feed into its new position in the list.
         */
        dropFeedColumn(){
            // clearTimeout(this.longpressTimeout);
            let columnBeingDropped = (document.getElementsByClassName('dragging')[0] as HTMLElement);
            if(columnBeingDropped.classList.contains('drag-column-start')){
                columnBeingDropped.classList.remove('drag-column-start');
                let feedContainer = document.getElementById('feedcolumnDisplay');
                feedContainer?.classList.remove('select-none','cursor-grabbing');//allow selecting text + elements again
                //Smoothly transition element to location - top element unfortunately will not move smoothly
                columnBeingDropped.style.transition = "left 0.3s ease";
                // columnBeingDropped.style.left = "0px";
                document.removeEventListener("mousemove", this.dragMoveFeedColumn);
                //If position is new
                if(FeedState.newFeedColumnIndex != FeedState.oldFeedColumnIndex){
                    // remove element from its oldIndex
                    const elRemoved = FeedState.FeedList.splice(FeedState.oldFeedColumnIndex-1, 1)[0];
                    // insert it at its new index
                    FeedState.FeedList.splice(FeedState.newFeedColumnIndex-1, 0, elRemoved);
                    SaveFeedChanges()//Save changes to disk.
                    .catch(err => {
                        toast.add(HandleAPIError(err, 'Error updating Feed position'));
                    })
                }
                columnBeingDropped.style.removeProperty('left');
                columnBeingDropped.style.removeProperty('transition');
                columnBeingDropped.classList.remove('dragging');
                FeedState.isGrabbingColumn = false;
            }
            FeedState.oldFeedColumnIndex = -100;
            FeedState.newFeedColumnIndex = -100;
            document.removeEventListener("mouseup", this.dropFeedColumn);
        },
        /**
         * Method used to move the {@link FeedColumn} that is being dragged in order
         * to re-order the Feed list.
         * @param e MouseEvent tracking User's pointer movement.
         */
        dragMoveFeedColumn(e:MouseEvent){
            let x = e.clientX;
            let currentDraggedColumn = document.getElementsByClassName('dragging')[0];
            let feedContainer = document.getElementById('feedcolumnDisplay');
            let scrollPos = feedContainer ? feedContainer.scrollLeft : 0;
            // (currentDraggedButton as HTMLElement).style.top = `${y-20}px`;//absolute position version
            // (currentDraggedColumn as HTMLElement).style.left = `${x-FeedState.dragColumnStartingX-FeedState.dragColumnClickXPos+scrollPos}px`;//will drag from clicked area
            (currentDraggedColumn as HTMLElement).style.left = `${x-FeedState.dragColumnStartingX-currentDraggedColumn.clientWidth/2+scrollPos}px`;//will drag from center of column
        },
        /**
         * Method used to open the {@link FeedOrderModal}
         * modal to update the position of the current `FeedColumn` in the
         * Feed list.
         */
        openFeedOrderModal(){
            if(this.feedData){
                UpdateSelectedFeed(this.feedData.description.feedId);
                AppState.showFeedOrderModal();
            }
        }
    },
    computed:{
        onMobileTouchscreen(){
            return isOnMobileTouchscreen();
        },
        showStandardPostLayout(){
            switch (this.feedData?.description.feedType) {
                case FeedEnums.Types.User:
                case FeedEnums.Types.Tag:
                case FeedEnums.Types.FeedGenerator:
                case FeedEnums.Types.Following:
                    return true;
                default:
                    return false;
            }
        },
        isFeedOwnerBlocked(){
            let authorPost:FeedViewPost|undefined;
            if(typeof this.feedData != 'undefined' && this.feedData.description.feedType == FeedEnums.Types.User){
                authorPost = this.feedData.data.find(x => (x as FeedViewPost).post.author.did == this.feedData?.description.feedSourceDID) as FeedViewPost;
            }
            return typeof authorPost != 'undefined' && typeof authorPost.post.author.viewer != 'undefined' && typeof authorPost.post.author.viewer.blocking != 'undefined';
        }
    },
    mounted(){
        this.isMounted = true;
        this.lastUpdate = new Date();
    },
    created() {
        /**Defines actions for the `toggleScrollToTop` function */
        this.toggleScrollToTop = debounce(e => {
            if((e.target as HTMLElement).scrollTop<8){
                this.isScrollToTopVisible = false;
            }
            else{
                this.isScrollToTopVisible = true;
            }
        },100);
        this.FeedDataType = this.feedData ? this.feedData.description.feedType : FeedEnums.Types.User;
        /**Mark correct FeedColumn width size button as selected */
        if(this.feedData) this.selectedWidthSetting = Object.keys(FeedEnums.Widths).indexOf(this.feedData.description.feedColumnSettings.width.toString());
    },
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

.feedpost-move,
.feedpost-enter-active,
.feedpost-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.feedpost-enter-from,
.feedpost-leave-to {
    opacity: 0;
    transform: translateY(20px);
}

.feedpost-leave-active {
    position: absolute;
}

.refresh-timeout{
    background-size: auto 56px;
    background-position: 0 -28px;
    background-repeat: no-repeat;
    animation: cooldown 3s ease 1;
    animation-fill-mode: forwards;
}

@keyframes cooldown {
    0% {
        background-position: 0 -28px;
    }
    100% {
        background-position: 0 28px;
    }
}

.drag-column-start {
	background-color: var(--color-btn-hover);
	opacity: 85%; /* faded */
    scale: 102%;
    /* transform: rotate(2deg); */
    cursor: grabbing;
}
</style>