<template>
    <div v-if="isValidGIF">
        <!-- <div>WEBM Video displayed here</div>
        <div>{{ webmURL }}</div> -->
        <video ref="webmPlayer" :src="webmURL" autoplay loop/>
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
        url:{
            type:String,
            required:true
        },
        isPaused:{
            type:Boolean,
            default:false
        }
    },
    data(){
        return{
        }
    },
    computed:{
        isValidGIF(){
            let isUrlValid = false;
            for (let i = 0; i < externalGIFSources.length; i++) {
                if(this.url.includes(externalGIFSources[i])){
                    isUrlValid = true;
                    i = externalGIFSources.length;
                }
            }
            return isUrlValid;
        },
        webmURL(){
            const requestParams = new URLSearchParams(this.url);
            // console.log('requestParams: ',requestParams);
            let apiEndpoint = ''
            for (let i = 0; i < externalGIFSources.length; i++) {
                if(this.url.includes(externalGIFSources[i])){
                    apiEndpoint = externalGIFSources[i];
                    i = externalGIFSources.length
                }
            }
            if(this.url.includes('https://media.tenor.com')){
                let webmLink = this.url;
                webmLink = webmLink.slice('https://media.tenor.com'.length+1);
                let splitLink = webmLink.split('/');
                webmLink = webmLink.slice(0,webmLink.indexOf(splitLink[splitLink.length-1]));
                webmLink = webmLink.replace('AAAAC/','AAAP3/');//a route ending with AAAP3 seems to indicate WEBM
                let filename = splitLink[splitLink.length-1];
                filename = filename.slice(0,filename.indexOf('.gif?'))+'.webm';
                return `https://t.gifs.bsky.app/${webmLink}${filename}`;
            }
            else if(this.url.includes('https://static.klipy.com')){
                let webmLink = this.url;
                webmLink = webmLink.slice('https://static.klipy.com'.length+1);
                let splitLink = webmLink.split('/');
                webmLink = webmLink.slice(0,webmLink.indexOf(splitLink[splitLink.length-1]));
                const webmRegex = new RegExp(`${/(?<=webm=).*/.source}`,'g');
                let webmId = this.url.match(webmRegex);
                return `https://k.gifs.bsky.app/${webmLink}${webmId}.webm`;
            }
            // let actorSearchParamKey = this.url.substring(0,this.url.indexOf(apiEndpoint)+apiEndpoint.length);
        }
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