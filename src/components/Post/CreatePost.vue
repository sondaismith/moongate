<template>
    <div class="absolute z-30 flex w-full h-full">
        <div @click="confirmClose(canSubmitPost)" class="absolute w-full h-full bg-slate-800/60"/>
        <div class="relative rounded-lg flex flex-col w-3/5 text-primary bg-focusBG border
        border-outlineLighter p-3 m-auto gap-3">
            <div class="flex items-center justify-between">
                <div @click="confirmClose(canSubmitPost)" class="font-bold text-sky-500 hover:text-sky-300 cursor-pointer">Cancel</div>
                <PillButton @click="createNewPost" class="transition-colors px-4 py-1 bg-sky-500" :class="(!canSubmitPost || postDetails.isAwaitingPostThreadData) ? '!bg-gray-400 text-gray-500 !cursor-default' : ''">Post</PillButton>
            </div>
            <div v-if="postDetails.currentPostAction == PostActions.Reply && postDetails.isAwaitingPostThreadData">
                <i-mingcute:loading-fill class="text-primary spinner self-center size-10"/>
            </div>
            <div v-else-if="postDetails.currentPostAction == PostActions.Reply" class="flex flex-col gap-1">
                <div class="flex flex-col self-start text-sm underlines select-none">
                    <div>Replying to...</div>
                    <div class="h-[1px] bg-outlineLighter"></div>
                </div>
                <div v-for="post in [postDetails.currentPostData]"
                class="flex gap-2">
                    <div class="p-1">
                        <AvatarRound :avatar="post.author.avatar"/>
                    </div>
                    <div class="flex flex-col overflow-hidden shrink">
                        <div class="flex gap-1 text-nowrap">
                            <div class="text-sm overflow-hidden text-ellipsis font-bold"
                            :title="post.author.displayName">{{ post.author.displayName }}</div>
                            <div class="text-sm overflow-hidden text-ellipsis text-secondary"
                            :title="post.author.handle">@{{ post.author.handle }}</div>
                        </div>
                        <RichPostTextBsky :post-text="getPostText" class="text-sm"/>
                    </div>
                    <div v-if="postContainsImage" class="ml-auto shrink-0 h-16 w-fulls rounded overflow-hidden box-content border border-outlineLighter"
                    :style="`aspect-ratio:${getPostImages[0].aspectRatio?.width}/${getPostImages[0].aspectRatio?.height}`">
                        <div class="h-full bg-contain bg-no-repeat"
                        :style="{'background-image': `url(${getPostImages[0].fullsize})`}"></div>
                    </div>
                    <div v-if="postContainsVideo"
                    class="ml-auto rounded-md text-sm w-16 p-1 bg-focusBG
                    border border-secondary text-center self-center">
                        Video
                    </div>
                    <div v-if="postContainsExternalEmbed"
                    class="ml-auto rounded-md text-sm w-16 p-1 bg-focusBG
                    border border-secondary text-center self-center">
                        External Embed
                    </div>
                </div>
                <div class="h-[1px] bg-outlineLighter"></div>
            </div>
            <div class="flex gap-2">
                <div class="p-1">
                    <AvatarRound class=""/>
                </div>
                <textarea id="post-textarea" role="text" placeholder="What do you want to say?" contenteditable
                @input="limitChars" v-model="postText"
                class="block rounded p-2  bg-postBG w-full postPlaceholder"/>
                <!-- <span role="text" placeholder="What do you want to say?" contenteditable
                @focusin="postInputFocusGained" @focusout="postInputFocusLost"
                @input="limitChars"
                class="block rounded p-2 bg-slate-900 w-full postPlaceholder"/> -->
            </div>
            <div v-if="postDetails.currentPostAction == PostActions.Quote && postDetails.isAwaitingPostThreadData">
                <i-mingcute:loading-fill class="text-primary spinner self-center size-10"/>
            </div>
            <div v-else-if="postDetails.currentPostAction == PostActions.Quote" class="flex flex-col gap-1">
                <!-- <div class="flex flex-col self-start text-sm underlines select-none">
                    <div>Quoting...</div>
                    <div class="h-[1px] bg-outlineLighter"></div>
                </div> -->
                <div v-for="post in [postDetails.currentPostData]"
                class="flex flex-col rounded-md p-2 gap-1 border border-outline">
                    <div class="flex gap-1 items-center">
                        <AvatarRound :avatar="post.author.avatar" class="size-6"/>
                        <div class="flex gap-1 text-nowrap overflow-hidden">
                            <div class="text-sm overflow-hidden text-ellipsis font-bold"
                            :title="post.author.displayName">{{ post.author.displayName }}</div>
                            <div class="text-sm overflow-hidden text-ellipsis text-secondary"
                            :title="post.author.handle">@{{ post.author.handle }}</div>
                        </div>
                    </div>
                    <div class="flex items-start flex-col self-start gap-1 overflow-hidden shrink">
                        <RichPostTextBsky :post-text="getPostText" class="text-sm"/>
                        <div v-if="postContainsImage" class="flex min-h-48 rounded overflow-hidden box-content border border-outlineLighter"
                        :style="`aspect-ratio:${getPostImages[0].aspectRatio?.width}/${getPostImages[0].aspectRatio?.height}`">
                            <div class="w-full h-full bg-contain bg-no-repeat"
                            :style="{'background-image': `url(${getPostImages[0].fullsize})`}"></div>
                        </div>
                        <div v-if="postContainsVideo"
                        class="rounded-md text-sm w-16 p-1 bg-focusBG
                        border border-secondary text-center">
                            Video
                        </div>
                        <div v-if="postContainsExternalEmbed"
                        class="rounded-md text-sm w-16 p-1 bg-focusBG
                        border border-secondary text-center">
                            External Embed
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex rounded bg-btn p-2 items-center self-start gap-1 text-sm">
                <i-mingcute:world-2-line/>
                <div>Anybody can interact</div>
            </div>
            <CheckBox :model-value="showsPostAfterCreation" @value-toggled="n => showsPostAfterCreation = n"/>
            <div class="flex items-center">
                <div class="flex gap-1">
                    <div v-for="option in mediaTypes" class="flex rounded p-2 hover:bg-btnHover
                    cursor-pointer text-blue-500 text-xl items-center justify-center">
                        <component :is="option.icon"></component>
                    </div>
                </div>
                <div class="flex items-center ml-auto gap-2 h-10">
                    <div class="font-bold text-sky-500 cursor-not-allowed" title="Language is English Only atm">English</div>
                    <div class="flex items-center gap-2 h-full">
                        <div class="flex min-w-8 justify-end">{{ charsRemaining }}</div>
                        <div class="flex border h-full">
                            <div class="relative flex bg-blue-400 w-2 self-end" :class="charUsagePercent == 100 ? 'bg-red-500' : ''"
                            :style="{'height':charUsagePercent+'%', 'transition':'height 0.4s ease'}"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import MdiInsertPhoto from '~icons/mdi/insert-photo';
