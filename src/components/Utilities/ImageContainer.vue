<template>
    <div ref="imageContainer" class="grid grid-cols-2 grid-flow-col grid-rows-2 w-full gap-0.5 border
        border-slate-500 rounded overflow-hidden">
        <div v-for="(image, index) in imagesToDisplay" class="overflow-hidden cursor-pointer"
            :class="[
                        (imagesToDisplay?.length === 1 ? 'col-span-2 row-span-2':''),
                        (imagesToDisplay?.length === 2 && index === 0 ? 'col-start-1 row-span-2':''),
                        (imagesToDisplay?.length === 2 && index === 1 ? 'col-start-2 row-span-2':''),
                        (imagesToDisplay?.length === 3 && index === 2 ? 'col-start-2 row-span-2':'')
                    ]">
            <div class="h-full w-full bg-center bg-cover"
                :style="{'background-image': 'url('+image+')'}"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

// var ro = new ResizeObserver(console.log).observe()
export default defineComponent({
    props:{
        imagesToDisplay: Object as PropType<string[]>,
    },
    methods:{
        /**
         * Method used to set the min-height of ImageContainer component based
         * on its width.
         */
        setImageContainerHeight(){
            var component = (this.$refs.imageContainer as HTMLElement);
            const aspectRatio = 9/16;
            component.style.minHeight = Math.floor(component.clientWidth*aspectRatio)+'px';
        },
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