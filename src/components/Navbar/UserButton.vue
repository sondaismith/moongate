<template>
    <a @click="toggleVisibility" :onmouseenter="displayButtonTooltip" :onmouseleave="hideButtonTooltip"
        class="group cursor-pointer relative flex justify-center
        rounded-full drop-shadow-md bg-blue-200 border
        border-blue-200 transition-[border] hover:border-gray-800
        aspect-square overflow-hidden">
        <Transition>
            <!-- <i-mingcute:user-1-line v-if="!AppState.canBrowse || !isVisible" class=" absolute h-full text-xl text-slate-800"/> -->
            <i-mingcute:lock-fill v-if="!AppState.canBrowse || !isVisible" class=" absolute h-full text-2xl text-slate-800"/>
            <div v-else-if="AppState.canBrowse || isVisible" class="absolute flex h-full w-full justify-center">
                {{ void "User initial - show if logged in" }}
                <div v-if="AppState.isAuthBrowsing" class="absolute flex h-full w-full text-[2rem]
                    font-black text-slate-700 items-center justify-center select-none z-[2]">
                    {{ AppState.currentUsername[0] }}
                </div>
                {{ void "Color Overlay for visibility" }}
                <div v-if="AppState.isAuthBrowsing" class="absolute flex h-full w-full bg-blue-400/60 z-[1]"></div>
                {{ void "User PFP/Guest Icon" }}
                <div v-if="AppState.isAuthBrowsing" class="absolute flex h-full w-full rounded-full"
                    style="background-image: url('src/assets/test-media/posts/image04.png');">
                </div>
                {{ void "Guest Icon" }}
                <i-mdi:account-off v-if="AppState.isGuestBrowsing" class="absolute h-full text-2xl text-slate-800 z-[1]"/>
                <div v-if="AppState.isGuestBrowsing" class="absolute flex h-full w-full rounded-full bg-blue-500"></div>
            </div>
        </Transition>
    </a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AppState } from '../../state/AppState.vue';

export default defineComponent({
    props: {
        tooltip: String
    },
    data(){
        return{
            isVisible: true, //DEBUG value
            AppState,
        }
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
        toggleVisibility(){
            // this.isVisible = !this.isVisible; //DEBUG
            AppState.canBrowse = false; //Update to use setter - don't directly access
        }
    },
    setup (props) {
        props.tooltip
    }
})
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>