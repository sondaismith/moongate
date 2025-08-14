<template>
    <button class="group flex rounded cursor-pointer justify-center items-center gap-1 transition-colors"
    :class="[$attrs.class ? $attrs.class : 'bg-sky-500 hover:bg-sky-700 hover:border-sky-700',
        isDisabled ? '!bg-gray-600 text-gray-400 pointer-events-none select-none' : ''
    ]">
        <div class="border-2 p-2 border-transparent group-focus:border-feedtypeBtnFocusHighlight
        w-full"
        style="border-radius: inherit;">
            <slot></slot>
        </div>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name:"SquareButton",
    props:{
        isDisabled:{
            type:Boolean
        },
    },
    setup () {
        return {}
    }
})
</script>

<style scoped>
</style>