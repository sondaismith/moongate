<template>
    <!-- <div class="flex rounded-full items-center justify-center"
        :class="[$attrs.class ? $attrs.class : 'px-4 py-2 border-2 border-sky-500 bg-sky-500 hover:bg-sky-700 hover:border-sky-700',
            disabled ? 'bg-gray-500 !border-gray-500 text-gray-400 select-none' : 'cursor-pointer']">
        <slot>[Set Slot Value Please!]</slot>
    </div> -->
    <button
    class="group flex justify-center cursor-pointer !border-transparent rounded-full transition-colors
    bg-btn select-none p-[1px] overflow-hidden">
        <div class="border-2 border-transparent rounded-full w-full px-3s py-1s
        group-focus-visible:border-feedtypeBtnFocusHighlight">
            <slot>[Set Slot Value Please!]</slot>
        </div>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name:"PillButton",
    props:{
        disabled:{
            type:Boolean
        },
    },
    setup () {
        return {}
    }
})
</script>

<style scoped>
:hover{
    transition: background-color 0.2s ease;
}
</style>