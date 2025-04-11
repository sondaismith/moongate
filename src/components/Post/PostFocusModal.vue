<template>
    <div data-test="post-focus-modal"
    class="absolute z-20 h-full w-full flex justify-between bg-slate-900/90">
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
                <div v-if="postDetails.isAwaitingFocusData" class="h-full w-full rounded-sm border-0 bg-slate-500 animate-pulse"></div>
                <div v-else-if="postDetails.currentThreadView.post.embed?.images && !postDetails.isAwaitingFocusData"
                class="rounded-sm h-full w-full bg-center bg-contain bg-no-repeat"
                :style="{'background-image' : 'url('+postDetails.currentThreadView.post.embed.images[postDetails.clickedMediaIndex].fullsize+')'}">
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
            <div v-if="postDetails.isAwaitingFocusData" class="flex rounded-lg mx-8 mt-2 mb-8 px-2 py-1 h-16 animate-pulse text-sm bg-slate-500/20"></div>
            <div v-else-if="postDetails.currentThreadView.post.embed.images[0].alt.trim() != ''" class="flex rounded-lg mx-8 mt-2 mb-8 px-2 py-1 text-sm bg-slate-500/20">
                <div class="flex bg-pink-400s min-[300px]:max-h-20 grow overflow-auto">{{ postDetails.currentThreadView.post.embed.images[postDetails.clickedMediaIndex].alt }}</div>
            </div>
            {{ void "Post Details" }}
            <!-- <div class="flex space-x-2 mx-8 px-2 py-4 ">
                <div>Comments</div>
                <div>Likes</div>
                <div>Share</div>
            </div> -->
        </div>
        {{ void "Comments Section" }}
        <div class="flex flex-col w-2/5 shrink-0 max-w-96 bg-slate-950 overflow-scroll">
            {{ void "Focused Post Loading Placeholder/Skeleton" }}
            <div v-if="postDetails.isAwaitingFocusData" class="flex flex-col rounded bg-slate-400s p-4 w-full">
                <div class="animate-pulse flex flex-col w-full overflow-hidden gap-1">
                    <div class="flex gap-2 mb-1">
                        <div class="drop-shadow-md">
                            <div class="rounded-full bg-slate-500 aspect-square size-10"></div>
                        </div>
                        <div class="flex flex-col gap-1 w-full">
                            <div class="h-4 w-24 rounded-sm bg-slate-500"></div>
                            <div class="h-3 w-full rounded-sm bg-slate-500"></div>
                        </div>
                        <div class="w-48 h-8 rounded-full bg-slate-500"></div>
                    </div>
                    <div class="h-4 w-full rounded-sm bg-slate-500"></div>
                    <div class="h-4 w-full rounded-sm bg-slate-500"></div>
                    <div class="h-4 w-4/5 rounded-sm bg-slate-500"></div>
                    <div class="h-3 max-w-40 mt-1 rounded-sm bg-slate-500"></div>
                    <div class="flex justify-between h-8 mt-1 w-full pt-2 border-t border-slate-500">
                        <div class="w-10 rounded-md bg-slate-500"></div>
                        <div class="w-10 rounded-md bg-slate-500"></div>
                        <div class="w-10 rounded-md bg-slate-500"></div>
                        <div class="w-10 rounded-md bg-slate-500"></div>
                        <div class="w-10 rounded-md bg-slate-500"></div>
                    </div>
                </div>
            </div>
            {{ void "User Info/Actions" }}
            <div v-if="!postDetails.isAwaitingFocusData" class="p-4">
                <div class="flex">
                    <AvatarRound :avatar="postDetails.currentThreadView.post.author.avatar"
                    :did="postDetails.currentThreadView.post.author.did"/>
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
            {{ void "Replies Loading Placeholder/Skeleton" }}
            <div v-if="postDetails.isAwaitingFocusData" class="flex flex-col rounded bg-slate-400s pt-4 px-4 w-full">
                <div class="animate-pulse flex w-full overflow-hidden gap-2">
                    <div class="rounded-full bg-slate-500 aspect-square size-10"></div>
                    <div class="flex flex-col gap-1 w-full">
                        <div class="flex gap-2 h-5 mb-1">
                            <div class="w-full rounded-sm bg-slate-500"></div>
                            <div class="h-4 w-full rounded-sm bg-slate-500"></div>
                            <div class="h-4 w-28 rounded-sm bg-slate-500"></div>
                        </div>
                        <div class="h-4 w-40 rounded-sm bg-slate-500"></div>
                        <div class="h-4 w-48 rounded-sm bg-slate-500"></div>
                        <div class="h-4 w-36 rounded-sm bg-slate-500"></div>
                        <div class="flex justify-between h-6 mt-2 w-full">
                            <div class="w-10 rounded-md bg-slate-500"></div>
                            <div class="w-10 rounded-md bg-slate-500"></div>
                            <div class="w-10 rounded-md bg-slate-500"></div>
                            <div class="w-10 rounded-md bg-slate-500"></div>
                            <div class="w-10 rounded-md bg-slate-500"></div>
                        </div>
                    </div>
                </div>
            </div>
            {{ void "Replies" }}
            <ReplyBreadcrumb class="px-4"/>
            <PostThreadView v-if="!postDetails.isAwaitingFocusData"/>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';
import { convertToLongTimestamp } from '../../helpers/converters';
import PostThreadView from './PostThreadView.vue';
import ReplyBreadcrumb from './ReplyBreadcrumb.vue';
import AvatarRound from '../Utilities/AvatarRound.vue';

export default defineComponent({
    components:{
        AvatarRound,
        PostThreadView,
        ReplyBreadcrumb
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
</style>