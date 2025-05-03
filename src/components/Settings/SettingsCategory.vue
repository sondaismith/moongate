<template>
    <div class="border-b border-outline p-0.5 rounded-sm cursor-pointer transition-colors
    hover:bg-btnHover" :class="{'bg-feedColumnBG' : selected}" @click="clickCategory">
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props:{
        /**The String index of the category to display when clicked. */
        index:String,
        /**Indicates component is currently selected.*/
        selected:Boolean,
    },
    data(){
        return{
            indexToEmit:this.index,
        }
    },
    emits:{
        /**Emit used to indicate a specific settings category has been clicked. */
        categoryClicked:(index:string|undefined) => {
            return index && index.trim() != '';
        }
    },
    methods:{
        clickCategory(){
            this.$emit('categoryClicked',this.index);
        }
    }
})
</script>

<style scoped>

</style>