import MdiFilmstripBoxMultiple from '~icons/mdi/filmstrip-box-multiple';
import MdiFileGifBox from '~icons/mdi/file-gif-box';
import { AppState, toast } from '../../state/AppState.vue';
import { CreateNewPost } from '../../lib/api/Post.vue';
import { isThreadViewPost, PostView, ThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { postDetails } from '../../state/PostDetails.vue';
import AvatarRound from '../Utilities/AvatarRound.vue';
import { isView, ViewImage } from '@atproto/api/dist/client/types/app/bsky/embed/images';
import RichPostTextBsky from '../Utilities/RichPostTextBsky.vue';
import { AppBskyEmbedRecordWithMedia, AppBskyEmbedVideo, AppBskyEmbedExternal, AppBskyEmbedRecord } from '@atproto/api';
import { isViewRecord } from '@atproto/api/dist/client/types/app/bsky/embed/record';
import { PostActions } from '../../enums/PostEnums';
import CheckBox from '../Utilities/CheckBox.vue';

export default defineComponent({
    components:{
        AvatarRound,
        RichPostTextBsky,
        CheckBox,
    },
    props:{
        avatar: String,
        postRef: Object as PropType<PostView>,
    },
    data(){
        return{
            postText:'',
            mediaTypes:[
                {label:'photo', icon:MdiInsertPhoto},
                {label:'video', icon:MdiFilmstripBoxMultiple},
                {label:'gif', icon:MdiFileGifBox},
            ],
            // canSubmitPost:false,
            confirmClose,
            postDetails,
            isView,
            AppBskyEmbedRecord,
            PostActions,
            isAwaitingPostConfirm:false,
            showsPostAfterCreation:false,
        }
    },
    methods:{
        /**
         * Method used to remove post message placeholder when input is in focus.
         */
        postInputFocusGained(event:FocusEvent){
            (event.target as HTMLElement).classList.remove('postPlaceholder');
            ((event.currentTarget as HTMLElement).nextSibling as HTMLElement).classList.remove('hide');
        },
        /**
         * Method used to add post message placeholder when input loses focus and
         * text is empty.
         */
        postInputFocusLost(event:FocusEvent){
            if ((event.target as HTMLElement).textContent == ""){
                //textbox empty
                (event.target as HTMLElement).classList.add('postPlaceholder');
                ((event.currentTarget as HTMLElement).nextSibling as HTMLElement).classList.add('hide');
            }
        },
        limitChars(){
            //expand/contract textarea height
            var textarea = document.getElementById('post-textarea');
            if(textarea){
                if(textarea.scrollHeight>textarea.clientHeight) textarea.style.height = textarea.scrollHeight+'px';
                else{
                    textarea.style.height = '';
                    textarea.style.height = textarea.scrollHeight+'px';
                }
            }
            //limit char count
            let maxChars = 300;
            if(this.postText.length>maxChars) this.postText = this.postText.slice(0,maxChars);
        },
        async createNewPost(){
            if(this.isAwaitingPostConfirm) return;
            this.isAwaitingPostConfirm = true;
            switch (postDetails.currentPostAction) {
                case PostActions.Post:
                    await CreateNewPost({
                        $type:'app.bsky.feed.post',
                        text: this.postText,
                        langs:['en-US'],
                        createdAt: new Date().toISOString()
                    },this.showsPostAfterCreation)
                    .then(()=>{this.isAwaitingPostConfirm = false});
                    break;
                case PostActions.Reply:
                    if(isThreadViewPost(postDetails.currentPostThreadData)){
                        let root:ThreadViewPost = postDetails.getPostThreadRoot(postDetails.currentPostThreadData);
                        console.log(root);
                        if(isThreadViewPost(root)){
                            await CreateNewPost({
                                $type:'app.bsky.feed.post',
                                text: this.postText,
                                reply:{
                                    root:{
                                        uri:root.post.uri,
                                        cid:root.post.cid
                                    },
                                    parent:{
                                        uri:postDetails.currentPostData.uri,
                                        cid:postDetails.currentPostData.cid
                                    }
                                },
                                langs:['en-US'],
                                createdAt: new Date().toISOString(),
                            },this.showsPostAfterCreation)
                            .then(() =>{
                                AppState.updateReplyParentsInLists(postDetails.currentPostData.cid, postDetails.currentPostData.replyCount ? postDetails.currentPostData.replyCount : 0);
                                this.isAwaitingPostConfirm = false;
                            })
                        }
                    }
                    else{
                        toast.add({summary:'Error', detail:'Referenced post thread is not set/valid', severity:'error', group:'tr', life:3000})
                    }
                    break;
                case PostActions.Quote:
                    if(isThreadViewPost(postDetails.currentPostThreadData)){
                        let root:ThreadViewPost = postDetails.getPostThreadRoot(postDetails.currentPostThreadData);
                        console.log(root);
                        if(isThreadViewPost(root)){
                            await CreateNewPost({
                                $type:'app.bsky.feed.post',
                                text: this.postText,
                                langs:['en-US'],
                                createdAt: new Date().toISOString(),
                                embed:{
                                    $type:'app.bsky.embed.record',
                                    record:{
                                        uri:postDetails.currentPostData.uri,
                                        cid:postDetails.currentPostData.cid
                                    }
                                }
                            },this.showsPostAfterCreation)
                            .then(()=>{this.isAwaitingPostConfirm = false});
                        }
                    }
                    else{
                        toast.add({summary:'Error', detail:'Referenced post thread is not set/valid', severity:'error', group:'tr', life:3000})
                    }
                    break;
                default:
                    break;
            }
        }

    },
    computed:{
        charsRemaining(){
            return 300-this.postText.length;
        },
        charUsagePercent(){
            return ((this.postText.length/300)*100).toFixed(2);
        },
        canSubmitPost(){
            if(this.postText.length>0 && !this.isAwaitingPostConfirm) return true;
            return false;
        },
        /**
         * Determines if the current Post data held by the component contains any images.
         */
         postContainsImage(){
            //This is the standalone/parent Post, not a QRT (Quote Retweet)
            if(!isViewRecord(this.postRef)){
                if(this.postRef?.embed && this.postRef.embed.images){
                    //Is a parent Post with image(s)
                    return true;
                }
                else if(this.postRef?.embed && AppBskyEmbedRecordWithMedia.isView(this.postRef.embed) && this.postRef.embed.media.images){
                    //Is a parent Post with image(s) and a QRT
                    return true;
                }
            }
            else{
                //This is a QRT
                if(this.postRef?.embeds && this.postRef.embeds.length>0 && this.postRef.embeds[0].images){
                    //Is a QRT with image(s)
                    return true;
                }
                else if(this.postRef?.embeds && this.postRef.embeds.length>0 && this.postRef.embeds[0].media &&
                    this.postRef.embeds[0].media.images && this.postRef.embeds[0].media.images.length>0){
                    //Is a QRT with image(s)
                    return true;
                }
            }
        },
        /**
         * Determines if the current Post data held by the component contains any video.
         */
        postContainsVideo(){
            //This is the standalone/parent Post, not a QRT (Quote Retweet)
            if(!isViewRecord(this.postRef)){
                if(this.postRef?.embed && AppBskyEmbedVideo.isView(this.postRef.embed)){
                    //Is a parent Post with video
                    return true;
                }
                else if(this.postRef?.embed && AppBskyEmbedVideo.isView(this.postRef.embed.media)){
                    //Is a parent Post with video and a QRT
                    return true;
                }
            }
            else{
                //This is a QRT
                if(this.postRef?.embeds && AppBskyEmbedVideo.isView(this.postRef.embeds[0])){
                    //Is a QRT with video
                    return true;
                }
            }
            return false;
        },
        /**
         * Determines if the current Post data held by the component contains external embed content.
         */
        postContainsExternalEmbed(){
            //This is the standalone/parent Post, not a QRT (Quote Retweet)
            if(!isViewRecord(this.postRef)){
                if(this.postRef?.embed && AppBskyEmbedExternal.isView(this.postRef.embed)){
                    //Is a parent Post with external embed
                    return true;
                }
                else if(this.postRef?.embed && this.postRef.embed.media && AppBskyEmbedExternal.isView(this.postRef.embed.media)){
                    //Is a parent Post with external embed and a QRT
                    return true;
                }
            }
            else{
                //This is a QRT
                if(this.postRef?.embeds && AppBskyEmbedExternal.isView(this.postRef.embeds[0])){
                    //Is a QRT with external embed
                    return true;
                }
                else if(this.postRef?.embeds && this.postRef.embeds.length>0 && AppBskyEmbedExternal.isView(this.postRef.embeds[0].media)){
                    //Is a QRT with external embed (GIF) with Text ?? not sure
                    return true;
                }
            }
            return false;
        },
        /**
         * Method that figures out what object to pass on to the `ImageContainer` component
         * based on what type of data configuration the current Post has.
         * @returns `ViewImage[]` containing Post images.
         */
        getPostImages():ViewImage[]{
            //This is a standalone/parent Post, not a QRT (Quote Retweet)
            if(!isViewRecord(this.postRef)){
                if(this.postRef?.embed && this.postRef.embed.images){
                    //Is a parent Post with image(s)
                    return this.postRef.embed.images as ViewImage[];
                }
                else if(this.postRef?.embed && AppBskyEmbedRecordWithMedia.isView(this.postRef.embed) && this.postRef.embed.media.images){
                    //Is a parent Post with image(s) and a QRT
                    return this.postRef.embed.media.images as ViewImage[];
                }
            }
            else{
                //This is a QRT
                if(this.postRef?.embeds && this.postRef.embeds.length>0 && this.postRef.embeds[0].images){
                    //Is a QRT with image(s)
                    return this.postRef.embeds[0].images as ViewImage[];
                }
                else if(this.postRef?.embeds && this.postRef.embeds.length>0 && this.postRef.embeds[0].media &&
                    this.postRef.embeds[0].media.images){
                    //Is a QRT with image(s)
                    return this.postRef.embeds[0].media.images as ViewImage[];
                }
            }
            return [];
        },
        /**
         * Method that figures out what object to pass on to the `VideoContainer` component
         * based on what type of data configuration the current Post has.
         * @returns `AppBskyEmbedVideo.View` containing Video details.
         */
        getPostVideo():AppBskyEmbedVideo.View|undefined{
            if(!isViewRecord(this.postRef)){
                if(this.postRef?.embed && AppBskyEmbedVideo.isView(this.postRef.embed)){
                    //Is a parent Post with video
                    return this.postRef.embed;
                }
                else if(this.postRef?.embed && AppBskyEmbedVideo.isView(this.postRef.embed.media)){
                    //Is a parent Post with video and a QRT
                    return this.postRef.embed.media;
                }
            }
            else{
                //This is a QRT
                if(this.postRef?.embeds && AppBskyEmbedVideo.isView(this.postRef.embeds[0])){
                    //Is a QRT with video
                    return this.postRef.embeds[0];
                }
            }
            // return {cid:'',playlist:''};//Empty AppBskyEmbedVideo.View object, shouldn't ever be returned
            return undefined;
        },
        /**
         * Method that figures out what object to pass on to the `EmbedExternal` component
         * based on what type of data configuration the current Post has.
         * @returns `AppBskyEmbedExternal.View` containing external embed details.
         */
        getPostEmbed():AppBskyEmbedExternal.View|undefined{
            //This is the standalone/parent Post, not a QRT (Quote Retweet)
            if(!isViewRecord(this.postRef)){
                if(this.postRef?.embed && AppBskyEmbedExternal.isView(this.postRef.embed)){
                    //Is a parent Post with external embed
                    return this.postRef.embed;
                }
                else if(this.postRef?.embed && this.postRef.embed.media && AppBskyEmbedExternal.isView(this.postRef.embed.media)){
                    //Is a parent Post with external embed and a QRT
                    return this.postRef.embed.media;
                }
            }
            else{
                //This is a QRT
                if(this.postRef?.embeds && AppBskyEmbedExternal.isView(this.postRef.embeds[0])){
                    //Is a QRT with external embed
                    return this.postRef.embeds[0];
                }
                else if(this.postRef?.embeds && this.postRef.embeds.length>0 && AppBskyEmbedExternal.isView(this.postRef.embeds[0].media)){
                    //Is a QRT with external embed (GIF) with Text ?? not sure
                    return this.postRef?.embeds[0].media;
                }
            }
        },
        /**
         * Method that figures out where the text associated with a Post is held based
         * on what type of data configuration the current Post has.
         */
        getPostText():string{
            if(!isViewRecord(this.postRef)) return this.postRef?.record.text;
            else return this.postRef.value.text;
        },
    },
    beforeUnmount() {
        postDetails.currentPostThreadData = {} as ThreadViewPost;
        postDetails.currentPostAction = PostActions.Post;
    },
})

function confirmClose(postContentExists:boolean){
    if(postContentExists){
        AppState.showConfirmModal('Are you sure you want to discard this post?',close);
    }
    else{
        close();
    }
}

function close(){
    AppState.hideCreatePost();
}
</script>

<style scoped>
.postPlaceholder::before{
  color: #94a3b8;
  content: attr(placeholder);
  pointer-events: none;
}
</style>