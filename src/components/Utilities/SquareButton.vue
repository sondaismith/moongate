<template>
    <div class="bg-sky-500 rounded p-2 cursor-pointer text-center"
    :class="[$attrs.class ? $attrs.class : 'bg-sky-500 hover:bg-sky-700 hover:border-sky-700',
        isDisabled ? 'bg-gray-600 pointer-events-none' : ''
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