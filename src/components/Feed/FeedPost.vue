<template>
    {{ void "feed content" }}
    <div class="w-full pb-2">
        {{ void "feed post" }}
        <div class="flex flex-col rounded bg-slate-400 p-1 w-full drop-shadow-md justify-between">
            {{ void "post pfp" }}
            <div class="flex w-full">
                <!-- <div class="w-1/6"> -->
                <div>
                    <div class="rounded-full bg-stone-500 aspect-square size-10">
                        <i-mingcute:butterfly-2-line class="text-2xl h-full w-full p-1"/>
                    </div>
                </div>
                {{ void "post content" }}
                <div class="flex flex-col pl-2 overflow-hidden">
                    <div class="flex flex-shrink-0 space-x-1 items-center">
                        <div class="text-feedPostName font-semibold text-nowrap">Random User</div>
                        <div class="text-feedTimestamp truncate" title="@Random User hdahdhdaahd">@Random User hdahdhdaahd</div>
                        <div class="text-feedTimestamp text-nowrap cursor-pointer" @click="openPostDetails">1 Jan 2024</div>
                    </div>
                    <div class="text-xs leading-4 pb-2">
                        Lorem ipsum dolor sit amet,
                        sed ut labore among us magna
                        aliqua. Quis nostrud exercitation
                        ullamco laboris.
                    </div>
                    {{ void "image-type media" }}
                    <div class="flex w-fit border border-slate-700 rounded">
                         <img class="w-fit" :src="getImageUrl(getRandomImageNum())"/>
                    </div>
                    <div class="flex flex-row h-8">
                        <div class="flex space-x-2">
                            <div class="flex h-full items-center">
                                <i-solar:chat-dots-outline class="text-base w-full"/>
                                <div class="pl-1">2</div>
                            </div>
                            <div class="flex h-full items-center">
                                <i-mingcute:repeat-line class="text-base"/>
                                <div class="pl-1">23</div>
                            </div>
                            <div class="flex h-full items-center">
                                <i-mingcute:heart-fill class="text-base"/>
                                <div class="pl-1">30</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';


function getImageUrl(num:String){
    // var iNum = getRandomImageNum();
    return new URL(`../../assets/test-media/posts/image${num}.png`, import.meta.url).href;
}

function getRandomImageNum(){
    var imageNum = (Math.floor(Math.random()*8)+1);
    console.log(imageNum);
    return "0"+imageNum;
}

export default defineComponent({
    data(){
        return{
            postDetails,
            getImageUrl,
            getRandomImageNum,
        }
    },
    methods:{
        openPostDetails(){
            postDetails.showModal();
        },
    },
    setup () {
        return {}
    },
})
</script>

<style scoped>
</style>