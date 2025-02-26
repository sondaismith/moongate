<template>
    <div class="px-4 py-2 rounded-full cursor-pointer border-2 border-sky-500"
        :class="[$attrs.class ? $attrs.class : 'bg-sky-500 hover:bg-sky-700 hover:border-sky-700',
            disabled ? 'bg-gray-500 !border-gray-500 text-gray-400 pointer-events-none' : '']">
        <slot>[Set Value Please!]</slot>
    </div>
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