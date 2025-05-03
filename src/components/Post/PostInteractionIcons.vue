<template>
    <div :class="textColorClass" class="flex flex-wrap text-secondary py-2 gap-1 *:h-5 justify-around">
        <div class="group flex items-center cursor-pointer hover:text-slate-300">
            <i-solar:chat-dots-outline class="pointer-events-none group-hover:text-yellow-500"/>
            <div class="pl-1" :title="numComments?.toString()">{{ getCompactNumberValue(numComments ? numComments : 0) }}</div>
        </div>
        <div class="group flex items-center cursor-pointer hover:text-slate-300">
            <i-mingcute:repeat-line class="pointer-events-none group-hover:text-blue-500"/>
            <div class="pl-1" :title="numShares?.toString()">{{ getCompactNumberValue(numShares ? numShares : 0) }}</div>
        </div>
        <div class="group flex items-center cursor-pointer hover:text-slate-300">
            <i-mingcute:heart-fill class="pointer-events-none group-hover:text-red-500"/>
            <div class="pl-1" :title="numLikes?.toString()">{{ getCompactNumberValue(numLikes ? numLikes : 0) }}</div>
        </div>
        <div v-if="!noShareButton" class="group flex items-center cursor-pointer hover:text-slate-300">
            <i-solar:share-bold class="pointer-events-none group-hover:text-blue-500"/>
        </div>
        <div @click="postDetails.showPostOptionsMenu" class="group flex items-center cursor-pointer hover:text-slate-300">
            <i-mdi:dots-horizontal class="pointer-events-none group-hover:text-primary"/>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';
import { getCompactNumberValue } from '../../helpers/converters';

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
            postDetails,
            getCompactNumberValue,
        }
    },
    setup () {
        return {}
    }
})
</script>

<style scoped>
</style>