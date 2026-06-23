<template>
    <div v-if="isValidGIF" class="flex h-full" data-testid="externalGIF-container">
        <div v-if="isPaused" class="absolute flex w-full h-full items-start justify-start">
            <div class="absolute bg-slate-800/60 w-full z-[1] h-full group-hover:bg-slate-400/30
            transition-colors"></div>
            <i-mingcute:pause-circle-fill class="absolute z-[2] left-1 top-1 size-8 text-white drop-shadow group-hover:scale-125 transition-transform"/>
        </div>
        <img v-if="isWEBP && !isPaused" class="absolute max-h-full self-center" :src="url"/>
        <video v-else-if="!isWEBP" ref="webmPlayer" tabindex="-1" :class="videoStyles"  :src="url" autoplay loop preload="auto"/>
        <img v-if="isWEBP" class="max-h-[480px]" :src="thumbnail"/>
    </div>
    <div v-else>
        Error: An empty string or a URI that does not point to a .webm or .mp4 file has been provided to this component somehow...
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
        /**The URL pointing to the thumbnail that is used when pausing a WEBP-based GIF. */
        thumbnail:{
            type:String,
            required:false
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
            const supportedExt = ['.webm','.webp','.mp4'];
            for (let i = 0; i < supportedExt.length; i++) {
                if(this.url.includes(supportedExt[i])){
                    isUrlValid = true;
                    i = externalGIFSources.length;
                }
            }
            return isUrlValid;
        },
        /**
         * Determines if the provided URL points to a .WEBP file.
         */
        isWEBP(){
            if(this.url.includes('.webp')) return true;
            else return false;
        },
        /**NOT USED - Returns passed in "external GIF source" converted into a URL pointing WEBM on the same external source.  */
        // webmURL(){
        //     return AppState.getExternalWebmUrlFromGifUri(this.url);
        // }
    },
    watch:{
        isPaused(newValue,oldValue){
            if(!this.isWEBP){
                if(oldValue == false && newValue == true) this.$refs.webmPlayer.pause();
                else if(oldValue == true && newValue == false) this.$refs.webmPlayer.play();
            }
        }
    }
})
</script>

<style scoped>

</style>