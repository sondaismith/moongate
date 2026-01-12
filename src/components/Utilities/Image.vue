<template>
    <div v-show="!imageLoaded" class="flex m-auto object-contain animate-pulse rounded-lg overflow-hidden" :class="fillContainer ? 'h-full' : 'h-1/2 w-full'">
        <div class="m-auto"><div class="loader"></div></div>
    </div>
    <div v-show="imageLoaded" class="flex max-h-full max-w-full mx-auto" :class="[imageContainerClass, fillContainer && imageLoaded ? 'h-full w-full' : '']">
        <img :src="imgUrl" v-bind="$attrs" @load="loadComplete"/>
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
        /**Should image take up as much space as possible. Currently used when displaying in `FocusFeedPost`. */
        fillContainer:{
            type:Boolean,
            default:false
        }
    },
    data() {
        return{
            /**Variable indicating if image to display has completed downloading. */
            imageLoaded:false
        }
    },
    methods:{
        /**
         * Method called when image finishes downloading.
         */
        loadComplete(){
            this.imageLoaded = true;
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