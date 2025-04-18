<template>
    <Transition>
        <div v-if="hasSensitiveContent && isSpoilered"
        class="absolute z-[1] flex flex-col backdrop-blur-lg bg-slate-800/80 w-full h-full text-sm
        justify-center items-center text-center">
                <div :title="mediaType" class="absolute p-1 rounded *:w-full *:h-full
                left-1 top-1 text-xl bg-yellow-500/80 text-black border border-slate-800">
                    <i-mingcute:photo-album-line v-if="mediaType == MediaType.Image"/>
                    <i-mingcute:video-line v-else-if="mediaType == MediaType.Video"/>
                </div>
                <div>Content Warning:</div>
                <div class="capitalize">{{ spoilerReasons }}</div>
            <div @click="isSpoilered = !isSpoilered" class="text-blue-400 hover:text-blue-300 cursor-pointer">Show</div>
        </div>
        <div v-else-if="hasSensitiveContent" class="absolute left-2 top-1">
            <div @click="isSpoilered = !isSpoilered"
            class="bg-slate-800/50 rounded p-1 text-slate-100 hover:text-pink-300
            transition-colors border border-slate-800 drop-shadow text-xl cursor-pointer"
            title="Hide Image">
                <i-mdi:hide-outline/>
            </div>
        </div>
    </Transition>
</template>

<script lang="ts">
import { Label } from '@atproto/api/dist/client/types/com/atproto/label/defs'
import { defineComponent, PropType } from 'vue'
import { MediaType } from '../../enums/PostEnums';

export default defineComponent({
    props:{
        labels: Object as PropType<Label[]>,
        hasSensitiveContent: Boolean,
        mediaType: String as PropType<MediaType>,
    },
    data(){
        return{
            MediaType,
            isSpoilered:true
        }
    },
    methods:{
    },
    computed:{
        spoilerReasons(){
            let list = '';
            if(this.labels && this.labels.length>0){
                list = this.labels.map(l => l.val).join(', ')
            }
            return list;
        },
        // hasSensitiveContent(){
        //     if(this.labels && this.labels.length>0) return true;
        //     else return false;
        // },
    },
    watch:{
        labels(){
            // this.isSpoilered = this.labels && this.labels.length>0 ? true : false;
        }
    },
    mounted(){
        // this.isSpoilered = this.hasSensitiveContent();
    }
})
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>