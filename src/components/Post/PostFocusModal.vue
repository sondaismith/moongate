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
                    v-if="postDetails.postData?.postMedia &&
                    postDetails.clickedMediaIndex != 0 &&
                    postDetails.clickedMediaIndex>=0"
                    class="cursor-pointer">
                        <i-mingcute:left-fill/>
                    </div>
                </div>
                <div v-if="postDetails.postData?.postMedia" class="border border-slate-800 rounded-sm h-full w-full bg-center bg-contain bg-no-repeat"
                    :style="{'background-image' : 'url('+postDetails.postData.postMedia[postDetails.clickedMediaIndex]+')'}">
                </div>
                <div v-else class="w-full">
                    {{ void "button spacer" }}
                </div>
                <div class="flex shrink-0 text-2xl justify-center bg-blue-400 w-10">
                    <div @click="increaseCurrentMediaIndex"
                    v-if="postDetails.postData?.postMedia &&
                    postDetails.clickedMediaIndex+1 != postDetails.postData?.postMedia.length &&
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
        <div class="flex flex-col w-2/5 shrink-0 max-w-96 bg-yellow-300/40 bg-slate-950">
            {{ void "User Info/Actions" }}
            <div class="p-4">
                <div class="flex">
                    <div class="rounded-full bg-stone-500 aspect-square size-10 self-center">
                        <i-mingcute:butterfly-2-line class="text-2xl h-full w-full p-1"/>
                    </div>
                    <div class="self-center ml-2">
                        <div class="font-bold leading-4">{{ postDetails.postData?.userName }}</div>
                        <div class="text-feedPostName">@{{ postDetails.postData?.userHandle }}</div>
                    </div>
                    <div class="rounded-full self-center ml-auto py-1 px-3 bg-slate-300 font-bold hover:bg-slate-200 text-slate-800 cursor-pointer">
                        + Follow
                    </div>
                </div>
                {{ void "Post Content - Text" }}
                <div class="text-sm pt-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </div>
                {{ void "Post Metadata" }}
                <div class="border-slate-600 divide-y divide-inherit !mt-0">
                    <div class="py-1">
                        <div class="text-feedPostName text-slate-300 cursor-pointer hover:underline">January 4th, 2025 at 12:42am</div>
                    </div>
                    <PostInteractionIcons :numComments="postDetails.postData?.comments.length"
                        :numShares="postDetails.postData?.totalReposts" :numLikes="postDetails.postData?.totalLikes"/>
                </div>
            </div>
            {{ void "post reply input" }}
            <div class="px-4"><PostReplyInput/></div>
            {{ void "Replies" }}
            <div class="flex pl-4 overflow-y-scroll">
                <div class="flex flex-col w-full text-xl text-slate-200">
                    <!-- <div class="w-auto">No Replies</div> -->
                    <div class="flex flex-col bg-orange-400s preload-gutter divide-y border-slate-600 divide-inherit">
                        {{ void "replies" }}
                        <div v-for="replies in postDetails.postData?.comments" class="pt-2 pr-3">
                            <PostReply :userName="replies.userName"
                                :userHandle="replies.userHandle" :postText="replies.postText"
                                :totalComments="replies.totalComments" :totalReposts="replies.totalReposts"
                                :totalLikes="replies.totalLikes"/>
                            {{ void "displays replies to comment" }}
                            <PostReply v-for="reply in replies.comments" :userName="reply.userName"
                                :userHandle="reply.userHandle" :postText="reply.postText"
                                :totalComments="reply.totalComments" :totalReposts="reply.totalReposts"
                                :totalLikes="reply.totalLikes"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';

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