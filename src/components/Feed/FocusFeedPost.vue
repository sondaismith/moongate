<template>
    <div v-if="postToShow && isViewBlocked(postToShow)">
        <div class="flex rounded-lg p-2 gap-1 border border-outline items-center">
            <i-mingcute:information-line class="size-4"/>
            <div>Blocked</div>
        </div>
    </div>
    <div v-else-if="postToShow && isViewNotFound(postToShow)">
        <div class="flex rounded-lg p-2 gap-1 border border-outline items-center">
            <i-mingcute:information-line class="size-4"/>
            <div>Deleted</div>
        </div>
    </div>
    <div v-else-if="postToShow && isListView(postToShow)">
        <div class="flex flex-col rounded-lg p-2 gap-1 border border-outline overflow-hidden select-none"
        title="Lists are not yet supported">
            <div class="flex gap-2">
                <!-- <AvatarRound :avatar="postData.avatar"/> -->
                <div class="bg-primary size-10 rounded-sm bg-contain border border-outline" :style="'background-image:url('+postToShow.avatar+')'"></div>
                <div class="flex flex-col gap-1s">
                    <div class="leading-5">{{ postToShow.record }}</div>
                    <div class="text-sm text-secondary">Starter Pack by @{{ postToShow.creator.handle }}</div>
                </div>
            </div>
            <div class="flex text-sm leading-4">{{ postToShow.description }}</div>
        </div>
    </div>
    <div v-else-if="postToShow && isStarterPackViewBasic(postToShow)">
        <div class="flex flex-col rounded-lg p-2 gap-1 border border-outline overflow-hidden select-none"
        title="Starter Packs are not yet supported">
            <div class="flex gap-2">
                <div class="relative shrink-0 size-10 rounded-sm text-postFocusBG bg-contain border border-outline" :style="'background-image:url('+postToShow.creator.avatar+')'">
                    <i-solar:box-minimalistic-bold-duotone class="absolute z-[1] w-full h-full"/>
                    <div class="absolute w-full h-full bg-primary/10s"></div>
                </div>
                <div class="flex flex-col overflow-hidden">
                    <div class="leading-5 text-nowrap overflow-hidden text-ellipsis">{{ postToShow.record.name }}</div>
                    <div class="text-sm text-secondary text-nowrap w-full overflow-hidden text-ellipsis">By @{{ postToShow.creator.handle }}</div>
                </div>
            </div>
            <div class="flex text-sm leading-4">{{ postToShow.record.description }}</div>
        </div>
    </div>
    <div v-else-if="postToShow && isGeneratorView(postToShow)">
        <div class="flex flex-col rounded-lg p-2 gap-1 border border-outline overflow-hidden
        select-none hover:bg-btnSubtle cursor-not-allowed"
        title="Generator views are not yet supported">
            <div class="flex gap-2">
                <div class="relative shrink-0 size-10 rounded-sm text-postFocusBG bg-contain border border-outline" :style="'background-image:url('+postToShow.avatar+')'">
                </div>
                <div class="flex flex-col overflow-hidden">
                    <div class="leading-5 text-nowrap overflow-hidden text-ellipsis">{{ postToShow.displayName }}</div>
                    <div class="text-sm text-secondary text-nowrap w-full overflow-hidden text-ellipsis">By @{{ postToShow.creator.handle }}</div>
                </div>
            </div>
            <div class="text-sm leading-4 break-words">{{ postToShow.description }}</div>
            <div class="text-sm font-semibold leading-4s">Liked by {{ postToShow.likeCount }} users</div>
        </div>
    </div>
    <div v-else-if="postToShow" class="flex flex-col rounded-lg border border-slate-600 text-primary w-full"
    :class="[$attrs.class, isReasonPin(postReason) ? 'pt-2' : '', isReplyStyle ? 'border-0' : 'gap-2 p-3 pb-1.5',
        isFeedPostStyle ? 'p-1.5' : ''
    ]">
        <div v-if="isReasonPin(postReason)" class="flex items-center text-secondary border-b
        border-outline pb-1 select-none">
            <i-mdi:pin class="text-sm"/>
            <div class="font-bold text-xs">Pinned</div>
        </div>
        {{ void "Retweet Label" }}
        <div v-if="postReason && isReasonRepost(postReason) && !isViewRecord(postToShow)"
        class="flex rounded p-1 bg-postMsg items-center text-sm">
            <div class="flex grow-0 shrink-0 justify-end px-1">
                <i-mdi:twitter-retweet/>
            </div>
            <div class="text-nowrap overflow-hidden text-ellipsis"
            :title="postReason.by.displayName">
                Reposted by {{ postReason.by.displayName }}
            </div>
        </div>
        <div v-else-if="postToShow && isPostReply" @click="openFocusDetailsPost(reply?.parent as PostView)"
        title="Open Reply Parent"
        class="flex self-start py-0.5 px-2 rounded-md text-[10px] leading-3 text-primary
        bg-btn hover:bg-btnHover cursor-pointer select-none">
            Reply
        </div>
        <div class="flex w-full">
            <div>
                <AvatarRound v-if="isReplyStyle" :avatar="postToShow.author.avatar" :did="postToShow.author.did" :handle="postToShow.author.handle"/>
                <div v-if="replyIndex !=undefined && totalReplies!=undefined && replyIndex<totalReplies" class="h-full bg-slate-700 w-0.5 m-auto"></div>
            </div>
            <div class="flex flex-col w-full overflow-hidden"
            :class="[isReplyStyle ? 'pl-2' : '']">
                {{ void "Post Profile Header" }}
                <div class="flex items-center gap-2">
                    <AvatarRound v-if="!isReplyStyle" :avatar="postToShow.author.avatar" :did="postToShow.author.did" :handle="postToShow.author.handle"
                    @avatar-clicked="callFocusPostAvatarClicked(postToShow.author.did)"/>
                    <div class="flex overflow-hidden" :class="[isReplyStyle ? 'gap-1 items-center' : 'flex-col']">
                        <div class="flex items-center gap-1 overflow-hidden">
                            <div class="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis" :title="postToShow.author.displayName">
                                {{ postToShow.author.displayName }}
                            </div>
                            <VerifiedBadge v-if="isUserVerified" class="size-4"/>
                        </div>
                        <div class="text-xs text-secondary whitespace-nowrap overflow-hidden text-ellipsis" :title="postToShow.author.handle">@{{ postToShow.author.handle }}</div>
                    </div>
                    <div v-if="!isViewRecord(postToShow)" data-test="focusFeedPost-timestamp-button" @click="isReplyStyle ? emitThreadReplyClicked(threadData ? threadData.post.uri : '') : openFocusDetails(0)" class="cursor-pointer text-secondary hover:text-secondaryHover transition-colors hover:underline text-xs text-nowrap self-start ml-auto" :title="convertToLongTimestamp(postToShow.record.createdAt)">{{ convertToShortTimestamp(postToShow.record.createdAt) }}</div>
                    <div v-else-if="isViewRecord(postToShow)" data-test="focusFeedPost-timestamp-button" @click="isReplyStyle ? emitThreadReplyClicked(threadData ? threadData.post.uri : '') : openFocusDetails(0)" class="cursor-pointer text-secondary hover:text-secondaryHover transition-colors hover:underline text-xs text-nowrap self-start ml-auto" :title="convertToLongTimestamp(postToShow.value.createdAt)">{{ convertToShortTimestamp(postToShow.value.createdAt) }}</div>
                </div>
                <div class="flex flex-col"
                :class="[isFeedPostStyle ? 'pl-12 pr-3' : '', isReplyStyle ? 'gap-2' : 'pt-2 gap-2']">
                    {{ void "Post Text Content" }}
                    <RichPostTextBsky data-test="focusFeedPost-text" v-if="!isViewRecord(postToShow)" :post-text="(postToShow.record as Record).text" :post-facets="(postToShow.record as Record).facets"/>
                    <!-- Is Quoted Post -->
                    <RichPostTextBsky data-test="focusFeedPost-text" v-else :post-text="((postToShow as ViewRecord).value as Record).text" :post-facets="((postToShow as ViewRecord).value as Record).facets"/>
                    {{ void "Post Media" }}
                    <ImageContainer v-if="postContainsImage" :images-to-display="getPostImages"
                    :labels="postToShow.labels" :author="postToShow.author.handle" :post-text="getPostText"
                    @media-click="(i:number) => isReplyStyle ? emitThreadReplyClicked(threadData ? threadData.post.uri : '', i) : openFocusDetails(i)"/>
                    <VideoContainer v-if="postContainsVideo" :video-view="getPostVideo"
                    :labels="postToShow.labels" :author="postToShow.author.handle"/>
                    <div v-if="postContainsExternalEmbed">
                        <EmbedExternal :embed="getPostEmbed" @media-click="(i:number) => isReplyStyle ? emitThreadReplyClicked(threadData ? threadData.post.uri : '', i) : openFocusDetails(i)"/>
                    </div>
                    {{ void "Reposts - ViewRecord and View" }}
                    <FocusFeedPost v-if="postToShow.embed?.record && postToShow.embed?.record.record && AppBskyEmbedRecord.isViewRecord(postToShow.embed.record.record)"
                    :post-data="postToShow.embed.record.record" :post-reason="postReason"
                    @focus-post-avatar-clicked="callFocusPostAvatarClicked" @thread-reply-clicked="emitThreadReplyClicked(postToShow.embed.record.record.uri)"/>
                    <FocusFeedPost v-else-if="postToShow.embed && AppBskyEmbedRecord.isView(postToShow.embed)"
                    :post-data="postToShow.embed.record" :post-reason="postReason"
                    @focus-post-avatar-clicked="callFocusPostAvatarClicked" @thread-reply-clicked="emitThreadReplyClicked(postToShow.embed.record.uri)"/>
                    {{ void "Post Interaction Buttons/Icons" }}
                    <PostInteractionIcons class="pb-0 !bg-lime-300s" :post-data="postToShow"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { isGeneratorView, isPostView, isReasonPin, isReasonRepost, PostView, ReasonPin, ReasonRepost, ReplyRef, ThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { AppBskyEmbedExternal, AppBskyEmbedImages, AppBskyEmbedRecord, AppBskyEmbedRecordWithMedia, AppBskyEmbedVideo, isDid } from '@atproto/api';
import { defineComponent, PropType } from 'vue'
import { convertToLongTimestamp, convertToShortTimestamp } from '../../helpers/converters';
import { isViewBlocked, isViewNotFound, isViewRecord, ViewRecord } from '@atproto/api/dist/client/types/app/bsky/embed/record';
import ImageContainer from '../Utilities/ImageContainer.vue';
import VideoContainer from '../Utilities/VideoContainer.vue';
import AvatarRound from '../Utilities/AvatarRound.vue';
import RichPostText from '../Utilities/RichPostText.vue';
import EmbedExternal from '../Utilities/EmbedExternal.vue';
import PostInteractionIcons from '../Post/PostInteractionIcons.vue';
import { isImage, ViewImage } from '@atproto/api/dist/client/types/app/bsky/embed/images';
import { postDetails, showFocusModal } from '../../state/PostDetails.vue';
import RichPostTextBsky from '../Utilities/RichPostTextBsky.vue';
import { isListView, isStarterPackViewBasic } from '@atproto/api/dist/client/types/app/bsky/graph/defs';
import VerifiedBadge from '../Utilities/VerifiedBadge.vue';
import { Record } from '@atproto/api/dist/client/types/app/bsky/feed/post';

export default defineComponent({
    components:{
        ImageContainer,
        VideoContainer,
        AvatarRound,
        RichPostText,
        RichPostTextBsky,
        EmbedExternal,
        VerifiedBadge,
        PostInteractionIcons,
    },
    props:{
        /**Prop used to pass in Post details - used by "Feed-type" display components (`FeedColumn`). */
        postData: Object as PropType<PostView>,
        /**Prop used to pass in Post details - used by "Reply-type" display components (`PostThreadView`). */
        threadData: Object as PropType<ThreadViewPost>,
        postReason: Object as PropType<ReasonRepost|ReasonPin>,
        isFeedPostStyle:{
            type:Boolean,
            default:false
        },
        isReplyStyle:{
            type:Boolean,
            default:false
        },
        replyIndex:Number,
        totalReplies:Number,
        reply: Object as PropType<ReplyRef>
    },
    data(){
        return{
            isReasonRepost,
            isReasonPin,
            isImage,
            isViewRecord,
            isViewBlocked,
            isViewNotFound,
            isListView,
            isStarterPackViewBasic,
            isGeneratorView,
            convertToLongTimestamp,
            convertToShortTimestamp,
            AppBskyEmbedImages,
            AppBskyEmbedVideo,
            AppBskyEmbedRecord,
            AppBskyEmbedRecordWithMedia,
            AppBskyEmbedExternal,
            postDetails,
            /**
             * The current Post details to show. "Post" is derived from `threadData`
             * first if it exists and `postData` second.
             */
            postToShow: {author:{did:'',handle:''},cid:'',indexedAt:'',record:{},uri:''} as PostView,
        }
    },
    emits:{
        /**Emits the DID value of the User associated with the clicked avatar. */
        focusPostAvatarClicked:(userDid:string) => {
            if(isDid(userDid)) return true;
            else return false;
        },
        /**
         * Updates the Posts/Replies displayed in the PostFocusModal component when
         * a `FocusFeedPost` timestamp is clicked.
         * This emit travels from `FocusFeedPost` to `PostThreadView` to `PostFocusModal`.
         * QRT Posts will emit to the container `FocusFeedPost` and then continue up
         * the previously outlined route.
         * @param postThreadURI The URI pointing to the new Post Thread context to display.
         * @param mediaIndex The Index of the media in the Post's collection to display.
         */
        threadReplyClicked:(postThreadURI:string,mediaIndex:number) => {
            if(postThreadURI.trim() != '')
                return {postThreadURI,mediaIndex};
            else return false;
        }
    },
    methods:{
        /**
         * Method used to emit a message that is used to update the view of the
         * `UserFocusModal`.
         * @param did DID of the User profile to switch the view of the `UserFocusModal` to.
         */
        callFocusPostAvatarClicked(did:string){
            this.$emit('focusPostAvatarClicked',did)
        },
        /**
         * Method used to display a particular post in the `PostFocusModal` component.
         * @param mediaIndex The index of the media content to initially show.
         */
        openFocusDetails(mediaIndex:number){
            if(this.postToShow){
                //Check if modal is already visible - if it is we are not showing it
                //for the first time, the thread context is being updated
                if(postDetails.isFocusVisible)
                    this.emitThreadReplyClicked(this.postToShow.uri);
                else
                    showFocusModal({post: this.postToShow}, mediaIndex);
            }
        },
        openFocusDetailsPost(post:PostView, mediaIndex:number=0){
            if(this.postToShow){
                showFocusModal({post: post}, mediaIndex);
            }
        },
        /**
         * Updates the Posts/Replies displayed in the PostFocusModal component.
         * Emits `threadReplyClicked` with URI of Post Thread to display.
         * @param newThreadURI The URI pointing to the new Post Thread context to display.
         */
        emitThreadReplyClicked(newThreadURI:string, mediaIndex:number=0){
            if(newThreadURI.trim() != '')
                this.$emit('threadReplyClicked',newThreadURI,mediaIndex);
        }
    },
    computed:{
        /**
         * Determines if the current Post data held by the component contains any images.
         */
        postContainsImage(){
            //This is the standalone/parent Post, not a QRT (Quote Retweet)
            if(!isViewRecord(this.postToShow)){
                if(this.postToShow?.embed && this.postToShow.embed.images){
                    //Is a parent Post with image(s)
                    return true;
                }
                else if(this.postToShow?.embed && AppBskyEmbedRecordWithMedia.isView(this.postToShow.embed) && this.postToShow.embed.media.images){
                    //Is a parent Post with image(s) and a QRT
                    return true;
                }
            }
            else{
                //This is a QRT
                if(this.postToShow?.embeds && this.postToShow.embeds.length>0 && this.postToShow.embeds[0].images){
                    //Is a QRT with image(s)
                    return true;
                }
                else if(this.postToShow?.embeds && this.postToShow.embeds.length>0 && this.postToShow.embeds[0].media &&
                    this.postToShow.embeds[0].media.images && this.postToShow.embeds[0].media.images.length>0){
                    //Is a QRT with image(s)
                    return true;
                }
            }
        },
        /**
         * Determines if the current Post data held by the component contains any video.
         */
        postContainsVideo(){
            //This is the standalone/parent Post, not a QRT (Quote Retweet)
            if(!isViewRecord(this.postToShow)){
                if(this.postToShow?.embed && AppBskyEmbedVideo.isView(this.postToShow.embed)){
                    //Is a parent Post with video
                    return true;
                }
                else if(this.postToShow?.embed && AppBskyEmbedVideo.isView(this.postToShow.embed.media)){
                    //Is a parent Post with video and a QRT
                    return true;
                }
            }
            else{
                //This is a QRT
                if(this.postToShow?.embeds && AppBskyEmbedVideo.isView(this.postToShow.embeds[0])){
                    //Is a QRT with video
                    return true;
                }
                else if(this.postToShow?.embeds && AppBskyEmbedRecordWithMedia.isView(this.postToShow.embeds[0]) &&
                AppBskyEmbedVideo.isView(this.postToShow.embeds[0].media)){
                    //Is a QRT with video
                    return true;
                }
            }
            return false;
        },
        /**
         * Determines if the current Post data held by the component contains external embed content.
         */
        postContainsExternalEmbed(){
            //This is the standalone/parent Post, not a QRT (Quote Retweet)
            if(!isViewRecord(this.postToShow)){
                if(this.postToShow?.embed && AppBskyEmbedExternal.isView(this.postToShow.embed)){
                    //Is a parent Post with external embed
                    return true;
                }
                else if(this.postToShow?.embed && this.postToShow.embed.media && AppBskyEmbedExternal.isView(this.postToShow.embed.media)){
                    //Is a parent Post with external embed and a QRT
                    return true;
                }
            }
            else{
                //This is a QRT
                if(this.postToShow?.embeds && AppBskyEmbedExternal.isView(this.postToShow.embeds[0])){
                    //Is a QRT with external embed
                    return true;
                }
                else if(this.postToShow?.embeds && this.postToShow.embeds.length>0 && AppBskyEmbedExternal.isView(this.postToShow.embeds[0].media)){
                    //Is a QRT with external embed (GIF) with Text ?? not sure
                    return true;
                }
            }
            return false;
        },
        /**
         * Method that figures out what object to pass on to the `ImageContainer` component
         * based on what type of data configuration the current Post has.
         * @returns `ViewImage[]` containing Post images.
         */
        getPostImages():ViewImage[]{
            //This is a standalone/parent Post, not a QRT (Quote Retweet)
            if(!isViewRecord(this.postToShow)){
                if(this.postToShow?.embed && this.postToShow.embed.images){
                    //Is a parent Post with image(s)
                    return this.postToShow.embed.images as ViewImage[];
                }
                else if(this.postToShow?.embed && AppBskyEmbedRecordWithMedia.isView(this.postToShow.embed) && this.postToShow.embed.media.images){
                    //Is a parent Post with image(s) and a QRT
                    return this.postToShow.embed.media.images as ViewImage[];
                }
            }
            else{
                //This is a QRT
                if(this.postToShow?.embeds && this.postToShow.embeds.length>0 && this.postToShow.embeds[0].images){
                    //Is a QRT with image(s)
                    return this.postToShow.embeds[0].images as ViewImage[];
                }
                else if(this.postToShow?.embeds && this.postToShow.embeds.length>0 && this.postToShow.embeds[0].media &&
                    this.postToShow.embeds[0].media.images){
                    //Is a QRT with image(s)
                    return this.postToShow.embeds[0].media.images as ViewImage[];
                }
            }
            return [];
        },
        /**
         * Method that figures out what object to pass on to the `VideoContainer` component
         * based on what type of data configuration the current Post has.
         * @returns `AppBskyEmbedVideo.View` containing Video details.
         */
        getPostVideo():AppBskyEmbedVideo.View|undefined{
            if(!isViewRecord(this.postToShow)){
                if(this.postToShow?.embed && AppBskyEmbedVideo.isView(this.postToShow.embed)){
                    //Is a parent Post with video
                    return this.postToShow.embed;
                }
                else if(this.postToShow?.embed && AppBskyEmbedVideo.isView(this.postToShow.embed.media)){
                    //Is a parent Post with video and a QRT
                    return this.postToShow.embed.media;
                }
            }
            else{
                //This is a QRT
                if(this.postToShow?.embeds && AppBskyEmbedVideo.isView(this.postToShow.embeds[0])){
                    //Is a QRT with video
                    return this.postToShow.embeds[0];
                }
                else if(this.postToShow?.embeds && AppBskyEmbedRecordWithMedia.isView(this.postToShow.embeds[0]) &&
                AppBskyEmbedVideo.isView(this.postToShow.embeds[0].media)){
                    //Is a QRT with video
                    return this.postToShow.embeds[0].media;
                }
            }
            // return {cid:'',playlist:''};//Empty AppBskyEmbedVideo.View object, shouldn't ever be returned
            return undefined;
        },
        /**
         * Method that figures out what object to pass on to the `EmbedExternal` component
         * based on what type of data configuration the current Post has.
         * @returns `AppBskyEmbedExternal.View` containing external embed details.
         */
        getPostEmbed():AppBskyEmbedExternal.View|undefined{
            //This is the standalone/parent Post, not a QRT (Quote Retweet)
            if(!isViewRecord(this.postToShow)){
                if(this.postToShow?.embed && AppBskyEmbedExternal.isView(this.postToShow.embed)){
                    //Is a parent Post with external embed
                    return this.postToShow.embed;
                }
                else if(this.postToShow?.embed && this.postToShow.embed.media && AppBskyEmbedExternal.isView(this.postToShow.embed.media)){
                    //Is a parent Post with external embed and a QRT
                    return this.postToShow.embed.media;
                }
            }
            else{
                //This is a QRT
                if(this.postToShow?.embeds && AppBskyEmbedExternal.isView(this.postToShow.embeds[0])){
                    //Is a QRT with external embed
                    return this.postToShow.embeds[0];
                }
                else if(this.postToShow?.embeds && this.postToShow.embeds.length>0 && AppBskyEmbedExternal.isView(this.postToShow.embeds[0].media)){
                    //Is a QRT with external embed (GIF) with Text ?? not sure
                    return this.postToShow?.embeds[0].media;
                }
            }
        },
        getPostText():string{
            if(!isViewRecord(this.postToShow)) return this.postToShow?.record.text;
            else return this.postToShow.value.text;
        },
        /**
         * Method used to see if the User of the focused Post is verified.
         */
        isUserVerified(){
            let profile = this.postToShow?.author;
            if(profile != undefined && profile.verification && profile.verification.verifiedStatus == 'valid')
                return true;
            return false;
        },
        /**
         * Method used to check if this Post is a reply. Ensures it the `parent`
         * is a `PostView` as well.
         */
        isPostReply(){
            if(this.reply && isPostView(this.reply.parent)) return true;
            return false;
        }
    },
    created(){
        // console.log(this.postData); //DEBUG - missing object/variable catching
        // console.log('Has this post been deleted?');
        // console.log(isViewNotFound(this.postData));
        if(this.threadData) this.postToShow = this.threadData.post;
        else if(this.postData) this.postToShow = this.postData;
    }
})
</script>

<style scoped>
</style>