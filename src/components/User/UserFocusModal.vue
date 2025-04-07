<template>
    <div class="absolute z-10 flex w-full h-full bg-slate-800/60 backdrop-blur-sm">
        <div @click="closeModal" :class="$attrs.class" class="absolute z-10 w-full h-full"></div>
        <div class="relative z-20 flex flex-col max-w-[40rem] w-4/5 md:w-2/3s h-4/5 mx-auto my-auto rounded bg-slate-800
            drop-shadow-lg overflow-hidden">
            {{ void "Main Container" }}
            <div class="h-full overflow-auto">
                <div class="flex flex-col h-full">
                    {{ void "Posts + Post Type Filters" }}
                    <div class="flex flex-col min-h-0s grow items-center">
                        <div class="relative w-full">
                            <div class="bg-red-400 w-full max-h-40 aspect-[3/1] shrink-0 bg-no-repeat bg-center bg-cover"
                            :style="'background-image: url('+currentUserProfile.banner+')'"/>
                            <div class="absolute z-[3] flex bg-sky-400 rounded-full aspect-square size-24 top-[4.5rem]s top-28 left-4
                            items-center justify-center shrink-0 border-2 border-slate-800 bg-no-repeat bg-center bg-cover"
                            :style="'background-image: url('+currentUserProfile.avatar+')'">{{currentUserProfile ? '' : 'PFP'}}</div>
                        </div>
                        {{ void "User Details Content" }}
                        <div id="user-summary" class="flex z-[2] w-full sticky top-0 mt-10 py-2 px-4 bg-slate-800">
                            <div class="flex flex-col w-full">
                                <div class="flex justify-between overflow-hiddens">
                                    <div class="overflow-hidden">
                                        <div class="text-2xl font-semibold overflow-hidden text-ellipsis">{{currentUserProfile ? currentUserProfile.displayName : "Username Title"}}</div>
                                        <div class="text-xs">{{currentUserProfile ? '@'+currentUserProfile.handle : '@handle'}}</div>
                                    </div>
                                    <div class="relative flex items-center mt-1 gap-2 h-8">
                                        <Transition name="smooth">
                                            <FollowUser v-if="!awaitingProfileData" class="px-4" :is-user-followed="isUserFollowed"
                                            :user-did="currentUserProfile.did" :is-disabled="!AppState.isAuthBrowsing"/>
                                        </Transition>
                                        <PillButton class="aspect-square size-10">...</PillButton>
                                    </div>
                                </div>
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
                            </div>
                        </div>
                        <div class="flex flex-col py-2 px-4 mb-2 w-full border-y border-slate-600 shrink grow-0 self-start">
                            <div class="text-xs text-slate-500">Bio</div>
                            <RichPostText :post-text="currentUserProfile ? currentUserProfile.description : 'No Description'"/>
                        </div>
                        <div class="flex z-[2] w-full sticky text-center justify-between border-b border-slate-600 bg-slate-800"
                        :style="{'top':userSummaryHeight+'px'}">
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
                            backdrop-blur-0 overflow-x-hiddens">
                                <div v-for="n in currentUserAccountTimelineData.data.filter(
                                    x => x.post.embed && x.post.author.did == currentUserProfile.did &&
                                    (AppBskyEmbedImages.isView(x.post.embed) || AppBskyEmbedVideo.isView(x.post.embed)))"
                                    class="relative rounded aspect-square size-44 overflow-hidden border border-slate-600">
                                    <div v-if="n.post.embed.images && n.post.embed.images.length>1" class="select-none">
                                        <div class="absolute z-[3] flex rounded top-1 right-1 size-6 bg-slate-300 backdrop-blur-sm text-slate-900 font-bold items-center justify-center drop-shadow">{{ n.post.embed?.images.length }}</div>
                                        <div class="absolute z-[2] flex rounded top-1.5 right-0.5 size-6 bg-slate-300/60 text-slate-900 font-bold items-center justify-center drop-shadow"></div>
                                    </div>
                                    <div v-if="n.post.embed.images" class="absolute z-[2] rounded-md bottom-1 right-2 p-1 text-xs bg-black/70 select-none">Photo</div>
                                    <div v-else class="absolute z-[2] rounded-md bottom-1 right-2 p-1 text-xs bg-black/70 select-none">Video</div>
                                    <SpoilerOverlay class="z-[1]" :labels="n.post.labels" :has-sensitive-content="hasSensitiveContent(n)"/>
                                    <div @click="showMediaContent(n)" class="relative flex bg-violet-500 hover:bg-violet-300
                                    cursor-pointer w-full h-full bg-no-repeat bg-center bg-cover
                                    overflow-hidden backdrop-blur-0"
                                    :style="'background-image: url('+(n.post.embed.images ? n.post.embed.images[0].thumb : n.post.embed?.thumbnail)+')'">
                                    </div>
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
import SpoilerOverlay from '../Utilities/SpoilerOverlay.vue';

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
            userSummaryHeight:0
        }
    },
    components:{
        PillButton,
        Hashtag,
        FocusFeedPost,
        RichPostText,
        ImageContainer,
        VideoContainer,
        SpoilerOverlay,
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
            //check to see if user-summary height has changed
            this.getUserSummaryHeight();
        },
        /**
         * Method that determines if a particular Post's media contains
         * Sensitive Content.
         * */
        hasSensitiveContent(n:FeedViewPost){
            if(n.post.labels && n.post.labels.length>0) return true;
            return false;
        },
        /**
         * Method that gets the height of the `user-summary` element.
         * Used to make sure the "post category tabs" element is properly
         * "stickied".
         */
        getUserSummaryHeight(){
            console.log('Getting user-summary element:')
            console.log((document.getElementById('user-summary') as HTMLElement).clientHeight);
            this.userSummaryHeight = (document.getElementById('user-summary') as HTMLElement).clientHeight;
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
        },
    },
    async created() {
        await this.updateDisplayedData();
        this.getUserSummaryHeight();
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