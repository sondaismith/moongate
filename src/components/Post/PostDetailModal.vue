<template>
    <div :class="postDetails.isVisible ? 'show' : 'hide'" class="modal absolute z-10 flex h-screen w-screen items-center justify-center">
        <div @click="hideModal" class="absolute bg-slate-900/90 h-full w-full"></div>
        <div class="z-20 flex flex-col h-full w-1/2 bg-blue-400">
        <!-- <div class="z-20 flex flex-col h-full py-4 w-1/2 bg-blue-400"> -->
            <div class="z-20 flex flex-col bg-slate-800 border-slate-600 border rounded-sm h-full p-4 pr-3 overflow-y-auto preload-gutter">
                {{ void "User Info/Actions" }}
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
                {{ void "post reply input" }}
                <PostReplyInput/>
                {{ void "reply container" }}
                <!-- <div class="flex flex-col preload-gutter overflow-y-auto min-h-[255px] divide-y border-slate-600 divide-inherit"> -->
                <div class="flex flex-col preload-gutter divide-y border-slate-600 divide-inherit">
                    {{ void "replies" }}
                    <div v-for="replies in postDetails.postData?.comments" class="pt-2">
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
        <!-- <PostOptionsMenu v-show="postDetails.isPostOptionsMenuVisible" :menuItems="OptionIconList"/> -->
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';
import * as PostEnums from "../../enums/PostEnums";
import { IDetailIcon } from '../../interfaces/PostInterfaces';
import { DetailIconList, OptionIconList } from '../../fake-data/dumPostData';
import PostInteractionIcons from './PostInteractionIcons.vue';

export default defineComponent({
    data(){
        return{
            isPostMenuVisible: false,
            postDetails,
            OptionIconList,
            dIconList: [] as IDetailIcon[],
            iconTypes:PostEnums.IconTypes
        }
    },
    created(){
        this.dIconList = DetailIconList;
    },
    methods:{
        hideModal(){
            // console.log(postDetails.isVisible + " - Hiding Modal");
            postDetails.hideModal();
        }
    },
    setup () {
        return {}
    }
})
</script>

<style scoped>
.modal{
    transition: opacity 0.1s, visibility 0.1s;
    opacity: 0;
    visibility: hidden;
}
.modal.show{
    /* animation: show 0.2s; */
    opacity: 100;
    visibility: visible;
}
.modal.hide {
    /* animation: dismiss 0.2s forwards; */
    opacity: 0;
    visibility: hidden;
}
</style>