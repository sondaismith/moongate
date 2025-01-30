<template>
    <div class="flex">
        <div class="flex-col">
            <div class="rounded-full overflow-hidden flex-shrink-0 bg-stone-500 aspect-square size-10">
                <i-mdi-robot-angry v-if="!avatar" class="h-full w-full p-2"/>
                <div v-if="avatar" class="h-full bg-contain" :style="{'background-image' : 'url('+avatar+')'}"></div>
            </div>
            {{ void "below is connector for replies" }}
            <div v-if="(replyThreadIndex!=undefined && totalThreadReplies && replyThreadIndex<totalThreadReplies)" class="h-full bg-slate-700 w-0.5 m-auto"></div>
        </div>
        <div class="w-full pl-2 min-w-0">
            <div class="flex leading-5 text-sm text-slate-400 items-center">
                <div class="font-bold text-white text-nowrap overflow-hidden text-ellipsis">{{ userName }}</div>
                <div class="flex-1 text-feedPostName pl-1 min-w-[60px] text-nowrap overflow-hidden text-ellipsis">@{{ userHandle }}</div>
                <div class="text-feedPostName px-1 ml-auto text-nowrap" :title="convertToLongTimestamp(timestamp)">{{ convertToShortTimestamp(timestamp) }}</div>
            </div>
            <div class="text-sm">
                {{ postText }}
            </div>
            <div>
                <!-- <div class="flex flex-col text-slate-400 py-2 space-x-2 justify-between"> -->
                    <PostInteractionIcons :numComments="totalComments" :numShares="totalReposts" :numLikes="totalLikes"/>
                <!-- </div> -->
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import * as PostEnums from "../../enums/PostEnums";
import { IDetailIcon } from '../../interfaces/PostInterfaces';
import { DetailIconList } from '../../fake-data/dumPostData';
import PostInteractionIcons from './PostInteractionIcons.vue';
import { convertToLongTimestamp, convertToShortTimestamp } from '../../helpers/converters';

var postReplyData : IDetailIcon[];

export default defineComponent({
    props:{
        userName: String,
        userHandle: String,
        avatar: String,
        totalComments: Number, //not going to actually be in final version, just use .length
        totalReposts: Number,
        totalLikes: Number,
        postText: String,
        timestamp: String,
        replyThreadIndex: Number,
        totalThreadReplies: Number,
        // postMedia?: String,
        // timestamp?: Date
    },
    data(){
        return{
            iconTypes:PostEnums.IconTypes,
            replyData : postReplyData,
            convertToShortTimestamp,
            convertToLongTimestamp,
        }
    },
    created(){
        this.replyData = DetailIconList
    }
})
</script>