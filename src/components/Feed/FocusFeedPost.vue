<template>
    <div v-if="postData" class="flex flex-col rounded-lg p-3 border border-slate-700 gap-2">
        {{ void "Retweet Label" }}
        <div v-if="postData.reason && isReasonRepost(postData.reason)"
        class="flex rounded p-1 bg-slate-700 items-center text-sm">
            <div class="flex grow-0 shrink-0 justify-end px-1">
                <i-mdi:twitter-retweet/>
            </div>
            <div class="text-nowrap overflow-hidden text-ellipsis"
            :title="postData.reason.by.displayName">
                Reposted by {{ postData.reason.by.displayName }}
            </div>
        </div>
        {{ void "Post Profile Header" }}
        <div class="flex items-center gap-2">
            <AvatarRound :avatar="postData.post.author.avatar" :did="postData.post.author.did" @avatar-clicked="callFocusPostAvatarClicked(postData.post.author.did)"/>
            <div class="flex flex-col">
                <div class="text-sm font-semibold">{{ postData.post.author.displayName }}</div>
                <div class="text-xs text-slate-400">@{{ postData.post.author.handle }}</div>
            </div>
            <div class="text-xs text-nowrap self-start ml-auto" :title="convertToLongTimestamp(postData.post.record.createdAt)">{{ convertToShortTimestamp(postData.post.record.createdAt) }}</div>
        </div>
        {{ void "Post Text Content" }}
        <RichPostText :post-text="postData.post.record.text"/>
        {{ void "Post Embed Content" }}
        <div v-if="postData.post.embed && (AppBskyEmbedRecord.isView(postData.post.embed))"
        class="rounded bg-slate-900 border border-slate-700">Embed Type Record Here</div>
        {{ void "Post embed record with media" }}
        <div v-if="postData.post.embed && (AppBskyEmbedRecordWithMedia.isView(postData.post.embed))"
        class="flex flex-col rounded-lg gap-2">
            <VideoContainer v-if="postData.post.embed.media && AppBskyEmbedVideo.isView(postData.post.embed.media)" :video-view="postData.post.embed.media"/>
            <div v-for="em in postData.post.embed.record" class="flex flex-col rounded-lg bg-purple-800s p-3
            border border-slate-700 text-xs gap-2">
                <div class="flex items-center gap-1">
                    <AvatarRound class="size-7" :avatar="(em as ViewRecord).author.avatar"/>
                    <div class="flex gap-1">
                        <div class="font-semibold">{{ em.author.displayName }}</div>
                        <div class="text-slate-400">@{{ em.author.handle }}</div>
                    </div>
                    <div class="text-nowrap ml-auto" :title="convertToLongTimestamp(em.value.createdAt)">{{ convertToShortTimestamp(em.value.createdAt) }}</div>
                </div>
                <RichPostText :post-text="em.value.text" class="text-sm"/>
                <EmbedExternal v-if="em.value.embed && AppBskyEmbedExternal.isMain(em.value.embed)" :embed="em as ViewRecord"/>
            </div>
        </div>
        <ImageContainer v-if="postData.post.embed && postData.post.embed.images"
        :images-to-display="postData.post.embed?.images"/>
            <PostInteractionIcons class="pb-0" :num-comments="postData.post.replyCount"
            :num-shares="postData.post.repostCount" :num-likes="postData.post.likeCount"/>
    </div>
</template>

<script lang="ts">
import { FeedViewPost, isReasonRepost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { AppBskyEmbedExternal, AppBskyEmbedImages, AppBskyEmbedRecord, AppBskyEmbedRecordWithMedia, AppBskyEmbedVideo, isDid } from '@atproto/api';
import { defineComponent, PropType } from 'vue'
import { convertToLongTimestamp, convertToShortTimestamp } from '../../helpers/converters';
import { ViewRecord } from '@atproto/api/dist/client/types/app/bsky/embed/record';
import ImageContainer from '../Utilities/ImageContainer.vue';
import VideoContainer from '../Utilities/VideoContainer.vue';
import RichPostText from '../Utilities/RichPostText.vue';
import EmbedExternal from '../Utilities/EmbedExternal.vue';
import PostInteractionIcons from '../Post/PostInteractionIcons.vue';

export default defineComponent({
    components:{
        ImageContainer,
        VideoContainer,
        RichPostText,
        EmbedExternal,
        PostInteractionIcons,
    },
    props:{
        postData: Object as PropType<FeedViewPost>,
    },
    data(){
        return{
            isReasonRepost,
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
        }
    },
    methods:{
        callFocusPostAvatarClicked(did:string){
            this.$emit('focusPostAvatarClicked',did)
        }
    }
})
</script>

<style scoped>
</style>