<template>
    <div class="absolute z-10 flex w-full h-full bg-slate-800/60 backdrop-blur-sm outline-none" tabindex="0">
        <div @click="closeModal" :class="$attrs.class" class="absolute z-10 w-full h-full"></div>
        <div class="relative z-20 flex flex-col max-w-[40rem] w-4/5 md:w-2/3s h-4/5 mx-auto my-auto rounded bg-slate-800
            drop-shadow-lg overflow-hidden">
            {{ void "Main Container" }}
            <div id="user-focus-container" class="h-full overflow-auto outline-none" tabindex="0">
                <div class="flex flex-col h-full">
                    {{ void "Posts + Post Type Filters" }}
                    <div class="flex flex-col min-h-0s grow items-center">
                        <div id="user-modal-navbar" class="flex z-[4] bg-slate-900 sticky top-0 h-8 w-full self-start
                        border-b border-slate-700 *:h-full *:cursor-pointer *:w-12">
                            <i-mingcute:arrow-left-fill @click="goToPreviousNavHistory"
                            class="hover:bg-slate-700" :class="[{'text-gray-600' : !hasPrevNavRecords}]"/>
                            <i-mingcute:arrow-right-fill @click="goToNextNavHistory"
                            class="hover:bg-slate-700" :class="[{'text-gray-600' : !hasNextNavRecords}]"/>
                        </div>
                        {{ void "Banner+PFP Placeholder" }}
                        <div v-if="awaitingProfileData" class="relative w-full animate-pulse z-[3]">
                            <div class="bg-slate-500 w-full max-h-40 aspect-[3/1] shrink-0"/>
                            <div class="absolute bg-slate-400 rounded-full size-24 top-[4.5rem]s top-28 left-4
                            shrink-0 border-2 border-slate-800"></div>
                        </div>
                        <div v-else class="relative w-full">
                            <div class="bg-red-400 w-full max-h-40 aspect-[3/1] shrink-0 bg-no-repeat bg-center bg-cover"
                            :style="'background-image: url('+UserFocusModalState.GetCurrentHistoryData().ProfileData.banner+')'"/>
                            <div class="absolute z-[3] flex bg-sky-400 rounded-full aspect-square size-24 top-[4.5rem]s top-28 left-4
                            items-center justify-center shrink-0 border-2 border-slate-800 bg-no-repeat bg-center bg-cover"
                            :style="'background-image: url('+UserFocusModalState.GetCurrentHistoryData().ProfileData.avatar+')'">{{UserFocusModalState.GetCurrentHistoryData().ProfileData ? '' : 'PFP'}}</div>
                        </div>
                        {{ void "User Details Content" }}
                        <div id="user-summary" class="flex flex-col z-[2] w-full sticky top-8 mt-10 py-2 px-4 bg-slate-800">
                            <div v-if="awaitingProfileData" class="flex flex-col w-full mt-1 gap-2 animate-pulse">
                                <div class="flex gap-2">
                                    <div class="flex flex-col w-full gap-1">
                                        <div class="h-9 rounded bg-slate-500"></div>
                                        <div class="h-3 w-48 rounded bg-slate-500"></div>
                                    </div>
                                    <div class="relative flex gap-3">
                                        <div class="h-9 w-[6.5rem] rounded-full bg-slate-500"></div>
                                        <div class="h-9 aspect-square rounded-full bg-slate-500"></div>
                                    </div>
                                </div>
                                <div class="flex gap-2">
                                    <div class="flex gap-1">
                                        <div class="h-5 w-8 bg-slate-500 rounded"></div>
                                        <div class="h-5 w-16 bg-slate-500 rounded"></div>
                                    </div>
                                    <div class="flex gap-1">
                                        <div class="h-5 w-8 bg-slate-500 rounded"></div>
                                        <div class="h-5 w-16 bg-slate-500 rounded"></div>
                                    </div>
                                    <div class="flex gap-1">
                                        <div class="h-5 w-8 bg-slate-500 rounded"></div>
                                        <div class="h-5 w-16 bg-slate-500 rounded"></div>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="flex flex-col w-full">
                                <div class="flex justify-between overflow-hiddens">
                                    <div class="overflow-hidden">
                                        <div class="text-2xl font-semibold overflow-hidden text-ellipsis">{{UserFocusModalState.GetCurrentHistoryData().ProfileData ? UserFocusModalState.GetCurrentHistoryData().ProfileData.displayName : "Username Title"}}</div>
                                        <div class="text-xs">{{UserFocusModalState.GetCurrentHistoryData().ProfileData ? '@'+UserFocusModalState.GetCurrentHistoryData().ProfileData.handle : '@handle'}}</div>
                                    </div>
                                    <div class="relative flex items-center mt-1 gap-2 h-8">
                                        <Transition name="smooth">
                                            <FollowUser v-if="!awaitingProfileData" class="px-4" :is-user-followed="isUserFollowed"
                                            :user-did="UserFocusModalState.GetCurrentHistoryData().ProfileData.did" :is-disabled="!AppState.isAuthBrowsing"/>
                                        </Transition>
                                        <PillButton class="aspect-square size-10">...</PillButton>
                                    </div>
                                </div>
                                <div class="flex mt-2">
                                    <div class="flex text-sm pr-2">
                                        <div class="font-bold pr-1">{{UserFocusModalState.GetCurrentHistoryData() ? UserFocusModalState.GetCurrentHistoryData().ProfileData.followersCount : '1'}}</div>
                                        <div class="text-slate-400">followers</div>
                                    </div>
                                    <div class="flex text-sm pr-2">
                                        <div class="font-bold pr-1">{{UserFocusModalState.GetCurrentHistoryData() ? UserFocusModalState.GetCurrentHistoryData().ProfileData.followsCount : '33'}}</div>
                                        <div class="text-slate-400">following</div>
                                    </div>
                                    <div class="flex text-sm pr-2">
                                        <div class="font-bold pr-1">{{UserFocusModalState.GetCurrentHistoryData() ? UserFocusModalState.GetCurrentHistoryData().ProfileData.postsCount : '7'}}</div>
                                        <div class="text-slate-400">posts</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="user-focus-bio" class="flex flex-col py-2 px-4 mb-2s w-full border-y border-slate-600 shrink grow-0 self-start">
                            <div class="text-xs text-slate-500">Bio</div>
                            <div v-if="awaitingProfileData" class="flex flex-col gap-1 animate-pulse">
                                <div class="bg-slate-500 rounded h-4 w-4/5"></div>
                                <div class="bg-slate-500 rounded h-4 w-2/3"></div>
                                <div class="bg-slate-500 rounded h-4 w-3/5"></div>
                            </div>
                            <RichPostText v-else :post-text="UserFocusModalState.GetCurrentHistoryData().ProfileData ? UserFocusModalState.GetCurrentHistoryData().ProfileData.description : 'No Description'"/>
                        </div>
                        <div id="user-post-tabs" class="flex z-[2] w-full sticky text-center justify-between border-b border-slate-600 bg-slate-800"
                        :style="{'top':userSummaryBottomPos+'px'}">
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
                            {{ void "Placeholder Post" }}
                            <div v-if="awaitingProfileData || isAwaitingTabSwitchData" class="flex flex-col w-full p-2 gap-2 rounded-lg border border-slate-600 animate-pulse">
                                <div class="flex h-10 gap-2">
                                    <div class="rounded-full size-10 bg-slate-500"></div>
                                    <div class="flex flex-col gap-1 overflow-hidden">
                                        <div class="h-5 w-24 rounded bg-slate-500"></div>
                                        <div class="h-4 w-20 rounded bg-slate-500"></div>
                                    </div>
                                    <div class="h-3 w-20 rounded bg-slate-500 ml-auto"></div>
                                </div>
                                <div class="flex flex-col w-full gap-1 mt-1">
                                    <div class="h-5 w-3/5 rounded bg-slate-500"></div>
                                    <div class="h-5 w-4/5 rounded bg-slate-500"></div>
                                    <div class="h-5 w-2/5 rounded bg-slate-500"></div>
                                </div>
                                <div class="h-48 rounded-lg p-2 border border-slate-600">
                                    <div class="w-full h-full rounded bg-slate-500"></div>
                                </div>
                                <div class="flex justify-between">
                                    <div class="flex gap-1">
                                        <div class="h-5 w-6 rounded-lg bg-slate-500"></div>
                                        <div class="h-5 w-8 rounded-lg bg-slate-500"></div>
                                    </div>
                                    <div class="flex gap-1">
                                        <div class="h-5 w-6 rounded-lg bg-slate-500"></div>
                                        <div class="h-5 w-8 rounded-lg bg-slate-500"></div>
                                    </div>
                                    <div class="flex gap-1">
                                        <div class="h-5 w-6 rounded-lg bg-slate-500"></div>
                                        <div class="h-5 w-8 rounded-lg bg-slate-500"></div>
                                    </div>
                                    <div class="flex gap-1">
                                        <div class="h-5 w-6 rounded-lg bg-slate-500"></div>
                                        <div class="h-5 w-8 rounded-lg bg-slate-500"></div>
                                    </div>
                                    <div class="flex gap-1">
                                        <div class="h-5 w-6 rounded-lg bg-slate-500"></div>
                                        <div class="h-5 w-8 rounded-lg bg-slate-500"></div>
                                    </div>
                                </div>
                            </div>
                            <div v-else-if="!awaitingProfileData" v-for="n in UserFocusModalState.GetCurrentHistoryData().FeedData.data.filter(x => !x.reply) as FeedViewPost[]"
                            class="w-full shrink-0s">
                                <FocusFeedPost :post-data="n.post" :post-reason="n.reason" @focus-post-avatar-clicked="updateDisplayedData"/>
                            </div>
                            <div v-if="!awaitingProfileData && !UserFocusModalState.GetCurrentHistoryData().FeedData.cursor"
                            class="flex justify-center rounded p-1 gap-1 w-full items-center
                            border border-slate-600 bg-slate-700 select-none">
                                <i-mdi:block/>
                                <div>End of posts</div>
                            </div>
                            <div v-else-if="!awaitingProfileData && UserFocusModalState.GetCurrentHistoryData().FeedData.cursor" @click="loadOlderPosts"
                            class="flex justify-center rounded p-1 gap-1 w-full items-center cursor-pointer
                            border border-slate-600 bg-slate-700 hover:bg-slate-600">
                                <i-mingcute:loading-fill v-if="isAwaitingLoadMorePosts" class="spinner"/>
                                <i-mingcute:plus-fill v-else/>
                                <div>Load more</div>
                            </div>
                        </div>
                        {{ void "Media Posts" }}
                        <div v-if="isViewingMedia" class="py-4 w-full">
                            <div v-if="awaitingProfileData || isAwaitingTabSwitchData" class="grid gap-2 self-center
                            grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] justify-items-center
                            backdrop-blur-0 overflow-x-hiddens">
                                <div v-for="x in 6" class="size-44 rounded bg-slate-500 border border-slate-600 animate-pulse"></div>
                            </div>
                            <div v-else-if="!awaitingProfileData" class="grid gap-2 self-center
                            grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] justify-items-center
                            backdrop-blur-0 overflow-x-hiddens">
                                <div v-for="n in UserFocusModalState.GetCurrentHistoryData().FeedData.data.filter(
                                    x => x.post.embed && x.post.author.did == UserFocusModalState.currentUserAccountDID &&
                                    (AppBskyEmbedImages.isView(x.post.embed) || AppBskyEmbedVideo.isView(x.post.embed)))"
                                    class="relative rounded aspect-square size-44 overflow-hidden border border-slate-600">
                                    <div v-if="n.post.embed.images && n.post.embed.images.length>1" class="select-none">
                                        <div class="absolute z-[3] flex rounded top-2 right-2 size-6 bg-slate-300 backdrop-blur-sm text-slate-900 font-bold items-center justify-center drop-shadow">{{ n.post.embed?.images.length }}</div>
                                        <div class="absolute z-[2] flex rounded top-[5px] right-[5px] size-6 bg-slate-300/60 text-slate-900 font-bold items-center justify-center drop-shadow"></div>
                                    </div>
                                    <div v-if="n.post.embed.images" class="absolute z-[2] rounded-md bottom-1 right-1 p-1 text-xs bg-black/70 select-none">Photo</div>
                                    <div v-else class="absolute z-[2] rounded-md bottom-1 right-1 p-1 text-xs bg-black/70 select-none">Video</div>
                                    <SpoilerOverlay class="z-[1]" :labels="n.post.labels" :has-sensitive-content="hasSensitiveContent(n)" :media-type="n.post.embed?.images ? MediaType.Image : MediaType.Video"/>
                                    <div @click="showMediaContent(n)" class="relative flex bg-violet-500 hover:bg-violet-300
                                    cursor-pointer w-full h-full bg-no-repeat bg-center bg-cover
                                    overflow-hidden backdrop-blur-0"
                                    :title="n.post.embed?.images ? n.post.embed?.images[0].alt : null"
                                    :style="'background-image: url('+(n.post.embed.images ? n.post.embed.images[0].thumb : n.post.embed?.thumbnail)+')'">
                                    </div>
                                </div>
                            </div>
                            <div v-if="!UserFocusModalState.GetCurrentHistoryData().FeedData.cursor"
                            class="flex justify-center rounded p-1 gap-1 mt-4 w-full items-center
                            border border-slate-600 bg-slate-700 select-none">
                                <i-mdi:block/>
                                <div>End of posts</div>
                            </div>
                            <div v-else-if="UserFocusModalState.GetCurrentHistoryData().FeedData.cursor && !isAwaitingTabSwitchData" @click="loadOlderPosts"
                            class="flex justify-center rounded p-1 gap-1 mt-4 mx-4 w-fulls items-center cursor-pointer
                            border border-slate-600 bg-slate-700 hover:bg-slate-600">
                                <i-mingcute:loading-fill v-if="isAwaitingLoadMorePosts" class="spinner"/>
                                <i-mingcute:plus-fill v-else/>
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
import { UserFocusModalState } from '../../state/UserFocusModalState.vue';
import { MediaType } from '../../enums/PostEnums';

