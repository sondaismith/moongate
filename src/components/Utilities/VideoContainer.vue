<template>
    <div>
        <div class="relative bg-black rounded-t-lg aspect-video items-center
        overflow-hidden group cursor-pointer bg-contain bg-center bg-no-repeat
        border border-slate-600"
        :class="[{'rounded-lg' : !isVideoPlayerVisible}]"
        :style="{'background-image' : `url(${videoView?.thumbnail})`,
        'aspect-ratio' : `${videoView?.aspectRatio?.width} / ${videoView?.aspectRatio?.height}`}">
            <SpoilerOverlay :labels="labels" :has-sensitive-content="labels && labels.length>0" :media-type="MediaType.Video"/>
            <div v-if="!isVideoPlayerVisible" @click="showVideo" class="flex w-full h-full items-center justify-center">
                <div class="bg-slate-400/0 w-full h-full group-hover:bg-slate-400/30
                transition-colors"></div>
                <i-solar:play-bold class="absolute size-12 drop-shadow group-hover:scale-125 transition-transform"/>
            </div>
            <div v-if="isVideoPlayerVisible" class="w-full h-full z-[1]">
                <video-player :options="videoOptions"/>
            </div>
        </div>
        <div @click="hideVideo" v-if="isVideoPlayerVisible"
        class="relative flex items-center gap-1 rounded-b-md -top-1 pt-2 pb-1 px-2
        border border-slate-600 bg-slate-700 hover:bg-slate-500 cursor-pointer">
            <i-mingcute:close-circle-fill class="text-base text-red-00"/>
            <div>Close Video</div>
        </div>
    </div>
</template>

<script lang="ts">
import { AppBskyEmbedVideo, Label } from '@atproto/api';
import { defineComponent, PropType } from 'vue'
// import videojs from 'video.js'
import 'video.js/dist/video-js.css';
// import Player from 'video.js/dist/types/player';
import VideoPlayer from './VideoPlayer.vue';
import SpoilerOverlay from './SpoilerOverlay.vue';
import { MediaType } from '../../enums/PostEnums';

export default defineComponent({
    components:{
        VideoPlayer,
        SpoilerOverlay,
    },
    props:{
        videoView: Object as PropType<AppBskyEmbedVideo.View>,
        labels: Object as PropType<Label[]>,
        author: String,
    },
    data(){
        return{
            // player: {} as Player
            MediaType,
            videoOptions: {
                autoplay: false,
                controls: true,
                sources: [
                    {
                        src:this.videoView?.playlist,
                        type:'application/x-mpegURL'
                    }
                ]
            },
            isVideoPlayerVisible:false
        }
    },
    methods:{
        showVideo(){
            this.isVideoPlayerVisible = true;
        },
        hideVideo(){
            this.isVideoPlayerVisible = false;
        }
    }
})
</script>

<style scoped>
</style>