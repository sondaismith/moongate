<template>
    <div v-if="postData && isViewBlocked(postData)">
        <div class="flex rounded-lg p-2 gap-1 border border-slate-700 items-center">
            <i-mingcute:information-line class="size-4"/>
            <div>Blocked</div>
        </div>
    </div>
    <div v-else-if="postData && isViewNotFound(postData)">
        <div class="flex rounded-lg p-2 gap-1 border border-slate-700 items-center">
            <i-mingcute:information-line class="size-4"/>
            <div>Deleted</div>
        </div>
    </div>
    <div v-else-if="postData" class="flex flex-col rounded-lg p-3 border border-slate-600 gap-2"
    :class="[$attrs.class, isReasonPin(postReason) ? 'pt-2' : '']">
        <div v-if="isReasonPin(postReason)" class="flex items-center text-slate-400 border-b
        border-slate-700 pb-1 select-none">
            <i-mdi:pin class="text-sm"/>
            <div class="font-bold text-xs">Pinned</div>
        </div>
        {{ void "Retweet Label" }}
        <div v-if="postReason && isReasonRepost(postReason) && !isViewRecord(postData)"
        class="flex rounded p-1 bg-slate-700 items-center text-sm">
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
                <div class="text-xs text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis" :title="postData.author.handle">@{{ postData.author.handle }}</div>
            </div>
            <div v-if="!isViewRecord(postData)" @click="openFocusDetails(0)" class="cursor-pointer text-slate-400 hover:text-slate-200 transition-colors hover:underline text-xs text-nowrap self-start ml-auto" :title="convertToLongTimestamp(postData.record.createdAt)">{{ convertToShortTimestamp(postData.record.createdAt) }}</div>
            <div v-else-if="isViewRecord(postData)" @click="openFocusDetails(0)" class="cursor-pointer text-slate-400 hover:text-slate-200 transition-colors hover:underline text-xs text-nowrap self-start ml-auto" :title="convertToLongTimestamp(postData.value.createdAt)">{{ convertToShortTimestamp(postData.value.createdAt) }}</div>
        </div>
        <div class="flex flex-col gap-2"
        :class="[isFeedPostStyle ? 'pl-12 pr-3' : '']">
            {{ void "Post Text Content" }}
            <RichPostText v-if="!isViewRecord(postData)" :post-text="postData.record.text"/>
            <RichPostText v-else :post-text="postData.value.text"/>
            {{ void "Post Media" }}
            <VideoContainer v-if="postData.embed && AppBskyEmbedVideo.isView(postData.embed.media)"
            :video-view="postData.embed.media" :labels="postData.labels" :author="postData.author.handle"/>
            <VideoContainer v-else-if="postData.embed && AppBskyEmbedVideo.isView(postData.embed)"
            :video-view="postData.embed" :labels="postData.labels" :author="postData.author.handle"/>
            <ImageContainer v-if="!isViewRecord(postData) && postData.embed && postData.embed.images"
            :images-to-display="postData.embed?.images" :labels="postData.labels"
            :author="postData.author.handle" @media-click="(i:number) => openFocusDetails(i)"/>
            <ImageContainer v-else-if="isViewRecord(postData) && postData.embeds && postData.embeds.length>0 && postData.embeds[0].images"
            :images-to-display="postData.embeds[0].images" :labels="postData.labels"
            :author="postData.author.handle" @media-click="(i:number) => openFocusDetails(i)"/>
            {{ void "1st Post w/External Embed, 2nd - Repost w/ External Embed" }}
            <div v-if="postData.embed && AppBskyEmbedExternal.isView(postData.embed)">
                <EmbedExternal :embed="postData.embed as View"/>
            </div>
            <div v-else-if="postData.embeds && postData.embeds.length>0">
                <EmbedExternal v-if="AppBskyEmbedExternal.isView(postData.embeds[0])" :embed="postData.embeds[0] as View"/>
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
import RichPostText from '../Utilities/RichPostText.vue';
import EmbedExternal from '../Utilities/EmbedExternal.vue';
import PostInteractionIcons from '../Post/PostInteractionIcons.vue';
import { isImage } from '@atproto/api/dist/client/types/app/bsky/embed/images';
import { showFocusModal } from '../../state/PostDetails.vue';
import { View } from '@atproto/api/dist/client/types/app/bsky/embed/external';

export default defineComponent({
    components:{
        ImageContainer,
        VideoContainer,
        RichPostText,
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
    created(){
        // console.log(this.postData); //DEBUG - missing object/variable catching
        // console.log('Has this post been deleted?');
        // console.log(isViewNotFound(this.postData));
    }
})
</script>

<style scoped>
</style>