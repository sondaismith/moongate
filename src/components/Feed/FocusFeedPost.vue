<template>
    <div v-if="isAccountBlocked" class="flex flex-col items-center p-1 py-2 text-primary bg-primary/10">
        <div class="text-base">Account blocked</div>
        <!-- <div>{{ postToShow.author.displayName }}</div> -->
        <div class="text-xs">{{ postToShow.author.handle }}</div>
        <button class="flex items-center gap-1 rounded px-1 cursor-pointer hover:bg-primary/10 shadow-none"
        @click="requestToggleBlock" title="Undo account block">
            <i-solar:undo-left-round-bold v-if="!isAwaitingAccountBlockAction"/>
            <i-mingcute:loading-fill v-else class="spinner"/>
            <div class="text-blueskyBlue">Undo?</div>
        </button>
    </div>
    <div v-else-if="typeof postToShow != 'undefined' && AppBskyEmbedRecord.isViewBlocked(postToShow)">
        <div class="flex rounded-lg p-2 gap-1 border border-outline items-center">
            <i-mingcute:information-line class="size-4"/>
            <div>Blocked</div>
        </div>
    </div>
    <div v-else-if="typeof postToShow != 'undefined' && AppBskyEmbedRecord.isViewNotFound(postToShow)">
        <div class="flex rounded-lg p-2 gap-1 border border-outline items-center">
            <i-mingcute:information-line class="size-4"/>
            <div>Deleted</div>
        </div>
    </div>
    <div v-else-if="typeof postToShow != 'undefined' && AppBskyEmbedRecord.isViewDetached(postToShow)">
        <div class="flex rounded-lg p-2 gap-1 border border-outline items-center">
            <i-mingcute:information-line class="size-4"/>
            <div>Removed by author</div>
        </div>
    </div>
    <div v-else-if="typeof postToShow != 'undefined' && AppBskyGraphDefs.isListView(postToShow)">
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
    <div v-else-if="typeof postToShow != 'undefined' && AppBskyGraphDefs.isStarterPackViewBasic(postToShow)">
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
    <div v-else-if="typeof postToShow != 'undefined' && AppBskyFeedDefs.isGeneratorView(postToShow)">
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
    <div v-else-if="typeof postToShow != 'undefined'" class="flex flex-col rounded-lg border border-slate-600 text-primary w-full"
    :class="[$attrs.class, AppBskyFeedDefs.isReasonPin(postReason) ? 'pt-2' : '', isReplyStyle ? 'border-0' : 'gap-2 p-3 pb-1.5',
        isFeedPostStyle ? 'p-1.5' : ''
    ]">
        <div v-if="AppBskyFeedDefs.isReasonPin(postReason)" class="flex items-center text-secondary border-b
        border-outline pb-1 select-none">
            <i-mdi:pin class="text-sm"/>
            <div class="font-bold text-xs">Pinned</div>
        </div>
        {{ void "Retweet Label" }}
        <div v-if="postReason && AppBskyFeedDefs.isReasonRepost(postReason) && !AppBskyEmbedRecord.isViewRecord(postToShow)"
        class="flex rounded px-2 p-1 bg-postMsg items-center text-sm gap-1">
            <div class="flex grow-0 shrink-0 justify-end">
                <i-mdi:twitter-retweet/>
            </div>
            <div class="text-nowrap overflow-hidden text-ellipsis"
            :title="postReason.by.displayName">
                Reposted by {{ postReason.by.displayName }}
            </div>
            <div class="ml-auto text-nowrap text-secondary text-[10px] leading-[14px]"
            :title="convertToLongTimestamp(postReason.indexedAt)">
                {{ convertToShortTimestamp(postReason.indexedAt) }}
            </div>
        </div>
        <button v-else-if="postToShow && isPostReply.isReply && !isReplyStyle" @click="openPostParent(getParentPostURI)"
        data-testid="focusfeedpost-view-parent" :disabled="isAwaitingParentPostHandle" title="Open Parent Post"
        class="flex gap-1 items-center self-start py-0.5 px-1 rounded-md text-[10px] leading-3 text-primary
        bg-btn hover:bg-btnHover hover:border-transparent disabled:bg-disabled cursor-pointer
        disabled:cursor-default shadow-none select-none">
            <i-mingcute:loading-fill v-if="isAwaitingParentPostHandle" class="spinner"/>
            <div>View Parent</div>
        </button>
        <div data-testid="focusFeedPost" class="flex w-full">
            <div>
                <AvatarRound v-if="isReplyStyle" data-testid="focusFeedPost-avatarRound" :author-details="postToShow.author"/>
                <div v-if="replyIndex !=undefined && totalReplies!=undefined && replyIndex<totalReplies" class="h-full bg-slate-700 w-0.5 m-auto"></div>
            </div>
            <div class="flex flex-col w-full min-w-0"
            :class="[isReplyStyle ? 'pl-2' : '']">
                {{ void "Post Profile Header" }}
                <div class="flex items-center gap-2">
                    <AvatarRound v-if="!isReplyStyle" data-testid="focusFeedPost-avatarRound" :author-details="postToShow.author"
                    @avatar-clicked="callFocusPostAvatarClicked(postToShow.author.did)"/>
                    <div class="flex overflow-hidden self-starts" :class="[isReplyStyle ? 'gap-1 items-center' : 'flex-col']">
                        <div class="flex items-center gap-1 overflow-hidden">
                            <div class="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis" :title="postToShow.author.displayName">
                                {{ postToShow.author.displayName }}
                            </div>
                            <VerifiedBadge v-if="isUserVerified" class="size-4"/>
                        </div>
                        <div class="text-xs text-secondary whitespace-nowrap overflow-hidden text-ellipsis" :title="postToShow.author.handle">@{{ postToShow.author.handle }}</div>
                    </div>
                    <div class="self-start ml-auto">
                        <button v-if="isPostBookmarked" @click="toggleBookmark" :disabled="isAwaitingBookmarkUpdate" class="group flex items-center rounded-none cursor-pointer
                        gap-1 hover:bg-btnSubtles text-secondary shadow-none hover:border-transparent active:bg-transparent active:border-transparent disabled:cursor-not-allowed disabled:text-disabled"
                        :title="isPostBookmarked ? 'Remove Bookmark' : 'Save Post'">
                            <i-mingcute:loading-fill v-if="isAwaitingBookmarkUpdate" class="text-primary spinner self-center size-3"/>
                            <i-mingcute:bookmark-line v-if="!isPostBookmarked" class="group-active:text-postBookmarkActive group-hover:text-postBookmarkHover"/>
                            <i-mingcute:bookmark-fill v-else class="text-postBookmark group-hover:text-postBookmarkHover group-active:text-postBookmarkActive group-disabled:text-disabled"/>
                        </button>
                    </div>
                    <!-- <div v-if="!isViewRecord(postToShow)" data-test="focusFeedPost-timestamp-button" @click="isReplyStyle ? emitThreadReplyClicked(threadData ? threadData : undefined) : openFocusDetails(0)" class="cursor-pointer text-secondary hover:text-secondaryHover transition-colors hover:underline text-xs text-nowrap self-start text-right" :title="convertToLongTimestamp(postToShow.record.createdAt)">{{ convertToShortTimestamp(postToShow.record.createdAt) }}</div>
                    <div v-else-if="isViewRecord(postToShow)" data-test="focusFeedPost-timestamp-button" @click="isReplyStyle ? emitThreadReplyClicked(threadData ? threadData : undefined) : openFocusDetails(0)" class="cursor-pointer text-secondary hover:text-secondaryHover transition-colors hover:underline text-xs text-nowrap self-start text-right" :title="convertToLongTimestamp(postToShow.value.createdAt)">{{ convertToShortTimestamp(postToShow.value.createdAt) }}</div> -->
                    <RouterLink v-if="!AppBskyEmbedRecord.isViewRecord(postToShow)" :to="getGeneratedPostUri()" @keydown.space="openPostInPostFocusModal"
                    data-testid="focusFeedPost-timestamp-button" class="cursor-pointer text-secondary hover:text-secondaryHover transition-colors hover:underline text-xs
                    text-nowrap self-start text-right outline outline-2 outline-transparent focus-visible:outline-focusBorder" :title="convertToLongTimestamp(postToShow.record.createdAt)">{{ convertToShortTimestamp(postToShow.record.createdAt) }}</RouterLink>
                    <RouterLink v-else-if="AppBskyEmbedRecord.isViewRecord(postToShow)" :to="getGeneratedPostUri()" @keydown.space="openPostInPostFocusModal"
                    data-testid="focusFeedPost-timestamp-button" class="cursor-pointer text-secondary hover:text-secondaryHover transition-colors hover:underline text-xs
                    text-nowrap self-start text-right outline outline-2 outline-transparent focus-visible:outline-focusBorder" :title="convertToLongTimestamp(postToShow.value.createdAt)">{{ convertToShortTimestamp(postToShow.value.createdAt) }}</RouterLink>
                </div>
                <div class="flex flex-col"
                :class="[isFeedPostStyle ? 'pl-12 pr-3' : '', isReplyStyle ? 'gap-2' : 'pt-2 gap-2']">
                    {{ void "Post Text Content" }}
                    <RichPostTextBsky data-testid="focusFeedPost-text" v-if="!AppBskyEmbedRecord.isViewRecord(postToShow)" :post-text="(postToShow.record as AppBskyFeedPost.Record).text" :post-facets="(postToShow.record as AppBskyFeedPost.Record).facets"/>
                    <!-- Is Quoted Post -->
                    <RichPostTextBsky data-testid="focusFeedPost-text" v-else :post-text="((postToShow as AppBskyEmbedRecord.ViewRecord).value as AppBskyFeedPost.Record).text" :post-facets="((postToShow as AppBskyEmbedRecord.ViewRecord).value as Record).facets"/>
                    {{ void "Post Media" }}
                    <!-- <ImageContainer v-if="postContainsImage" :images-to-display="getPostImages"
                    :labels="postToShow.labels" :author="postToShow.author.handle" :post-text="getPostText"
                    @media-click="(i:number) => isReplyStyle ? emitThreadReplyClicked(threadData ? threadData : undefined, i) : openFocusDetails(i)"/> -->
                    <!-- Add check to ensure postToShow is PostView -->
                    <ImageContainer v-if="postContainsImage" :images-to-display="getPostImages" :media-embed="getPostImages"
                    :labels="postToShow.labels" :author="postToShow.author.handle" :post-text="getPostText"
                    :post-id="getEndOfPostUri" @media-click="(i:number) => openFocusDetails(i)"/>
                    <VideoContainer v-if="postContainsVideo" :video-view="getPostVideo"
                    :labels="postToShow.labels" :author="postToShow.author.handle"/>
                    <EmbedExternal v-if="postContainsExternalEmbed" :embed="getPostEmbed" @media-click="(i:number) => isReplyStyle ? emitThreadReplyClicked(threadData ? threadData : undefined, i) : openFocusDetails(i)"
                    :author="postToShow.author.handle" :post-id="getEndOfPostUri"/>
                    {{ void "Reposts - ViewRecord and View" }}
                    <FocusFeedPost v-if="postToShow.embed?.record && postToShow.embed?.record.record && AppBskyEmbedRecord.isViewRecord(postToShow.embed.record.record)"
                    :post-data="postToShow.embed.record.record" :post-reason="postReason"
                    @focus-post-avatar-clicked="callFocusPostAvatarClicked" @thread-reply-clicked="emitThreadReplyClicked(postToShow.embed.record.record.uri)"/>
                    <FocusFeedPost v-else-if="postToShow.embed && AppBskyEmbedRecord.isView(postToShow.embed)"
                    :post-data="postToShow.embed.record" :post-reason="postReason"
                    @focus-post-avatar-clicked="callFocusPostAvatarClicked" @thread-reply-clicked="emitThreadReplyClicked(postToShow.embed.record.uri)"/>
                    {{ void "Post Interaction Buttons/Icons" }}
                    <PostInteractionIcons v-if="!hidePostMetrics" class="pb-0 !bg-lime-300s" :post-data="postToShow"/>
                </div>
                {{ void "Spacer for when interaction icons are hidden (usually when displaying Quoted post)" }}
                <div v-if="hidePostMetrics" class="h-1.5"></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { AppBskyEmbedExternal, AppBskyEmbedImages, AppBskyEmbedRecord, AppBskyEmbedRecordWithMedia, AppBskyEmbedVideo, AppBskyFeedDefs, AppBskyGraphDefs, AppBskyLabelerDefs, isDid } from '@atproto/api';
