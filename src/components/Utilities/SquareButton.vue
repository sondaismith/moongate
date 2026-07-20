<template>
    <button class="relative group outline-none flex rounded cursor-pointer
    justify-center items-center gap-1 transition-colors"
    :class="[$attrs.class ? $attrs.class : 'bg-sky-500 hover:bg-sky-700 hover:border-sky-700 h-10',
        isDisabled || isAwaitingResponse ? '!bg-disabledBG !text-disabled pointer-events-nones select-none !cursor-not-allowed' : '',
        `p-${focusPadding}`, buttonBorder ? `border ${borderColorClass}` : '!border-transparent',
        preventShrink ? 'shrink-0' : ''
    ]"
    :disabled="isDisabled || isAwaitingResponse">
        <div v-if="!isAwaitingResponse" class="flex items-center justify-center w-full h-full rounded border-2 border-transparent
        group-focus-visible:border-feedtypeBtnFocusHighlight"
        :class="[`px-${buttonPaddingX} py-${buttonPaddingY}`]">
            <slot></slot>
        </div>
        <i-mingcute:loading-fill v-else class="spinner"/>
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
         * The x-axis padding to use between the `focus-visible:` highlight and the button content.
         * Default is 1 (applies 'px-1').
         * Note that a padding of 0.5(0.125rem, 2px) is already applied for the focus-visible:
         * highlight by default, but that can be changed using `focusPadding`. There is also a
         * default border width of 2px to keep in mind, but that can be changed via CSS.
         */
        buttonPaddingX:{
            type:String,
            default:'1'
        },
        /**
         * The y-axis padding to use between the `focus-visible:` highlight and the button content.
         * Default is 1 (applies 'py-1').
         * Note that a padding of 0.5(0.125rem, 2px) is already applied for the focus-visible:
         * highlight by default, but that can be changed using `focusPadding`. There is also a
         * default border width of 2px to keep in mind, but that can be changed via CSS.
         */
        buttonPaddingY:{
            type:String,
            default:'1'
        },
        /**
         * The padding to use between the edge of the button and the focus-visible: highlight.
         * Default is 0.5 (applies 'p-0.5').
         */
        focusPadding:{
            type:String,
            default:'0.5'
        },
        /**
         * Does this button have a border?
         */
        buttonBorder:{
            type:Boolean,
            default:false
        },
        /**
         * The class used to determine the color of the button's border color.
         */
        borderColorClass:{
            type:String,
            default:''
        },
        /**Should the component prevent itself from horizontally shrinking? */
        preventShrink:{
            type:Boolean,
            default:false
        }
    },
})
</script>

<style scoped>
</style>