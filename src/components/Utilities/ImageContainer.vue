<template>
    <div ref="imageContainer" class="grid grid-cols-2 grid-flow-col grid-rows-2 w-full gap-0.5 border
        border-slate-500 rounded overflow-hidden">
        <div v-for="(image, index) in imagesToDisplay" @click="showMediaFocusModal(index)" class="overflow-hidden cursor-pointer"
            :class="[
                        (imagesToDisplay?.length === 1 ? 'col-span-2 row-span-2':''),
                        (imagesToDisplay?.length === 2 && index === 0 ? 'col-start-1 row-span-2':''),
                        (imagesToDisplay?.length === 2 && index === 1 ? 'col-start-2 row-span-2':''),
                        (imagesToDisplay?.length === 3 && index === 2 ? 'col-start-2 row-span-2':'')
                    ]">
            <div class="h-full w-full bg-center bg-cover"
                :style="{'background-image': 'url('+image.thumb+')'}"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';
import { ViewImage } from '@atproto/api/dist/client/types/app/bsky/embed/images';


export function calculateImageContainerMinHeight(elWidth:number):number{
    if(typeof elWidth !== 'number') throw new TypeError('Value must be a number');
    const aspectRatio = 9/16;
    var newMinHeight = Math.floor(elWidth*aspectRatio);
    return newMinHeight;
}

export default defineComponent({
    name:'ImageContainer',
    props:{
        imagesToDisplay: Object as PropType<ViewImage[]>,
    },
    methods:{
        /**
         * Method used to set the min-height of ImageContainer component based
         * on its width.
         */
        setImageContainerHeight(){
            var component = (this.$refs.imageContainer as HTMLElement);
            const aspectRatio = 9/16;
            var newMinHeight = Math.floor(component.clientWidth*aspectRatio);
            component.style.minHeight = newMinHeight+'px';
        },
        showMediaFocusModal(index:number){
            this.$emit('media-click', index);
        }
    },
    data(){
        return{
            postDetails,
        }
    },
    mounted(){
        this.setImageContainerHeight();
    },
    setup () {
        return {}
    }
})
</script>

<style scoped>
</style>