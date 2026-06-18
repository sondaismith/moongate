<template>
    <!-- <ReplyBreadcrumb class="px-4"/> -->
    <div data-testid="postThreadView" class="flex px-4 preload-gutter bg-postFocusBG">
        <div class="flex flex-col w-full text-xl text-primary">
            <!-- <div class="w-auto">No Replies</div> -->
            <div v-if="!isChangingThreadContext" class="flex flex-col bg-orange-400s preload-gutter divide-y border-slate-600 divide-inherit text-sm">
                {{ void "replies" }}
                <TransitionGroup>
                    <div v-for="replies in currentThreadView.replies" :key="(replies as AppBskyFeedDefs.ThreadViewPost).post.cid" class="py-2 pr-3 flex flex-col gap-2">
                        <FocusFeedPost v-if="AppBskyFeedDefs.isThreadViewPost(replies)" @thread-reply-clicked="changeThreadFromPost"
                        :post-data="({$type:'app.bsky.feed.defs#postView',...replies.post} as AppBskyFeedDefs.PostView)" :is-reply-style="true" :reply-index="0" :total-replies="replies.post.replyCount"/>
                        {{ void "displays replies to comment" }}
                        <TransitionGroup>
                            <div v-for="(reply, index) in (replies as AppBskyFeedDefs.ThreadViewPost).replies" :key="(reply as AppBskyFeedDefs.ThreadViewPost).post.cid">
                                <FocusFeedPost v-if="AppBskyFeedDefs.isThreadViewPost(reply)" @thread-reply-clicked="changeThreadFromPost" :post-data="({$type:'app.bsky.feed.defs#postView',...reply.post} as AppBskyFeedDefs.PostView)" :is-reply-style="true"
                                :reply-index="index+1" :total-replies="replies.replies.length"/>
                            </div>
                        </TransitionGroup>
                    </div>
                </TransitionGroup>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';
import PostReply from './PostReply.vue';
import { AppBskyFeedDefs } from '@atproto/api';
import FocusFeedPost from '../Feed/FocusFeedPost.vue';
import { emptyPostThread } from '../../fake-data/dumPostData';

export default defineComponent({
    components:{
        PostReply,
        FocusFeedPost,
    },
    props:{
        /**
         * Post thread to display. Should be passed by parent
         * `PostFocusModal` component.
         */
        currentThreadView:{
            type: Object as PropType<AppBskyFeedDefs.ThreadViewPost>,
            default: emptyPostThread,
        },
        /**
         * Used to cause the displayed Replies to update when the context changes.
         * Updated from `PostFocusModal`.
         */
        isChangingThreadContext:{
            type: Boolean,
            required: true,
        }
    },
    data(){
        return{
            AppBskyFeedDefs,
            postDetails,
        }
    },
    emits:{
        /**
         * Updates the Posts/Replies displayed in the PostFocusModal component when
         * a `FocusFeedPost` timestamp is clicked.
         * This emit travels from `PostThreadView` to `PostFocusModal`.
         * @param postThread The new Post Thread context to display.
         * @param mediaIndex The Index of the media in the Post's collection to display.
         */
        updateThreadContext:(postThread:AppBskyFeedDefs.ThreadViewPost|undefined, mediaIndex:number) => {
            return {postThread: postThread,mediaIndex};
        }
    },
    methods:{
        /**
         * Updates the Posts/Replies displayed in the PostFocusModal component.
         * Emits {@link updateThreadContext} message with URI of Post Thread to display.
         * @param newThread The new Post Thread context to display.
         */
        changeThreadFromPost(newThread:AppBskyFeedDefs.ThreadViewPost|undefined,mediaIndex:number){
            // alert(newThread.post.author.handle);
            this.$emit('updateThreadContext', newThread, mediaIndex);
        }
    }
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