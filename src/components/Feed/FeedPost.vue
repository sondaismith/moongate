<template>
    <div class="w-full pb-2">
        {{ void "feed post" }}
        <div class="flex flex-col rounded bg-slate-400 p-1 pr-3 w-full drop-shadow-md justify-between">
            <div v-if="postData?.reason && isReasonRepost(postData.reason)"
            class="flex text-xs font-medium mb-1 items-center p-0.5 rounded bg-slate-600">
                <div class="flex grow-0 shrink-0 w-12 justify-end pr-1"><i-mdi:twitter-retweet/></div>
                <div class="whitespace-nowrap overflow-hidden text-ellipsis">Reposted by {{ postData.reason.by.displayName }}</div>
            </div>
            {{ void "post pfp" }}
            <div class="flex w-full">
                <div>
                    <div @click="displaySelectedUserAccount" @mouseover="AccountPeekState.waitBeforePeekingUser"
                    @mouseleave="AccountPeekState.cancelUserPeek" class="rounded-full bg-stone-500 aspect-square
                    border box-content size-10 bg-contain hover:border-slate-600
                    transition-[border-color] ease-linear duration-200 cursor-pointer"
                    :style="{'background-image' : 'url('+postData?.post.author.avatar+')'}">
                        <!-- <i-mingcute:butterfly-2-line class="text-2xl h-full w-full p-1"/> -->
                    </div>
                </div>
                {{ void "post content" }}
                <div class="flex flex-col pl-2 w-full overflow-hidden">
                    <div class="flex items-center">
                        <div class="text-feedPostName font-semibold max-w-36 shrink-0 truncate"
                        :title="postData?.post.author.displayName">{{ postData?.post.author.displayName }}</div>
                        <div class="text-[10px] pl-1 truncate" :title="`@${postData?.post.author.handle}`">@{{ postData?.post.author.handle }}</div>
                        <div data-test="post-timestamp" class="text-[10px] text-nowrap cursor-pointer ml-auto pl-1" :title="convertToLongTimestamp(postData?.post.indexedAt)" @click="openPostDetails()">{{ convertToShortTimestamp(postData?.post.indexedAt) }}</div>
                    </div>
                    <div class="text-xs leading-4 pb-2">
                        <!-- {{ postData?.post.record.text }} -->
                        <RichPostText :post-text="postData?.post.record.text" class="leading-5 text-sm"
                        hash-tag-style="text-slate-900 hover:text-slate-700"
                        user-link-style="!bg-slate-700 hover:!bg-slate-500 leading-5 p-[4px] text-[10px]"/>
                    </div>
                    {{ void "image-type media" }}
                    <ImageContainer v-if="postData?.post.embed?.images"
                    :imagesToDisplay="postData?.post.embed.images"
                    @media-click="(i:number) => openFocusDetails(i)"/>
                    <div class="flex flex-row h-8">
                        <PostInteractionIcons class="text-slate-50 text-s" :noShareButton="true"
                            :numComments="postData?.post.replyCount" :numShares="postData?.post.repostCount"
                            :numLikes="postData?.post.likeCount"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { postDetails, showDetailModal, showFocusModal } from '../../state/PostDetails.vue';
import { FeedViewPost, isReasonRepost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { convertToLongTimestamp, convertToShortTimestamp } from '../../helpers/converters';
import { AppState } from '../../state/AppState.vue';
import RichPostText from '../Utilities/RichPostText.vue';
import { AccountPeekState } from '../../state/AccountPeekState.vue';

export default defineComponent({
    components:{
        RichPostText,
    },
    props:{
        postData: Object as PropType<FeedViewPost>
    },
    data(){
        return{
            postDetails,
            convertToShortTimestamp,
            convertToLongTimestamp,
            isReasonRepost,
            AccountPeekState,
        }
    },
    methods:{
        openPostDetails(){
            if(this.postData){
                // postDetails.showModalPost(this.postData);
                showDetailModal(this.postData);
                //update `PostDetailIcons` in `Post` State
                // postDetails.updatePostDetailIconValues(this.postData.comments.length.toString(),this.postData.totalReposts.toString(),this.postData.totalLikes.toString());
            }
        },
        openFocusDetails(mediaIndex:number){
            if(this.postData){
                // postDetails.showFocusModal(this.postData, mediaIndex);
                showFocusModal(this.postData, mediaIndex);
                //update `PostDetailIcons` in `Post` State
                postDetails.updatePostDetailIconValues(this.postData.post.replyCount.toString(),this.postData.post.repostCount.toString(),this.postData.post.likeCount.toString());
            }
        },
        /**
         * Opens the `UserFocusModal` component to the currently selected
         * user's profile.
         */
        displaySelectedUserAccount(){
            AppState.ToggleUserFocusModal(this.postData?.post.author.did);
        }
    },
    setup () {
        return {}
    },
})
</script>

<style scoped>
</style>