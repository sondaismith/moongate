<template>
    <button class="group !border-transparent flex rounded cursor-pointer justify-center items-center gap-1 transition-colors"
    :class="[$attrs.class ? $attrs.class : 'bg-sky-500 hover:bg-sky-700 hover:border-sky-700',
        isDisabled ? '!bg-gray-600 text-gray-400 pointer-events-none select-none' : ''
    ]">
        <div class="flex border-2 border-transparent group-focus:border-feedtypeBtnFocusHighlight
        items-center"
        :class="`p-${buttonPadding}`"
        style="border-radius: inherit;">
            <slot></slot>
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
        /**
         * The padding to use around the button content. Default is 2 (applies 'p-2').
         */
        buttonPadding:{
            type:String,
            default:'2'
        }
    },
    setup () {
        return {}
    }
})
</script>

<style scoped>
</style>