import { defineComponent, PropType } from 'vue'
import { convertToLongTimestamp, convertToShortTimestamp } from '../../helpers/converters';
import ImageContainer from '../Utilities/ImageContainer.vue';
import VideoContainer from '../Utilities/VideoContainer.vue';
import AvatarRound from '../Utilities/AvatarRound.vue';
import RichPostText from '../Utilities/RichPostText.vue';
import EmbedExternal from '../Utilities/EmbedExternal.vue';
import PostInteractionIcons from '../Post/PostInteractionIcons.vue';
import { postDetails } from '../../state/PostDetails.vue';
import RichPostTextBsky from '../Utilities/RichPostTextBsky.vue';
import VerifiedBadge from '../Utilities/VerifiedBadge.vue';
import { AppBskyFeedPost } from '@atproto/api';
import { getUserProfile, toggleBlock } from '../../lib/api/User.vue';
import { BookmarkPost, getPostImages, RemoveBookmark } from '../../lib/api/Post.vue';
import { AppState, toast } from '../../state/AppState.vue';

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
        postData: Object as PropType<AppBskyFeedDefs.PostView>|PropType<AppBskyEmbedRecord.ViewRecord>|PropType<AppBskyEmbedRecord.ViewNotFound>|PropType<AppBskyEmbedRecord.ViewBlocked>|PropType<AppBskyEmbedRecord.ViewDetached>|
            PropType<AppBskyFeedDefs.GeneratorView>|PropType<AppBskyGraphDefs.ListView>|PropType<AppBskyLabelerDefs.LabelerView>|PropType<AppBskyGraphDefs.StarterPackViewBasic>|PropType<{$type: string}>,
        /**Prop used to pass in Post details - used by "Reply-type" display components (`PostThreadView`). */
        threadData: Object as PropType<AppBskyFeedDefs.ThreadViewPost>,
        postReason: Object as PropType<AppBskyFeedDefs.ReasonRepost|AppBskyFeedDefs.ReasonPin>,
        isFeedPostStyle:{
            type:Boolean,
            default:false
        },
        isReplyStyle:{
            type:Boolean,
            default:false
        },
        /**Should the associated Post's metrics (number of likes etc.) be hidden? */
        hidePostMetrics:{
            type:Boolean,
            default:false
        },
        replyIndex:Number,
        totalReplies:Number,
        /**The `ReplyRef` object associated with the Post to display, if there is one. */
        replyRef: Object as PropType<AppBskyFeedDefs.ReplyRef>
    },
    data(){
        return{
            AppBskyFeedDefs,
            AppBskyGraphDefs,
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
            postToShow: {author:{did:'',handle:''},cid:'',indexedAt:'',record:{},uri:''} as AppBskyFeedDefs.PostView|AppBskyEmbedRecord.ViewRecord,//|ViewNotFound|ViewBlocked|ViewDetached|AppBskyFeedDefs.GeneratorView|AppBskyGraphDefs.ListView|AppBskyLabelerDefs.LabelerView|AppBskyGraphDefs.StarterPackViewBasic,
            /**Are we currently waiting for an action relating to blocking or unblocking a User account to finish? */
            isAwaitingAccountBlockAction:false,
            /**Are we currently waiting for an action relating to saving/removing a Post bookmark to finish? */
            isAwaitingBookmarkUpdate:false,
            /**Are we currently waiting for the account handle of the parent Post creator to be resolved? */
            isAwaitingParentPostHandle:false,
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
         * @param postThread The the new Post Thread context to display.
         * @param mediaIndex The Index of the media in the Post's collection to display.
         */
        threadReplyClicked:(postThread:AppBskyFeedDefs.ThreadViewPost|undefined,mediaIndex:number) => {
            // if(postThreadURI.trim() != '')
                return {postThread: postThread,mediaIndex};
            // else return false;
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
                // if(postDetails.isFocusVisible)
                //     this.emitThreadReplyClicked(this.postToShow.uri);
                // else
                //     showFocusModal(this.postToShow.uri, mediaIndex);
                let postDid:string|undefined = this.postToShow.uri.split('/').pop();
                if(AppBskyEmbedImages.isView(this.getPostImages) && this.getPostImages.images.length>0)
                    this.$router.push(`/profile/${this.postToShow.author.handle}/post/${postDid}/${mediaIndex}`);
                else if(AppBskyEmbedRecordWithMedia.isView(this.getPostImages) && AppBskyEmbedImages.isView(this.getPostImages.media) && this.getPostImages.media.images.length>0){
                    this.$router.push(`/profile/${this.postToShow.author.handle}/post/${postDid}/${mediaIndex}`);
                }
                else
                    this.$router.push(`/profile/${this.postToShow.author.handle}/post/${postDid}`);
                // this.$router.push({name:'postWithMedia', params:{handle: this.postToShow.author.handle, postDid:postDid, clickedMediaIndex:mediaIndex}});
            }
        },
        /**
         * Method used to generate a route used to display the interacted with Post in the
         * `PostFocusModal` component.
         * @param mediaIndex The index of the Post image to display. Default is 0.
         */
        getGeneratedPostUri(mediaIndex:number=0):string{
            let postDid = this.postToShow.uri.split('/').pop();
            // if(this.getPostImages.length>0)
            //     return `/profile/${this.postToShow.author.handle}/post/${postDid}/${mediaIndex}`;
            // else
                return `/profile/${this.postToShow.author.handle}/post/${postDid}`;
        },
        /**
         * Method used to open the parent Post of this Post in `PostFocusModal`, if it exists.
         * @param postURI The URI that points to the parent post.
         * @param mediaIndex The media index to initially show when displaying the parent post.
         */
        async openPostParent(postURI:string|undefined, mediaIndex:number=0){
            if(typeof this.postToShow != 'undefined' && typeof postURI != 'undefined' && !this.isAwaitingParentPostHandle){
                let accountDid = postURI.split('/')[2];
                let handle = '';
                if(this.isPostReply.hasFullParentInfo){
                    //If reply reference exists and parent is a PostView object
                    if(typeof this.replyRef != 'undefined' && AppBskyFeedDefs.isPostView(this.replyRef.parent)) handle = this.replyRef.parent.author.handle;
                    //need to handle `NotFoundPost` and `BlockedPost` situations as well
                }
                else{
                    //disable "View Parent of Reply" button until this resolves
                    this.isAwaitingParentPostHandle = true;
                    await getUserProfile(accountDid).then(res => {
                        handle = res.data.handle;
                    })
                    .catch(err => {
                        toast.add({summary:'Error Getting Parent Post', detail:`${err}`, severity:'error', group:'tr', life:3000});
                        //add route navigation to display current post once `UserFocusModal` has support for displaying parent/root posts
                    })
                    .finally(()=>{
                        //re-enable "View Parent of Reply" button
                        this.isAwaitingParentPostHandle = false;
                    })
                }
                if(handle.trim() != ''){
                    let postDid:string|undefined = postURI.split('/').pop();
                    this.$router.push(`/profile/${handle}/post/${postDid}`);
                }
            }
        },
        /**Method used to open the related Post in the `PostFocusModal` component when using keyboard input. */
        openPostInPostFocusModal(e:KeyboardEvent){
            e.preventDefault();
            this.$router.push(this.getGeneratedPostUri());
        },
        /**
         * Updates the Posts/Replies displayed in the PostFocusModal component.
         * Emits `threadReplyClicked` with URI of Post Thread to display.
         * @param newThread The  new Post Thread context to display.
         */
        emitThreadReplyClicked(newThread:AppBskyFeedDefs.ThreadViewPost|undefined, mediaIndex:number=0){
            // if(newThread.trim() != '')
                this.$emit('threadReplyClicked',newThread,mediaIndex);
        },
        /**
         * Method used to attempt to block/unblock the account associated with the
         * Post that was interacted with.
         */
        async requestToggleBlock(){
            if(this.isAwaitingAccountBlockAction) return;
            if(typeof this.postData != 'undefined'){
                this.isAwaitingAccountBlockAction = true;
                await toggleBlock(this.postData.author)
                .finally(() => {this.isAwaitingAccountBlockAction = false});
            }
        },
        /**
         * Toggles the "Bookmark" status of a Post. Requires login.
         */
        async toggleBookmark(){
            if(!AppState.checkIfLoggedIn('bookmark a Post')) return;
            this.isAwaitingBookmarkUpdate = true;
            if(this.isPostBookmarked){
                await RemoveBookmark(this.postToShow)
                .then(() => {
                    if(typeof this.postToShow.viewer != 'undefined') this.postToShow.viewer.bookmarked = false;
                    toast.add({summary:'Success',detail:`Bookmarked Removed`,severity:'success',group:'tr',life:3000});
                })
                .catch(err => {
                    toast.add({summary:'Error',detail:`${err}`,severity:'error',group:'tr',life:3000});
                    console.log(err);
                })
                .finally(() => {
                    this.isAwaitingBookmarkUpdate = false;
                })
            }
            else{
                await BookmarkPost(this.postToShow)
                .then(() => {
                    if(typeof this.postToShow.viewer != 'undefined') this.postToShow.viewer.bookmarked = true;
                    toast.add({summary:'Success',detail:`Post Bookmarked`,severity:'success',group:'tr',life:3000});
                })
                .catch(err => {
                    toast.add({summary:'Error',detail:`${err}`,severity:'error',group:'tr',life:3000});
                    console.log(err);
                })
                .finally(() => {
                    this.isAwaitingBookmarkUpdate = false;
                })
            }
        }
    },
    computed:{
        /**
         * Determines if the current Post data held by the component contains any images.
         */
        postContainsImage(){
            //This is the standalone/parent Post, not a QRT (Quote Retweet)
            if(!AppBskyEmbedRecord.isViewRecord(this.postToShow)){
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
            if(!AppBskyEmbedRecord.isViewRecord(this.postToShow)){
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
            if(!AppBskyEmbedRecord.isViewRecord(this.postToShow)){
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
        // getPostImages():ViewImage[]{
        getPostImages():AppBskyEmbedImages.View|AppBskyEmbedRecordWithMedia.View{
            if(typeof this.postToShow != 'undefined')
                // return getPostImages({post:this.postToShow});
                return getPostImages(this.postToShow);
            else return {images:[]};
        },
        /**
         * Method that figures out what object to pass on to the `VideoContainer` component
         * based on what type of data configuration the current Post has.
         * @returns `AppBskyEmbedVideo.View` containing Video details.
         */
        getPostVideo():AppBskyEmbedVideo.View|undefined{
            if(!AppBskyEmbedRecord.isViewRecord(this.postToShow)){
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
            if(!AppBskyEmbedRecord.isViewRecord(this.postToShow)){
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
        /**Returns the last bit of ID information held at the end of the URI that points to
         * the currently displayed Post. */
        getEndOfPostUri():string{
            let postId = this.postToShow.uri.split('/').pop();
            return typeof postId != 'undefined' ? postId : '';
        },
        getPostText():string{
            if(!AppBskyEmbedRecord.isViewRecord(this.postToShow)) return this.postToShow?.record.text;
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
         * Method used to check if this Post is a reply.
         */
        isPostReply():{isReply:boolean,hasFullParentInfo:boolean}{
            //ThreadViewPost that is reply (seen in Feed)
            if(this.replyRef && AppBskyFeedDefs.isPostView(this.replyRef.parent)) return {isReply:true,hasFullParentInfo:true};
            //Standalone PostView that is reply (likely seen as bookmark)
            else if(AppBskyFeedDefs.isPostView(this.postToShow) && AppBskyFeedPost.isMain(this.postToShow.record) && typeof (this.postToShow.record as AppBskyFeedPost.Main).reply != 'undefined')
                return {isReply:true,hasFullParentInfo:false}; //there's no way to know the state of the reply Post until accessing it when using this object...
            return {isReply:false,hasFullParentInfo:false};
        },
        /**Return the URI pointing to the Parent of this Post, if it exists. */
        getParentPostURI():string|undefined{
            if(this.isPostReply.isReply){
                if(typeof this.replyRef != 'undefined' && AppBskyFeedDefs.isPostView(this.replyRef.parent)) return this.replyRef.parent.uri;
                else if(AppBskyFeedDefs.isPostView(this.postToShow) && AppBskyFeedPost.isMain(this.postToShow.record) && typeof (this.postToShow.record as AppBskyFeedPost.Main).reply != 'undefined') return (this.postToShow.record as AppBskyFeedPost.Main).reply!.parent.uri;
            }
        },
        /**Is the account associated with the currently displayed Post blocked by the logged in User? */
        isAccountBlocked():boolean{
            //author has to be checked in case the Post Records is a `viewNotFound` or similar
            return typeof this.postToShow.author != 'undefined' && typeof this.postToShow.author.viewer != 'undefined' && typeof this.postToShow.author.viewer.blocking != 'undefined';
        },
        /**Checks if this Post has been bookmarked by the current User. */
        isPostBookmarked(){
            return typeof this.postToShow.viewer != 'undefined' && typeof this.postToShow.viewer.bookmarked != 'undefined' && this.postToShow.viewer.bookmarked;
        },
    },
    created(){
        // console.log(this.postData); //DEBUG - missing object/variable catching
        // console.log('Has this post been deleted?');
        // console.log(isViewNotFound(this.postData));
        if(typeof this.threadData != 'undefined' && typeof this.postData == 'undefined') this.postToShow = this.threadData.post;
        else if(typeof this.postData != 'undefined') this.postToShow = this.postData;
    }
})
</script>

<style scoped>
</style>