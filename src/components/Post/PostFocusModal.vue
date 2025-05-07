<template>
    <div data-test="post-focus-modal" id="post-focus-modal" tabindex="0"
    class="absolute z-20 h-full w-full flex bg-slate-900/90 outline-none">
        {{ void "Media Section" }}
        <div class="flex flex-col w-3/5 grow">
            {{ void "Close Button" }}
            <div @click="hideModal" class="flex shrink-0 ml-auto bg-blue-300 py-2 w-10
                justify-center text-2xl cursor-pointer">
                <i-mingcute:close-fill/>
            </div>
            {{ void "Media Container" }}
            <div class="flex items-center h-full justify-center overflow-hidden">
                <div class="flex shrink-0 text-2xl bg-blue-400 w-10">
                    <div @click="decreaseCurrentMediaIndex"
                    v-if="canDecreaseMediaIndex"
                    class="cursor-pointer">
                        <i-mingcute:left-fill/>
                    </div>
                </div>
                <div v-if="postDetails.isAwaitingFocusData" class="h-full w-full rounded-sm border-0 bg-slate-500 animate-pulse"></div>
                <div v-else-if="hasImageMedia && !postDetails.isAwaitingFocusData"
                class="rounded-sm h-full w-full bg-center bg-contain bg-no-repeat"
                :style="{'background-image' : 'url('+(getEmbededImageViewImageObjects[postDetails.clickedMediaIndex] as ViewImage).fullsize+')'}">
                </div>
                <video-container v-else-if="isVideoView(postDetails.currentThreadView.post.embed) && !postDetails.isAwaitingFocusData"
                class="relative flex flex-col max-w-full h-full justify-center p-5"
                :style="{'aspect-ratio':`${postDetails.currentThreadView.post.embed.aspectRatio?.width}/${postDetails.currentThreadView.post.embed.aspectRatio?.height}`}"
                :video-view="postDetails.currentThreadView.post.embed">
                </video-container>
                <EmbedExternal v-else-if="hasEmbedGIFMedia" :embed="getEmbedGIFMedia"/>
                <div class="flex shrink-0 text-2xl justify-center bg-blue-400 w-10">
                    <div @click="increaseCurrentMediaIndex"
                    v-if="canIncreaseMediaIndex"
                    class="cursor-pointer">
                        <i-mingcute:right-fill/>
                    </div>
                </div>
            </div>
            <div v-if="postDetails.isAwaitingFocusData" class="flex rounded-lg mx-8 mt-2 mb-8 p-2 h-16 animate-pulse text-sm bg-slate-500/30"></div>
            <div v-else-if="hasEmbededImagesWithAltText" class="flex rounded-lg mx-8 mt-2 mb-8 p-2 text-sm bg-slate-500/20">
                <div class="flex min-[300px]:max-h-20 grow overflow-auto">{{ getEmbededImageAltText }}</div>
            </div>
            <div v-else-if="hasEmbededVideoWithAltText" class="flex rounded-lg mx-8 mt-2 mb-8 p-2 text-sm bg-slate-500/20">
                <div class="flex min-[300px]:max-h-20 grow overflow-auto">{{ postDetails.currentThreadView.post.embed?.alt }}</div>
            </div>
            {{ void "Post Details" }}
            <!-- <div class="flex space-x-2 mx-8 px-2 py-4 ">
                <div>Comments</div>
                <div>Likes</div>
                <div>Share</div>
            </div> -->
        </div>
        {{ void "Comments Section" }}
        <div class="flex flex-col w-2/5 shrink-0 max-w-96 bg-postFocusBG overflow-y-scroll">
            {{ void "Focused Post Loading Placeholder/Skeleton" }}
            <div v-if="postDetails.isAwaitingFocusData" class="flex flex-col rounded bg-slate-400s p-4 pb-2 w-full">
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
            {{ void "User Info/Actions" }}
            <div v-if="!postDetails.isAwaitingFocusData" class="p-4 pb-2">
                <div class="flex gap-1">
                    <AvatarRound :avatar="postDetails.currentThreadView.post.author.avatar"
                    :did="postDetails.currentThreadView.post.author.did"
                    :handle="postDetails.currentThreadView.post.author.handle"/>
                    <div class="self-center overflow-hidden text-primary ml-1">
                        <div class="flex items-center gap-1">
                            <div class="font-bold leading-4 text-ellipsis text-nowrap overflow-hidden"
                            :title="postDetails.currentThreadView.post.author.displayName">
                                {{ postDetails.currentThreadView.post.author.displayName }}
                            </div>
                            <VerifiedBadge v-if="isUserVerified" class="size-4"/>
                        </div>
                        <div class="text-feedPostName text-ellipsis overflow-hidden">@{{ postDetails.currentThreadView.post.author.handle }}</div>
                    </div>
                    <div class="rounded-full self-center ml-auto
                    py-1 px-3 bg-slate-300 font-bold hover:bg-slate-200
                    text-slate-800 text-nowrap cursor-pointer">
                        + Follow
                    </div>
                </div>
                {{ void "Post Content - Text" }}
                <div class="text-sm pt-2 text-primary">
                    {{ postDetails.currentThreadView ? postDetails.currentThreadView.post.record.text : "initial state - undefined" }}
                </div>
                {{ void "Post Metadata" }}
                <div class="border-slate-600 divide-y divide-inherit !mt-0">
                    <div class="py-1">
                        <div class="text-feedPostName text-secondary cursor-pointer hover:underline">{{ convertToLongTimestamp(postDetails.postThread.post.indexedAt) }}</div>
                    </div>
                    <PostInteractionIcons class="pt-2" :post-data="postDetails.currentThreadView.post"/>
                </div>
            </div>
            {{ void "post reply input" }}
            <div class="px-4"><PostReplyInput/></div>
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
            <ReplyBreadcrumb class="px-4"/>
            <div v-if="postDetails.threadNavIndex>0" class="flex px-4 text-primary items-center"
            @click="postDetails.decreaseThreadNavIndex">
                <div class="bg-btn px-1 rounded hover:bg-btnHover cursor-pointer">Back</div>
                <!-- <div class="flex text-xs flex-wrap">
                    <div v-for="navItem in postDetails.threadNavHistory">{{ navItem.post.author.displayName }} ></div>
                </div> -->
            </div>
            <PostThreadView v-if="!postDetails.isAwaitingFocusData"/>
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
import { AppState } from '../../state/AppState.vue';
import { AppBskyEmbedExternal, AppBskyEmbedRecordWithMedia } from '@atproto/api';
import EmbedExternal from '../Utilities/EmbedExternal.vue';
import VerifiedBadge from '../Utilities/VerifiedBadge.vue';
import PostInteractionIcons from './PostInteractionIcons.vue';

