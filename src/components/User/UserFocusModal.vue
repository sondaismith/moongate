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
                <div class="flex flex-col h-full">
                    {{ void "User Details Content" }}
                    <div class="flex flex-col mb-2 shrink grow-0">
                        <div class="flex ml-auto gap-2 h-10">
                            <Transition name="smooth">
                                <FollowUser v-if="!awaitingProfileData" class="px-4" :is-user-followed="isUserFollowed"
                                :user-did="currentUserProfile.did" :is-disabled="!AppState.isAuthBrowsing"/>
                            </Transition>
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
                    <div class="flex flex-col min-h-0 grow items-center">
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
                        class="flex flex-col flex-wrap items-start py-2 gap-2 max-w-[30rem] w-full">
                            <div v-for="n in currentUserAccountTimelineData.data.filter(x => !x.reply) as FeedViewPost[]"
                            class="w-full shrink-0s">
                                <FocusFeedPost :post-data="n.post" :post-reason="n.reason" @focus-post-avatar-clicked="updateDisplayedData"/>
                            </div>
                            <div v-if="!currentUserAccountTimelineData.cursor"
                            class="flex justify-center rounded p-1 gap-1 w-full items-center
                            border border-slate-600 bg-slate-700 select-none">
                                <i-mdi:block/>
                                <div>End of posts</div>
                            </div>
                            <div v-else @click="loadOlderPosts"
                            class="flex justify-center rounded p-1 gap-1 w-full items-center cursor-pointer
                            border border-slate-600 bg-slate-700 hover:bg-slate-600">
                                <i-mingcute:loading-fill v-if="isAwaitingLoadMorePosts" class="spinner"/>
                                <i-mingcute:plus-fill v-else/>
                                <div>Load more</div>
                            </div>
                        </div>
                        {{ void "Media Posts" }}
                        <div v-if="isViewingMedia" class="py-4 w-full">
                            <div class="grid gap-2 self-center
                            grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] justify-items-center
                            overflow-x-hiddens">
                                <div @click="showMediaContent(n)" v-for="n in currentUserAccountTimelineData.data.filter(
                                    x => x.post.embed && x.post.author.did == currentUserProfile.did &&
                                    (AppBskyEmbedImages.isView(x.post.embed) || AppBskyEmbedVideo.isView(x.post.embed)))"
                                class="relative flex bg-violet-500 hover:bg-violet-300
                                cursor-pointer rounded aspect-square size-44 bg-no-repeat bg-center bg-cover"
                                :style="'background-image: url('+(n.post.embed.images ? n.post.embed.images[0].thumb : n.post.embed?.thumbnail)+')'">
                                    <div v-if="n.post.embed.images && n.post.embed.images.length>1" class="select-none">
                                        <div class="absolute z-[1] flex rounded top-1 right-1 size-6 bg-slate-300 backdrop-blur-sm text-slate-900 font-bold items-center justify-center drop-shadow">{{ n.post.embed?.images.length }}</div>
                                        <div class="absolute flex rounded top-1.5 right-0.5 size-6 bg-slate-300/60 text-slate-900 font-bold items-center justify-center drop-shadow"></div>
                                    </div>
                                    <div v-if="n.post.embed.images" class="absolute rounded-md bottom-1 right-2 p-1 text-xs bg-black/70 select-none">Photo</div>
                                    <div v-else class="absolute rounded-md bottom-1 right-2 p-1 text-xs bg-black/70 select-none">Video</div>
                                </div>
                            </div>
                            <div v-if="!currentUserAccountTimelineData.cursor"
                            class="flex justify-center rounded p-1 gap-1 mt-4 w-full items-center
                            border border-slate-600 bg-slate-700 select-none">
                                <i-mdi:block/>
                                <div>End of posts</div>
                            </div>
                            <div v-else @click="loadOlderPosts"
                            class="flex justify-center rounded p-1 gap-1 mt-4 w-fulls items-center cursor-pointer
                            border border-slate-600 bg-slate-700 hover:bg-slate-600">
                                <div>Load more</div>
                            </div>
                        </div>
                    </div>
                </div>
                <ToContainerTop class="right-3 bottom-2"/>
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
import { AppBskyActorGetProfile, AppBskyEmbedExternal, AppBskyEmbedImages, AppBskyEmbedRecord, AppBskyEmbedRecordWithMedia, AppBskyEmbedVideo, isDid } from '@atproto/api';
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { isImage } from '@atproto/api/dist/client/types/app/bsky/embed/images';
import { GenerateTagLinkText } from '../../helpers/parsers';
import Hashtag from '../Utilities/Hashtag.vue';
import RichPostText from '../Utilities/RichPostText.vue';
import { HandleAPIError } from '../../helpers/errors';
import { GetBrowsingAgent } from '../../lib/api.vue';
import ImageContainer from '../Utilities/ImageContainer.vue';
import AvatarRound from '../Utilities/AvatarRound.vue';
import { convertToLongTimestamp, convertToShortTimestamp } from '../../helpers/converters';
import EmbedExternal from '../Utilities/EmbedExternal.vue';
import VideoContainer from '../Utilities/VideoContainer.vue';
import FocusFeedPost from '../Feed/FocusFeedPost.vue';
import FollowUser from '../Utilities/FollowUser.vue';
import ToContainerTop from '../Utilities/ToContainerTop.vue';
import { IFeedReturnedPostResults } from '../../interfaces/FeedInterfaces';
import { GetFeedDataForFeedType } from '../../state/FeedList.vue';
import { FeedEnums } from '../../enums/FeedEnums';

