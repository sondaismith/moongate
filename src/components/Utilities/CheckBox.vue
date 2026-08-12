<template>
    <button class="group flex rounded cursor-pointer transition-colors shadow-none hover:border-transparent
    active:bg-transparent active:border-transparent outline outline-2 outline-transparent focus-visible:outline-focusBorder"
    :style="`gap:${textGap}rem`"
    @click="toggleValue">
        <div class="flex shrink-0 my-auto rounded bg-btn border border-outline
        items-center justify-center group-hover:bg-checkboxHover group-active:bg-checkboxHover overflow-hidden"
        :style="`height:${checkboxSize}rem; width:${checkboxSize}rem`">
            <!-- <div class="relative h-full w-full leading-4 text-center align-middle bg-red-400">x</div> -->
                <i-mdi:check v-if="modelValue" class="h-full"/>
        </div>
        <!-- <div>Show Post after creation?</div> -->
        <slot></slot>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props:{
        /**The current value of the checkbox. */
        modelValue:Boolean,
        /**Spacing gap between Checkbox and label in rem units. Default is 0.25. */
        textGap:{
            type:Number,
            default:0.25
        },
        /**Dimensions (width & height) of checkbox square in rem units. Default is 1. */
        checkboxSize:{
            type:Number,
            default:1,
        }
    },
    data(){
        return{
            checkState:false,
        }
    },
    emits:{
        valueToggled:(value:boolean) => {
            if(typeof value == 'boolean') return true;
        },
    },
    methods:{
        toggleValue(){
            this.checkState = !this.checkState;
            this.$emit('valueToggled',this.checkState);
        }
    },
    created(){
        this.checkState = this.modelValue;
    }
})
</script>

<style scoped>

</style>