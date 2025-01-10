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
                        <PostDetailIcon v-for="iconData in dIconList" :iconDetails="iconData" />
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
import { defineComponent, FunctionalComponent } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';
import { PostEnums } from '../../enums/PostEnums';
import { DetailIcon } from './PostInterfaces';
import { DetailIconList } from '../../fake-data/dumPostData';

// //Icons
// import SolarChatDotsOutline from '~icons/solar/chat-dots-outline';
// import MingcuteRepeatLine from '~icons/mingcute/repeat-line';
// import MingcuteHeartFill from '~icons/mingcute/heart-fill';
// import SolarShareBold from '~icons/solar/share-bold';
// import MdiDotsHorizontal from '~icons/mdi/dots-horizontal';

// /**In a real situation, the label values should be set when the modal is created
//  * using the post data returned from the server.
//  */
// var DetailIconList : DetailIcon[] = [
//     { label: '6', type:PostEnums.IconTypes.Comment, icon: SolarChatDotsOutline, color: 'group-hover:text-yellow-500' },
//     { label: '2', type:PostEnums.IconTypes.Reposts, icon: MingcuteRepeatLine, color: 'group-hover:text-blue-500' },
//     { label: '3', type:PostEnums.IconTypes.Likes, icon: MingcuteHeartFill, color: 'group-hover:text-red-500' },
//     { label: '', type:PostEnums.IconTypes.Share, icon: SolarShareBold, color: 'group-hover:text-blue-500' },
//     { label: '', type:PostEnums.IconTypes.Options, icon: MdiDotsHorizontal, color: 'group-hover:text-white-500' },
// ]

export default defineComponent({
    data(){
        return{
            isPostMenuVisible: false,
            postDetails,
            dIconList: [] as DetailIcon[],
            iconTypes:PostEnums.IconTypes
        }
    },
    created(){
        this.dIconList = DetailIconList;
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