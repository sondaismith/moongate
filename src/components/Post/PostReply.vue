<template>
    <div class="flex">
        <div class="flex-col">
            <AvatarRound :avatar="avatar" :did="userDid" :handle="userHandle"/>
            {{ void "below is connector for replies" }}
            <div v-if="(replyThreadIndex!=undefined && totalThreadReplies && replyThreadIndex<totalThreadReplies)" class="h-full bg-slate-700 w-0.5 m-auto"></div>
        </div>
        <div class="w-full pl-2 min-w-0">
            <div class="flex leading-5 text-sm text-primary items-center">
                <div class="flex items-center gap-1 overflow-hidden">
                    <div class="font-bold text-nowrap overflow-hidden text-ellipsis"
                    :title="userName">{{ userName }}</div>
                    <VerifiedBadge v-if="isUserVerified" class="size-4"/>
                </div>
                <div class="flex-1 text-feedPostName text-secondary pl-1 min-w-[60px] text-nowrap overflow-hidden text-ellipsis">@{{ userHandle }}</div>
                <div class="text-feedPostName text-secondary px-1 ml-auto text-nowrap cursor-pointer hover:text-secondaryHover"
                :title="convertToLongTimestamp(timestamp)"
                @click="postDetails.setCurrentThreadView(cid)"
                >
                {{ convertToShortTimestamp(timestamp) }}
            </div>
            </div>
            <div class="text-sm break-words">
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
import { defineComponent, PropType } from 'vue'
import * as PostEnums from "../../enums/PostEnums";
import { IDetailIcon } from '../../interfaces/PostInterfaces';
import { DetailIconList } from '../../fake-data/dumPostData';
import PostInteractionIcons from './PostInteractionIcons.vue';
import { convertToLongTimestamp, convertToShortTimestamp } from '../../helpers/converters';
import { postDetails } from '../../state/PostDetails.vue';
import AvatarRound from '../Utilities/AvatarRound.vue';
import VerifiedBadge from '../Utilities/VerifiedBadge.vue';
import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

var postReplyData : IDetailIcon[];

export default defineComponent({
    components:{
        AvatarRound,
        PostInteractionIcons,
        VerifiedBadge,
    },
    props:{
        cid: String,
        parentCID: String,
        userName: String,
        userHandle: String,
        userDid:String,
        avatar: String,
        totalComments: Number, //not going to actually be in final version, just use .length
        totalReposts: Number,
        totalLikes: Number,
        postText: String,
        timestamp: String,
        replyThreadIndex: Number,
        totalThreadReplies: Number,
        profileData:{} as PropType<ProfileView>,
        // postMedia?: String,
        // timestamp?: Date
    },
    data(){
        return{
            iconTypes:PostEnums.IconTypes,
            replyData : postReplyData,
            convertToShortTimestamp,
            convertToLongTimestamp,
            postDetails,
        }
    },
    created(){
        this.replyData = DetailIconList
    },
    computed:{
        /**
         * Method used to see if the author of the Post is verified.
         */
        isUserVerified(){
            if(this.profileData && this.profileData != undefined &&
            this.profileData.verification && this.profileData.verification.verifiedStatus == 'valid')
                return true;
            return false;
        },
    }
})
</script>