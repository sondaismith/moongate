<template>
    <a :onmouseenter="displayButtonTooltip" :onmouseleave="hideButtonTooltip"
        class="group cursor-pointer relative flex justify-center
        rounded-full drop-shadow-md bg-blue-200 border
        border-blue-200 transition-[border] hover:border-gray-800
        aspect-square">
        <i-mingcute:user-1-line class="h-full text-xl text-slate-800"/>
    </a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        tooltip: String
    },
    methods:{

        displayButtonTooltip(event:PointerEvent){
            var tooltip = document.getElementById('navbar-tooltip');
            var button = (event.currentTarget as HTMLElement);
            var buttonCenter = button.offsetTop + button.offsetHeight/2;
            if(tooltip){
                tooltip.style.top = buttonCenter+'px';
                if(this.$props.tooltip){
                    tooltip.textContent = this.$props.tooltip;
                }
            }
        },
        hideButtonTooltip(event:PointerEvent){
            var tooltip = document.getElementById('navbar-tooltip');
            if(tooltip){
                tooltip.style.top = '-200px';
                tooltip.textContent = "";
            }
        },
    },
    setup (props) {
        props.tooltip
    }
})
</script>

<style scoped>
</style>