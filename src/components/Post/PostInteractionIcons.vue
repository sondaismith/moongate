<template>
    <div :class="textColorClass" class="flex flex-wrap -mt-1 bg-red-300s text-secondary gap-1 justify-around
     *:p-1">
        <div class="flex rounded-full items-center"
        :class="canUserReply ? 'group cursor-pointer hover:bg-btnSubtle' : 'text-disabled select-none'"
        @click="canUserReply && replyToPost()" :title="postDetails.whoCanReply(postData)">
            <i-solar:chat-dots-outline class="pointer-events-none group-hover:text-yellow-600"/>
            <div class="pl-1" :title="postData.replyCount?.toString()">{{ getCompactNumberValue(postData.replyCount ? postData.replyCount : 0) }}</div>
        </div>
        <div class="group flex rounded-full items-center cursor-pointer gap-1 hover:bg-btnSubtle"
        title="Repost"
        @click="showRepostOptionsMenu($event, postData)">
            <i-mingcute:repeat-line
            :class="[isPostRepostedByUser ? 'text-blue-500' : 'group-hover:text-blue-500']"/>
            <div v-if="!isAwaitingRepostUpdate" :title="postData.repostCount?.toString()">{{ getCompactNumberValue(postData.repostCount ? postData.repostCount : 0) }}</div>
            <i-mingcute:loading-fill v-else class="text-primary spinner self-center size-3"/>
        </div>
        <div @click="toggleLike" class="group flex rounded-full items-center cursor-pointer
        gap-1 hover:bg-btnSubtle"
        title="Like Post">
            <i-mingcute:heart-fill
            :class="[isPostLikedByUser ? 'text-red-500' : 'group-hover:text-red-500']"/>
            <div v-if="!isAwaitingLikeUpdate":title="postData.likeCount?.toString()">{{ getCompactNumberValue(postData.likeCount ? postData.likeCount : 0) }}</div>
            <i-mingcute:loading-fill v-else class="text-primary spinner self-center size-3"/>
        </div>
        <!-- <div v-if="!noShareButton" class="group flex items-center cursor-pointer hover:text-slate-300"
        :class="{'pointer-events-none' : !AppState.isAuthBrowsing}">
            <i-solar:share-bold class="pointer-events-none group-hover:text-blue-500"/>
        </div> -->
        <div @click="showOptionsMenu($event, postData.uri, postData.author.handle)"
        title="More Actions"
        class="group flex rounded-full items-center cursor-pointer hover:bg-btnSubtle">
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
import { GetBrowsingAgent } from '../../lib/api.vue';
import { DeletePost } from '../../lib/api/Post.vue';

//Option Menu icons
import MingcuteLinkLine from '~icons/mingcute/link-line';
import MingcuteRepeatLine from '~icons/mingcute/repeat-line';
import MingcuteQuoteRightFill from '~icons/mingcute/quote-right-fill';
import MingcuteDelete2Line from '~icons/mingcute/delete-2-line';
import { AppBskyFeedThreadgate } from '@atproto/api';

function CopyPostLink(postUri:string, handle:string=""){
    let link = CreateBskyWeblink(postUri, handle);
    if(link) navigator.clipboard.writeText(link);
    //Need to add toast or something to alert the User that link has been copied
}

/**
 * Asks the User if they're sure they would like to unlike the selected
 * post. If the unlike is confirmed it will perform the passed Function.
 * @param unlikeFunc The function to use to unlike the Post.
 */
async function ConfirmPostUnlike(unlikeFunc:Function){
    AppState.showConfirmModal('Are you sure you want to unlike this post?',unlikeFunc);
}
/**
 * Asks the User if they're sure they would like to undo the repost of the selected
 * post.
 * @param undoRepostFunc The function to use to undo the Repost.
 */
async function ConfirmUndoRepost(undoRepostFunc:Function){
    await AppState.showConfirmModal('Are you sure you want to undo this repost?', undoRepostFunc);
}

/**
 * Asks the User if they're sure they would like to delete the selected
 * post. If deletion is confirmed it will perform the passed Function.
 * @param deleteFunc The function to use to delete the Post.
 */
