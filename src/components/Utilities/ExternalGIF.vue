<template>
    <div v-if="isValidGIF" data-testid="externalGIF-container">
        <div v-if="isPaused" class="absolute flex w-full h-full items-start justify-start">
            <div class="absolute bg-slate-800/60 w-full h-full group-hover:bg-slate-400/30
            transition-colors"></div>
            <i-mingcute:pause-circle-fill class="absolute z-[1] left-1 top-1 size-8 text-white drop-shadow group-hover:scale-125 transition-transform"/>
        </div>
        <video ref="webmPlayer" tabindex="-1" :class="videoStyles"  :src="url" autoplay loop preload="auto"/>
    </div>
    <div v-else>
        <div>Invalid URL :(</div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { externalGIFSources } from '../../state/AppState.vue';

export default defineComponent({
    props:{
        /**The URL pointing to the GIF (WebM) to display. */
        url:{
            type:String,
            required:true
        },
        /**Is the GIF (WebM) currently paused? */
        isPaused:{
            type:Boolean,
            default:false
        },
        /**Used to apply CSS styles directly on the `video` HTML element. */
        videoStyles:{
            type:String,
            required:false
        }
    },
    data(){
        return{
        }
    },
    computed:{
        /**
         * Determines if the provided URL points to a valid "GIF" (a supported video file that
         * is treated as GIF).
         */
        isValidGIF(){
            let isUrlValid = false;
            const supportedExt = ['.webm','.mp4'];
            for (let i = 0; i < supportedExt.length; i++) {
                if(this.url.includes(supportedExt[i])){
                    isUrlValid = true;
                    i = externalGIFSources.length;
                }
            }
            return isUrlValid;
        },
        /**NOT USED - Returns passed in "external GIF source" converted into a URL pointing WEBM on the same external source.  */
        // webmURL(){
        //     return AppState.getExternalWebmUrlFromGifUri(this.url);
        // }
    },
    watch:{
        isPaused(newValue,oldValue){
            if(oldValue == false && newValue == true) this.$refs.webmPlayer.pause();
            else if(oldValue == true && newValue == false) this.$refs.webmPlayer.play();
        }
    }
})
</script>

<style scoped>

</style>