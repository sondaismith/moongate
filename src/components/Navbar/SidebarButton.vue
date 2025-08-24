<template>
    <button :onmouseenter="displayButtonTooltip" :onmouseleave="hideButtonTooltip"
    class="group relative flex justify-center items-center
            rounded-xl drop-shadow-md bg-feedBtn border border-outline transition-[border]
            hover:border-secondary focus-visible:border-embedHoverBorder !w-full h-10 p-0.5 overflow-hidden">
            <div class="w-full h-full border-2 rounded-lg transition-[border] border-transparent
            group-focus-visible:border-feedtypeBtnFocusHighlight"></div>
            <FeedIcon :icon="icon"
            class="absolute h-full text-2xl text-primary m-auto select-none pointer-events-none"/>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props: {
        icon: String,
        tooltip: String,
    },
    methods:{
        displayButtonTooltip(event:PointerEvent){
            var tooltip = document.getElementById('navbar-tooltip');
            var button = (event.currentTarget as HTMLElement);
            //If the element below does not have a scroll, or cannot be found
            //it should fail gracefully and still work correctly.
            var containerScrollPos = button.parentElement?.parentElement?.scrollTop;
            var buttonCenter = button.offsetTop - (containerScrollPos ? containerScrollPos : 0) + button.offsetHeight/2;
            if(tooltip){
                tooltip.style.top = buttonCenter+'px';
                if(this.$props.tooltip){
                    tooltip.textContent = this.$props.tooltip;
                }
            }
        },
        hideButtonTooltip(){
            var tooltip = document.getElementById('navbar-tooltip');
            if(tooltip){
                tooltip.style.top = '-200px';
                tooltip.textContent = "";
            }
        },
    }
})
</script>