export default defineComponent({
    data(){
        return{
            AppState,
            UserFocusModalState,
            MediaType,
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
            userSummaryBottomPos:0
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
        /**Prepares and displays data when the "Posts" tab is clicked. */
        async viewPosts(){
            if(!this.awaitingProfileData){
                this.repositionScrollOnTabSwitch();
                this.isViewingPosts = true;
                this.isViewingReplies = this.isViewingMedia = false;
                this.isAwaitingTabSwitchData = true;
                await GetBrowsingAgent().getAuthorFeed({
                    actor:UserFocusModalState.currentUserAccountDID,
                    includePins:true
                })
                .then(res => {
                    // this.currentUserAccountTimelineData.data = res.data.feed;
                    // this.currentUserAccountTimelineData.cursor = res.data.cursor;
                    UserFocusModalState.GetCurrentHistoryData().FeedData.data = res.data.feed;
                    UserFocusModalState.GetCurrentHistoryData().FeedData.cursor = res.data.cursor;
                })
                .catch(err => toast.add(HandleAPIError(err, `Error getting @${this.currentUserProfile.handle}'s timeline`)));
                this.isAwaitingTabSwitchData = false;
            }
        },
        viewReplies(){
            if(!this.awaitingProfileData){
                this.isViewingReplies = true;
                this.isViewingPosts = this.isViewingMedia = false;
            }
        },
        /**Prepares and displays data when the "Media" tab is clicked. */
        async viewMedia(){
            if(!this.awaitingProfileData){
                this.repositionScrollOnTabSwitch();
                this.isViewingMedia = true;
                this.isViewingPosts = this.isViewingReplies = false;
                this.isAwaitingTabSwitchData = true;
                //Get media posts
                await GetBrowsingAgent().getAuthorFeed({
                    actor:UserFocusModalState.currentUserAccountDID,
                    filter:'posts_with_media',
                })
                .then(res => {
                    UserFocusModalState.GetCurrentHistoryData().FeedData.data = res.data.feed;
                    UserFocusModalState.GetCurrentHistoryData().FeedData.cursor = res.data.cursor;
                })
                .catch(err => toast.add(HandleAPIError(err, `Error getting @${this.currentUserProfile.handle}'s media`)));
                this.isAwaitingTabSwitchData = false;
            }
        },
        async loadOlderPosts(){
            this.isAwaitingLoadMorePosts = true;
            // await GetFeedDataForFeedType(FeedEnums.Types.User,this.currentUserProfile.did,'',this.currentUserAccountTimelineData.cursor)
            await GetFeedDataForFeedType(FeedEnums.Types.User,UserFocusModalState.currentUserAccountDID,'', UserFocusModalState.GetCurrentHistoryData().FeedData.cursor)
            .then(res => {
                res.data.forEach(post => {
                    UserFocusModalState.GetCurrentHistoryData().FeedData.data.push(post);
                });
                UserFocusModalState.GetCurrentHistoryData().FeedData.cursor = res.cursor;
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
            if(isDid(UserFocusModalState.currentUserAccountDID)){
                //Update the current navigation history item if we are navigating to a new
                //user account after the initial starting one
                if(UserFocusModalState.navigationHistory.length > 0) this.updateCurrentNavHistoryScrollPos();
                this.awaitingProfileData = true;
                var userProfile:AppBskyActorGetProfile.Response;
                await GetBrowsingAgent().getProfile({
                    actor:UserFocusModalState.currentUserAccountDID
                })
                .then(res => {
                    this.currentUserProfile = res.data
                });
                var userTL;
                await GetBrowsingAgent().getAuthorFeed({
                    actor:UserFocusModalState.currentUserAccountDID,
                    includePins:true
                })
                .then(res => {
                    //If the current history index is not at the end of the array, drop
                    //all of the items in front of the current index
                    if(UserFocusModalState.currentNavIndex < UserFocusModalState.navigationHistory.length-1) UserFocusModalState.navigationHistory.splice(UserFocusModalState.currentNavIndex+1);
                    //Add the latest User Account page to the history array
                    UserFocusModalState.navigationHistory.push({FeedData:{data:res.data.feed,cursor:res.data.cursor},ProfileData:this.currentUserProfile,scrollPos:0});
                    //Move to the newly added User account - will not occur if there is only one item (initial state)
                    if(UserFocusModalState.navigationHistory.length > 1) this.goToNextNavHistory(false);
                    // setTimeout(() => {
                    //     this.setUserSummaryBottomPos();
                    //     this.scrollToModalPos(0);
                    // }, 10);
                })
                .catch(err => toast.add(HandleAPIError(err, `Error getting @${this.currentUserProfile.handle}'s timeline`)));
                console.log(UserFocusModalState.GetCurrentHistoryData().ProfileData);
                this.awaitingProfileData = false;

            }

            //check to see if user-summary height has changed
            //small delay to allow DOM to update
            setTimeout(() => {
                this.setUserSummaryBottomPos();
            }, 10);
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
         * Method that sets the bottom position of the `user-summary` element.
         * Used to make sure the "post category tabs" element is properly
         * "stickied".
         */
        setUserSummaryBottomPos(){
            // console.log('Getting user-summary element:')
            // console.log((document.getElementById('user-summary') as HTMLElement).clientHeight);
            let navbarHeight = (document.getElementById('user-modal-navbar') as HTMLElement).getBoundingClientRect().height;
            this.userSummaryBottomPos = navbarHeight + (document.getElementById('user-summary') as HTMLElement).getBoundingClientRect().height;
        },
        /**
         * Method that returns the scroll-top position needed so the "post tabs" will be
         * exactly at the top of the modal. Used by `repositionScrollOnTabSwitch()`
         * when switching tabs.
         */
        getUserFocusTabsScrollTopPos(){
            let bio = document.getElementById('user-focus-bio');
            let summary = document.getElementById('user-summary');
            if(summary){
                let navbarHeight = (document.getElementById('user-modal-navbar') as HTMLElement).getBoundingClientRect().height;
                let bioBottomPos = bio ? bio.offsetTop+bio.getBoundingClientRect().height : 0;
                return bioBottomPos-(navbarHeight + summary.getBoundingClientRect().height);
            }
            return 0;
        },
        /**
         * Method used to adjust `user-focus-container` scroll position when tab is switched.
         * Will only update scroll when user has scrolled "past" tabs (the Post content has scrolled
         * up past the tabs). Used when switching tabs.
         */
        repositionScrollOnTabSwitch(){
            let userFocusContainer = (document.getElementById('user-focus-container') as HTMLElement);
            let targetTabPos = this.getUserFocusTabsScrollTopPos();
            //only reposition if user has scrolled past tabs
            if(userFocusContainer && userFocusContainer.scrollTop >= targetTabPos){
                this.scrollToModalPos(targetTabPos);
            }
        },
        /**
         * Method used to scroll to position in `UserFocusModal`. Used
         * when loading/switching "main content" to improve the UX.
         * @param newPos The scroll position to move to.
         * @param behavior The scroll behavior to use. Defaults to instant.
         */
        scrollToModalPos(newPos:number, behavior:ScrollBehavior = 'instant'){
            let userFocusContainer = (document.getElementById('user-focus-container') as HTMLElement);
            // console.log(userFocusContainer.scrollTop);
            userFocusContainer.scrollTo({top:newPos,behavior:behavior});
            // console.log(userFocusContainer.scrollTop);
        },
        /**
         * Method that calls `PrevNavHistory` to display the previous
         * User Account in the modal's navigation history.
         */
        goToPreviousNavHistory(){
            this.updateCurrentNavHistoryScrollPos();
            UserFocusModalState.PrevNavHistory();
            this.restoreScrollPosAfterNavHistoryChange();
        },
        /**
         * Method that calls `NextNavHistory` to display the next
         * User Account in the modal's navigation history.
         */
        goToNextNavHistory(updateScrollPos:boolean = true){
            if(updateScrollPos) this.updateCurrentNavHistoryScrollPos();
            UserFocusModalState.NextNavHistory();
            this.restoreScrollPosAfterNavHistoryChange();
        },
        /**
         * Method that updates the currently viewed "Navigation History" object's
         * `scrollPos`. Used to keep track of the scroll position the user was in
         * the feed before navigating forward or backwards.
         */
        updateCurrentNavHistoryScrollPos(){
            let userFocusContainer = (document.getElementById('user-focus-container') as HTMLElement);
            UserFocusModalState.GetCurrentHistoryData().scrollPos = userFocusContainer.scrollTop;
        },
        /**
         * Method that restores the last scroll position the `UserFocusModal` had when
         * viewing the "Navigation History" object that has just been displayed. Called
         * when navigating forwards and backwards through the history.
         */
        restoreScrollPosAfterNavHistoryChange(){
            setTimeout(() => {
                this.scrollToModalPos(UserFocusModalState.GetCurrentHistoryData().scrollPos);
            }, 100);
        },
        /**
         * Method used to navigate through the modal navigation history
         * if the shortcut Alt + Left Arrow or Alt + Right Arrow is pressed.
         * @param e Key down event.
         */
        onKeyboardShorcutEntered(e:KeyboardEvent){
            if(e.key == 'ArrowLeft' && e.altKey && !e.repeat){
                this.goToPreviousNavHistory();
            }
            else if(e.key == 'ArrowRight' && e.altKey && !e.repeat){
                this.goToNextNavHistory();
            }
            // else if(!e.repeat) console.log('Other key pressed: '+e.key);
        },
        /**
         * Method that adds support for navigating through the modal navigation history
         * using the Mouse "Browser Back" and "Browser Forwards" buttons.
         * @param e The MouseEvent fired.
         */
        onMouseShortcutEntered(e:MouseEvent){
            if(e.button == 3) this.goToPreviousNavHistory();
            else if (e.button == 4) this.goToNextNavHistory();
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
            if(UserFocusModalState.GetCurrentHistoryData().ProfileData.viewer && UserFocusModalState.GetCurrentHistoryData().ProfileData.viewer.following){
                return true;
            }
            return false;
        },
        hasPrevNavRecords(){
            if(UserFocusModalState.currentNavIndex < 1) return false;
            return true;
        },
        hasNextNavRecords(){
            if(UserFocusModalState.currentNavIndex < UserFocusModalState.navigationHistory.length-1) return true;
            return false;
        },
    },
    async created() {
        await this.updateDisplayedData();
        this.setUserSummaryBottomPos();
    },
    mounted() {
        //Add keyboard shortcut listener
        let modal = document.getElementById('user-focus-container');
        this.$el.addEventListener('keydown', this.onKeyboardShorcutEntered);
        this.$el.addEventListener('mouseup', this.onMouseShortcutEntered);
        if(modal) modal.focus(); //focus modal
    },
    beforeUnmount() {
        UserFocusModalState.currentNavIndex = 0;
        UserFocusModalState.navigationHistory = [];
        //Remove keyboard shortcut listener
        this.$el.removeEventListener('keydown', this.onKeyboardShorcutEntered);
        this.$el.removeEventListener('mouseup', this.onMouseShortcutEntered);
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