<template>
    <div data-test="post-focus-modal" :class="postDetails.isFocusVisible ? 'show' : ''"
    class="absolute z-10 h-full w-full flex justify-between bg-slate-900/90">
        {{ void "Media Section" }}
        <div class="flex flex-col w-full">
            {{ void "Close Button" }}
            <div @click="hideModal" class="flex shrink-0 ml-auto bg-blue-300 py-2 w-10
                justify-center text-2xl cursor-pointer">
                <i-mingcute:close-fill/>
            </div>
            {{ void "Media Container" }}
            <div class="flex items-center h-full">
                <div class="flex shrink-0 text-2xl justify-center bg-blue-400 w-10">
                    <div @click="decreaseCurrentMediaIndex"
                    v-if="postDetails.currentThreadView.post.embed?.images &&
                    postDetails.clickedMediaIndex != 0 &&
                    postDetails.clickedMediaIndex>=0"
                    class="cursor-pointer">
                        <i-mingcute:left-fill/>
                    </div>
                </div>
                <div v-if="postDetails.currentThreadView.post.embed?.images" class="border border-slate-800 rounded-sm h-full w-full bg-center bg-contain bg-no-repeat"
                    :style="{'background-image' : 'url('+postDetails.currentThreadView.post.embed.images[postDetails.clickedMediaIndex].fullsize+')'}">
                </div>
                <div v-else class="w-full">
                    {{ void "button spacer" }}
                </div>
                <div class="flex shrink-0 text-2xl justify-center bg-blue-400 w-10">
                    <div @click="increaseCurrentMediaIndex"
                    v-if="postDetails.currentThreadView.post.embed?.images &&
                    postDetails.clickedMediaIndex+1 != postDetails.currentThreadView.post.embed?.images.length &&
                    postDetails.clickedMediaIndex>=0"
                    class="cursor-pointer">
                        <i-mingcute:right-fill/>
                    </div>
                </div>
            </div>
            {{ void "Post Details" }}
            <div class="flex space-x-2 mx-8 px-2 py-4 ">
                <div>Comments</div>
                <div>Likes</div>
                <div>Share</div>
            </div>
        </div>
        {{ void "Comments Section" }}
        <div class="flex flex-col w-2/5 shrink-0 max-w-96 bg-slate-950">
            {{ void "User Info/Actions" }}
            <div class="p-4">
                <div class="flex">
                    <div class="rounded-full shrink-0 overflow-hidden bg-stone-500 aspect-square size-10 self-center">
                        <!-- <i-mingcute:butterfly-2-line class="text-2xl h-full w-full p-1"/> -->
                        <div class="h-full w-full bg-contain" :style="{'background-image' : 'url('+postDetails.currentThreadView.post.author.avatar+')'}"></div>
                    </div>
                    <div class="self-center ml-2 overflow-hidden">
                        <div class="font-bold leading-4 text-ellipsis overflow-hidden">{{ postDetails.currentThreadView.post.author.displayName }}</div>
                        <div class="text-feedPostName text-ellipsis overflow-hidden">@{{ postDetails.currentThreadView.post.author.handle }}</div>
                    </div>
                    <div class="rounded-full self-center ml-auto
                    py-1 px-3 bg-slate-300 font-bold hover:bg-slate-200
                    text-slate-800 text-nowrap cursor-pointer">
                        + Follow
                    </div>
                </div>
                {{ void "Post Content - Text" }}
                <div class="text-sm pt-2">
                    {{ postDetails.currentThreadView ? postDetails.currentThreadView.post.record.text : "initial state - undefined" }}
                </div>
                {{ void "Post Metadata" }}
                <div class="border-slate-600 divide-y divide-inherit !mt-0">
                    <div class="py-1">
                        <div class="text-feedPostName text-slate-300 cursor-pointer hover:underline">{{ convertToLongTimestamp(postDetails.postThread.post.indexedAt) }}</div>
                    </div>
                    <PostInteractionIcons :numComments="postDetails.currentThreadView.post.replyCount"
                        :numShares="postDetails.currentThreadView.post.repostCount" :numLikes="postDetails.currentThreadView.post.likeCount"/>
                </div>
            </div>
            {{ void "post reply input" }}
            <div class="px-4"><PostReplyInput/></div>
            {{ void "Replies" }}
            <ReplyBreadcrumb class="px-4"/>
            <PostThreadView/>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';
import { convertToLongTimestamp } from '../../helpers/converters';
import PostThreadView from './PostThreadView.vue';
import ReplyBreadcrumb from './ReplyBreadcrumb.vue';

export default defineComponent({
    setup () {
        return {}
    },
    data(){
        return{
            imageCollection: [
                'src/assets/test-media/posts/image04.png',
                'src/assets/test-media/posts/image01.png',
                'src/assets/test-media/posts/image05.png',
                'src/assets/test-media/posts/image06.png',
            ],
            postDetails,
            convertToLongTimestamp,
        }
    },
    methods:{
        increaseCurrentMediaIndex(){
            if(postDetails.clickedMediaIndex+1 < this.imageCollection.length)
                postDetails.setClickedMediaIndex(postDetails.getClickedMediaIndex()+1);
        },
        decreaseCurrentMediaIndex(){
            if(postDetails.clickedMediaIndex-1 >= 0)
                postDetails.setClickedMediaIndex(postDetails.getClickedMediaIndex()-1);
        },
        hideModal(){
            postDetails.hideFocusModal();
        }
    },
    mounted(){
    }
})
</script>

<style scoped>
[data-test="post-focus-modal"]{
    z-index: -10;
    display: none;
}
[data-test="post-focus-modal"].show{
    z-index: 20;
    display: flex;
}
</style>