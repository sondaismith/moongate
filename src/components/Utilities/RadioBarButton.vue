<template>
    <button class="flex group w-full items-center rounded p-0.5 border border-outline outline-none cursor-pointer hover:bg-btnHover overflow-hidden">
        <div class="flex gap-1.5 items-center w-full h-full px-1 rounded border-2 border-transparent
        group-focus-visible:border-feedtypeBtnFocusHighlight overflow-hidden *:select-none">
            <div class="rounded-full aspect-square h-4 border border-primary/20 shrink-0" :class="[selected ? 'bg-radioButtonSelected' : 'bg-focusBG']"></div>
            <slot></slot>
        </div>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props:{
        selected:Boolean,
    }
})
</script>

<style scoped>
</style>