export default defineComponent({
    components:{
        AvatarRound,
        PostInteractionIcons,
        PostThreadView,
        ReplyBreadcrumb,
        VideoContainer,
        EmbedExternal,
        VerifiedBadge,
    },
    data(){
        return{
            imageCollection: [
                'src/assets/test-media/posts/image04.png',
                'src/assets/test-media/posts/image01.png',
                'src/assets/test-media/posts/image05.png',
                'src/assets/test-media/posts/image06.png',
            ],
            postDetails,
            convertToLongTimestamp,
            isImageView,
            isVideoView,
            AppBskyEmbedRecordWithMedia,
        }
    },
    methods:{
        increaseCurrentMediaIndex(){
            if(postDetails.clickedMediaIndex+1 < this.imageCollection.length)
                postDetails.setClickedMediaIndex(postDetails.getClickedMediaIndex()+1);
        },
        decreaseCurrentMediaIndex(){
            if(postDetails.clickedMediaIndex-1 >= 0)
                postDetails.setClickedMediaIndex(postDetails.getClickedMediaIndex()-1);
        },
        hideModal(){
            postDetails.hideFocusModal();
        },
        /**
         * Method used to navigate through the modal navigation history
         * if the shortcut Alt + Left Arrow or Alt + Right Arrow is pressed.
         * @param e Key down event.
         */
        onKeyboardShorcutEntered(e:KeyboardEvent){
            if(e.key == 'ArrowLeft' && e.altKey && !e.repeat){
                postDetails.decreaseThreadNavIndex();
            }
            else if(e.key == 'ArrowRight' && e.altKey && !e.repeat){
                postDetails.increaseThreadNavIndex();
            }
            // else if(!e.repeat) console.log('Other key pressed: '+e.key);
        },
        /**
         * Method that adds support for navigating through the modal navigation history
         * using the Mouse "Browser Back" and "Browser Forward" buttons.
         * @param e The MouseEvent fired.
         */
        onMouseShortcutEntered(e:MouseEvent){
            if(e.button == 3) postDetails.decreaseThreadNavIndex();
            else if (e.button == 4) postDetails.increaseThreadNavIndex();
        }
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
        /**
         * Checks to see if the current post contains any images, and if
         * the first one has any descriptive ALT text.
         */
        hasEmbededImagesWithAltText(){
            //Image Post
            if(postDetails.currentThreadView.post.embed &&
            postDetails.currentThreadView.post.embed.images &&
            (postDetails.currentThreadView.post.embed.images as ViewImage[])[postDetails.clickedMediaIndex].alt.trim() != '')
                return true;
            //Image Post w/ QRT
            else if(postDetails.currentThreadView.post.embed &&
            AppBskyEmbedRecordWithMedia.isView(postDetails.currentThreadView.post.embed) &&
            postDetails.currentThreadView.post.embed.media.images &&
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
                return (postDetails.currentThreadView.post.embed.images as ViewImage[])[postDetails.clickedMediaIndex].alt;
            else if(postDetails.currentThreadView.post.embed &&
            AppBskyEmbedRecordWithMedia.isView(postDetails.currentThreadView.post.embed) &&
            (postDetails.currentThreadView.post.embed.media.images as ViewImage[]).length > 0)
                return (postDetails.currentThreadView.post.embed.media.images as ViewImage[])[0].alt;
            return '';
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
        /**Determines if the current media index can be decreased.*/
        canDecreaseMediaIndex(){
            let currentImages = this.getEmbededImageViewImageObjects;
            if(currentImages.length>0){
                if(postDetails.clickedMediaIndex != 0 &&
                postDetails.clickedMediaIndex>=0)
                    return true;
            }
            return false;
        },
        /**Determines if the current media index can be increased.*/
        canIncreaseMediaIndex(){
            let currentImages = this.getEmbededImageViewImageObjects;
            if(currentImages.length>0){
                if(postDetails.clickedMediaIndex+1 != currentImages.length &&
                postDetails.clickedMediaIndex>=0)
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
    },
    mounted(){
        //Add keyboard+mouse shortcut listener
        this.$el.addEventListener('keydown', this.onKeyboardShorcutEntered);
        this.$el.addEventListener('mouseup', this.onMouseShortcutEntered);
        (this.$el as HTMLElement).focus();
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
</style>