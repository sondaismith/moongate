<template>
    <a class="group cursor-pointer relative flex justify-center rounded-full drop-shadow-md bg-blue-200 border border-blue-200 transition-[border] hover:border-gray-800 aspect-square">
        <i-mingcute:user-1-line class="h-full text-xl text-slate-800"/>
        <span
            class="invisible absolute whitespace-nowrap start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible"
        >
            {{ tooltip }}
        </span>
    </a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        tooltip: String
    },
    setup (props) {
        props.tooltip
    }
})
</script>

<style scoped>
</style>