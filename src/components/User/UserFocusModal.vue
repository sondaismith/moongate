<template>
    <div class="absolute z-10 flex w-full h-full bg-slate-800/60 backdrop-blur-sm">
        <div @click="closeModal" :class="$attrs.class" class="absolute z-10 w-full h-full"></div>
        <div class="relative z-20 flex flex-col w-4/5 md:w-2/3s h-4/5 mx-auto my-auto rounded bg-slate-800
            drop-shadow-lg overflow-hidden">
            <div class="bg-red-400 w-full h-40 shrink-0 bg-no-repeat bg-center bg-cover"
            :style="'background-image: url('+currentUserProfile.banner+')'">Banner</div>
            <div class="absolute flex bg-sky-400 rounded-full aspect-square size-24 top-28 left-4
            items-center justify-center shrink-0 border-2 border-slate-800 bg-no-repeat bg-center bg-cover"
            :style="'background-image: url('+currentUserProfile.avatar+')'">{{currentUserProfile ? '' : 'PFP'}}</div>
            {{ void "Main Container" }}
            <div class="p-4 h-full overflow-auto">
                <div class="flex flex-col h-full overflow-hiddens">
                    {{ void "User Details Content" }}
                    <div class="flex flex-col mb-2 shrink grow-0">
                        <div class="flex ml-auto gap-2 h-10">
                            <PillButton>+ Follow</PillButton>
                            <PillButton class="aspect-square size-10">...</PillButton>
                        </div>
                        <div class="text-2xl font-semibold">{{currentUserProfile ? currentUserProfile.displayName : "Username Title"}}</div>
                        <div class="text-xs">{{currentUserProfile ? '@'+currentUserProfile.handle : '@handle'}}</div>
                        <div class="flex mt-2">
                            <div class="flex text-sm pr-2">
                                <div class="font-bold pr-1">{{currentUserProfile ? currentUserProfile.followersCount : '1'}}</div>
                                <div class="text-slate-400">followers</div>
                            </div>
                            <div class="flex text-sm pr-2">
                                <div class="font-bold pr-1">{{currentUserProfile ? currentUserProfile.followsCount : '33'}}</div>
                                <div class="text-slate-400">following</div>
                            </div>
                            <div class="flex text-sm pr-2">
                                <div class="font-bold pr-1">{{currentUserProfile ? currentUserProfile.postsCount : '7'}}</div>
                                <div class="text-slate-400">posts</div>
                            </div>
                        </div>
                        <!-- <div v-html="currentUserProfile ? GenerateTagLinkText(currentUserProfile.description) : 'No Description'" class="leading-4 mt-2 whitespace-pre-wrap">
                        </div> -->
                        <!-- <div class="leading-4 mt-2 whitespace-pre-wrap">
                            {{ currentUserProfile ? currentUserProfile.description : 'No Description' }}
                        </div> -->
                        <RichPostText :post-text="currentUserProfile ? currentUserProfile.description : 'No Description'"/>
                    </div>
                    {{ void "Posts + Post Type Filters" }}
                    <div class="flex flex-col min-h-0 grow">
                        <div class="flex w-full text-center justify-between border-b border-slate-600">
                            <div @click="viewPosts" class="w-full hover:bg-slate-700 cursor-pointer">
                                <div class="pt-2 pb-1">Posts</div>
                                <div v-if="isViewingPosts" class="bg-blue-400 h-1 w-10 ml-auto mr-auto"></div>
                            </div>
                            <div @click="viewReplies" class="w-full hover:bg-slate-700 cursor-pointer">
                                <div class="pt-2 pb-1">Replies</div>
                                <div v-if="isViewingReplies" class="bg-blue-400 h-1 w-10 ml-auto mr-auto"></div>
                            </div>
                            <div @click="viewMedia" class="w-full hover:bg-slate-700 cursor-pointer">
                                <div class="pt-2 pb-1">Media</div>
                                <div v-if="isViewingMedia" class="bg-blue-400 h-1 w-10 ml-auto mr-auto"></div>
                            </div>
                        </div>
                        {{ void "General Posts" }}
                        <div v-if="isViewingPosts || isViewingReplies"
                        class="flex flex-col flex-wrap items-start py-2 gap-2">
                            <div v-for="n in currentUserAccountData.filter(x => !x.reply).slice(0,30) as FeedViewPost[]"
                            class="w-full max-w-[30rem] shrink-0s">
                                <FocusFeedPost :post-data="n.post" :post-reason="n.reason" @focus-post-avatar-clicked="updateDisplayedData"/>
                            </div>
                        </div>
                        {{ void "Media Posts" }}
                        <div v-if="isViewingMedia" class="py-4 w-full grid gap-2 self-center
                        grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] justify-items-center
                        overflow-x-hiddens">
                            <div @click="showMediaContent(n)" v-for="n in currentUserAccountData.filter(
                                x => x.post.embed && x.post.author.did == currentUserProfile.did &&
                                (AppBskyEmbedImages.isView(x.post.embed) || AppBskyEmbedVideo.isView(x.post.embed)))"
                            class="relative flex bg-violet-500 hover:bg-violet-300
                            cursor-pointer rounded aspect-square size-44 bg-no-repeat bg-center bg-cover"
                            :style="'background-image: url('+(n.post.embed.images ? n.post.embed.images[0].thumb : n.post.embed?.thumbnail)+')'">
                                <div v-if="n.post.embed.images" class="absolute rounded-md bottom-1 right-2 p-1 text-xs bg-black/70">Photo</div>
                                <div v-else class="absolute rounded-md bottom-1 right-2 p-1 text-xs bg-black/70">Video</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PillButton from '../Utilities/PillButton.vue';
