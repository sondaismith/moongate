<template>
    <div class="absolute flex w-full h-full" @contextmenu.prevent @keyup="handleKeyup" @keydown="(e) => TrapFocus($el,e)">
        <div id="options-btn-menu" :tabindex="-1"
        class="absolute flex flex-col rounded z-[100] p-1 bg-slate-800 border
        border-slate-600 *:divide-slate-500 text-xs space-y-1 drop-shadow-md-harder top-[-1000px] focus-visible:outline-none">
            <button v-for="mi in OptionsMenuState.currentMenuItems" @click="performAction(mi.Action)" @contextmenu.prevent
            class="flex rounded-sm py-0.5 px-1 divide-x-[1px] items-center hover:bg-white/20 shadow-none cursor-pointer
            focus-visible:border-searchbarFocusHightlight">
                <div class="pr-1 text-base" :class="mi.IconStyle"><component :is="mi.Icon"/></div>
                <div class="pl-2" :class="mi.LabelStyle">{{ mi.Label }}</div>
            </button>
        </div>
        <div @click="hideMenu" @contextmenu="hideMenu" class="z-[90] w-full h-full"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent, FunctionalComponent } from 'vue'
import { OptionsMenuState } from '../../state/OptionsMenuState.vue';
import { TrapFocus } from '../../state/AppState.vue';

export interface IOptionMenuItem{
    Icon: FunctionalComponent,
    Label: string,
    Action: Function,
    IconStyle?: string,
    LabelStyle?: string
}

export default defineComponent({
    data(){
        return{
            OptionsMenuState,
            TrapFocus,
        }
    },
    methods:{
        hideMenu(e:Event){
            e.preventDefault();
            OptionsMenuState.hideOptionMenu();
        },
        performAction(action:Function){
            action();
            OptionsMenuState.hideOptionMenu();
        },
        /**
         * Method used to close the menu when the Escape Key is
         * pressed.
         * @param e The `KeyboardEvent` that called the handler.
         */
        handleKeyup(e:KeyboardEvent){
            if(e.key.toLowerCase() == 'escape') this.hideMenu(e);
        }
    },
    mounted(){
        // console.log(((this.$el as HTMLElement).children[0] as HTMLElement));
        // ((this.$el as HTMLElement).children[0] as HTMLElement).focus();
    }
})
</script>

<style scoped>
</style>