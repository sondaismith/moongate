<template>
    <div class="flex gap-1 cursor-pointer"
    @click="toggleValue">
        <div class="flex shrink-0 size-4 box-content my-auto rounded bg-btn border border-outline
        items-center justify-center hover:bg-btnHover">
            <!-- <div class="relative h-full w-full leading-4 text-center align-middle bg-red-400">x</div> -->
                <i-mdi:check v-if="checkState" class="bg-green-400s h-full"/>
        </div>
        <!-- <div>Show Post after creation?</div> -->
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props:{
        /**Allows you to set the starting value of the checkbox. */
        modelValue:Boolean
    },
    data(){
        return{
            checkState:false,
        }
    },
    emits:{
        valueToggled:(value:boolean) => {
            return value;
        }
    },
    methods:{
        toggleValue(){
            this.checkState = !this.checkState;
            this.$emit('valueToggled',this.checkState);
        }
    },
    created(){
        this.checkState = this.modelValue;
    }
})
</script>

<style scoped>

</style>