import { postDetails, showFocusModal } from '../../state/PostDetails.vue';
import { AppState, toast } from '../../state/AppState.vue';
import { FeedViewPost, isReasonRepost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { AppBskyEmbedExternal, AppBskyEmbedImages, AppBskyEmbedRecord, AppBskyEmbedRecordWithMedia, AppBskyEmbedVideo, isDid } from '@atproto/api';
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { isImage } from '@atproto/api/dist/client/types/app/bsky/embed/images';
import { GenerateTagLinkText } from '../../helpers/parsers';
import Hashtag from '../Utilities/Hashtag.vue';
import RichPostText from '../Utilities/RichPostText.vue';
import { HandleAPIError, IsError } from '../../helpers/errors';
import { GetBrowsingAgent } from '../../lib/api.vue';
import ImageContainer from '../Utilities/ImageContainer.vue';
import AvatarRound from '../Utilities/AvatarRound.vue';
import { convertToLongTimestamp, convertToShortTimestamp } from '../../helpers/converters';
import EmbedExternal from '../Utilities/EmbedExternal.vue';
import VideoContainer from '../Utilities/VideoContainer.vue';
import FocusFeedPost from '../Feed/FocusFeedPost.vue';

export default defineComponent({
    data(){
        return{
            isImage,
            isReasonRepost,
            GenerateTagLinkText,
            convertToShortTimestamp,
            convertToLongTimestamp,
            AppBskyEmbedImages,
            AppBskyEmbedVideo,
            AppBskyEmbedRecord,
            AppBskyEmbedRecordWithMedia,
            AppBskyEmbedExternal,
            isViewingPosts:true,
            isViewingReplies:false,
            isViewingMedia:false,
            currentUserProfile:{} as ProfileViewDetailed,
            currentUserAccountData:[] as FeedViewPost[],
        }
    },
    components:{
        PillButton,
        Hashtag,
        FocusFeedPost,
        RichPostText,
        ImageContainer,
        VideoContainer,
        AvatarRound,
        EmbedExternal,
    },
    methods:{
        viewPosts(){
            this.isViewingPosts = true;
            this.isViewingReplies = this.isViewingMedia = false;
        },
        viewReplies(){
            this.isViewingReplies = true;
            this.isViewingPosts = this.isViewingMedia = false;
        },
        async viewMedia(){
            this.isViewingMedia = true;
            this.isViewingPosts = this.isViewingReplies = false;
            //Get media posts
            var userMedia = await GetBrowsingAgent().getAuthorFeed({
                actor:postDetails.currentUserAccountDID,
                filter:'posts_with_media',
            });
            this.currentUserAccountData = userMedia.data.feed;
        },
        closeModal(){
            AppState.HideUserFocusModal();
        },
        showMediaContent(post:FeedViewPost){
            postDetails.isFocusVisible = true;
            showFocusModal(post,0);
        },
        async updateDisplayedData(){
            if(isDid(postDetails.currentUserAccountDID)){
                var userProfile = await GetBrowsingAgent().getProfile({
                    actor:postDetails.currentUserAccountDID
                });
                var userTL = await GetBrowsingAgent().getAuthorFeed({
                    actor:postDetails.currentUserAccountDID,
                });
                if(IsError(userProfile)){
                    toast.add(HandleAPIError(userProfile as Error))
                }
                this.currentUserProfile = userProfile.data;
                this.currentUserAccountData = userTL.data.feed;
                console.log(this.currentUserAccountData);
            }
        }
    },
    async created() {
        this.updateDisplayedData();
    }
})

</script>

<style scoped>

</style>