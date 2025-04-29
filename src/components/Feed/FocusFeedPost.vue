<template>
    <div v-if="postData && isViewBlocked(postData)">
        <div class="flex rounded-lg p-2 gap-1 border border-outline items-center">
            <i-mingcute:information-line class="size-4"/>
            <div>Blocked</div>
        </div>
    </div>
    <div v-else-if="postData && isViewNotFound(postData)">
        <div class="flex rounded-lg p-2 gap-1 border border-outline items-center">
            <i-mingcute:information-line class="size-4"/>
            <div>Deleted</div>
        </div>
    </div>
    <div v-else-if="postData && isListView(postData)">
        <div class="flex flex-col rounded-lg p-2 gap-1 border border-outline overflow-hidden select-none"
        title="Lists are not yet supported">
            <div class="flex gap-2">
                <!-- <AvatarRound :avatar="postData.avatar"/> -->
                <div class="bg-primary size-10 rounded-sm bg-contain border border-outline" :style="'background-image:url('+postData.avatar+')'"></div>
                <div class="flex flex-col gap-1s">
                    <div class="leading-5">{{ postData.record }}</div>
                    <div class="text-sm text-secondary">Starter Pack by @{{ postData.creator.handle }}</div>
                </div>
            </div>
            <div class="flex text-sm leading-4">{{ postData.description }}</div>
        </div>
    </div>
    <div v-else-if="postData && isStarterPackViewBasic(postData)">
        <div class="flex flex-col rounded-lg p-2 gap-1 border border-outline overflow-hidden select-none"
        title="Starter Packs are not yet supported">
            <div class="flex gap-2">
                <div class="relative shrink-0 size-10 rounded-sm text-postFocusBG bg-contain border border-outline" :style="'background-image:url('+postData.creator.avatar+')'">
                    <i-solar:box-minimalistic-bold-duotone class="absolute z-[1] w-full h-full"/>
                    <div class="absolute w-full h-full bg-primary/10s"></div>
                </div>
                <div class="flex flex-col overflow-hidden">
                    <div class="leading-5 text-nowrap overflow-hidden text-ellipsis">{{ postData.record.name }}</div>
                    <div class="text-sm text-secondary text-nowrap w-full overflow-hidden text-ellipsis">By @{{ postData.creator.handle }}</div>
                </div>
            </div>
            <div class="flex text-sm leading-4">{{ postData.record.description }}</div>
        </div>
    </div>
    <div v-else-if="postData" class="flex flex-col rounded-lg p-3 border border-slate-600 gap-2 text-primary"
    :class="[$attrs.class, isReasonPin(postReason) ? 'pt-2' : '']">
        <div v-if="isReasonPin(postReason)" class="flex items-center text-secondary border-b
        border-outline pb-1 select-none">
            <i-mdi:pin class="text-sm"/>
            <div class="font-bold text-xs">Pinned</div>
        </div>
        {{ void "Retweet Label" }}
        <div v-if="postReason && isReasonRepost(postReason) && !isViewRecord(postData)"
        class="flex rounded p-1 bg-postMsg items-center text-sm">
            <div class="flex grow-0 shrink-0 justify-end px-1">
                <i-mdi:twitter-retweet/>
            </div>
            <div class="text-nowrap overflow-hidden text-ellipsis"
            :title="postReason.by.displayName">
                Reposted by {{ postReason.by.displayName }}
            </div>
        </div>
        {{ void "Post Profile Header" }}
        <div class="flex items-center gap-2">
            <AvatarRound :avatar="postData.author.avatar" :did="postData.author.did" @avatar-clicked="callFocusPostAvatarClicked(postData.author.did)"/>
            <div class="flex flex-col overflow-hidden">
                <div class="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis" :title="postData.author.displayName">{{ postData.author.displayName }}</div>
                <div class="text-xs text-secondary whitespace-nowrap overflow-hidden text-ellipsis" :title="postData.author.handle">@{{ postData.author.handle }}</div>
            </div>
            <div v-if="!isViewRecord(postData)" @click="openFocusDetails(0)" class="cursor-pointer text-secondary hover:text-secondaryHover transition-colors hover:underline text-xs text-nowrap self-start ml-auto" :title="convertToLongTimestamp(postData.record.createdAt)">{{ convertToShortTimestamp(postData.record.createdAt) }}</div>
            <div v-else-if="isViewRecord(postData)" @click="openFocusDetails(0)" class="cursor-pointer text-secondary hover:text-secondaryHover transition-colors hover:underline text-xs text-nowrap self-start ml-auto" :title="convertToLongTimestamp(postData.value.createdAt)">{{ convertToShortTimestamp(postData.value.createdAt) }}</div>
        </div>
        <div class="flex flex-col gap-2"
        :class="[isFeedPostStyle ? 'pl-12 pr-3' : '']">
            {{ void "Post Text Content" }}
            <RichPostTextBsky v-if="!isViewRecord(postData)" :post-text="postData.record.text"/>
            <RichPostTextBsky v-else :post-text="postData.value.text"/>
            {{ void "Post Media" }}
            <ImageContainer v-if="postContainsImage" :images-to-display="getPostImages"
            :labels="postData.labels" :author="postData.author.handle"
            @media-click="(i:number) => openFocusDetails(i)"/>
            <VideoContainer v-if="postContainsVideo" :video-view="getPostVideo"
            :labels="postData.labels" :author="postData.author.handle"/>
            <div v-if="postContainsExternalEmbed">
                <EmbedExternal :embed="getPostEmbed"/>
            </div>
            {{ void "Reposts - ViewRecord and View" }}
            <FocusFeedPost v-if="postData.embed?.record && postData.embed?.record.record && AppBskyEmbedRecord.isViewRecord(postData.embed.record.record)"
            :post-data="postData.embed.record.record" :post-reason="postReason" @focus-post-avatar-clicked="callFocusPostAvatarClicked"/>
            <FocusFeedPost v-else-if="postData.embed && AppBskyEmbedRecord.isView(postData.embed)"
            :post-data="postData.embed.record" :post-reason="postReason" @focus-post-avatar-clicked="callFocusPostAvatarClicked"/>
            {{ void "Post Interaction Buttons/Icons" }}
            <PostInteractionIcons class="pb-0" :num-comments="postData.replyCount"
            :num-shares="postData.repostCount" :num-likes="postData.likeCount"/>
        </div>
    </div>
