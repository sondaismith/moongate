<template>
    <div data-testid="post-focus-modal-main" id="post-focus-modal-main" tabindex="0" @keydown.tab="(e) => TrapFocus($el,e,isImageFullscreen)" @scroll.passive="toggleScrollToTop"
    class="absolute z-20 h-full w-full flex flex-col sm:flex-row bg-slate-900/90 outline-none overflow-y-auto">
        {{ void "Fullscreen Image" }}
        <div ref="postfocusimagefullscreen" v-if="isImageFullscreen" @keydown.tab="(e) => TrapFocus(this.$refs.postfocusimagefullscreen,e)" tabindex="-1">
            <Transition>
                <FocusButton @click="hideImageFullscreen" @keydown.space="hideImageFullscreen" @keydown.enter="hideImageFullscreen"
                class="fixed flex h-full w-full text-primary items-center justify-center scroll-auto bg-black/95
                bg-contain bg-center bg-no-repeat z-30 border-none rounded-none active:bg-black/95 outline-offset-[-6px]"
                :style="{'background-image': 'url('+(fullscreenImage)+'s)'}">
                    <div v-if="!(fullscreenImage as AppBskyEmbedExternal.ViewExternal).uri" @click="(e)=>{e.stopPropagation()}" class="absolute text-black bottom-0 left-0 px-2 bg-white/50 z-10">
                        {{embedImageDimensions}}
                    </div>
                    <img @contextmenu="(e) => {e.preventDefault()}" :src="(fullscreenImage as AppBskyEmbedExternal.ViewExternal).uri ? (fullscreenImage as AppBskyEmbedExternal.ViewExternal).uri : (fullscreenImage as AppBskyEmbedImages.ViewImage).fullsize" class="max-h-full max-w-full"/>
                </FocusButton>
            </Transition>
        </div>
        {{ void "Sticky Control bar - mobile version" }}
        <div v-if="AppState.usingMobileLayout" class="sticky top-0 z-10 bg-postFocusBG border-b border-outline shadow-scroll-underline shadow-postFocusModalDetailsShadow/10
        flex items-center gap-2 px-2 py-1 text-primary">
            <div class="flex items-center gap-1">
                <SquareButton data-testid="postFocusModal-control-bar-back-button" @click="onReplyThreadBackButton()"
                class="text-primary shadow-none hover:bg-btnHover text-2xl" title="Back"
                button-padding-x="0" button-padding-y="0">
                    <i-mingcute:arrow-left-line/>
                </SquareButton>
                <div class="text-lg font-bold">Post</div>
            </div>
            <div v-if="postDetails.isAwaitingFocusData || isChangingThreadContext" class="animate-pulse h-4 w-full rounded-sm bg-slate-500/30"></div>
            <div v-else class="max-w-20s text-nowrap overflow-hidden text-ellipsis text-secondary text-sm select-none" :title="(postDetails.currentThreadView.post.record as AppBskyFeedPost.Record).text">{{ (postDetails.currentThreadView.post.record as AppBskyFeedPost.Record).text }}</div>
            <FocusButton @click="isScrollToTopVisible && scrollToTopOfModal()" class="flex rounded-lg cursor-pointer hover:bg-btnHover border border-outline items-center px-2 text-primary transition-opacity h-full ml-auto"
            :style="[isScrollToTopVisible ? {'opacity':'100%'} : {'opacity':'0%', 'cursor':'default'}]" title="Scroll to Top" :disabled="!isScrollToTopVisible"><i-mingcute:arrow-to-up-fill/></FocusButton>
            <FocusButton v-if="hasImageMedia" @click="showImageFullscreen(getEmbededImageViewImageObjects[currentMediaIndex])"
            class="flex rounded-lg cursor-pointer hover:bg-btnHover border border-outline items-center px-2 text-primary sm:hidden h-full" title="View Image"><i-mdi:insert-photo/></FocusButton>
            <FocusButton data-testid="postFocusModal-control-bar-close-button" class="flex rounded-lg cursor-pointer bg-btn hover:bg-btnHover border border-outline items-center px-2 text-primary h-full"
            title="Close Thread" @click="hideModal"><i-mingcute:exit-fill/></FocusButton>
        </div>
        {{ void "Media Section" }}
        <div v-if="hasImageMedia || hasEmbedGIFMedia || AppBskyEmbedVideo.isView(postDetails.currentThreadView.post.embed)"
        class="relative flex flex-col w-full sm:w-3/5 grow min-h-[30rem]">
            {{ void "Media Container" }}
            <div v-if="postDetails.isAwaitingFocusData" class="rounded-lg z-10 select-none mx-auto mt-5 animate-pulse bg-slate-500/20 h-10 w-10"></div>
            <div v-else-if="getEmbededImageObjects.images.length>1" class="rounded-lg z-10 select-none mx-auto mt-5 bg-slate-500/20 p-2 w-10">{{currentMediaIndex+1}}/{{ getEmbededImageObjects.images.length }}</div>
            <div data-testid="postFocusModal-media-container" class="flex items-center h-full w-full justify-center overflow-hidden p-5">
                <div v-if="postDetails.isAwaitingFocusData" class="h-full w-2/3">
                    <div class="h-full w-full rounded-sm border-0 bg-slate-500 animate-pulse mx-auto"></div>
                </div>
                <Swiper v-else-if="hasImageMedia && !postDetails.isAwaitingFocusData" :modules="modules" :slides-per-view="1" :space-between="40" :initial-slide="clickedMediaIndex"
                navigation :keyboard="{enabled:true}" @after-init="getSwiperRef" @active-index-change="updateCurrentMediaIndex"
                class="text-primary h-full w-full">
                    <SwiperSlide v-for="(image, index) in getEmbededImageObjects.images">
                        <ImageContainer @image-clicked="showImageFullscreen" :show-fullsize="true"
                        :post-text="(postDetails.currentThreadView.post.record as AppBskyFeedPost.Record).text"
                        :media-embed="{$type:'app.bsky.embed.images#view', images: [getEmbededImageObjects.images[index]]} as AppBskyEmbedImages.View"
                        :is-large-container-view="true" :images-to-display="image" :author="postDetails.currentThreadView.post.author.handle"
                        :post-id="getEndOfPostUri" :media-index="currentMediaIndex"/>
                    </SwiperSlide>
                </Swiper>
                <video-container v-else-if="AppBskyEmbedVideo.isView(postDetails.currentThreadView.post.embed) && !postDetails.isAwaitingFocusData"
                class="relative flex flex-col max-w-full h-full justify-center p-5"
                :style="{'aspect-ratio':`${postDetails.currentThreadView.post.embed.aspectRatio?.width}/${postDetails.currentThreadView.post.embed.aspectRatio?.height}`}"
                :video-view="postDetails.currentThreadView.post.embed">
                </video-container>
                <EmbedExternal v-else-if="hasEmbedGIFMedia" class="m-auto" :embed="getEmbedGIFMedia" :show-fullsize="true"
                :author="postDetails.currentThreadView.post.author.handle" :post-id="getEndOfPostUri"/>
            </div>
            <div v-if="postDetails.isAwaitingFocusData" class="flex rounded-lg mx-8 mb-8 p-2 h-16 animate-pulse text-sm bg-slate-500/30"></div>
            <div v-else-if="hasEmbededImagesWithAltText" class="flex rounded-lg mx-8 mb-8 p-2 text-sm bg-slate-500/20">
                <div class="flex min-[300px]:max-h-20 grow text-slate-100 overflow-auto">{{ getEmbededImageAltText }}</div>
            </div>
            <div v-else-if="hasEmbededVideoWithAltText" class="flex rounded-lg mx-8 mb-8 p-2 text-sm bg-slate-500/20">
                <div class="flex min-[300px]:max-h-20 grow text-slate-100 overflow-auto">{{ postDetails.currentThreadView.post.embed?.alt }}</div>
            </div>
            <div v-else class="h-10 w-full shrink-0"></div>
            {{ void "Post Details" }}
            <!-- <div class="flex space-x-2 mx-8 px-2 py-4 ">
                <div>Comments</div>
                <div>Likes</div>
                <div>Share</div>
            </div> -->
        </div>
        <div v-else @click="hideModal" class="w-full h-full hidden sm:block"></div>
        {{ void "Comments Section" }}
        <div data-testid="post-focus-modal-side" id="post-focus-modal-side" @scroll.passive="toggleScrollToTop" tabindex="-1"
        class="flex flex-col w-full sm:w-2/5 shrink-0 sm:max-w-96 bg-postFocusBG grow sm:ml-auto sm:overflow-y-auto">
            {{ void "Sticky Control bar" }}
            <div v-if="!AppState.usingMobileLayout" class="sticky top-0 z-10 bg-postFocusBG border-b border-outline shadow-scroll-underline shadow-postFocusModalDetailsShadow/10
            flex items-center gap-2 px-2 py-1 text-primary">
                <div class="flex items-center gap-1">
                    <SquareButton data-testid="postFocusModal-control-bar-back-button" @click="onReplyThreadBackButton()"
                    class="text-primary shadow-none hover:bg-btnHover text-2xl" title="Back"
                    button-padding-x="0" button-padding-y="0">
                        <i-mingcute:arrow-left-line/>
                    </SquareButton>
                    <div class="text-lg font-bold">Post</div>
                </div>
                <div v-if="postDetails.isAwaitingFocusData || isChangingThreadContext" class="animate-pulse h-4 w-full rounded-sm bg-slate-500/30"></div>
                <div v-else class="max-w-20s text-nowrap overflow-hidden text-ellipsis text-secondary text-sm select-none" :title="(postDetails.currentThreadView.post.record as AppBskyFeedPost.Record).text">{{ (postDetails.currentThreadView.post.record as AppBskyFeedPost.Record).text }}</div>
                <FocusButton @click="isScrollToTopVisible && scrollToTopOfModal()" class="flex rounded-lg cursor-pointer hover:bg-btnHover border border-outline items-center px-2 text-primary transition-opacity h-full ml-auto"
                :style="[isScrollToTopVisible ? {'opacity':'100%'} : {'opacity':'0%', 'cursor':'default'}]" title="Scroll to Top" :disabled="!isScrollToTopVisible"><i-mingcute:arrow-to-up-fill/></FocusButton>
                <FocusButton v-if="hasImageMedia" @click="showImageFullscreen(getEmbededImageViewImageObjects[currentMediaIndex])"
                class="flex rounded-lg cursor-pointer hover:bg-btnHover border border-outline items-center px-2 text-primary sm:hidden h-full" title="View Image"><i-mdi:insert-photo/></FocusButton>
                <FocusButton data-testid="postFocusModal-control-bar-close-button" class="flex rounded-lg cursor-pointer bg-btn hover:bg-btnHover border border-outline items-center px-2 text-primary h-full"
                title="Close Thread" @click="hideModal"><i-mingcute:exit-fill/></FocusButton>
            </div>
            {{ void "Focused Post Loading Placeholder/Skeleton" }}
            <div data-testid="postFocusModal-focus-post-loading" v-if="postDetails.isAwaitingFocusData || isChangingThreadContext" class="flex flex-col rounded bg-slate-400s p-4 pb-2 w-full">
                <div class="animate-pulse flex flex-col w-full overflow-hidden gap-1">
                    <div class="flex gap-2 mb-1">
                        <div class="drop-shadow-md">
                            <div class="rounded-full bg-slate-500/30 aspect-square size-10"></div>
                        </div>
                        <div class="flex flex-col gap-1 w-full">
                            <div class="h-4 w-24 rounded-sm bg-slate-500/30"></div>
                            <div class="h-3 w-full rounded-sm bg-slate-500/30"></div>
                        </div>
                        <div class="w-48 h-8 rounded-full bg-slate-500/30"></div>
                    </div>
                    <div class="h-4 w-full rounded-sm bg-slate-500/30"></div>
                    <div class="h-4 w-full rounded-sm bg-slate-500/30"></div>
                    <div class="h-4 w-4/5 rounded-sm bg-slate-500/30"></div>
                    <div class="h-3 max-w-40 mt-1 rounded-sm bg-slate-500/30"></div>
                    <div class="flex justify-between h-8 mt-1 w-full pt-2 border-t border-slate-500">
                        <div class="w-10 rounded-md bg-slate-500/30"></div>
                        <div class="w-10 rounded-md bg-slate-500/30"></div>
                        <div class="w-10 rounded-md bg-slate-500/30"></div>
                        <div class="w-10 rounded-md bg-slate-500/30"></div>
                        <div class="w-10 rounded-md bg-slate-500/30"></div>
                    </div>
                </div>
            </div>
            <div data-testid="postFocusModal-focus-post-loaded" v-else class="p-4 pb-1 top-10 sm:top-0 z-10s bg-postFocusBG border-b border-outline shadow-lg sm:shadow-none shadow-postFocusModalDetailsShadow/10">
                {{ void "User Info/Actions" }}
                <div class="flex gap-1">
                    <AvatarRound :author-details="postDetails.currentThreadView.post.author"/>
                    <div class="self-center overflow-hidden text-primary ml-1">
                        <div class="flex items-center gap-1">
                            <div data-testid="PostFocusModal-displayName"
                            class="font-bold leading-4 text-ellipsis text-nowrap overflow-hidden"
                            :title="postDetails.currentThreadView.post.author.displayName">
                                {{ postDetails.currentThreadView.post.author.displayName }}
                            </div>
                            <VerifiedBadge v-if="isUserVerified" class="size-4"/>
                        </div>
                        <div data-testid="PostFocusModal-handle" class="text-feedPostName text-ellipsis overflow-hidden">@{{ postDetails.currentThreadView.post.author.handle }}</div>
                    </div>
                    <div class="rounded-full self-center ml-auto
                    py-1 px-3 bg-slate-300 font-bold hover:bg-slate-200
                    text-slate-800 text-nowrap cursor-pointer">
                        + Follow
                    </div>
                </div>
                {{ void "Post Content - Text" }}
                <RichPostTextBsky data-testid="postFocusModal-text" class="text-sm pt-2 text-primary"
                :post-text="(postDetails.currentThreadView.post.record as AppBskyFeedPost.Record).text"
                :post-facets="(postDetails.currentThreadView.post.record as AppBskyFeedPost.Record).facets"
                :is-changing-thread-context="isChangingThreadContext"/>
                {{ void "Quoted Post (if applicable)" }}
                <div v-if="typeof postDetails.currentThreadView.post.embed != 'undefined'" class="py-2 text-sm">
                    <FocusFeedPost v-if="typeof postDetails.currentThreadView.post.embed != 'undefined' && AppBskyEmbedRecord.isView(postDetails.currentThreadView.post.embed)"
                    :post-data="postDetails.currentThreadView.post.embed.record" :hide-post-metrics="true"/>
                    <FocusFeedPost v-else-if="typeof postDetails.currentThreadView.post.embed != 'undefined' && AppBskyEmbedRecordWithMedia.isView(postDetails.currentThreadView.post.embed)"
                    :post-data="postDetails.currentThreadView.post.embed.record.record" :hide-post-metrics="true"/>
                </div>
                {{ void "Post Metadata" }}
                <div class="flex flex-col gap-2">
                    <div class="flex flex-wrap gap-1s leading-5 py-0.5 border-b-[1px] border-slate-600">
                        <div class="text-feedPostName bgs-lime-300 text-secondary cursor-pointer hover:underline mr-1">{{ convertToLongTimestamp(postDetails.currentThreadView.post.indexedAt) }}</div>
                        <div v-if="showThreadGateRules" class="flex bg-spink-300 items-center text-feedPostName text-secondary cursor-pointer hover:underline">
                            <i-mdi:accounts/>
                            <div>{{ postDetails.whoCanReply(postDetails.currentThreadView.post) }}</div>
                        </div>
                    </div>
                    <PostInteractionIcons :post-data="postDetails.currentThreadView.post"/>
                </div>
            </div>
            {{ void "post reply input" }}
            <div v-if="false" class="px-4 py-4"><PostReplyInput/></div>
            {{ void "Replies Loading Placeholder/Skeleton" }}
            <div v-if="postDetails.isAwaitingFocusData" class="flex flex-col rounded bg-slate-400s pt-4 px-4 w-full">
                <div class="animate-pulse flex w-full overflow-hidden gap-2">
                    <div class="rounded-full bg-slate-500/30 aspect-square size-10"></div>
                    <div class="flex flex-col gap-1 w-full">
                        <div class="flex gap-2 h-5 mb-1">
                            <div class="w-full rounded-sm bg-slate-500/30"></div>
                            <div class="h-4 w-full rounded-sm bg-slate-500/30"></div>
                            <div class="h-4 w-28 rounded-sm bg-slate-500/30"></div>
                        </div>
                        <div class="h-4 w-40 rounded-sm bg-slate-500/30"></div>
                        <div class="h-4 w-48 rounded-sm bg-slate-500/30"></div>
                        <div class="h-4 w-36 rounded-sm bg-slate-500/30"></div>
                        <div class="flex justify-between h-6 mt-2 w-full">
                            <div class="w-10 rounded-md bg-slate-500/30"></div>
                            <div class="w-10 rounded-md bg-slate-500/30"></div>
                            <div class="w-10 rounded-md bg-slate-500/30"></div>
                            <div class="w-10 rounded-md bg-slate-500/30"></div>
                            <div class="w-10 rounded-md bg-slate-500/30"></div>
                        </div>
                    </div>
                </div>
            </div>
            {{ void "Replies" }}
            <!-- <ReplyBreadcrumb class="px-4" :current-breadcrumb="currentBreadcrumb"/>
            <div v-if="threadNavIndex>0" class="flex px-4 text-primary items-center"
            @click="onReplyThreadBackButton">
                <div class="bg-btn px-1 rounded hover:bg-btnHover cursor-pointer">Back</div>
            </div> -->
            <PostThreadView v-if="!postDetails.isAwaitingFocusData" @update-thread-context="updateThreadContextFromPost"
            :is-changing-thread-context="isChangingThreadContext" :current-thread-view="postDetails.currentThreadView"/>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';
