<template>
    <button class="outline outline-2 outline-transparent focus-visible:outline-focusBorder shadow-none"
    :disabled="disabled">
        <slot></slot>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name:'Focus Button',
    props:{
        /**Should the button be disabled? */
        disabled:{
            type:Boolean,
            default:false
        }
    }
})
</script>