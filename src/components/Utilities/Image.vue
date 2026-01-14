<template>
    <div v-show="!imageLoaded && !imageError" class="flex m-auto object-contain animate-pulse rounded-lg overflow-hidden" :class="fillContainer ? 'h-full w-full' : 'h-1/2 w-full'">
        <div v-if="loaderType == 'blocks'" class="m-auto"><div class="loader"></div></div>
        <div v-if="loaderType == 'spinner'" class="m-auto"><i-mingcute:loading-fill class="spinner text-black"/></div>
    </div>
    <div v-show="imageError" class="flex" title="Error Loading Image">
        <i-mingcute:warning-fill class="text-2xl"/>
    </div>
    <div v-show="imageLoaded" class="flex max-h-full max-w-full mx-auto" :class="[imageContainerClass, fillContainer && imageLoaded ? 'h-full w-full' : '']">
        <img :src="imgUrl" v-bind="$attrs" @load="loadComplete" @error="errorOccured"/>
    </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { defineComponent } from 'vue'

export default defineComponent({
    props:{
        /**The URL pointing to the image to display. */
        imgUrl:{
            required:true,
            type:String
        },
        /**CSS Classes to apply to the image container. */
        imageContainerClass:{
            type:String as PropType<'justify-center'|'self-center'>,
            default:'self-center'
        },
        /**Should image take up as much space as possible. Currently used when displaying in `FocusFeedPost` and `AvatarRound`. */
        fillContainer:{
            type:Boolean,
            default:false
        },
        /**Determines what loading animation is used. */
        loaderType:{
            type:String as PropType<'blocks'|'spinner'>,
            default:'blocks'
        }
    },
    data() {
        return{
            /**Variable indicating if image to display has completed downloading. */
            imageLoaded:false,
            /**Variable indicating if there was an error during the attempt to download the image to display. */
            imageError:false
        }
    },
    methods:{
        /**
         * Method called when image finishes downloading.
         */
        loadComplete(){
            this.imageLoaded = true;
        },
        /**
         * Method called when there is an error during the image download.
         */
        errorOccured(){
            this.imageError = true;
        }
    },
    watch:{
        //Used to reset the `imageLoaded` variable when the URL changes (e.g. multiple images in `ImageContainer`).
        imgUrl(newUrl, oldUrl){
            if(newUrl != oldUrl) this.imageLoaded = false;
        }
    }
})
</script>

<style scoped>
/* HTML: <div class="loader"></div> */
.loader {
  width: 20px;
  aspect-ratio: 1;
  position: relative;
}
.loader:before,
.loader:after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  margin: -8px 0 0 -8px;
  width: 16px;
  aspect-ratio: 1;
  background: var(--color-searchbar-btn);
  animation:
    l1-1 2s  infinite,
    l1-2 .5s infinite;
}
.loader:after {
  background: var(--color-searchbar-btn-hover);
  animation-delay: -1s,0s;
}
@keyframes l1-1 {
  0%   {top:0   ;left:0}
  25%  {top:100%;left:0}
  50%  {top:100%;left:100%}
  75%  {top:0   ;left:100%}
  100% {top:0   ;left:0}
}
@keyframes l1-2 {
   80%,100% {transform: rotate(0.5turn)}
}
</style>