import { convertToLongTimestamp } from '../../helpers/converters';
import PostThreadView from './PostThreadView.vue';
import ReplyBreadcrumb from './ReplyBreadcrumb.vue';
import AvatarRound from '../Utilities/AvatarRound.vue';
import { AppBskyEmbedVideo } from '@atproto/api';
import VideoContainer from '../Utilities/VideoContainer.vue';
import { AppState, toast, TrapFocus } from '../../state/AppState.vue';
import { AppBskyEmbedExternal, AppBskyEmbedImages, AppBskyEmbedRecord, AppBskyEmbedRecordWithMedia, AppBskyFeedPost } from '@atproto/api';
import EmbedExternal from '../Utilities/EmbedExternal.vue';
import VerifiedBadge from '../Utilities/VerifiedBadge.vue';
import PostInteractionIcons from './PostInteractionIcons.vue';
import { emptyPostThread } from '../../fake-data/dumPostData';
import { AppBskyFeedDefs } from '@atproto/api';
import { getPostThread } from '../../lib/api/Post.vue';
import { HandleAPIError } from '../../helpers/errors';
import ImageContainer from '../Utilities/ImageContainer.vue';
import SlideshowArrow from '../Utilities/SlideshowArrow.vue';
import SquareButton from '../Utilities/SquareButton.vue';
import RichPostTextBsky from '../Utilities/RichPostTextBsky.vue';
import { debounce } from '../../helpers/debouncer';
import { PostThreadBranchData } from '../../types/PostTypes';
import { router } from '../../main';
import { RouteLocationNormalizedLoadedGeneric } from 'vue-router';
import FocusFeedPost from '../Feed/FocusFeedPost.vue';
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Keyboard, Pagination } from 'swiper/modules'
import { Swiper as SwiperClass } from 'swiper/types'
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/keyboard';
import 'swiper/css/pagination'
import FocusButton from '../Utilities/FocusButton.vue';

