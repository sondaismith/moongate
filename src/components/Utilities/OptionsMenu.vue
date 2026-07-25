<template>
    <div class="absolute flex w-full h-full" @contextmenu.prevent @keyup="handleKeyup" @keydown.tab="(e) => TrapFocus($el,e)">
        <div data-testid="options-menu" id="options-btn-menu" role="menu" :tabindex="-1"
        class="absolute flex flex-col gap-1 rounded z-[100] p-1 bg-slate-800 border
        border-slate-600 *:divide-slate-500 text-xs text-slate-100 drop-shadow-md-harder top-[-1000px] focus-visible:outline-none">
            <template v-for="mi in OptionsMenuState.currentMenuItems">
                <button v-if="mi.Type == ItemType.Option" @click="performAction(mi.Action)" @contextmenu.prevent
                class="flex rounded-sm py-0.5 px-1 divide-x-[1px] items-center hover:bg-btnHover shadow-none cursor-pointer
                focus-visible:border-searchbarFocusHightlight disabled:text-disabled disabled:hover:bg-transparent
                disabled:hover:border-transparent disabled:cursor-default"
                :disabled="mi.disabled">
                    <div v-if="mi.Icon == 'moongate'" class="pr-1 text-base"><AppLogo :is-button="false" class="size-[1.2rem]" :icon-styling="'text-white scale-[120%]'"/></div>
                    <div v-else class="pr-1 text-base" :class="mi.IconStyle"><component :is="mi.Icon"/></div>
                    <div class="pl-2" :class="mi.LabelStyle">{{ mi.Label }}</div>
                </button>
                <RouterLink v-if="mi.Type == ItemType.RouterLink" :to="typeof mi.route != 'undefined' && mi.route.trim() != '' ? mi.route : ''"
                target="_blank" tabindex="-1">
                    <button @contextmenu.prevent
                    class="flex rounded-sm py-0.5 px-1 divide-x-[1px] items-center hover:bg-btnHover shadow-none cursor-pointer
                    focus-visible:border-searchbarFocusHightlight disabled:text-disabled disabled:hover:bg-transparent
                    disabled:hover:border-transparent disabled:cursor-default"
                    :disabled="mi.disabled">
                        <div class="pr-1 text-base" :class="mi.IconStyle"><component :is="mi.Icon"/></div>
                        <div class="pl-2 font-normal" :class="mi.LabelStyle">{{ mi.Label }}</div>
                    </button>
                </RouterLink>
                <div v-if="mi.Type ==ItemType.Splitter" class="bg-outline h-[1px]">
                </div>
            </template>
        </div>
        <div @click="hideMenu" @contextmenu="hideMenu" class="z-[90] w-full h-full"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent, FunctionalComponent } from 'vue'
import { OptionsMenuState } from '../../state/OptionsMenuState.vue';
import { TrapFocus } from '../../state/AppState.vue';
import AppLogo from '../SVG/AppLogo.vue';

export interface IOptionMenuItem{
    Icon: FunctionalComponent|"moongate",
    Label: string,
    Action: Function,
    Type:ItemType,
    IconStyle?: string,
    LabelStyle?: string,
    disabled?: boolean,
    route?: string
}

export enum ItemType{
    Option,
    RouterLink,
    Splitter
}

export default defineComponent({
    components:{
        AppLogo,
    },
    data(){
        return{
            OptionsMenuState,
            TrapFocus,
            ItemType,
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