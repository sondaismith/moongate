<template>
    <div class="flex">
        <div class="flex flex-col">
            <div class="rounded-full bg-stone-500 aspect-square size-10">
                <i-mdi-robot-angry class="h-full w-full p-2"/>
            </div>
            {{ void "below is connector for replies" }}
            <div v-if="Number(totalComments) > 0" class="h-full bg-slate-700 w-0.5 m-auto"></div>
        </div>
        <div class="w-full pl-2">
            <div class="flex leading-5 text-sm text-slate-400 items-center">
                <div class="font-bold text-white">{{ userName }}</div>
                <div class="text-feedPostName pl-1">@{{ userHandle }}</div>
                <div class="text-feedPostName pr-1 ml-auto">31m</div>
            </div>
            <div class="text-sm">
                {{ postText }}
            </div>
            <div>
                <div class="flex text-slate-400 py-2 space-x-2 justify-between">
                    <PostDetailIcon v-for="item in replyData" :iconDetails="item"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import * as PostEnums from "../../enums/PostEnums";
import { IDetailIcon } from '../../interfaces/PostInterfaces';
import { DetailIconList } from '../../fake-data/dumPostData';

var postReplyData : IDetailIcon[];

export default defineComponent({
    props:{
        userName: String,
        userHandle: String,
        totalComments: Number, //not going to actually be in final version, just use .length
        totalReposts: Number,
        totalLikes: Number,
        postText: String,
        // postMedia?: String,
        // timestamp?: Date
    },
    data(){
        return{
            iconTypes:PostEnums.IconTypes,
            replyData : postReplyData,
        }
    },
    created(){
        this.replyData = DetailIconList
    }
})
</script>