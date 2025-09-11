<template>
    <SquareButton @click="$emit('buttonClicked')"
    class="text-2xl  text-primary bg-btn opacity-30 hover:opacity-100 focus-visible:opacity-100
    transition-opacity rounded-none h-10 w-10"
    :class="[{'rounded-l rounded-r-sm' : arrowDirection == 'Left'},
        {'rounded-r rounded-l-sm ' : arrowDirection == 'Right'}]"
    button-padding="0">
        <i-mingcute:left-fill v-if="arrowDirection == 'Left'"/>
        <i-mingcute:right-fill v-if="arrowDirection == 'Right'"/>
    </SquareButton>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import SquareButton from './SquareButton.vue';

export default defineComponent({
    components:{
        SquareButton,
    },
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