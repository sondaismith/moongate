<template>
    <!-- <ReplyBreadcrumb class="px-4"/> -->
    <div class="flex pl-4 sm:overflow-y-scroll">
        <div class="flex flex-col w-full text-xl text-primary">
            <!-- <div class="w-auto">No Replies</div> -->
            <div v-if="!postDetails.isChangingThreadContext" class="flex flex-col bg-orange-400s preload-gutter divide-y border-slate-600 divide-inherit text-sm">
                {{ void "replies" }}
                <TransitionGroup>
                    <div v-for="replies in postDetails.currentThreadView.replies" :key="(replies as ThreadViewPost).post.cid" class="py-2 pr-3 flex flex-col gap-2">
                        <FocusFeedPost v-if="isThreadViewPost(replies)" :thread-data="replies" :is-reply-style="true" :reply-index="0" :total-replies="replies.post.replyCount"/>
                        {{ void "displays replies to comment" }}
                        <TransitionGroup>
                            <div v-for="(reply, index) in (replies as ThreadViewPost).replies" :key="(reply as ThreadViewPost).post.cid">
                                <FocusFeedPost :thread-data="reply" :is-reply-style="true" :reply-index="index+1" :total-replies="replies.replies.length"/>
                            </div>
                        </TransitionGroup>
                    </div>
                </TransitionGroup>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';
import PostReply from './PostReply.vue';
import { isThreadViewPost, PostView, ThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import FocusFeedPost from '../Feed/FocusFeedPost.vue';

export default defineComponent({
    components:{
        PostReply,
        FocusFeedPost,
    },
    data(){
        return{
            isThreadViewPost,
            postDetails,
        }
    },
})

</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>