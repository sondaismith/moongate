<template>
    <!-- <ReplyBreadcrumb class="px-4"/> -->
    <div class="flex pl-4 overflow-y-scroll">
        <div class="flex flex-col w-full text-xl text-primary">
            <!-- <div class="w-auto">No Replies</div> -->
            <div class="flex flex-col bg-orange-400s preload-gutter divide-y border-slate-600 divide-inherit">
                {{ void "replies" }}
                <div v-for="replies in postDetails.currentThreadView?.replies" class="pt-2 pr-3">
                    <PostReply :replyThreadIndex="0" :totalThreadReplies="replies.replies.length"
                    :profileData="replies.post.author" :postData="replies.post as PostView"/>
                    {{ void "displays replies to comment" }}
                    <div v-for="(reply, index) in replies.replies">
                        <PostReply :replyThreadIndex="index+1" :totalThreadReplies="replies.replies.length+replies.replies[0].replies.length"
                            :profileData="reply.post.author" :postData="reply.post as PostView"/>
                        <!-- <PostReply v-if="reply.replies.length == 1" :cid="reply.post.cid"
                            :parentCID="reply.post.record.reply.parent.cid" :userName="reply.replies[0].post.author.displayName"
                            :userHandle="reply.replies[0].post.author.handle" :avatar="reply.replies[0].post.author.avatar"
                            :postText="reply.replies[0].post.record.text" :timestamp="reply.replies[0].post.indexedAt"
                            :totalComments="reply.replies[0].post.replyCount" :totalReposts="reply.replies[0].post.repostCount"
                            :totalLikes="reply.replies[0].post.likeCount"
                            :replyThreadIndex="index+1" :totalThreadReplies="1"/> -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';
import PostReply from './PostReply.vue';
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

export default defineComponent({
    components:{
        PostReply,
    },
    data(){
        return{
            postDetails,
        }
    },
})

</script>

<style scoped>
</style>