export default defineComponent({
    data(){
        return{
            AppState,
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
            awaitingProfileData:false,
            isAwaitingTabSwitchData:false,
            isAwaitingLoadMorePosts:false,
            currentUserProfile:{} as ProfileViewDetailed,
            currentUserAccountTimelineData:{data:[],cursor:''} as IFeedReturnedPostResults,
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
        FollowUser,
        ToContainerTop,
    },
    methods:{
        async viewPosts(){
            this.isViewingPosts = true;
            this.isViewingReplies = this.isViewingMedia = false;
            this.isAwaitingTabSwitchData = true;
            await GetBrowsingAgent().getAuthorFeed({
                actor:postDetails.currentUserAccountDID,
                includePins:true
            })
            .then(res => {
                this.currentUserAccountTimelineData.data = res.data.feed;
                this.currentUserAccountTimelineData.cursor = res.data.cursor;
            })
            .catch(err => toast.add(HandleAPIError(err, `Error getting @${this.currentUserProfile.handle}'s timeline`)));
            this.isAwaitingTabSwitchData = false;
        },
        viewReplies(){
            this.isViewingReplies = true;
            this.isViewingPosts = this.isViewingMedia = false;
        },
        async viewMedia(){
            this.isViewingMedia = true;
            this.isViewingPosts = this.isViewingReplies = false;
            this.isAwaitingTabSwitchData = true;
            //Get media posts
            await GetBrowsingAgent().getAuthorFeed({
                actor:postDetails.currentUserAccountDID,
                filter:'posts_with_media',
            })
            .then(res => {
                this.currentUserAccountTimelineData.data = res.data.feed;
                this.currentUserAccountTimelineData.cursor = res.data.cursor;
            })
            .catch(err => toast.add(HandleAPIError(err, `Error getting @${this.currentUserProfile.handle}'s media`)));
            this.isAwaitingTabSwitchData = false;
        },
        async loadOlderPosts(){
            this.isAwaitingLoadMorePosts = true;
            await GetFeedDataForFeedType(FeedEnums.Types.User,this.currentUserProfile.did,'',this.currentUserAccountTimelineData.cursor)
            .then(res => {
                res.data.forEach(post => {
                    this.currentUserAccountTimelineData.data.push(post);
                });
                this.currentUserAccountTimelineData.cursor = res.cursor;
            })
            .catch(err => toast.add(HandleAPIError(err, `Error loading more posts`)));
            this.isAwaitingLoadMorePosts = false;
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
                this.awaitingProfileData = true;
                var userProfile:AppBskyActorGetProfile.Response;
                await GetBrowsingAgent().getProfile({
                    actor:postDetails.currentUserAccountDID
                })
                .then(res => {
                    this.currentUserProfile = res.data
                });
                var userTL;
                await GetBrowsingAgent().getAuthorFeed({
                    actor:postDetails.currentUserAccountDID,
                    includePins:true
                })
                .then(res => {
                    this.currentUserAccountTimelineData.data = res.data.feed;
                    this.currentUserAccountTimelineData.cursor = res.data.cursor;
                })
                .catch(err => toast.add(HandleAPIError(err, `Error getting @${this.currentUserProfile.handle}'s timeline`)));
                console.log(this.currentUserAccountTimelineData);
                this.awaitingProfileData = false;
            }
        }
    },
    computed:{
        /**
         * Method that checks to see if the User is following the currently displayed account.
         * In order for this value to be accurate, we must wait until the API call finishes, so
         * `awaitingProfileData` must be false. Currently handled via v-if on the `FollowUser`
         * component above.
         */
        isUserFollowed(){
            if(this.currentUserProfile.viewer && this.currentUserProfile.viewer.following){
                return true;
            }
            return false;
        }
    },
    async created() {
        await this.updateDisplayedData();
    }
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

.smooth-enter-active,
.smooth-leave-active {
  transition: opacity 0.3s ease, transform 0.4s ease;
}

.smooth-enter-from,
.smooth-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>