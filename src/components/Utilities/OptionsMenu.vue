<template>
    <div class="absolute flex w-full h-full" @contextmenu.prevent>
        <!-- <div class="w-full h-full z-10 bg-red-500"> -->
            <div id="options-btn-menu" class="absolute flex flex-col rounded z-20 p-1 bg-slate-800 border
            border-slate-600 *:divide-slate-500 text-xs space-y-1 drop-shadow-md-harder top-[-1000px]">
                <div v-for="mi in OptionsMenuState.currentMenuItems" @click="performAction(mi.Action)" @contextmenu.prevent
                class="flex rounded-sm py-0.5 px-1 divide-x-[1px] items-center hover:bg-white/20 cursor-pointer">
                    <div class="pr-1 text-base" :class="mi.IconStyle"><component :is="mi.Icon"/></div>
                    <div class="pl-2" :class="mi.LabelStyle">{{ mi.Label }}</div>
                </div>
            </div>
        <!-- </div> -->
        <div @click="hideMenu" @contextmenu="hideMenu" class="z-10 w-full h-full"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent, FunctionalComponent } from 'vue'
import { OptionsMenuState } from '../../state/OptionsMenuState.vue';

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
        }
    }
})
</script>

<style scoped>
</style>