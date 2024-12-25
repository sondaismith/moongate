<template>
    <a class="group cursor-pointer relative flex justify-center rounded-xl drop-shadow-md bg-blue-200 border border-blue-200 transition-[border] hover:border-gray-800 h-10">
        <i-mingcute:home-4-line class="h-full text-2xl text-slate-800"/>
        <span
            class="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible"
        >
            {{ tooltip }}
        </span>
    </a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        tooltip: String,
        type: {type: String, required: true}
    },
    setup (props) {        
        props.type,
        props.tooltip
    }
})
</script>

<style scoped>

</style>