</template>

<script lang="ts">
import { isReasonPin, isReasonRepost, PostView, ReasonPin, ReasonRepost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { AppBskyEmbedExternal, AppBskyEmbedImages, AppBskyEmbedRecord, AppBskyEmbedRecordWithMedia, AppBskyEmbedVideo, isDid, RepostRecord } from '@atproto/api';
import { defineComponent, PropType } from 'vue'
import { convertToLongTimestamp, convertToShortTimestamp } from '../../helpers/converters';
import { isViewBlocked, isViewNotFound, isViewRecord } from '@atproto/api/dist/client/types/app/bsky/embed/record';
import ImageContainer from '../Utilities/ImageContainer.vue';
import VideoContainer from '../Utilities/VideoContainer.vue';
import AvatarRound from '../Utilities/AvatarRound.vue';
import RichPostText from '../Utilities/RichPostText.vue';
import EmbedExternal from '../Utilities/EmbedExternal.vue';
import PostInteractionIcons from '../Post/PostInteractionIcons.vue';
import { isImage, ViewImage } from '@atproto/api/dist/client/types/app/bsky/embed/images';
import { showFocusModal } from '../../state/PostDetails.vue';
import { View } from '@atproto/api/dist/client/types/app/bsky/embed/external';
import RichPostTextBsky from '../Utilities/RichPostTextBsky.vue';
import { isListView, isStarterPackViewBasic } from '@atproto/api/dist/client/types/app/bsky/graph/defs';

export default defineComponent({
    components:{
        ImageContainer,
        VideoContainer,
        AvatarRound,
        RichPostText,
        RichPostTextBsky,
        EmbedExternal,
        PostInteractionIcons,
    },
    props:{
        postData: Object as PropType<PostView>,
        postReason: Object as PropType<ReasonRepost|ReasonPin>,
        isFeedPostStyle:{
            type:Boolean,
            default:false
        }
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
            convertToLongTimestamp,
            convertToShortTimestamp,
            AppBskyEmbedImages,
            AppBskyEmbedVideo,
            AppBskyEmbedRecord,
            AppBskyEmbedRecordWithMedia,
            AppBskyEmbedExternal,
        }
    },
    emits:{
        /**Emits the DID value of the User associated with the clicked avatar. */
        focusPostAvatarClicked:(userDid:string) => {
            if(isDid(userDid)) return true;
            else return false;
        },
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
         * Method used to display a particular post in the `FocusFeedPost` component.
         * @param mediaIndex The index of the media content to initially show.
         */
        openFocusDetails(mediaIndex:number){
            if(this.postData){
                // postDetails.showFocusModal(this.postData, mediaIndex);
                showFocusModal({post: this.postData}, mediaIndex);
                //update `PostDetailIcons` in `Post` State
                // postDetails.updatePostDetailIconValues(this.postData.post.replyCount.toString(),this.postData.post.repostCount.toString(),this.postData.post.likeCount.toString());
            }
        },
    },
    computed:{
        /**
         * Determines if the current Post data held by the component contains any images.
         */
        postContainsImage(){
            //This is the standalone/parent Post, not a QRT (Quote Retweet)
            if(!isViewRecord(this.postData)){
                if(this.postData?.embed && this.postData.embed.images){
                    //Is a parent Post with image(s)
                    return true;
                }
                else if(this.postData?.embed && AppBskyEmbedRecordWithMedia.isView(this.postData.embed) && this.postData.embed.media.images){
                    //Is a parent Post with image(s) and a QRT
                    return true;
                }
            }
            else{
                //This is a QRT
                if(this.postData?.embeds && this.postData.embeds.length>0 && this.postData.embeds[0].images){
                    //Is a QRT with image(s)
                    return true;
                }
            }
            return false;
        },
        /**
         * Determines if the current Post data held by the component contains any video.
         */
        postContainsVideo(){
            //This is the standalone/parent Post, not a QRT (Quote Retweet)
            if(!isViewRecord(this.postData)){
                if(this.postData?.embed && AppBskyEmbedVideo.isView(this.postData.embed)){
                    //Is a parent Post with video
                    return true;
                }
                else if(this.postData?.embed && AppBskyEmbedVideo.isView(this.postData.embed.media)){
                    //Is a parent Post with video and a QRT
                    return true;
                }
            }
            else{
                //This is a QRT
                if(this.postData?.embeds && AppBskyEmbedVideo.isView(this.postData.embeds[0])){
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
            if(!isViewRecord(this.postData)){
                if(this.postData?.embed && AppBskyEmbedExternal.isView(this.postData.embed)){
                    //Is a parent Post with external embed
                    return true;
                }
                else if(this.postData?.embed && this.postData.embed.media && AppBskyEmbedExternal.isView(this.postData.embed.media)){
                    //Is a parent Post with video and a QRT
                    return true;
                }
            }
            else{
                //This is a QRT
                if(this.postData?.embeds && AppBskyEmbedExternal.isView(this.postData.embeds[0])){
                    //Is a QRT with video
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
            if(!isViewRecord(this.postData)){
                if(this.postData?.embed && this.postData.embed.images){
                    //Is a parent Post with image(s)
                    return this.postData.embed.images as ViewImage[];
                }
                else if(this.postData?.embed && AppBskyEmbedRecordWithMedia.isView(this.postData.embed) && this.postData.embed.media.images){
                    //Is a parent Post with image(s) and a QRT
                    return this.postData.embed.media.images as ViewImage[];
                }
            }
            else{
                //This is a QRT
                if(this.postData?.embeds && this.postData.embeds.length>0 && this.postData.embeds[0].images){
                    //Is a QRT with image(s)
                    return this.postData.embeds[0].images as ViewImage[];
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
            if(!isViewRecord(this.postData)){
                if(this.postData?.embed && AppBskyEmbedVideo.isView(this.postData.embed)){
                    //Is a parent Post with video
                    return this.postData.embed;
                }
                else if(this.postData?.embed && AppBskyEmbedVideo.isView(this.postData.embed.media)){
                    //Is a parent Post with video and a QRT
                    return this.postData.embed.media;
                }
            }
            else{
                //This is a QRT
                if(this.postData?.embeds && AppBskyEmbedVideo.isView(this.postData.embeds[0])){
                    //Is a QRT with video
                    return this.postData.embeds[0];
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
            if(!isViewRecord(this.postData)){
                if(this.postData?.embed && AppBskyEmbedExternal.isView(this.postData.embed)){
                    //Is a parent Post with external embed
                    return this.postData.embed;
                }
                else if(this.postData?.embed && this.postData.embed.media && AppBskyEmbedExternal.isView(this.postData.embed.media)){
                    //Is a parent Post with external embed and a QRT
                    return this.postData.embed.media;
                }
            }
            else{
                //This is a QRT
                if(this.postData?.embeds && AppBskyEmbedExternal.isView(this.postData.embeds[0])){
                    //Is a QRT with video
                    return this.postData.embeds[0];
                }
            }
        }
    },
    created(){
        // console.log(this.postData); //DEBUG - missing object/variable catching
        // console.log('Has this post been deleted?');
        // console.log(isViewNotFound(this.postData));
    }
})
</script>

<style scoped>
</style>