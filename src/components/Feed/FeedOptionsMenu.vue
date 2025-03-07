<template>
    <div class="absolute flex w-full h-full">
        <!-- <div class="w-full h-full z-10 bg-red-500"> -->
            <div id="feed-btn-menu" class="absolute flex flex-col rounded z-20 p-1 bg-slate-800 border
            border-slate-600 *:divide-slate-500 text-xs space-y-1 drop-shadow-md-harder">
                <div class="flex rounded-sm py-0.5 px-1 divide-x-[1px] items-center hover:bg-white/20 cursor-pointer">
                    <div class="pr-1 text-base"><i-mingcute:edit-4-line/></div>
                    <div class="pl-2">Edit Feed</div>
                </div>
                <div @click="deleteFeed" class="flex rounded-sm py-0.5 px-1 divide-x-[1px] items-center text-red-400 hover:bg-white/20 cursor-pointer">
                    <div class="pr-1 text-base"><i-solar:trash-bin-trash-bold/></div>
                    <div class="pl-2">Delete Feed</div>
                </div>
            </div>
        <!-- </div> -->
        <div @click="hideMenu" @contextmenu="hideMenu" class="z-10 w-full h-full"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { FeedState, RemoveFeed } from '../../state/FeedList.vue';

export default defineComponent({
    methods:{
        deleteFeed(){
            RemoveFeed(FeedState.selectedFeed);
            FeedState.isFeedOptionMenuVisible = false;
        },
        hideMenu(e:Event){
            e.preventDefault();
            FeedState.selectedFeed = '';
            FeedState.isFeedOptionMenuVisible = false;
        }
    },
    setup () {
        return {}
    }
})
</script>

<style scoped>
</style>