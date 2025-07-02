<template>
    <div class="flex rounded p-2 cursor-pointer justify-center items-center gap-1 transition-colors"
    :class="[$attrs.class ? $attrs.class : 'bg-sky-500 hover:bg-sky-700 hover:border-sky-700',
        isDisabled ? '!bg-gray-600 text-gray-400 pointer-events-none select-none' : ''
    ]">
        <slot></slot>
    </div>
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