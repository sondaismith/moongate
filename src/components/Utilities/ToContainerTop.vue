<template>
    <div @click="scrollToTopOfContainer" class="absolute z-[5] rounded p-1
    bg-slate-200 opacity-40 hover:opacity-60 text-slate-600 text-3xl transition-opacity
    cursor-pointer"
    :class="$attrs.class ? $attrs.class : 'bottom-2 left-3'"
    title="Return to Top">
        <i-mdi:format-vertical-align-top/>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    methods:{
        scrollToTopOfContainer(e:MouseEvent){
            let container = (e.currentTarget as HTMLElement).parentElement as HTMLElement;
            container.scrollBy({top:-container.scrollTop,behavior:'smooth'});
        }
    }
})
</script>

<style scoped>
</style>