<template>
    <div class="relative flex bg-slate-600 rounded-lg aspect-video items-center
    justify-center overflow-hidden group cursor-pointer bg-contain bg-center bg-no-repeat"
    :style="{'background-image' : `url(${videoView?.thumbnail})`,
    'aspect-ratio' : `${videoView?.aspectRatio?.width} / ${videoView?.aspectRatio?.height}`}">
        <div class="bg-slate-400/0 w-full h-full group-hover:bg-slate-400/30
        transition-colors"></div>
        <i-solar:play-bold class="absolute size-12 drop-shadow group-hover:scale-125 transition-transform"/>
    </div>
</template>

<script lang="ts">
import { AppBskyEmbedVideo } from '@atproto/api';
import { defineComponent, PropType } from 'vue'

export default defineComponent({
    props:{
        videoView: Object as PropType<AppBskyEmbedVideo.View>
    }
})
</script>

<style scoped>
</style>