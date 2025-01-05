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
                    <PostDetailIcon :iconType="iconTypes.Comment" :iconText="totalComments"/>
                    <PostDetailIcon :iconType="iconTypes.Reposts" :iconText="totalReposts"/>
                    <PostDetailIcon :iconType="iconTypes.Likes" :iconText="totalLikes"/>
                    <PostDetailIcon :iconType="iconTypes.Share"/>
                    <PostDetailIcon :iconType="iconTypes.Options"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { PostEnums } from '../../enums/PostEnums';

export default defineComponent({
    props:{
        userName: String,
        userHandle: String,
        totalComments: String, //not going to actually be in final version, just use .length
        totalReposts: String,
        totalLikes: String,
        postText: String,
        // postMedia?: String,
        // timestamp?: Date
    },
    data(){
        return{
            iconTypes:PostEnums.IconTypes
        }
    }
})
</script>