<template>
    <div :class="textColorClass" class="flex flex-wrap text-secondary gap-1 *:h-5 justify-around">
        <div class="group flex items-center cursor-pointer hover:text-slate-300"
        :class="{'pointer-events-none' : !AppState.isAuthBrowsing}">
            <i-solar:chat-dots-outline class="pointer-events-none group-hover:text-yellow-500"/>
            <div class="pl-1" :title="postData.replyCount?.toString()">{{ getCompactNumberValue(postData.replyCount ? postData.replyCount : 0) }}</div>
        </div>
        <div class="group flex items-center cursor-pointer hover:text-slate-300"
        :class="{'pointer-events-none' : !AppState.isAuthBrowsing}">
            <i-mingcute:repeat-line class="pointer-events-none group-hover:text-blue-500"/>
            <div class="pl-1" :title="postData.repostCount?.toString()">{{ getCompactNumberValue(postData.repostCount ? postData.repostCount : 0) }}</div>
        </div>
        <div class="group flex items-center cursor-pointer hover:text-slate-300"
        :class="{'pointer-events-none' : !AppState.isAuthBrowsing}">
            <i-mingcute:heart-fill class="pointer-events-none group-hover:text-red-500"/>
            <div class="pl-1" :title="postData.likeCount?.toString()">{{ getCompactNumberValue(postData.likeCount ? postData.likeCount : 0) }}</div>
        </div>
        <div v-if="!noShareButton" class="group flex items-center cursor-pointer hover:text-slate-300"
        :class="{'pointer-events-none' : !AppState.isAuthBrowsing}">
            <i-solar:share-bold class="pointer-events-none group-hover:text-blue-500"/>
        </div>
        <div @click="showOptionsMenu($event, postData.uri, postData.author.handle)"
        class="group flex items-center cursor-pointer hover:text-slate-300">
            <i-mdi:dots-horizontal class="pointer-events-none group-hover:text-primary"/>
        </div>
        <!-- <div @click="postDetails.showPostOptionsMenu" class="group flex items-center cursor-pointer hover:text-slate-300">
            <i-mdi:dots-horizontal class="pointer-events-none group-hover:text-primary"/>
        </div> -->
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';
import { CreateBskyWeblink, getCompactNumberValue } from '../../helpers/converters';
import { OptionsMenuState } from '../../state/OptionsMenuState.vue';
import { IOptionMenuItem } from '../Utilities/OptionsMenu.vue';

//Option Menu icons
import MingcuteLinkLine from '~icons/mingcute/link-line';
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { AppState } from '../../state/AppState.vue';

function CopyPostLink(postUri:string, handle:string=""){
    let link = CreateBskyWeblink(postUri, handle);
    if(link) navigator.clipboard.writeText(link);
    //Need to add toast or something to alert the User that link has been copied
}

export default defineComponent({
    props:{
        textColorClass: String,
        noShareButton: Boolean,
        postData:{
            type: Object as PropType<PostView>,
            required: true
        }
    },
    data(){
        return{
            AppState,
            isPostMenuVisible: false,
            postDetails,
            getCompactNumberValue,
        }
    },
    methods:{
        /**
         * Shows Options Menu allowing user to perform different actions
         * relating to the selected User.
         */
        showOptionsMenu(e:MouseEvent, postURI:string, handle:string=""){
            e.preventDefault();
            OptionsMenuState.currentMenuItems = [
                {Icon:MingcuteLinkLine,Label:'Copy link to Post',Action:function(){CopyPostLink(postURI, handle)}},
            ] as IOptionMenuItem[]
            OptionsMenuState.showOptionMenu(e);
        },
    }
})
</script>

<style scoped>
</style>