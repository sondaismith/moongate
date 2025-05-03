<template>
  <video ref="videoPlayer" class="video-js">
    Something has gone wrong loading the video
  </video>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import videojs from 'video.js';

export default defineComponent({
  name: 'VideoPlayer',
  props: {
    options: {
      type: Object,
      default() {
        return {};
      }
    },
    width:{
      type:Number,
      default(){
        return 16;
      }
    },
    height:{
      type:Number,
      default(){
        return 9;
      }
    }
  },
  data() {
    return {
      player: null
    }
  },
  mounted() {
    this.player = videojs(this.$refs.videoPlayer, this.options, () => {
      this.player.log('onPlayerReady', this);
    });
  },
  beforeUnmount() {
    if (this.player) {
      console.log('deleting video player:');
      console.log(this.player);
      this.player.dispose();
    }
  }
})
</script>

<style scoped>
  .video-js{
    width: 100%;
    height: 100%;
  }
</style>