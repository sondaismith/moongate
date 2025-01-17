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
                <div class="flex flex-col px-2 overflow-hidden">
                    <div class="flex items-center">
                        <div class="text-feedPostName font-semibold text-nowrap">{{ postData?.userName }}</div>
                        <div class="text-feedTimestamp pl-1 truncate" title="@Random User hdahdhdaahd">@{{ postData?.userHandle }}</div>
                        <div class="text-feedTimestamp text-nowrap cursor-pointer ml-auto" @click="openPostDetails">1 Jan 2024</div>
                    </div>
                    <div class="text-xs leading-4 pb-2">
                        Lorem ipsum dolor sit amet,
                        sed ut labore among us magna
                        aliqua. Quis nostrud exercitation
                        ullamco laboris.
                    </div>
                    <!-- <div class="text-xs leading-4 pb-2">{{ postData?.postText }}</div> -->
                    {{ void "image-type media" }}
                    <ImageContainer v-if="postData?.postType === 'image'" :imagesToDisplay="postData?.postMedia"/>
                    <div class="flex flex-row h-8">
                        <PostInteractionIcons class="text-slate-50 text-s" :noShareButton="true"
                            :numComments="postData?.comments.length" :numShares="postData?.totalReposts"
                            :numLikes="postData?.totalLikes"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';
import { IPostDetails } from '../../interfaces/PostInterfaces';
import ImageContainer from '../Utilities/ImageContainer.vue';

export default defineComponent({
    props:{
        postData: Object as PropType<IPostDetails>
    },
    data(){
        return{
            postDetails,
        }
    },
    methods:{
        openPostDetails(){
            // postDetails.showModal();
            if(this.postData){
                postDetails.showModalPost(this.postData);
                //update `PostDetailIcons` in `Post` State
                postDetails.updatePostDetailIconValues(this.postData.comments.length.toString(),this.postData.totalReposts.toString(),this.postData.totalLikes.toString());
            }
        },
    },
    setup () {
        return {}
    },
})
</script>

<style scoped>
</style>