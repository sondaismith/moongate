<template>
    <button class="flex group w-full items-center rounded p-0.5 border border-outline outline-none cursor-pointer hover:bg-btnHover overflow-hidden">
        <div class="flex gap-1.5 items-center w-full h-full px-1 rounded border-2 border-transparent
        group-focus-visible:border-feedtypeBtnFocusHighlight overflow-hidden *:select-none">
            <div v-if="!hideRadioButton" class="flex items-center rounded-full aspect-square h-5 border border-secondary shrink-0">
                <i-mingcute:check-fill v-if="selected" class="h-full w-full p-0.5 text-radioButtonSelected"/>
            </div>
            <slot></slot>
        </div>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props:{
        selected:Boolean,
        hideRadioButton:{
            type: Boolean,
            default: false
        },
    }
})
</script>

<style scoped>
</style>