async function ConfirmPostDelete(deleteFunc:Function){
    AppState.showConfirmModal('Are you sure you want to delete this post?',deleteFunc);
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
        /**Data representing the Post that the interactions will be acted upon. */
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
            isAwaitingRepostUpdate:false,
            isAwaitingPostDelete:false,
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
            //Only show "delete post" option if the User is logged in and this is one of their Posts
            if(AppState.isAuthBrowsing && GetBrowsingAgent().did == this.postData.author.did){
                OptionsMenuState.currentMenuItems.push({
                    Icon:MingcuteDelete2Line,
                    Label:'Delete Post',
                    Action:this.askAboutDelete,
                    IconStyle:'text-red-400',
                    LabelStyle:'text-red-400'
                });
            }
            OptionsMenuState.showOptionMenu(e);
        },
        /**
         * Shows Options Menu allowing user to perform different actions
         * relating to the selected User.
         */
        showRepostOptionsMenu(e:MouseEvent, post:PostView){
            e.preventDefault();
            let isReposted = this.isPostRepostedByUser
            if(!AppState.checkIfLoggedIn('repost/quote post')) return;
            OptionsMenuState.currentMenuItems = [
                {Icon:MingcuteRepeatLine,Label:(isReposted ? 'Undo Repost' : 'Repost'),Action:this.toggleRepost},
                {Icon:MingcuteQuoteRightFill,Label:'Quote post',Action:function(){QuotePost(post)}},
            ] as IOptionMenuItem[]
            OptionsMenuState.showOptionMenu(e);
        },
        replyToPost(){
            if(!AppState.checkIfLoggedIn('reply')) return;
            postDetails.prepareForPostAction(this.postData,PostActions.Reply)
            AppState.showCreatePost();
        },
        /**
         * Method prompts the User to confirm if they would like to unlike the selected
         * Post. Passes the component method `unlikePost()` to `ConfirmPostUnlike()` which will
         * only be performed if the User selects the "confirm" option.
         */
        askAboutUnlike(){
            ConfirmPostUnlike(this.unlikePost);
        },
        /**
         * Method that unlikes the Post that this component is attached to. Should not be
         * called directly - use `askAboutUnlike()`.
         */
        unlikePost(){
            if(this.postData.viewer && this.postData.viewer.like){
                this.isAwaitingLikeUpdate = true;
                GetBrowsingAgent().deleteLike(this.postData.viewer.like)
                .then(() => {//Update like count
                    let newLikeCount = this.postData.likeCount - 1;
                    this.postData.likeCount = newLikeCount>-1 ? newLikeCount : 0;
                    this.postData.viewer.like = undefined;//set Post as unliked
                    AppState.UpdatePostsInFeedList(this.postData);
                    this.isAwaitingLikeUpdate = false;
                })
            }
        },
        /**
         * Method that allows the User to Like and Un-like Posts while they're
         * logged in.
         */
        async toggleLike(){
            if(!AppState.checkIfLoggedIn('like a Post')) return;
            if(this.isAwaitingLikeUpdate) return;
            postDetails.prepareForPostAction(this.postData,PostActions.Like);
            if(!this.isPostLikedByUser){//Like
                this.isAwaitingLikeUpdate = true;
                GetBrowsingAgent().like(this.postData.uri, this.postData.cid)
                .then(res => {
                    if(this.postData.viewer) this.postData.viewer.like = res.uri; //Update current Post to be "liked"
                    //Increase like count by 1
                    this.postData.likeCount = this.postData.likeCount + 1;
                    AppState.UpdatePostsInFeedList(this.postData);
                    this.isAwaitingLikeUpdate = false;
                })
                .catch(err => {
                    toast.add({summary:"Error", detail:`${err} Issue liking post by ${this.postData.author.handle}`, severity:'error', group:'tr', life:3000});
                })
            }
            else{//Unlike
                this.askAboutUnlike();
            }
        },
        /**
         * Method prompts the User to confirm if they would like to undo the repost of the
         * selected Post. Passes the component method `undoRepost()` to `ConfirmUndoRepost()`
         * which will only be performed if the User selects the "confirm" option.
         */
        askAboutRepostUndo(){
            ConfirmUndoRepost(this.UndoRepost);
        },
        /**
         * Undoes the repost of a specific Post.
         * @param repostUri The URI of the Repost to undo (delete).
         */
        async UndoRepost(){
            if(this.postData.viewer && this.postData.viewer.repost){
                this.isAwaitingRepostUpdate = true;
                await GetBrowsingAgent().deleteRepost(this.postData.viewer.repost)
                .then(() => {
                    if(this.postData.viewer) this.postData.viewer.repost = undefined; //Update current Post to not be reposted
                    //Decrease repost count by 1
                    if(this.postData.repostCount) this.postData.repostCount = this.postData.repostCount - 1;
                    else this.postData.repostCount = 0;
                    AppState.UpdatePostsInFeedList(this.postData);
                    this.isAwaitingRepostUpdate = false;
                })
                .catch(err => {
                    toast.add({summary:"Error", detail:`${err} Issue undoing repost of post by ${this.postData.author.handle}`, severity:'error', group:'tr', life:3000});
                    this.isAwaitingRepostUpdate = false;
                })
            }
        },
        /**
         * Method that allows the User to Repost and undo a Repost while they're
         * logged in.
         */
        async toggleRepost(){
            if(!AppState.checkIfLoggedIn('repost a Post')) return;
            if(this.isAwaitingRepostUpdate) return;
            if(!this.isPostRepostedByUser){
                this.isAwaitingRepostUpdate = true;
                GetBrowsingAgent().repost(this.postData.uri, this.postData.cid)
                .then(res => {
                    if(this.postData.viewer) this.postData.viewer.repost = res.uri; //Update current Post to be "reposted"
                    //Increase repost count by 1
                    if(this.postData.repostCount) this.postData.repostCount = this.postData.repostCount + 1;
                    else this.postData.repostCount = 1;
                    AppState.UpdatePostsInFeedList(this.postData);
                    this.isAwaitingRepostUpdate = false;
                })
                .catch(err => {
                    toast.add({summary:"Error", detail:`${err} Issue reposting post by ${this.postData.author.handle}`, severity:'error', group:'tr', life:3000});
                })
            }
            else{
                if(this.postData.viewer && this.postData.viewer.repost){
                    this.askAboutRepostUndo();
                }
            }
        },
        /**
         * Method prompts the User to confirm if they would like to delete the selected
         * Post. Passes the component `deletePost()` method to `ConfirmPostDelete()` which will
         * only be performed if the User selects the "confirm" option.
         */
        askAboutDelete(){
            ConfirmPostDelete(this.deletePost);
        },
        /**
         * Method that deletes the Post that this component is attached to. Should not be
         * called directly - use `askAboutDelete()`.
         */
        async deletePost(){
            if(!AppState.checkIfLoggedIn('delete a Post')) return;
            if(this.isAwaitingPostDelete) return;
            this.isAwaitingPostDelete = true;
            console.log(this.postData);
            await DeletePost(this.postData)
            .then(() => {
                //update feeds to reflect that post has been deleted
                AppState.removeDeletedPostFromLists(this.postData.cid);
                toast.add({summary:"Post Deleted", detail:`Deleted post "${this.postData.record.text}""`, severity:'success', group:'tr', life:3000});
                this.isAwaitingPostDelete = false;
            })
            .catch(err => {
                toast.add({summary:"Error", detail:`${err} Issue deleting post by ${this.postData.author.handle}`, severity:'error', group:'tr', life:3000});
                this.isAwaitingPostDelete = false;
            })
        }
    },
    computed:{
        /**Checks if the Post this control is associated with is Liked by the current User. */
        isPostLikedByUser(){
            if(this.postData.viewer && this.postData.viewer.like) return true;
            return false;
        },
        /**Checks if the Post this control is associated with has been Reposted by the current User. */
        isPostRepostedByUser(){
            if(this.postData.viewer && this.postData.viewer.repost) return true;
            return false;
        },
        /**
         * Checks if the current User can reply to the current post. Not fully implemented
         * yet - will prevent replying if any Threadgate.Allow rule is found.
         */
        canUserReply(){
            if(this.postData.threadgate){
                let tgRecord = this.postData.threadgate.record as AppBskyFeedThreadgate.Record
                if(!tgRecord.allow) return false;
            }
            else{return true;}
        },
    }
})
</script>

<style scoped>
</style>