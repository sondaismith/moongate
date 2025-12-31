<template>
    <div data-test="post-focus-modal" id="post-focus-modal" tabindex="0" @scroll.passive="toggleScrollToTop"
    class="absolute z-20 h-full w-full flex flex-col sm:flex-row bg-slate-900/90 outline-none overflow-y-auto">
        {{ void "Fullscreen Image" }}
        <Transition>
            <div v-if="isImageFullscreen" @click="hideImageFullscreen" class="fixed flex h-full w-full text-primary items-center justify-center scroll-auto bg-black/95
            bg-contain bg-center bg-no-repeat z-30"
            :style="{'background-image': 'url('+(fullscreenImage)+'s)'}">
                <div v-if="!(fullscreenImage as ViewExternal).uri" @click="(e)=>{e.stopPropagation()}" class="absolute text-black bottom-0 left-0 px-2 bg-white/50 z-10">
                    {{`${(fullscreenImage as ViewImage).aspectRatio?.width}x${(fullscreenImage as ViewImage).aspectRatio?.height}px`}}
                </div>
                <img @contextmenu="(e) => {e.preventDefault()}" :src="(fullscreenImage as ViewExternal).uri ? (fullscreenImage as ViewExternal).uri : (fullscreenImage as ViewImage).fullsize" class="max-h-full max-w-full"/>
            </div>
        </Transition>
        <div class="sticky sm:absolute top-0 z-20 flex justify-center h-10 w-full sm:w-auto shrink-0 bg-postFocusBG sm:bg-transparent border-b border-outline">
            {{ void "Close Button" }}
            <div class="self-center flex justify-between w-full h-full px-4 py-2 sm:px-0">
                <div @click="isScrollToTopVisible && scrollToTopOfModal()" class="flex rounded-lg cursor-pointer bg-btn items-center py-1 px-3 text-primary sm:hidden transition-opacity"
                :style="[isScrollToTopVisible ? {'opacity':'100%'} : {'opacity':'0%'}]"><i-mdi:format-vertical-align-top/></div>
                <div v-if="hasImageMedia" @click="showImageFullscreen(getEmbededImageViewImageObjects[currentMediaIndex])"
                class="flex rounded-lg cursor-pointer bg-btn items-center px-3 text-primary text-sm sm:hidden">View Image</div>
                <div @click="hideModal" class="flex rounded-lg cursor-pointer bg-btn px-3 items-center text-primary sm:hidden"><i-mingcute:close-fill/></div>
            </div>
            <SquareButton data-test="postFocusModal-close-button" @click="hideModal"
            class="text-primary bg-btn !rounded-br aspect-square w-10 text-2xl
            ml-auto sm:!rounded-tl-none sm:!rounded-r-none hidden sm:block"
            button-padding="0">
                <i-mingcute:close-fill/>
            </SquareButton>
        </div>
        {{ void "Media Section" }}
        <div v-if="hasImageMedia || hasEmbedGIFMedia || isVideoView(postDetails.currentThreadView.post.embed)"
        class="relative flex flex-col w-full sm:w-3/5 grow min-h-[30rem]">
            {{ void "Media Container" }}
            <div class="flex items-center h-full w-full justify-center overflow-hidden p-5 sm:pt-10">
                <div class="flex h-full w-10 shrink-0 items-center mr-auto">
                    <SlideshowArrow v-if="canDecreaseMediaIndex && !postDetails.isAwaitingFocusData" arrow-direction="Left" @button-clicked="decreaseCurrentMediaIndex"/>
                </div>
                <div v-if="postDetails.isAwaitingFocusData" class="h-full w-2/3">
                    <div class="h-full w-full rounded-sm border-0 bg-slate-500 animate-pulse mx-auto"></div>
                </div>
                <!-- <div v-else-if="hasImageMedia && !postDetails.isAwaitingFocusData"
                class="rounded-sm h-full w-full bg-center bg-contain bg-no-repeat"
                :style="{'background-image' : 'url('+(getEmbededImageViewImageObjects[currentMediaIndex] as ViewImage).fullsize+')'}">
                </div> -->
                <ImageContainer v-else-if="hasImageMedia && !postDetails.isAwaitingFocusData"
                @image-clicked="showImageFullscreen" :show-fullsize="true" :media-embed="{$type:'app.bsky.embed.images#view', images: [getEmbededImageObjects.images[currentMediaIndex]]} as AppBskyEmbedImages.View" :is-large-container-view="true"
                :images-to-display="[getEmbededImageViewImageObjects[currentMediaIndex]]" :author="postDetails.currentThreadView.post.author.handle"
                :post-id="getEndOfPostUri" :media-index="currentMediaIndex"/>
                <video-container v-else-if="isVideoView(postDetails.currentThreadView.post.embed) && !postDetails.isAwaitingFocusData"
                class="relative flex flex-col max-w-full h-full justify-center p-5"
                :style="{'aspect-ratio':`${postDetails.currentThreadView.post.embed.aspectRatio?.width}/${postDetails.currentThreadView.post.embed.aspectRatio?.height}`}"
                :video-view="postDetails.currentThreadView.post.embed">
                </video-container>
                <EmbedExternal v-else-if="hasEmbedGIFMedia" @image-clicked="showImageFullscreen" :embed="getEmbedGIFMedia" :show-fullsize="true"
                :author="postDetails.currentThreadView.post.author.handle" :post-id="getEndOfPostUri"/>
                <div class="flex h-full w-10 shrink-0 items-center ml-auto">
                    <SlideshowArrow v-if="canIncreaseMediaIndex && !postDetails.isAwaitingFocusData" arrow-direction="Right" @button-clicked="increaseCurrentMediaIndex"/>
                </div>
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
        <div class="flex flex-col w-full sm:w-2/5 shrink-0 sm:max-w-96 bg-postFocusBG grow sm:ml-auto">
            {{ void "Focused Post Loading Placeholder/Skeleton" }}
            <div v-if="postDetails.isAwaitingFocusData || isChangingThreadContext" class="flex flex-col rounded bg-slate-400s p-4 pb-2 w-full">
                <div class="animate-pulse flex flex-col w-full overflow-hidden gap-1">
                    <div class="flex gap-2 mb-1">
                        <div class="drop-shadow-md">
                            <div class="rounded-full bg-slate-500 aspect-square size-10"></div>
                        </div>
                        <div class="flex flex-col gap-1 w-full">
                            <div class="h-4 w-24 rounded-sm bg-slate-500"></div>
                            <div class="h-3 w-full rounded-sm bg-slate-500"></div>
                        </div>
                        <div class="w-48 h-8 rounded-full bg-slate-500"></div>
                    </div>
                    <div class="h-4 w-full rounded-sm bg-slate-500"></div>
                    <div class="h-4 w-full rounded-sm bg-slate-500"></div>
                    <div class="h-4 w-4/5 rounded-sm bg-slate-500"></div>
                    <div class="h-3 max-w-40 mt-1 rounded-sm bg-slate-500"></div>
                    <div class="flex justify-between h-8 mt-1 w-full pt-2 border-t border-slate-500">
                        <div class="w-10 rounded-md bg-slate-500"></div>
                        <div class="w-10 rounded-md bg-slate-500"></div>
                        <div class="w-10 rounded-md bg-slate-500"></div>
                        <div class="w-10 rounded-md bg-slate-500"></div>
                        <div class="w-10 rounded-md bg-slate-500"></div>
                    </div>
                </div>
            </div>
            <div v-else class="p-4 pb-1 sticky top-10 sm:top-0 z-10 bg-postFocusBG border-b border-outline shadow-lg sm:shadow-none shadow-postFocusModalDetailsShadow/10">
                {{ void "User Info/Actions" }}
                <div class="flex gap-1">
                    <AvatarRound :avatar="postDetails.currentThreadView.post.author.avatar"
                    :did="postDetails.currentThreadView.post.author.did"
                    :handle="postDetails.currentThreadView.post.author.handle"/>
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
                <RichPostTextBsky data-test="postFocusModal-text" class="text-sm pt-2 text-primary"
                :post-text="(postDetails.currentThreadView.post.record as Record).text"
                :post-facets="(postDetails.currentThreadView.post.record as Record).facets"
                :is-changing-thread-context="isChangingThreadContext"/>
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
                    <div class="rounded-full bg-slate-500 aspect-square size-10"></div>
                    <div class="flex flex-col gap-1 w-full">
                        <div class="flex gap-2 h-5 mb-1">
                            <div class="w-full rounded-sm bg-slate-500"></div>
                            <div class="h-4 w-full rounded-sm bg-slate-500"></div>
                            <div class="h-4 w-28 rounded-sm bg-slate-500"></div>
                        </div>
                        <div class="h-4 w-40 rounded-sm bg-slate-500"></div>
                        <div class="h-4 w-48 rounded-sm bg-slate-500"></div>
                        <div class="h-4 w-36 rounded-sm bg-slate-500"></div>
                        <div class="flex justify-between h-6 mt-2 w-full">
                            <div class="w-10 rounded-md bg-slate-500"></div>
                            <div class="w-10 rounded-md bg-slate-500"></div>
                            <div class="w-10 rounded-md bg-slate-500"></div>
                            <div class="w-10 rounded-md bg-slate-500"></div>
                            <div class="w-10 rounded-md bg-slate-500"></div>
                        </div>
                    </div>
                </div>
            </div>
            {{ void "Replies" }}
            <ReplyBreadcrumb class="px-4" :current-breadcrumb="currentBreadcrumb"/>
            <div v-if="threadNavIndex>0" class="flex px-4 text-primary items-center"
            @click="decreaseThreadNavIndex">
                <div class="bg-btn px-1 rounded hover:bg-btnHover cursor-pointer">Back</div>
                <!-- <div class="flex text-xs flex-wrap">
                    <div v-for="navItem in postDetails.threadNavHistory">{{ navItem.post.author.displayName }} ></div>
                </div> -->
            </div>
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
import { isView as isImageView, ViewImage } from '@atproto/api/dist/client/types/app/bsky/embed/images';
import { isView as isVideoView, View as ViewVideo } from '@atproto/api/dist/client/types/app/bsky/embed/video';
import VideoContainer from '../Utilities/VideoContainer.vue';
import { AppState, toast } from '../../state/AppState.vue';
import { AppBskyEmbedExternal, AppBskyEmbedImages, AppBskyEmbedRecordWithMedia, AppBskyFeedPost } from '@atproto/api';
import EmbedExternal from '../Utilities/EmbedExternal.vue';
import VerifiedBadge from '../Utilities/VerifiedBadge.vue';
import PostInteractionIcons from './PostInteractionIcons.vue';
import { emptyPostThread } from '../../fake-data/dumPostData';
import { ThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { getPostThread } from '../../lib/api/Post.vue';
import { HandleAPIError } from '../../helpers/errors';
import ImageContainer from '../Utilities/ImageContainer.vue';
import SlideshowArrow from '../Utilities/SlideshowArrow.vue';
import { ViewExternal } from '@atproto/api/dist/client/types/app/bsky/embed/external';
import SquareButton from '../Utilities/SquareButton.vue';
import RichPostTextBsky from '../Utilities/RichPostTextBsky.vue';
import { Record } from '@atproto/api/dist/client/types/app/bsky/feed/post';
import { debounce } from '../../helpers/debouncer';

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
            imageCollection: [],
            postDetails,
            convertToLongTimestamp,
            isImageView,
            isVideoView,
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
             * Holds record of how/where the User has navigated down
             * the Post reply tree. The 1st element will always be a
             * reference to the root Post.
             */
            threadNavHistory: [emptyPostThread] as ThreadViewPost[],
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
            fullscreenImage : {} as ViewImage|ViewExternal,
            /**Is the "scroll to top" button currently visible? */
            isScrollToTopVisible:false,
            /**Record of the last valid Post DID used. Used to prevent reload when `CreatePost`
             * or `Login` modal are closed after opening on top of `PostFocusModal`. */
            lastPostDid:'',
            /**Record of the route the User was using before opening this modal. Navigated back to when
             * the modal is closed. */
            routeEntryPoint:'/'
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
        showImageFullscreen(image:ViewImage|ViewExternal){
            this.fullscreenImage = image;
            this.isImageFullscreen = true;
        },
        hideImageFullscreen(){
            this.isImageFullscreen = false;
            this.fullscreenImage = {} as ViewImage|ViewExternal;
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
            if(e.key == 'ArrowLeft' && !e.repeat){
                this.decreaseCurrentMediaIndex();
            }
            else if(e.key == 'ArrowRight' && !e.repeat){
                this.increaseCurrentMediaIndex();
            }
            if(e.key == 'ArrowLeft' && e.altKey && !e.repeat){
                this.decreaseThreadNavIndex();
            }
            else if(e.key == 'ArrowRight' && e.altKey && !e.repeat){
                this.increaseThreadNavIndex();
            }
            // else if(!e.repeat) console.log('Other key pressed: '+e.key);
        },
        /**
         * Method that adds support for navigating through the modal navigation history
         * using the Mouse "Browser Back" and "Browser Forward" buttons.
         * @param e The MouseEvent fired.
         */
        onMouseShortcutEntered(e:MouseEvent){
            if(e.button == 3) this.decreaseThreadNavIndex();
            else if (e.button == 4) this.increaseThreadNavIndex();
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
                this.postThread = res.data.thread as ThreadViewPost;
                // postDetails.currentThreadView = postDetails.threadNavHistory[0] = postDetails.postThread;
                //Take Post Thread prop and update relevant variables
                postDetails.currentThreadView = this.threadNavHistory[0] = this.postThread;
                if(!Number.isNaN(this.clickedMediaIndex))
                    this.currentMediaIndex = this.clickedMediaIndex; //Set initial media item to show
                else this.currentMediaIndex = 0;
                console.log(this.clickedMediaIndex);
            })
            .catch(err => toast.add(HandleAPIError(err, 'Error getting Post thread for focus modal')))
            .finally(()=>{
                postDetails.isAwaitingFocusData = false;
                document.title = this.getFocusPostTitle;
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
        /**
         * Method that changes the thread "context" - updates the main post displayed in
         * the `PostFocusModal` component.
         * Updates the navigation history list (`threadNavHistory`).
         * @param threadPost Post/reply to display in `PostFocusModal`.
         */
        setThreadContext(threadPost:ThreadViewPost|undefined, mediaIndex:number=0){
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
        async updateThreadContextFromPost(newThreadContext:ThreadViewPost|undefined,mediaIndex:number){
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
        createThreadPostUri(thread:ThreadViewPost){
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
        findThreadView(cid:string, repliesArray:ThreadViewPost):ThreadViewPost|undefined {
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
        discoverBreadcrumbs(parentCID:string, currentPostThread:ThreadViewPost){
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
            let mainContainer = document.getElementById('post-focus-modal');
            if(mainContainer) mainContainer.scrollBy({top:-mainContainer.scrollTop,behavior:'smooth'});
        },
        /**
         * Method used to scroll back to the top of a Feed list. Defined in the
         * "created()" section.
         */
        toggleScrollToTop(e:Event){},
    },
    computed:{
        /**Checks to see if the current post contains any image media. */
        hasImageMedia(){
            //Image Post
            if((postDetails.currentThreadView.post.embed &&
            isImageView(postDetails.currentThreadView.post.embed)))
                return true;
            //Image Post w/ QRT
            if(AppBskyEmbedRecordWithMedia.isView(postDetails.currentThreadView.post.embed) &&
            isImageView(postDetails.currentThreadView.post.embed.media))
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
            if(this.hasImageMedia || this.hasEmbedGIFMedia || isVideoView(postDetails.currentThreadView.post.embed))
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
            (postDetails.currentThreadView.post.embed.images as ViewImage[]).length > 0 &&
            (postDetails.currentThreadView.post.embed.images as ViewImage[])[this.currentMediaIndex].alt.trim() != '')
                return true;
            //Image Post w/ QRT
            else if(typeof postDetails.currentThreadView.post.embed != 'undefined' &&
            AppBskyEmbedRecordWithMedia.isView(postDetails.currentThreadView.post.embed) &&
            typeof postDetails.currentThreadView.post.embed.media.images != 'undefined' &&
            (postDetails.currentThreadView.post.embed.media.images as ViewImage[]).length > 0 &&
            (postDetails.currentThreadView.post.embed.media.images as ViewImage[])[0].alt.trim() != '')
                return true;
            return false;
        },
        /**
         * Checks to see if the current post contains a video, and if
         * it has any descriptive ALT text.
         */
        hasEmbededVideoWithAltText(){
            if(postDetails.currentThreadView.post.embed &&
            isVideoView(postDetails.currentThreadView.post.embed) &&
            (postDetails.currentThreadView.post.embed as ViewVideo).alt &&
            (postDetails.currentThreadView.post.embed as ViewVideo).alt.trim() != '') return true;
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
                return (postDetails.currentThreadView.post.embed.images as ViewImage[])[this.currentMediaIndex].alt;
            else if(postDetails.currentThreadView.post.embed &&
            AppBskyEmbedRecordWithMedia.isView(postDetails.currentThreadView.post.embed) &&
            (postDetails.currentThreadView.post.embed.media.images as ViewImage[]).length > 0)
                return (postDetails.currentThreadView.post.embed.media.images as ViewImage[])[this.currentMediaIndex].alt;
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
        getEmbededImageViewImageObjects():ViewImage[]{
            if(postDetails.currentThreadView.post.embed &&
            postDetails.currentThreadView.post.embed.images)
                return (postDetails.currentThreadView.post.embed.images as ViewImage[]);
            else if(postDetails.currentThreadView.post.embed &&
            AppBskyEmbedRecordWithMedia.isView(postDetails.currentThreadView.post.embed) &&
            postDetails.currentThreadView.post.embed.media.images &&
            (postDetails.currentThreadView.post.embed.media.images as ViewImage[]).length > 0)
                return (postDetails.currentThreadView.post.embed.media.images as ViewImage[]);
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
            return postTextClip.trim() != '' ? `${postTextClip}... by ${postDetails.currentThreadView.post.author.displayName} | moongate` : `${postDetails.currentThreadView.post.author.displayName}'s Post | moongate`;
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
            if(typeof newIndex != 'undefined' && newIndex != oldIndex)
                this.currentMediaIndex = newIndex;
        }
    },
    beforeRouteEnter(to, from, next){
        if(from.name == 'saving media'){//restore page title after navigating back from `SaveMediaModal`
            next(vm => {
                document.title = vm.getFocusPostTitle;
            })
        }
        else next();
    },
    created(){
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
        console.log(this.handle);
        console.log(this.postDid);
        this.getThreadData();
    },
    mounted(){
        //Add keyboard+mouse shortcut listener
        this.$el.addEventListener('keydown', this.onKeyboardShorcutEntered);
        this.$el.addEventListener('mouseup', this.onMouseShortcutEntered);
        (this.$el as HTMLElement).focus();
        document.title = `Loading Post data... | moongate`
    },
    beforeUnmount() {
        console.log('Closing PostFocusModal...');
        //Remove keyboard+mouse shortcut listener
        this.$el.removeEventListener('keydown', this.onKeyboardShorcutEntered);
        this.$el.removeEventListener('mouseup', this.onMouseShortcutEntered);
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