export default defineComponent({
    components:{
        AvatarRound,
        RichPostTextBsky,
        PostInteractionIcons,
        PostThreadView,
        ReplyBreadcrumb,
        ImageContainer,
        VideoContainer,
        EmbedExternal,
        SlideshowArrow,
        VerifiedBadge,
        SquareButton,
        FocusFeedPost,
        Swiper,
        SwiperSlide,
        FocusButton
    },
    props:{
        // /**
        //  * Initial Post Thread to show in modal.
        //  */
        // postThreadToShow:{
        //     type: Object as PropType<ThreadViewPost>,
        //     required: true
        // },
        /**
         * DID that points to the initial Post Thread to show in modal.
         */
        postDid:{
            type: String,
            default:''
        },
        /**
         * Index of initial media to show in modal.
         */
        clickedMediaIndex:{
            type: Number,
            default: 0
        },
        /**The handle of the creator of the Post to show. */
        handle:{
            type:String,
        },

    },
    data(){
        return{
            AppState,
            AppBskyEmbedRecord,
            AppBskyEmbedImages,
            AppBskyEmbedVideo,
            TrapFocus,
            swiper: {} as SwiperClass,
            modules:[Navigation, Keyboard, Pagination],
            imageCollection: [],
            postDetails,
            convertToLongTimestamp,
            /**Used to determine which media item to display. */
            AppBskyEmbedRecordWithMedia,
            /**Index of media in Post's collection that is currently being displayed. */
            currentMediaIndex: 0,
            /**
             * Holds details of the "Thread" of the initial Post that was opened up in the Focus modal.
             * Should not be modified once set except to be cleared.
             */
            postThread : emptyPostThread,
            /**
             * UNUSED - Holds record of how/where the User has navigated down
             * the Post reply tree. The 1st element will always be a
             * reference to the root Post.
             */
            threadNavHistory: [emptyPostThread] as AppBskyFeedDefs.ThreadViewPost[],
            /**
             * Holds record of how/where the User has navigated down
             * the Post reply tree. Reords the branch "state" as well
             * (number of replies shown and scroll position). The 1st
             * element will always be a reference to the root Post.
             */
            threadBranchHistory:[] as PostThreadBranchData[],
            /**
             * Determines the currently displayed post from the thread in `PostFocusModal` when
             * used with `postDetails.threadNavHistory[]`. If the value is 0 it will show the
             * root Post.
             */
            threadNavIndex: 0,
            /**Used to cause the Replies displayed in `PostThreadView` to update when the context changes. */
            isChangingThreadContext:false,
            currentBreadcrumb : [{userName:"Origin",postCID:"this_cid_is_unset"}],
            /**Is a Post image currently being shown at fullscreen size? */
            isImageFullscreen: false,
            /**Object representing image to display at fullscreen size. */
            fullscreenImage : {} as AppBskyEmbedImages.ViewImage|AppBskyEmbedExternal.ViewExternal,
            /**Is the "scroll to top" button currently visible? */
            isScrollToTopVisible:false,
            /**Record of the last valid Post DID used. Used to prevent reload when `CreatePost`
             * or `Login` modal are closed after opening on top of `PostFocusModal`. */
            lastPostDid:'',
            /**Record of the route the User was using before opening this modal. Navigated back to when
             * the modal is closed. */
            routeEntryPoint:'/',
            /**The `data-testid` selector for the reply container used when using the Desktop layout. */
            replyContainerElementDesktop:'[data-testid=post-focus-modal-side]',
            /**The `data-testid` selector for the reply container used when using the Mobile layout. */
            replyContainerElementMobile:'[data-testid=post-focus-modal-main]'
        }
    },
    methods:{
        increaseCurrentMediaIndex(){
            if(this.currentMediaIndex+1 < this.getEmbededImageObjects.images.length)
                // postDetails.setClickedMediaIndex(postDetails.getClickedMediaIndex()+1);
                // this.currentMediaIndex = this.currentMediaIndex+1;
                this.$router.push(`/profile/${postDetails.currentThreadView.post.author.handle}/post/${postDetails.currentThreadView.post.uri.split('/').pop()}/${this.currentMediaIndex+1}`);
        },
        decreaseCurrentMediaIndex(){
            if(this.currentMediaIndex-1 >= 0)
                // postDetails.setClickedMediaIndex(postDetails.getClickedMediaIndex()-1);
                // this.currentMediaIndex = this.currentMediaIndex-1;
                this.$router.push(`/profile/${postDetails.currentThreadView.post.author.handle}/post/${postDetails.currentThreadView.post.uri.split('/').pop()}/${this.currentMediaIndex-1}`);

        },
        showImageFullscreen(image:AppBskyEmbedImages.ViewImage|AppBskyEmbedExternal.ViewExternal){
            this.fullscreenImage = image;
            this.isImageFullscreen = true;
            this.$el.focus();//allows next tab to select the fullscreen image, allowing for a quick close
            this.swiper.keyboard.disable();
        },
        hideImageFullscreen(){
            this.isImageFullscreen = false;
            this.fullscreenImage = {} as AppBskyEmbedImages.ViewImage|AppBskyEmbedExternal.ViewExternal;
            this.swiper.keyboard.enable();
        },
        hideModal(){
            this.$router.push(this.routeEntryPoint);
            this.threadNavIndex = 0; //Clear thread navigation history
            this.threadNavHistory = [emptyPostThread];
        },
        /**
         * Method used to navigate through images held in the modal, using
         * the Left Arrow or Right Arrow keys, and the modal navigation history
         * if the shortcut Alt + Left Arrow or Alt + Right Arrow is pressed.
         * @param e Key down event.
         */
        onKeyboardShorcutEntered(e:KeyboardEvent){
            if(e.key == 'ArrowLeft' && !e.altKey && !e.repeat){
                this.decreaseCurrentMediaIndex();
            }
            else if(e.key == 'ArrowRight' && !e.altKey && !e.repeat){
                this.increaseCurrentMediaIndex();
            }
            // else if(!e.repeat) console.log('Other key pressed: '+e.key);
        },
        /**
         * Method used to close the `PostFocusModal` if the Escape Key is pressed.
         * @param e Key down event.
         */
        onEscapeKeyPressed(e:KeyboardEvent){
            if(e.key == 'Escape'){
                this.hideModal();
            }
        },
        /**
         * Method used to retrieve the Post/Post thread data via the Bluesky
         * API.
         * NOTE: Only used when modal is first used. To change the Post Thread
         * context in other situations use {@link updateThreadContextFromPost}.
         */
        async getThreadData(){
            postDetails.isAwaitingFocusData = true;
            await getPostThread(this.postUri)
            .then(res => {
                this.postThread = res.data.thread as AppBskyFeedDefs.ThreadViewPost;
                // postDetails.currentThreadView = postDetails.threadNavHistory[0] = postDetails.postThread;
                //Take Post Thread prop and update relevant variables
                postDetails.currentThreadView = this.threadNavHistory[0] = this.postThread;
                if(!Number.isNaN(this.clickedMediaIndex))
                    this.currentMediaIndex = this.clickedMediaIndex; //Set initial media item to show
                else this.currentMediaIndex = 0;
                console.log(this.clickedMediaIndex);
            })
            .catch(err => {
                // toast.add(HandleAPIError(err, 'Error getting Post thread for focus modal'))
                console.log('PostFocusModal - error getting Post Thread data')
                console.log(err)
                postDetails.currentThreadView = this.threadNavHistory[0] = emptyPostThread;
            })
            .finally(()=>{
                postDetails.isAwaitingFocusData = false;
                setTimeout(() => {
                    //Restore scroll position
                    let replyContainer = document.querySelector(this.replyContainerSelector);
                    if(replyContainer != null){
                        replyContainer.scrollTop = this.threadBranchHistory[this.threadNavIndex].scrollPos;
                    }
                    (this.$el as HTMLElement).focus();
                }, 1);
                document.title = this.getFocusPostTitle;
                console.log('PostFocusModal - getThreadData "finally" handler has run')
            });
        },
        setCurrentThreadView(cid: string) {
            var result = this.findThreadView(cid,this.postThread);

            if(result){
                postDetails.currentThreadView = result;
            }
            else{
                //go back to Post origin ThreadView
                console.log('Finding Post ThreadView failed :(');
                postDetails.currentThreadView = this.postThread;
            }
            this.updateCurrentBreadcrumbs();
        },
        /**Increases the `threadNavIndex` by 1. Navigates to new Post/Reply context.*/
        increaseThreadNavIndex(mediaIndex:number=0){
            if(this.threadNavIndex+1 < this.threadNavHistory.length){
                this.isChangingThreadContext = true;
                this.threadNavIndex++;
                // this.clickedMediaIndex = mediaIndex;
                this.currentMediaIndex = mediaIndex;
                postDetails.currentThreadView = this.threadNavHistory[this.threadNavIndex];
                setTimeout(() => {
                    this.isChangingThreadContext = false;
                }, 1);
            }
        },
        /**Decreases the `threadNavIndex` by 1. Navigates to previously viewed Post/Reply context.*/
        decreaseThreadNavIndex(){
            if(this.threadNavIndex-1 >= 0){
                this.isChangingThreadContext = true;
                this.threadNavIndex--;
                // this.clickedMediaIndex = 0; //prevents accessing element that does not exist
                this.currentMediaIndex = 0; //prevents accessing element that does not exist
                postDetails.currentThreadView = this.threadNavHistory[this.threadNavIndex];
                setTimeout(() => {
                    this.isChangingThreadContext = false;
                }, 300);//timeout used to refresh `RichPostTextBsky` component with updated content
            }
        },
        /**Method used to programmatically navigate back through web history. */
        onReplyThreadBackButton(){
            router.back();
        },
        /**
         * Method that changes the thread "context" - updates the main post displayed in
         * the `PostFocusModal` component.
         * Updates the navigation history list (`threadNavHistory`).
         * @param threadPost Post/reply to display in `PostFocusModal`.
         */
        setThreadContext(threadPost:AppBskyFeedDefs.ThreadViewPost|undefined, mediaIndex:number=0){
            if(threadPost){
                //If at latest/end of threadNavHistory
                if(this.threadNavIndex+1 == this.threadNavHistory.length){
                    this.threadNavHistory.push(threadPost);
                }
                else{
                    this.threadNavHistory = this.threadNavHistory.slice(0,this.threadNavIndex+1);
                    this.threadNavHistory.push(threadPost);
                }
                this.increaseThreadNavIndex(mediaIndex);
            }
        },
        /**
         * Updates the Posts/Replies displayed in the PostFocusModal component.
         * Triggered by an emitted message coming from a child `FocusFeedPost`
         * timestamp being clicked.
         * @param newThreadContext The new Post Thread context to display.
         * @param mediaIndex The Index of the media in the Post's collection to display.
         */
        async updateThreadContextFromPost(newThreadContext:AppBskyFeedDefs.ThreadViewPost|undefined,mediaIndex:number){
            if(typeof newThreadContext != 'undefined'){
                // postDetails.isAwaitingFocusData = true;
                // // await getPostThread(newThreadContext.post.uri)
                // await getPostThread(this.createThreadPostUri(newThreadContext))
                // .then(res => {
                //     this.setThreadContext(res.data.thread as ThreadViewPost);
                //     this.currentMediaIndex = mediaIndex;
                // })
                // .catch(err => toast.add(HandleAPIError(err, 'Error getting reply')))
                // .finally(() => postDetails.isAwaitingFocusData = false);
                console.log(mediaIndex);
                this.$router.push(`/profile/${newThreadContext.post.author.handle}/post/${newThreadContext.post.uri.split('/').pop()}`);
                this.currentMediaIndex = mediaIndex;
            }
        },
        /**
         * Method used to create a "post URI" for the current thread context.
         * Returns URI in the format of `at://[handle]/app.bsky.feed.post/[post DID]`.
         * @param thread The `ThreadViewPost` thread context to create the URI for.
         */
        createThreadPostUri(thread:AppBskyFeedDefs.ThreadViewPost){
            let postDid = thread.post.uri.split('/').pop();
            return `at://${thread.post.author.handle}/app.bsky.feed.post/${postDid}`;
        },
        /**
         * Method that resets the current ThreadView back to the Post
         * origin.
         */
        returnToThreadOrigin() {
            postDetails.currentThreadView = this.postThread;
            this.updateCurrentBreadcrumbs();
        },
        /**
         * Method that updates currently displayed reply breadcrumb labels.
         * Should be called any time the currentThreadView is changed.
         */
        updateCurrentBreadcrumbs(){
            //If there the reply object containing the parent ref does not exist
            if(!postDetails.currentThreadView.post.record.reply){
                this.currentBreadcrumb.splice(0, this.currentBreadcrumb.length, ...[{userName:"Origin",postCID:"root"}]);
            }
            else{
                //reset breadcrumbs
                this.currentBreadcrumb.splice(0, this.currentBreadcrumb.length, ...[]);
                this.discoverBreadcrumbs(postDetails.currentThreadView.post.cid, postDetails.currentThreadView);
                //add origin "home button" to start of breadcrumbs
                this.currentBreadcrumb.unshift({userName:"Origin",postCID:"this_cid_is_unset"});
            }
        },

        /**
         * Method that is used to return a Post thread matching a specific cid. Used
         * by PostFocusModal component.
         * @param cid The unique cid value of the ThreadViewPost object we're trying to find.
         * @param repliesArray The ThreadViewPost object representing the Post "thread" we will search.
         */
        findThreadView(cid:string, repliesArray:AppBskyFeedDefs.ThreadViewPost):AppBskyFeedDefs.ThreadViewPost|undefined {
            var result;
            //Check if current ThreadViewPost is the one we're looking for
            if(repliesArray.post.cid === cid) result = repliesArray;
            //If match found, skip replies check...
            if(result == undefined){
                //otherwise...
                //If match is not found, check if it has replies that can be searched
                if(Array.isArray(repliesArray.replies) && repliesArray.replies.length > 0){
                    //replies is NOT empty - time to check each object in the array
                    for (let i = 0; i < repliesArray.replies.length; i++) {
                        result = this.findThreadView(cid, repliesArray.replies[i])
                        //If a result has been returned, stop the for loops
                        if(result != undefined){
                            i = repliesArray.replies.length;
                        }
                    }
                }
            }
            //Return final result
            return result;
        },
        /**
         * Method used to generate the "breadcrumb" labels used to illustrate the current "reply tree"
         * location relative to the originally loaded ThreadViewPost object.
         * @param parentCID The unique cid value of the "Parent" ThreadViewPost object we're trying to find.
         * @param currentPostThread The ThreadViewPost object representing the Post "thread" who's parent we are looking for.
         */
        discoverBreadcrumbs(parentCID:string, currentPostThread:AppBskyFeedDefs.ThreadViewPost){
            var result;
            //get the parent element
            var parentThread = this.findThreadView(parentCID, this.postThread);
            //If this has a reply object we have not gotten to the top level ThreadViewPost
            if(parentThread && parentThread.post.record.reply){
                result = parentThread.post.author.displayName;
                this.currentBreadcrumb.unshift({userName:parentThread.post.author.displayName, postCID:parentThread?.post.cid});
                this.discoverBreadcrumbs(parentThread?.post.record.reply.parent.cid,parentThread);
            }
        },
        /**
         * Method used to scroll to top of `PostFocusModal`.
         */
        scrollToTopOfModal(){
            let scrollElement = this.replyContainerElementDesktop;
            if(AppState.usingMobileLayout) scrollElement = this.replyContainerElementMobile;
            scrollElement = scrollElement.split('=')[1].split(']')[0];
            let mainContainer = document.getElementById(scrollElement);
            if(mainContainer) mainContainer.scrollBy({top:-mainContainer.scrollTop,behavior:'smooth'});
        },
        /**
         * Method used to scroll back to the top of a Feed list. Defined in the
         * "created()" section.
         */
        toggleScrollToTop(e:Event){},
        /**
         * Method used to save the "reply container" scroll position as well as update
         * the "reply thread branch history" when navigating between "reply threads".
         * Should only be called in `beforeRouteUpdate()` and `beforeRouteEnter()`
         * Navigation Guards.
         * @param to "to" variable provided by Navigation Guard used to call this method.
         * @param from "from" variable provided by Navigation Guard used to call this method.
         * @param fromScrollPos Current scroll position of the `PostFocusModal` "reply container".
         */
        manageReplyContainerState(to:RouteLocationNormalizedLoadedGeneric,from:RouteLocationNormalizedLoadedGeneric, fromScrollPos:number){
            // let replyContainer = document.querySelector(this.replyContainerElement);
            // let scrollPos = replyContainer != null ? replyContainer.scrollTop : 'error finding postThreadView element';
            // console.log(`Scroll position of previous reply container div was: ${scrollPos}px.`);
            //save current "reply area" scroll position before navigating to new view
            // this.threadBranchHistory[this.threadNavIndex] = {...this.threadBranchHistory[this.threadNavIndex], route:from.path, scrollPos:replyContainer != null ? replyContainer.scrollTop : 0};
            this.threadBranchHistory[this.threadNavIndex] = {...this.threadBranchHistory[this.threadNavIndex], route:from.path, scrollPos:fromScrollPos};
            //figure out if we are navigating forward to a new `threadBranchHistory` entry or back to an old one
            if(AppState.routeNavigationInfo && AppState.routeNavigationInfo.direction === 'back'){
                if(this.threadNavIndex-1 >= 0) this.threadNavIndex--;
                else{//if User navigates back to/through PostFocusModal using browser history and not timestamp buttons - mainly to keep route value synced
                    this.threadBranchHistory[this.threadNavIndex] = {...this.threadBranchHistory[this.threadNavIndex], route:to.path, scrollPos:0};
                }
                console.log('back button pressed');
            }
            else if(AppState.routeNavigationInfo && AppState.routeNavigationInfo.direction === 'forward'){
                if(this.threadNavIndex+1 < this.threadBranchHistory.length) this.threadNavIndex++;
                else{//if User navigates forward through PostFocusModal using browser history and not timestamp buttons - mainly to keep route value synced
                    this.threadBranchHistory[this.threadNavIndex] = {...this.threadBranchHistory[this.threadNavIndex], route:to.path, scrollPos:0};
                }
                console.log('forward button pressed');
            }
            else{
                if(this.threadNavIndex == this.threadBranchHistory.length-1){//at end of array, can add new records as normal
                    this.threadBranchHistory.push({cursor:10,route:to.path,scrollPos:0});
                }
                else{
                    this.threadBranchHistory = this.threadBranchHistory.slice(0,this.threadNavIndex+1);//drop records after current index, then add new record
                    this.threadBranchHistory.push({cursor:10,route:to.path,scrollPos:0});
                }
                this.threadNavIndex++;
            }
            AppState.routeNavigationInfo = null;
        },
        /**
         * Creates a reference to the Swiper element so that we can do things to it
         * (like disabling it when the "fullscreen" image).
         * @param swiper Swiper object retrieved via `after-init` event.
         */
        getSwiperRef(swiper:SwiperClass){
            this.swiper = swiper;
        },
        /**
         * Updates the `currentMediaIndex` when the active index of the `Swiper` component
         * in `PostFocusModal` changes.
         * @param swiper Swiper object retrieved via `active-index-change` event.
         */
        updateCurrentMediaIndex(swiper:SwiperClass){
            this.currentMediaIndex = swiper.activeIndex;
        }
    },
    computed:{
        /**Checks to see if the current post contains any image media. */
        hasImageMedia(){
            //Image Post
            if((postDetails.currentThreadView.post.embed &&
            AppBskyEmbedImages.isView(postDetails.currentThreadView.post.embed)))
                return true;
            //Image Post w/ QRT
            if(AppBskyEmbedRecordWithMedia.isView(postDetails.currentThreadView.post.embed) &&
            AppBskyEmbedImages.isView(postDetails.currentThreadView.post.embed.media))
                return true;
            return false;
        },
        /**Checks to see if the current post contains an embeded GIF. */
        hasEmbedGIFMedia(){
            //GIF Post
            if((postDetails.currentThreadView.post.embed &&
            postDetails.currentThreadView.post.embed.media &&
            AppBskyEmbedExternal.isView(postDetails.currentThreadView.post.embed.media)))
                return true;
            //GIF Post in QRT
            if((postDetails.currentThreadView.post.embed &&
            postDetails.currentThreadView.post.embed.external &&
            AppBskyEmbedExternal.isView(postDetails.currentThreadView.post.embed)))
                return true;
            return false;
        },
        /**Checks to see if the current post contains any media (Image, GIF or Video). */
        hasAnyMedia(){
            if(this.hasImageMedia || this.hasEmbedGIFMedia || AppBskyEmbedVideo.isView(postDetails.currentThreadView.post.embed))
                return true;
            return false;
        },
        /**
         * Checks to see if the current post contains any images, and if
         * the first one has any descriptive ALT text.
         */
        hasEmbededImagesWithAltText(){
            //Image Post
            if(typeof postDetails.currentThreadView.post.embed != 'undefined' &&
            typeof postDetails.currentThreadView.post.embed.images != 'undefined' &&
            (postDetails.currentThreadView.post.embed.images as AppBskyEmbedImages.ViewImage[]).length > 0 &&
            (postDetails.currentThreadView.post.embed.images as AppBskyEmbedImages.ViewImage[])[this.currentMediaIndex].alt.trim() != '')
                return true;
            //Image Post w/ QRT
            else if(typeof postDetails.currentThreadView.post.embed != 'undefined' &&
            AppBskyEmbedRecordWithMedia.isView(postDetails.currentThreadView.post.embed) &&
            typeof postDetails.currentThreadView.post.embed.media.images != 'undefined' &&
            (postDetails.currentThreadView.post.embed.media.images as AppBskyEmbedImages.ViewImage[]).length > 0 &&
            (postDetails.currentThreadView.post.embed.media.images as AppBskyEmbedImages.ViewImage[])[0].alt.trim() != '')
                return true;
            return false;
        },
        /**
         * Checks to see if the current post contains a video, and if
         * it has any descriptive ALT text.
         */
        hasEmbededVideoWithAltText(){
            if(postDetails.currentThreadView.post.embed &&
            AppBskyEmbedVideo.isView(postDetails.currentThreadView.post.embed) &&
            (postDetails.currentThreadView.post.embed as AppBskyEmbedVideo.View).alt &&
            (postDetails.currentThreadView.post.embed as AppBskyEmbedVideo.View).alt?.trim() != '') return true;
            return false;
        },
        /**
         * Method that returns the ALT text attached to an image. This is a helper method that
         * simplifies the proceess of locating the ALT text data based on the type of the Post
         * object.
         */
        getEmbededImageAltText():string{
            if(postDetails.currentThreadView.post.embed &&
            postDetails.currentThreadView.post.embed.images)
                return (postDetails.currentThreadView.post.embed.images as AppBskyEmbedImages.ViewImage[])[this.currentMediaIndex].alt;
            else if(postDetails.currentThreadView.post.embed &&
            AppBskyEmbedRecordWithMedia.isView(postDetails.currentThreadView.post.embed) &&
            (postDetails.currentThreadView.post.embed.media.images as AppBskyEmbedImages.ViewImage[]).length > 0)
                return (postDetails.currentThreadView.post.embed.media.images as AppBskyEmbedImages.ViewImage[])[this.currentMediaIndex].alt;
            return '';
        },
        /**
         * Method used to return the Embed View (AppBskyEmbedImages.View) held by the currently
         * selected Post. Resolves the location of the data based on the type of
         * the Post object.
         */
        getEmbededImageObjects():AppBskyEmbedImages.View{
            if(postDetails.currentThreadView.post.embed &&
            AppBskyEmbedImages.isView(postDetails.currentThreadView.post.embed))
                return postDetails.currentThreadView.post.embed;
            else if(postDetails.currentThreadView.post.embed &&
            AppBskyEmbedRecordWithMedia.isView(postDetails.currentThreadView.post.embed) &&
            AppBskyEmbedImages.isView(postDetails.currentThreadView.post.embed.media) &&
            postDetails.currentThreadView.post.embed.media.images.length>0)
                return postDetails.currentThreadView.post.embed.media;
            return {images:[]};
        },
        getCurrentImageToDisplay(){
            return {$type:'app.bsky.embed.images#view', images: [this.getEmbededImageObjects.images[this.currentMediaIndex]]} as AppBskyEmbedImages.View;
        },
        /**
         * Method used to return the image collection held by the currently
         * selected Post. Resolves the location of the data based on the type of
         * the Post object.
         */
        getEmbededImageViewImageObjects():AppBskyEmbedImages.ViewImage[]{
            if(postDetails.currentThreadView.post.embed &&
            postDetails.currentThreadView.post.embed.images)
                return (postDetails.currentThreadView.post.embed.images as AppBskyEmbedImages.ViewImage[]);
            else if(postDetails.currentThreadView.post.embed &&
            AppBskyEmbedRecordWithMedia.isView(postDetails.currentThreadView.post.embed) &&
            postDetails.currentThreadView.post.embed.media.images &&
            (postDetails.currentThreadView.post.embed.media.images as AppBskyEmbedImages.ViewImage[]).length > 0)
                return (postDetails.currentThreadView.post.embed.media.images as AppBskyEmbedImages.ViewImage[]);
            return [];
        },
        /**
         * Method that returns the GIF EmbedExternal object. This is a helper method that
         * simplifies the proceess of locating the embed data based on the type of the Post
         * object.
         */
        getEmbedGIFMedia():AppBskyEmbedExternal.View|undefined{
            //GIF Post
            if(postDetails.currentThreadView.post.embed &&
            postDetails.currentThreadView.post.embed.media &&
            AppBskyEmbedExternal.isView(postDetails.currentThreadView.post.embed.media
            ))
                return postDetails.currentThreadView.post.embed.media
            //GIF Post in QRT
            if((postDetails.currentThreadView.post.embed &&
            postDetails.currentThreadView.post.embed.external &&
            AppBskyEmbedExternal.isView(postDetails.currentThreadView.post.embed)))
                return postDetails.currentThreadView.post.embed;
        },
        /**
         * Returns string detailing the embeded image's dimensions, if available.
         */
        embedImageDimensions(){
            let text = 'Image Dimensions N/A';
            if("aspectRatio" in this.fullscreenImage && typeof this.fullscreenImage.aspectRatio != 'undefined')
                text = `${this.fullscreenImage.aspectRatio.width}x${this.fullscreenImage.aspectRatio.height}px`;
            return text;
        },
        /**Returns the last bit of ID information held at the end of the URI that points to
         * the currently displayed Post. */
        getEndOfPostUri():string{
            let postId = postDetails.currentThreadView.post.uri.split('/').pop();
            return typeof postId != 'undefined' ? postId : '';
        },
        /**Determines if the current media index can be decreased.*/
        canDecreaseMediaIndex(){
            let currentImages = this.getEmbededImageObjects.images;
            if(currentImages.length>0){
                if(this.currentMediaIndex != 0 &&
                this.currentMediaIndex>=0)
                    return true;
            }
            return false;
        },
        /**Determines if the current media index can be increased.*/
        canIncreaseMediaIndex(){
            let currentImages = this.getEmbededImageObjects.images;
            if(currentImages.length>0){
                if(this.currentMediaIndex+1 < currentImages.length &&
                this.currentMediaIndex>=0)
                    return true;
            }
            return false;
        },
        /**
         * Method used to see if the User of the focused Post is verified.
         */
        isUserVerified(){
            let profile = postDetails.currentThreadView.post.author;
            if(profile != undefined && profile.verification && profile.verification.verifiedStatus == 'valid')
                return true;
            return false;
        },
        /**Determines if the label displaying the thread/post gate rules applied to the current Post should be displayed. */
        showThreadGateRules():boolean{
            //if NOT (viewing a reply while not logged in)
            return !(typeof postDetails.currentThreadView.parent != 'undefined' && !AppState.isAuthBrowsing);
        },
        postUri(){
            return `at://${this.handle}/app.bsky.feed.post/${this.postDid}`;
        },
        /**Returns formatted title for Post currently being viewed on PostFocusModal. */
        getFocusPostTitle(){
            let postTextClip = ''
            if(!postDetails.isAwaitingFocusData && AppBskyFeedPost.isMain(postDetails.currentThreadView.post.record)){
                let fullText = (postDetails.currentThreadView.post.record as AppBskyFeedPost.Main).text
                let sliceLength = 21;
                if(fullText.length<sliceLength) sliceLength = fullText.length
                postTextClip =  fullText.slice(0,sliceLength-1);
            }
            let userId = (typeof postDetails.currentThreadView.post.author.displayName != 'undefined') ? postDetails.currentThreadView.post.author.displayName : postDetails.currentThreadView.post.author.handle;
            return postTextClip.trim() != '' ? `${postTextClip}... by ${userId} | moongate` : `${userId}'s Post | moongate`;
        },
        /**
         * Computed variable that returns the CSS selector value that points to the currently
         * used container for replies based on if the application is displaying in "mobile"
         * mode or not.
         */
        replyContainerSelector(){
            if(!AppState.usingMobileLayout) return this.replyContainerElementDesktop;
            else return this.replyContainerElementMobile;
        }
    },
    watch:{
        /**Updates thread context when Post DID changes (new post in thread is navigated to). */
        postDid(newDid:string,oldDid:string){
            if(typeof newDid != 'undefined' && newDid.trim() != '' && newDid != oldDid && newDid != this.lastPostDid){
                this.lastPostDid = newDid;
                this.getThreadData();
            }
        },
        /**Updates the displayed post image when media index in route changes. */
        clickedMediaIndex(newIndex:number,oldIndex:number){
            if(typeof newIndex != 'undefined' && newIndex != oldIndex && !this.$router.currentRoute.value.path.includes('/download')){
                this.currentMediaIndex = newIndex;
                document.title = this.getFocusPostTitle;
            }
        }
    },
    beforeRouteEnter(to, from, next){
        if(from.name == 'saving media'){//restore page title after navigating back from `SaveMediaModal`
            next(vm => {
                document.title = vm.getFocusPostTitle;
            })
        }
        else if((from.name == 'postfocusmodal' && to.name == 'postfocusmodal with mediaindex') || (from.name == 'postfocusmodal with mediaindex' && to.name == 'postfocusmodal')){
            //computed value `replyContainerSelector` is only available after navigation has happened (via `vm`) - have to use these hard-coded values
            let replyContainer = document.querySelector(AppState.usingMobileLayout ? '[data-testid=post-focus-modal-main]' : '[data-testid=post-focus-modal-side]');
            let fromScrollPos = replyContainer != null ? replyContainer.scrollTop : 0;
            next(vm => {
                vm.manageReplyContainerState(to,from,fromScrollPos);
            })
        }
        else{
            AppState.routeNavigationInfo = null;
            next();
        }
    },
    beforeRouteUpdate(to,from){
        let replyContainer = document.querySelector(this.replyContainerSelector);
        let fromScrollPos = replyContainer != null ? replyContainer.scrollTop : 0;
        this.manageReplyContainerState(to,from,fromScrollPos);
        if(this.isImageFullscreen){//if fullscreen view is open, do not navigate - just close the fullscreen view
            this.hideImageFullscreen();
            return false;
        }
    },
    beforeRouteLeave(){
        if(this.isImageFullscreen){//if fullscreen view is open, do not navigate - just close the fullscreen view
            this.hideImageFullscreen();
            return false;
        }
    },
    async created(){
        /**Defines actions for the `toggleScrollToTop` function */
        this.toggleScrollToTop = debounce(e => {
            if((e.target as HTMLElement).scrollTop<20){
                this.isScrollToTopVisible = false;
            }
            else{
                this.isScrollToTopVisible = true;
            }
        },200);
        this.lastPostDid = this.postDid;
        if(window.history.state.back != null && !(window.history.state.back as String).includes('/post')) this.routeEntryPoint = window.history.state.back;
        else if(window.history.state.forward != null && !(window.history.state.forward as String).includes('/post')) this.routeEntryPoint = window.history.state.forward;
        this.threadBranchHistory = [{cursor:10,route:router.currentRoute.value.path,scrollPos:0}];//Set up "reply branch history" for Post thread
        console.log(this.handle);
        console.log(this.postDid);
        console.log('PostFocusModal created() running');
        //track when user navigates through browser history
        if(!AppState.hasRouteNavigationListenerBeenAdded){
            AppState.hasRouteNavigationListenerBeenAdded = true;
            router.options.history.listen((to, from, info) => {
                AppState.routeNavigationInfo = info;
            });
        }
        await this.getThreadData();
    },
    mounted(){
        //Add keyboard+mouse shortcut listener
        // this.$el.addEventListener('keydown', this.onKeyboardShorcutEntered);
        this.$el.addEventListener('keydown', this.onEscapeKeyPressed);
        (this.$el as HTMLElement).focus();
        document.title = `Loading Post data... | moongate`;
    },
    beforeUnmount() {
        console.log('Closing PostFocusModal...');
        //Remove keyboard+mouse shortcut listener
        // this.$el.removeEventListener('keydown', this.onKeyboardShorcutEntered);
        this.$el.removeEventListener('keydown', this.onEscapeKeyPressed);
        AppState.handleFocusOnComponentClose();
    },
})
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>