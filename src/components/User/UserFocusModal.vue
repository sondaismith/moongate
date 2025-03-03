<template>
    <div class="absolute z-10 flex w-full h-full bg-slate-800/60 backdrop-blur-sm">
        <div @click="closeModal" :class="$attrs.class" class="absolute z-10 w-full h-full"></div>
        <div class="relative z-20 flex flex-col w-4/5 md:w-2/3s h-4/5 mx-auto my-auto rounded bg-slate-800
            drop-shadow-lg overflow-hidden">
            <div class="bg-red-400 w-full h-32 shrink-0">Banner</div>
            <div class="absolute flex bg-sky-400 rounded-full aspect-square size-20 top-24 left-4
            items-center justify-center shrink-0">PFP</div>
            {{ void "Main Container" }}
            <div class="p-4 h-full overflow-hidden">
                <div class="flex flex-col h-full overflow-hidden">
                    {{ void "User Details Content" }}
                    <div class="flex flex-col mb-2 shrink grow-0">
                        <div class="flex ml-auto gap-2 h-10">
                            <PillButton>+ Follow</PillButton>
                            <PillButton class="aspect-square size-10">...</PillButton>
                        </div>
                        <div class="text-2xl font-semibold">Username Title</div>
                        <div class="text-xs">@handle</div>
                        <div class="flex mt-1">
                            <div class="flex text-sm pr-2">
                                <div class="font-bold pr-1">1</div>
                                <div class="text-slate-400">followers</div>
                            </div>
                            <div class="flex text-sm pr-2">
                                <div class="font-bold pr-1">1</div>
                                <div class="text-slate-400">following</div>
                            </div>
                            <div class="flex text-sm pr-2">
                                <div class="font-bold pr-1">101</div>
                                <div class="text-slate-400">posts</div>
                            </div>
                        </div>
                        <div class="leading-4">
                            Lorem ipsum? More like The quick brown fox jumps over the lazy dog. This
                            is just a test collection of words to form a long sentence.
                            Boo!
                        </div>
                    </div>
                    {{ void "Posts + Post Type Filters" }}
                    <div class="flex flex-col min-h-0 grow">
                        <div class="flex w-full text-center justify-between border-b border-slate-600">
                            <div @click="viewPosts" class="w-full hover:bg-slate-700 cursor-pointer">
                                <div class="py-1">Posts</div>
                                <div v-if="isViewingPosts" class="bg-blue-400 h-1 w-10 ml-auto mr-auto"></div>
                            </div>
                            <div @click="viewReplies" class="w-full hover:bg-slate-700 cursor-pointer">
                                <div class="py-1">Replies</div>
                                <div v-if="isViewingReplies" class="bg-blue-400 h-1 w-10 ml-auto mr-auto"></div>
                            </div>
                            <div @click="viewMedia" class="w-full hover:bg-slate-700 cursor-pointer">
                                <div class="py-1">Media</div>
                                <div v-if="isViewingMedia" class="bg-blue-400 h-1 w-10 ml-auto mr-auto"></div>
                            </div>
                        </div>
                        <div v-if="isViewingPosts || isViewingReplies">Post Type</div>
                        <div v-if="isViewingMedia" class="px-2 py-4 w-full grid gap-2 self-center
                        grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] justify-items-center overflow-x-hidden">
                            <div v-for="n in 14" class="bg-violet-500 hover:bg-violet-300 cursor-pointer rounded aspect-square size-44">
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
import PillButton from '../Utilities/PillButton.vue';

export default defineComponent({
    data(){
        return{
            isViewingPosts:true,
            isViewingReplies:false,
            isViewingMedia:false,
        }
    },
    components:{
        PillButton,
    },
    methods:{
        viewPosts(){
            this.isViewingPosts = true;
            this.isViewingReplies = this.isViewingMedia = false;
        },
        viewReplies(){
            this.isViewingReplies = true;
            this.isViewingPosts = this.isViewingMedia = false;
        },
        viewMedia(){
            this.isViewingMedia = true;
            this.isViewingPosts = this.isViewingReplies = false;
        },
        closeModal(){
            alert('close user account modal');
        },
    },
    setup () {
        return {}
    }
})
</script>

<style scoped>

</style>