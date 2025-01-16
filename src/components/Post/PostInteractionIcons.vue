<template>
    <div :class="textColorClass" class="flex text-slate-400 py-2 space-x-1 justify-between">
        <div class="group flex items-center cursor-pointer hover:text-slate-300">
            <i-solar:chat-dots-outline class="pointer-events-none group-hover:text-yellow-500"/>
            <div class="pl-1">{{ numComments }}</div>
        </div>
        <div class="group flex items-center cursor-pointer hover:text-slate-300">
            <i-mingcute:repeat-line class="pointer-events-none group-hover:text-blue-500"/>
            <div class="pl-1">{{ numShares }}</div>
        </div>
        <div class="group flex items-center cursor-pointer hover:text-slate-300">
            <i-mingcute:heart-fill class="pointer-events-none group-hover:text-red-500"/>
            <div class="pl-1">{{ numLikes }}</div>
        </div>
        <div v-if="!noShareButton" class="group flex items-center cursor-pointer hover:text-slate-300">
            <i-solar:share-bold class="pointer-events-none group-hover:text-blue-500"/>
        </div>
        <div @click="postDetails.showPostOptionsMenu" class="group flex items-center cursor-pointer hover:text-slate-300">
            <i-mdi:dots-horizontal class="pointer-events-none group-hover:text-white"/>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';

export default defineComponent({
    props:{
        numComments: Number,
        numShares: Number,
        numLikes: Number,
        textColorClass: String,
        noShareButton: Boolean
    },
    data(){
        return{
            isPostMenuVisible: false,
            postDetails
        }
    },
    setup () {
        return {}
    }
})
</script>

<style scoped>
</style>