<template>
    <div @click="clicked" class="group flex items-center gap-1">
        <div class="rounded-full aspect-square h-4 border border-outline group-hover:border-hover" :class="[selected ? 'bg-green-500' : 'bg-transparent']"></div>
         <div :class="labelClass">{{ label }}</div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props:{
        label:String,
        labelClass:String
    },
    data(){
        return{
            selected:false,
        }
    },
    methods:{
        clicked(){
            this.selected = !this.selected;
        }
    },
    emits:{
        /**Allows a specified action to be performed when the button is clicked. */
        toggleAction:()=>{return true;}
    }
})
</script>

<style scoped>
</style>