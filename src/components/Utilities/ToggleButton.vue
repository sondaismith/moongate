<template>
    <div class="flex gap-2 transition-colors" :class="{'text-disabled pointer-events-none' : disabled}">
        <div title="List of languages you allow - those not selected will not be shown.">
            {{ leftOption ? leftOption : '[Left Option Missing]' }}
        </div>
        <div class="relative flex items-center">
            <div class="rounded-full bg-toggleGutter border border-outline w-10 h-3"></div>
            <div class="z-[1]s absolute transition-all rounded-full size-5
            bg-toggleButton hover:border-hover border border-outline cursor-pointer translate-x-0"
            :class="{'translate-x-full' : !toggleValue, '!bg-disabled' : disabled}"
            @click="disabled ? ()=>{} : $emit('toggleAction')"></div>
        </div>
        <div title="List of languages you do not want to see - those not selected will be shown.">
            {{ rightOption ? rightOption : '[Right Option Missing]' }}
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props:{
        /**The text that is displayed on the left of the button. */
        leftOption:{
            type:String,
            required:true,
        },
        /**The text that is displayed on the right of the button. */
        rightOption:{
            type:String,
            required:true,
        },
        /**The value that will be toggled. */
        toggleValue:{
            type:Boolean,
            required:true,
        },
        /**Is the button disabled? */
        disabled:Boolean,
    },
    emits:{
        /**Allows a specified action to be performed when the button is clicked. */
        toggleAction:()=>{return true;}
    }
})
</script>

<style scoped>
</style>