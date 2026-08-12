<template>
    <div class="flex gap-1 items-center p-2 hover:bg-btnHover transition-colors"
    :class="errorGettingPost ? 'cursor-not-allowed' : 'cursor-pointer'"
    :title="errorGettingPost ? 'Unable to view content' : 'View related content'"
    @click="!errorGettingPost && openRelatedContent()">
        <div class="flex flex-col overflow-hidden w-full gap-1">
            <div class="flex items-center gap-2">
                <component :is="getNotifIcon?.icon" class="size-7 shrink-0" :class="getNotifIcon?.color"/>
                <AvatarRound :author-details="notifData.author"/>
                <div class="flex flex-col overflow-hidden">
                    <div class="text-primary font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
                    :title="notifData.author.displayName ? notifData.author.displayName : notifData.author.handle">
                        {{ notifData.author.displayName ? notifData.author.displayName : notifData.author.handle }}
                    </div>
                    <div class="text-primary text-xs">{{ generateNotifMessage }}</div>
                </div>
                <div class="ml-auto text-secondary text-xs text-nowrap self-start">{{ convertToShortTimestamp(notifData?.indexedAt) }}</div>
            </div>
            <div class="flex gap-1 items-center">
                <i-mingcute:warning-fill v-if="errorGettingPost" class="text-yellow-500 size-6"/>
                <div class="text-secondary">{{ contentText }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { convertToShortTimestamp } from '../../helpers/converters';
import { AppBskyNotificationListNotifications } from '@atproto/api';
import AvatarRound from '../Utilities/AvatarRound.vue';

//Icons
import MingcuteHeartFill from '~icons/mingcute/heart-fill';
import MingcuteUserFollowFill from '~icons/mingcute/user-follow-fill';
import SolarChatDotsOutline from '~icons/solar/chat-dots-outline';
import MingcuteRepeatLine from '~icons/mingcute/repeat-line';
import SolarMentionCircleBold from '~icons/solar/mention-circle-bold';
import MingcuteQuoteRightFill from '~icons/mingcute/quote-right-fill';
import MingcuteQuestionFill from '~icons/mingcute/question-fill';
import { AppBskyFeedDefs } from '@atproto/api';
import { showFocusModal } from '../../state/PostDetails.vue';
import { GetBrowsingAgent } from '../../lib/api.vue';
import { toast } from '../../state/AppState.vue';
import { HandleAPIError } from '../../helpers/errors';

var NotifIcons = [
    { name: 'like', icon: MingcuteHeartFill },
    { name: 'follow', icon: MingcuteUserFollowFill },
    { name: 'reply', icon: SolarChatDotsOutline },
    { name: 'repost', icon: MingcuteRepeatLine },
    { name: 'mention', icon: SolarMentionCircleBold },
    { name: 'quote', icon: MingcuteQuoteRightFill },
    { name: 'unknown', icon: MingcuteQuestionFill },
]

export default defineComponent({
    components:{
        AvatarRound,
    },
    props:{
        notifData:{
            type: Object as PropType<AppBskyNotificationListNotifications.Notification>,
            required: true
        }
    },
    data(){
        return{
            convertToShortTimestamp,
            contentText:'',
            isAwaitingContentText:false,
            errorGettingPost:false,
        }
    },
    methods:{
        openRelatedContent(){
            // alert('You clicked the notification component.');
            if(typeof this.notifData != 'undefined'){
                let post:AppBskyFeedDefs.PostView = {
                    author:{did:'',handle:''},
                    cid:this.notifData.record.subject.cid,
                    indexedAt:'',
                    record:{},
                    uri:this.notifData.record.subject.uri
                }
                showFocusModal({post: post}, 0);
            }
        },
        openFocusDetailsPost(post:AppBskyFeedDefs.PostView, mediaIndex:number=0){
            if(this.notifData){
                showFocusModal({post: post}, mediaIndex);
            }
        },
        async getRelatedContent(){
            if(this.notifData){
                await GetBrowsingAgent().getPostThread({
                    uri:this.notifData.record.subject.uri
                })
                .then(res => {
                    if(AppBskyFeedDefs.isThreadViewPost(res.data.thread)){
                        this.contentText = (res.data.thread as AppBskyFeedDefs.ThreadViewPost).post.record.text as string;
                    }
                })
                .catch(err => {
                    // toast.add(HandleAPIError(err, 'Error loading Post text'));
                    this.contentText = '[Post cannot be found]'
                    this.errorGettingPost = true;
                })
            }
        }
    },
    computed:{
        generateNotifMessage(){
            if(this.notifData){
                switch (this.notifData.reason) {
                    case 'like':
                        return "liked your post";
                    case 'follow':
                        return 'followed you';
                    case 'reply':
                        return 'replied to your post';
                    case 'repost':
                        return 'reposted your post';
                    case 'mention':
                        return 'mentioned you in a post';
                    case 'quote':
                        return 'quoted your post';
                    default:
                        return this.notifData.reason;
                }
            }
        },
        getNotifIcon(){
            if(this.notifData){
                switch (this.notifData.reason) {
                    case 'like':
                        return {icon:MingcuteHeartFill,color:'text-red-500'};
                    case 'follow':
                        return {icon:MingcuteUserFollowFill,color:'text-blue-500'};
                    case 'reply':
                        return {icon:SolarChatDotsOutline,color:'text-yellow-500'};
                    case 'repost':
                        return {icon:MingcuteRepeatLine,color:'text-blue-500'};
                    case 'mention':
                        return {icon:SolarMentionCircleBold,color:'text-blue-500'};
                    case 'quote':
                        return {icon:MingcuteQuoteRightFill,color:'text-blue-500'};
                    default:
                        return {icon:MingcuteQuestionFill,color:'text-blue-400'};
                }
            }
        }
    },
    mounted(){
        this.getRelatedContent();
    }
})
</script>

<style scoped>

</style>