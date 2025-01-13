<template>
    <span
        class="absolute whitespace-nowrap start-full top-[-10px] ms-4 -translate-y-1/2
        rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white select-none"
    >
        {{ tooltip }}
    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props:{
        tooltip : String
    },
    setup () {
        return {}
    }
})
</script>

<style scoped>
</style>