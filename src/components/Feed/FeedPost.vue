<template>
    {{ void "feed content" }}
    <div class="w-full pb-2">
        {{ void "feed post" }}
        <div class="flex flex-col rounded bg-slate-400 p-1 w-full drop-shadow-md">
            {{ void "post pfp" }}
            <div class="flex w-full">
                <div class="w-1/6">
                    <div class="rounded-full bg-stone-500 aspect-square size-10">
                        <i-mingcute:butterfly-2-line class="text-2xl h-full w-full p-1"/>
                    </div>
                </div>
                {{ void "post content" }}
                <div class="pl-2 w-5/6">
                    <div class="flex space-x-1 items-center">
                        <div class="text-feedPostName font-semibold text-nowrap">Random User</div>
                        <div class="text-feedTimestamp truncate" title="@Random User hdahdhdaahd">@Random User hdahdhdaahd</div>
                        <div class="text-feedTimestamp text-nowrap cursor-pointer" @click="openPostDetails">1 Jan 2024</div>
                    </div>
                    <div class="text-xs leading-4">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </div>
                </div>
            </div>
            <div class="flex flex-row h-8">
                <div class="w-1/6"></div>
                <div class="w-5/6 pl-2 flex space-x-2">
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
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';

export default defineComponent({
    data(){
        return{
            postDetails
        }
    },
    methods:{
        openPostDetails(){
            postDetails.showModal();
        }
    },
    setup () {

        return {}
    }
})
</script>

<style scoped>
</style>