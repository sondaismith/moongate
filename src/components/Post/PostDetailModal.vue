<template>
    <div class="absolute z-10 flex h-screen w-screen items-center justify-center">
        <div @click="hideModal" class="absolute bg-slate-900/90 h-full w-full"></div>
        <div class="z-20 flex flex-col h-full w-1/2 bg-blue-400">
        <!-- <div class="z-20 flex flex-col h-full py-4 w-1/2 bg-blue-400"> -->
            <div class="z-20 flex flex-col bg-slate-800 border-slate-600 border rounded-sm h-full p-4 space-y-2 overflow-y-auto">
                {{ void "User Info/Actions" }}
                <div class="flex">
                    <div class="rounded-full bg-stone-500 aspect-square size-10 self-center">
                        <i-mingcute:butterfly-2-line class="text-2xl h-full w-full p-1"/>
                    </div>
                    <div class="self-center ml-2">
                        <div class="font-bold leading-4">Modal</div>
                        <div class="text-feedPostName">@modalTest.moon.social</div>
                    </div>
                    <div class="rounded-full self-center ml-auto py-1 px-3 bg-slate-300 font-bold hover:bg-slate-200 text-slate-800 cursor-pointer">
                        + Follow
                    </div>
                </div>
                {{ void "Post Content - Text" }}
                <div class="text-sm">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </div>
                {{ void "Post Metadata" }}
                <div class="border-slate-600 divide-y divide-inherit !mt-0">
                    <div class="py-1">
                        <div class="text-feedPostName text-slate-300 cursor-pointer hover:underline">January 4th, 2025 at 12:42am</div>
                    </div>
                    <div class="flex text-slate-400 py-2 space-x-2 justify-between">
                        <PostDetailIcon :iconType="iconTypes.Comment" iconText="6"/>
                        <PostDetailIcon :iconType="iconTypes.Reposts" iconText="12"/>
                        <PostDetailIcon :iconType="iconTypes.Likes" iconText="42"/>
                        <PostDetailIcon :iconType="iconTypes.Share"/>
                        <div>
                            <PostDetailIcon @click="showPostOptionsMenu" :iconType="iconTypes.Options"/>
                            <PostOptionsMenu @click="hidePostOptionsMenu" v-show="isPostMenuVisible"/>
                        </div>
                    </div>
                </div>
                {{ void "post reply input" }}
                <div>
                    <!-- <textarea class="block w-full p-2 rounded bg-slate-900" placeholder="Post reply..."/> -->
                    <span class="block w-full p-2 rounded bg-slate-900 overflow-hidden resize
                    max-h-36 postPlaceholder" role="text" placeholder="Post reply..."
                    contenteditable @focusin="postInputFocusGained" @focusout="postInputFocusLost"/>
                </div>
                {{ void "reply container" }}
                <!-- <div class="flex flex-col preload-gutter overflow-y-auto min-h-[255px] divide-y border-slate-600 divide-inherit"> -->
                <div class="flex flex-col preload-gutter divide-y border-slate-600 divide-inherit">
                    {{ void "replies" }}
                    <div v-for="replies in postDetails.postDetailsList[0].comments" class="pt-2">
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
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';
import { PostEnums } from '../../enums/PostEnums';
import PostOptionsMenu from './PostOptionsMenu.vue';

export default defineComponent({
    data(){
        return{
            isPostMenuVisible: false,
            postDetails,
            iconTypes:PostEnums.IconTypes
        }
    },
    methods:{
        /**
         * Method used to remove post message placeholder when input is in focus.
         */
        postInputFocusGained(event:FocusEvent){
            (event.target as HTMLElement).classList.remove('postPlaceholder');
        },
        /**
         * Method used to add post message placeholder when input loses focus and
         * text is empty.
         */
        postInputFocusLost(event:FocusEvent){
            if ((event.target as HTMLElement).textContent == ""){
                //textbox empty
                (event.target as HTMLElement).classList.add('postPlaceholder');
            }
        },
        /**
         * Shows the "Post Options" menu.
         */
        showPostOptionsMenu(event:FocusEvent){
            (event.target as HTMLElement).classList.add('text-white') //keep button "hover" state
            this.isPostMenuVisible = true;
        },/**
         * Hides the "Post Options" menu.
         */
        hidePostOptionsMenu(event:PointerEvent){
            // if((event.target === (event.currentTarget as HTMLElement).children[1])){
            if((event.target as HTMLElement).classList.contains('menu-closer')){
                //remove button "hover" state
                (event.target as HTMLElement).parentElement?.parentElement?.children[0].classList.remove('text-white');
                this.isPostMenuVisible = false;
            }
        },
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