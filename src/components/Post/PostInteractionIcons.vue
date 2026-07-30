<template>
    <div :class="textColorClass" class="flex flex-wrap -mt-1 text-secondary gap-1 justify-around justify-betweens
     *:p-1 *:bg-red-600s">
        <button :disabled="!canUserReply" data-test="postInteraction-reply-button" class="flex gap-0.5 rounded-full items-center border-none shadow-none
        outline outline-2 outline-transparent focus-visible:outline-focusBorder"
        :class="canUserReply ? 'group cursor-pointer hover:bg-btnSubtle' : 'text-disabled select-none'"
        @click="canUserReply && replyToPost()" :title="postDetails.whoCanReply(postData)">
            <i-solar:chat-dots-outline class="pointer-events-none group-hover:text-yellow-600 group-active:text-yellow-700"/>
            <div v-if="!AppSettingsState.Settings.isHidingComments" :title="postData.replyCount?.toString()">
                {{ getCompactNumberValue(postData.replyCount ? postData.replyCount : 0) }}
            </div>
        </button>
        <button class="group flex rounded-full items-center cursor-pointer gap-0.5 hover:bg-btnSubtle border-none shadow-none
        outline outline-2 outline-transparent focus-visible:outline-focusBorder"
        title="Repost"
        @click="showRepostOptionsMenu($event, postData)">
            <i-mingcute:repeat-line class="group-active:text-blue-700"
            :class="[isPostRepostedByUser ? 'text-blue-500' : 'group-hover:text-blue-500']"/>
            <div v-if="!isAwaitingRepostUpdate" :title="postData.repostCount?.toString()" :class="[{'hidden' : AppSettingsState.Settings.isHidingShares}]">
                {{ getCompactNumberValue(postData.repostCount ? postData.repostCount : 0) }}
            </div>
            <i-mingcute:loading-fill v-else class="text-primary spinner self-center size-3"/>
        </button>
        <button @click="toggleLike" class="group flex rounded-full items-center cursor-pointer gap-0.5 hover:bg-btnSubtle
        border-none shadow-none outline outline-2 outline-transparent focus-visible:outline-focusBorder"
        title="Like Post">
            <i-mingcute:heart-fill class="group-active:text-red-700"
            :class="[isPostLikedByUser ? 'text-red-500' : 'group-hover:text-red-500']"/>
            <div v-if="!isAwaitingLikeUpdate":title="postData.likeCount?.toString()" :class="[{'hidden' : AppSettingsState.Settings.isHidingLikes}]">
                {{ getCompactNumberValue(postData.likeCount ? postData.likeCount : 0) }}
            </div>
            <i-mingcute:loading-fill v-else class="text-primary spinner self-center size-3"/>
        </button>
        <div class="flex !p-0 min-h-[28px]">
            <!-- <div @click="" class="group flex rounded-full items-center cursor-pointer
            gap-1 hover:bg-btnSubtle"
            title="Save Post">
                <i-mingcute:bookmark-fill class="group-active:text-green-700"
                :class="[isPostLikedByUser ? 'text-green-500' : 'group-hover:text-green-500']"/>
                <i-mingcute:loading-fill v-if="isAwaitingBookmarkUpdate" class="text-primary spinner self-center size-3"/>
            </div> -->
            <button @click="showOptionsMenu($event, postData.uri, postData.author.handle)"
            :disabled="isAwaitingBookmarkUpdate || isAwaitingAccountBlockAction || isAwaitingAccountMuteAction"
            title="More Actions" class="group flex px-1.5 min-w-[28px] rounded-full items-center border-0 hover:bg-btnSubtle disabled:bg-disabledBG disabled:text-disabled disabled:cursor-not-allowed shadow-none
            outline outline-2 outline-transparent focus-visible:!outline-blue-500">
                <i-mingcute:loading-fill v-if="isAwaitingBookmarkUpdate || isAwaitingAccountBlockAction || isAwaitingAccountMuteAction"
                class="text-primary spinner self-center p-0.5"/>
                <i-mdi:dots-horizontal v-else class="pointer-events-none group-hover:text-primary group-disabled:text-disabled"/>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
//Option Menu icons
import MingcuteLinkLine from '~icons/mingcute/link-line';
import MingcuteRepeatLine from '~icons/mingcute/repeat-line';
import MingcuteQuoteRightFill from '~icons/mingcute/quote-right-fill';
import MingcuteDelete2Line from '~icons/mingcute/delete-2-line';
import MingcuteBookmarkLine from '~icons/mingcute/bookmark-line';
import MingcuteBookmarkFill from '~icons/mingcute/bookmark-fill';
import MingcuteVolumeMuteFill from '~icons/mingcute/volume-mute-fill';
import BlueskySocialFillIcon from '~icons/mingcute/bluesky-social-fill';
import MingcuteVolumeFill from '~icons/mingcute/volume-fill';
import MdiPersonBlock from '~icons/mdi/person-block';
import MdiUserCheck from '~icons/mdi/user-check';

