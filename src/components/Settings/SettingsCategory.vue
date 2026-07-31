<template>
    <FocusButton class="border-0 border-b border-outline p-0.5 rounded-sm cursor-pointer transition-colors
    hover:bg-btnHover text-left" :class="{'bg-feedColumnBG' : selected}" @click="clickCategory">
        <slot></slot>
    </FocusButton>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FocusButton from '../Utilities/FocusButton.vue';

export default defineComponent({
    components:{
        FocusButton,
    },
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