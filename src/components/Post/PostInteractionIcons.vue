<template>
    <div :class="textColorClass" class="flex flex-wrap text-secondary gap-1 *:h-5 justify-around">
        <div class="group flex items-center cursor-pointer hover:text-slate-300"
        :class="{'pointer-events-none' : !AppState.isAuthBrowsing}"
        @click="replyToPost">
            <i-solar:chat-dots-outline class="pointer-events-none group-hover:text-yellow-500"/>
            <div class="pl-1" :title="postData.replyCount?.toString()">{{ getCompactNumberValue(postData.replyCount ? postData.replyCount : 0) }}</div>
        </div>
        <div class="group flex items-center cursor-pointer hover:text-slate-300"
        :class="{'pointer-events-none' : !AppState.isAuthBrowsing}"
        @click="showRepostOptionsMenu($event, postData)">
            <i-mingcute:repeat-line class="pointer-events-none group-hover:text-blue-500"/>
            <div class="pl-1" :title="postData.repostCount?.toString()">{{ getCompactNumberValue(postData.repostCount ? postData.repostCount : 0) }}</div>
        </div>
        <div class="group flex items-center cursor-pointer hover:text-slate-300"
        :class="{'pointer-events-none' : !AppState.isAuthBrowsing}"
        @click="toggleLike">
            <i-mingcute:heart-fill class="pointer-events-none"
            :class="[isPostLikedByUser ? 'text-red-500' : 'group-hover:text-red-500']"/>
            <div v-if="!isAwaitingLikeUpdate" class="pl-1" :title="postData.likeCount?.toString()">{{ getCompactNumberValue(postData.likeCount ? postData.likeCount : 0) }}</div>
            <i-mingcute:loading-fill v-else class="text-primary spinner self-center size-3"/>
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
import { PostView, ThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { AppState, toast } from '../../state/AppState.vue';
import { PostActions } from '../../enums/PostEnums';

//Option Menu icons
import MingcuteLinkLine from '~icons/mingcute/link-line';
import MingcuteRepeatLine from '~icons/mingcute/repeat-line';
import MingcuteQuoteRightFill from '~icons/mingcute/quote-right-fill';
import { GetBrowsingAgent } from '../../lib/api.vue';

function CopyPostLink(postUri:string, handle:string=""){
    let link = CreateBskyWeblink(postUri, handle);
    if(link) navigator.clipboard.writeText(link);
    //Need to add toast or something to alert the User that link has been copied
}

/**
 * Asks the User if they're sure they would like to un-like the selected
 * post.
 * @param likeUri The URI of the Like to un-like (delete).
 */
async function ConfirmUnlike(postData:PostView, likeUri:string){
    AppState.showConfirmModal('Are you sure you want to un-like this post?',async function(){Unlike(postData, likeUri)});
}

/**
 * Un-likes a specific Post.
 * @param likeUri The URI of the Like to un-like (delete).
 */
async function Unlike(postData:PostView,likeUri:string):Promise<boolean>{
    await GetBrowsingAgent().deleteLike(likeUri)
    .then(res => {
        if(postData.viewer) postData.viewer.like = undefined; //Update current Post to not be liked
        //Decrease like count by 1
        if(postData.likeCount) postData.likeCount = postData.likeCount - 1;
        else postData.likeCount = 0;
        return true;
    })
    .catch(err => {
        toast.add({summary:"Error", detail:`${err} Issue liking post by ${this.postData.author.handle}`, severity:'error', group:'tr', life:3000});
    })
    return true;
}

/**
 * Opens the `CreatePost` component to allow the use to make a "quote post".
 * @param post Post to quote post.
 */
function QuotePost(post:PostView){
    postDetails.prepareForPostAction(post,PostActions.Quote)
    AppState.showCreatePost();
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
            postThread: {} as ThreadViewPost,
            isAwaitingLikeUpdate:false,
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
        /**
         * Shows Options Menu allowing user to perform different actions
         * relating to the selected User.
         */
        showRepostOptionsMenu(e:MouseEvent, post:PostView){
            e.preventDefault();
            OptionsMenuState.currentMenuItems = [
                {Icon:MingcuteRepeatLine,Label:'Repost',Action:function(){}},
                {Icon:MingcuteQuoteRightFill,Label:'Quote post',Action:function(){QuotePost(post)}},
            ] as IOptionMenuItem[]
            OptionsMenuState.showOptionMenu(e);
        },
        replyToPost(){
            postDetails.prepareForPostAction(this.postData,PostActions.Reply)
            AppState.showCreatePost();
        },
        /**
         * Method that allows the User to Like and Un-like Posts while they're
         * logged in.
         */
        toggleLike(){
            if(!this.isPostLikedByUser){
                this.isAwaitingLikeUpdate = true;
                GetBrowsingAgent().like(this.postData.uri, this.postData.cid)
                .then(res => {
                    if(this.postData.viewer) this.postData.viewer.like = res.uri; //Update current Post to be "liked"
                    //Increase like count by 1
                    if(this.postData.likeCount) this.postData.likeCount = this.postData.likeCount + 1;
                    else this.postData.likeCount = 1;
                    this.isAwaitingLikeUpdate = false;
                })
                .catch(err => {
                    toast.add({summary:"Error", detail:`${err} Issue liking post by ${this.postData.author.handle}`, severity:'error', group:'tr', life:3000});
                })
            }
            else
                if(this.postData.viewer && this.postData.viewer.like){
                    this.isAwaitingLikeUpdate = true;
                    // await ConfirmUnlike(this.postData, this.postData.viewer?.like);
                    ConfirmUnlike(this.postData, this.postData.viewer?.like);
                    this.isAwaitingLikeUpdate = false;
                }
        },
    },
    computed:{
        isPostLikedByUser(){
            if(this.postData.viewer && this.postData.viewer.like) return true;
            return false;
        }
    }
})
</script>

<style scoped>
</style>