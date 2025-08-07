<template>
    <div class="flex shrink-0 text-2xl justify-center text-primary bg-btn opacity-30 hover:opacity-100
    transition-opacity rounded-r rounded-l-sm h-10 w-10 items-center ml-auto">
        <div @click="$emit('buttonClicked')"
        class="cursor-pointer">
            <i-mingcute:left-fill v-if="arrowDirection == 'Left'"/>
            <i-mingcute:right-fill v-if="arrowDirection == 'Right'"/>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
    props:{
        arrowDirection:{
            type: String as PropType<'Left'|'Right'|'Up'|'Down'>,
            required: true
        }
    },
    emits:['buttonClicked'],
})
</script>

<style scoped>

</style>