<template>
    <button class="group !border-transparent flex rounded cursor-pointer
    justify-center items-center gap-1 transition-colors"
    :class="[$attrs.class ? $attrs.class : 'bg-sky-500 hover:bg-sky-700 hover:border-sky-700',
        isDisabled || isAwaitingResponse ? '!bg-disabledBG !text-disabled pointer-events-nones select-none !cursor-not-allowed' : ''
    ]"
    :disabled="isDisabled || isAwaitingResponse">
        <div class="flex border-2 border-transparent group-focus-visible:border-feedtypeBtnFocusHighlight
        justify-center w-full"
        :class="`p-${buttonPadding}`"
        style="border-radius: inherit;">
            <slot v-if="!isAwaitingResponse"></slot>
            <i-mingcute:loading-fill v-else class="spinner"/>
        </div>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name:"SquareButton",
    props:{
        /**Is the button disabled? */
        isDisabled:{
            type:Boolean
        },
        /**Is the Button awaiting a response? (disables interaction while true) */
        isAwaitingResponse:{
            type:Boolean,
            default:false
        },
        /**
         * The padding to use around the button content. Default is 2 (applies 'p-2').
         */
        buttonPadding:{
            type:String,
            default:'2'
        }
    },
})
</script>

<style scoped>
</style>