import { defineComponent, PropType } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';
import { CreateBskyWeblink, getCompactNumberValue } from '../../helpers/converters';
import { OptionsMenuState } from '../../state/OptionsMenuState.vue';
import { IOptionMenuItem, ItemType } from '../Utilities/OptionsMenu.vue';
import { AppBskyFeedDefs } from '@atproto/api';
import { AppState, CopyTextToClipboard, toast } from '../../state/AppState.vue';
import { PostActions } from '../../enums/PostEnums';
import { GetBrowsingAgent } from '../../lib/api.vue';
import { BookmarkPost, DeletePost, RemoveBookmark } from '../../lib/api/Post.vue';
import { AppBskyFeedThreadgate } from '@atproto/api';
import { AppSettingsState } from '../../state/AppSettingsState.vue';
import { toggleBlock, toggleMute } from '../../lib/api/User.vue';

function CopyPostLink(postUri:string, handle:string="", returnMoongateLink:boolean=false){
    let link = CreateBskyWeblink(postUri, handle, returnMoongateLink);
    if(typeof link != 'undefined')
        CopyTextToClipboard(link, 'link');
    else
        toast.add({summary:'Error creating Link',severity:'error', group:'bc', life:1000});
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
function QuotePost(post:AppBskyFeedDefs.PostView){
    postDetails.prepareForPostAction(post,PostActions.Quote)
    AppState.showCreatePost();
}

export default defineComponent({
    props:{
        textColorClass: String,
        noShareButton: Boolean,
        /**Data representing the Post that the interactions will be acted upon. */
        postData:{
            type: Object as PropType<AppBskyFeedDefs.PostView>,
            required: true
        }
    },
    data(){
        return{
            AppState,
            AppSettingsState,
            isPostMenuVisible: false,
            postDetails,
            getCompactNumberValue,
            postThread: {} as AppBskyFeedDefs.ThreadViewPost,
            isAwaitingLikeUpdate:false,
            isAwaitingRepostUpdate:false,
            // isAwaitingBookmarkUpdate:false,
            isAwaitingPostDelete:false,
            /**Are we currently waiting for an action relating to saving/removing a Post bookmark to finish? */
            isAwaitingBookmarkUpdate:false,
            /**Are we currently waiting for an action relating to muting or unmuting a User account to finish? */
            isAwaitingAccountMuteAction:false,
            /**Are we currently waiting for an action relating to blocking or unblocking a User account to finish? */
            isAwaitingAccountBlockAction:false,
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
                {Icon:BlueskySocialFillIcon,Label:'Copy link to Post (Bluesky)',Action:function(){CopyPostLink(postURI, handle)},Type:ItemType.Option},
                {Icon:'moongate',Label:'Copy link to Post (Moongate)',Action:function(){CopyPostLink(postURI, handle, true)},Type:ItemType.Option},
            ] as IOptionMenuItem[]
            OptionsMenuState.currentMenuItems.push({Icon:MingcuteBookmarkFill,Label:'',Action:()=>{},Type:ItemType.Splitter});
            if(this.isPostBookmarked)
                OptionsMenuState.currentMenuItems.push({Icon:MingcuteBookmarkFill,IconStyle:'text-postBookmarkActive',Label:'Remove Bookmark',Action:this.toggleBookmark,Type:ItemType.Option});
            else
                OptionsMenuState.currentMenuItems.push({Icon:MingcuteBookmarkLine,Label:'Bookmark Post',Action:this.toggleBookmark,Type:ItemType.Option});
            if(AppState.isAuthBrowsing && GetBrowsingAgent().did != this.postData.author.did){
                OptionsMenuState.currentMenuItems.push({Icon:MingcuteVolumeMuteFill,Label:'Mute Account',Action:this.requestToggleMute,Type:ItemType.Splitter});
                if(!this.isAccountMuted)
                    OptionsMenuState.currentMenuItems.push({Icon:MingcuteVolumeMuteFill,Label:'Mute Account',Action:this.requestToggleMute,Type:ItemType.Option});
                else
                    OptionsMenuState.currentMenuItems.push({Icon:MingcuteVolumeFill,Label:'Unmute Account',Action:this.requestToggleMute,Type:ItemType.Option});
                if(!this.isAccountBlocked)
                    OptionsMenuState.currentMenuItems.push({Icon:MdiPersonBlock,Label:'Block Account',Action:this.requestToggleBlock,Type:ItemType.Option});
                else
                    OptionsMenuState.currentMenuItems.push({Icon:MdiUserCheck,Label:'Unblock Account',Action:this.requestToggleBlock,Type:ItemType.Option});
            }
            //Only show "delete post" option if the User is logged in and this is one of their Posts
            if(AppState.isAuthBrowsing && GetBrowsingAgent().did == this.postData.author.did){
                OptionsMenuState.currentMenuItems.push({Icon:MingcuteDelete2Line,Label:'',Action:()=>{},Type:ItemType.Splitter});
                OptionsMenuState.currentMenuItems.push({
                    Icon:MingcuteDelete2Line,
                    Label:'Delete Post',
                    Action:this.askAboutDelete,
                    Type:ItemType.Option,
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
        showRepostOptionsMenu(e:MouseEvent, post:AppBskyFeedDefs.PostView){
            e.preventDefault();
            let isReposted = this.isPostRepostedByUser
            if(!AppState.checkIfLoggedIn('repost/quote post')) return;
            OptionsMenuState.currentMenuItems = [
                {Icon:MingcuteRepeatLine,Label:(isReposted ? 'Undo Repost' : 'Repost'),Action:this.toggleRepost,Type:ItemType.Option},
                {Icon:MingcuteQuoteRightFill,Label:'Quote post',Action:function(){QuotePost(post)},Type:ItemType.Option},
            ] as IOptionMenuItem[]
            //if the current user cannot quote post the interacted with post, "disable" the quote post button
            if(typeof post.viewer != 'undefined' && typeof post.viewer.embeddingDisabled != undefined && post.viewer.embeddingDisabled){
                OptionsMenuState.currentMenuItems[1] = {Icon:MingcuteQuoteRightFill,Label:'Quote Posts disabled',Action:()=>{},Type:ItemType.Option,disabled:true}
            }
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
        },
        /**
         * Method used to attempt to mute/unmute the account associated with the
         * Post that was interacted with.
         */
        async requestToggleMute(){
            if(this.isAwaitingAccountMuteAction) return;
            this.isAwaitingAccountMuteAction = true;
            await toggleMute(this.postData.author)
            .finally(() => {this.isAwaitingAccountMuteAction = false});
        },
        /**
         * Method used to attempt to block/unblock the account associated with the
         * Post that was interacted with.
         */
        async requestToggleBlock(){
            if(this.isAwaitingAccountBlockAction) return;
            this.isAwaitingAccountBlockAction = true;
            await toggleBlock(this.postData.author)
            .finally(() => {this.isAwaitingAccountBlockAction = false});
        },
        /**
         * Toggles the "Bookmark" status of a Post. Requires login.
         */
        async toggleBookmark(){
            if(!AppState.checkIfLoggedIn('bookmark a Post')) return;
            this.isAwaitingBookmarkUpdate = true;
            if(this.isPostBookmarked){
                await RemoveBookmark(this.postData)
                .then(() => {
                    if(typeof this.postData.viewer != 'undefined') this.postData.viewer.bookmarked = false;
                    toast.add({summary:'Success',detail:`Bookmarked Removed`,severity:'success',group:'tr',life:3000});
                })
                .catch(err => {
                    toast.add({summary:'Error',detail:`${err}`,severity:'error',group:'tr',life:3000});
                    console.log(err);
                })
                .finally(() => {
                    this.isAwaitingBookmarkUpdate = false;
                })
            }
            else{
                await BookmarkPost(this.postData)
                .then(() => {
                    if(typeof this.postData.viewer != 'undefined') this.postData.viewer.bookmarked = true;
                    toast.add({summary:'Success',detail:`Post Bookmarked`,severity:'success',group:'tr',life:3000});
                })
                .catch(err => {
                    toast.add({summary:'Error',detail:`${err}`,severity:'error',group:'tr',life:3000});
                    console.log(err);
                })
                .finally(() => {
                    this.isAwaitingBookmarkUpdate = false;
                })
            }
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
            let status = true;
            //user is logged in - viewer is available
            if(typeof this.postData.viewer != 'undefined' && typeof this.postData.viewer.replyDisabled != 'undefined'){
                status = !this.postData.viewer.replyDisabled;
            }
            //no viewer, check thread gate
            else if(typeof this.postData.threadgate != 'undefined'){
                let tgRecord = this.postData.threadgate.record as AppBskyFeedThreadgate.Record
                //show disabled if "no replies" rule applied
                if(typeof tgRecord.allow != 'undefined' && tgRecord.allow.length == 0) status = false;
            }
            return status;
        },
        /**Checks if the current Post has been bookmarked by the current User. */
        isPostBookmarked(){
            return typeof this.postData.viewer != 'undefined' && typeof this.postData.viewer.bookmarked != 'undefined' && this.postData.viewer.bookmarked;
        },
        isAccountMuted(){
            return (typeof this.postData.author.viewer != 'undefined' && typeof this.postData.author.viewer.muted != 'undefined' && this.postData.author.viewer.muted);
        },
        isAccountBlocked(){
            return (typeof this.postData.author.viewer != 'undefined' && typeof this.postData.author.viewer.blocking != 'undefined');
        }
    }
})
</script>

<style scoped>
</style>