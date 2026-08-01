<template>
    <FocusButton @click="toggleValue" class="relative flex flex-col p-1 h-7 w-11 items-center rounded-full bg-transparent outline-offset-2"
    :class="valueToToggle ? '!bg-modernToggleBtnBGSelected border-modernToggleBtnBorder hover:border-modernToggleBtnBorderHover focus-visible:border-modernToggleBtnBorderHover' :
    'bg-modernToggleBtnBG border-disabled hover:border-slate-400 focus-visible:border-slate-400'">
        <div class="absolute transition-transform left-1 top-1 bottom-1 rounded-full aspect-square bg-modernToggleBtnToggleFill"
        :class="valueToToggle ? 'translate-x-4':'translate-x-0 !bg-disabled'"></div>
    </FocusButton>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FocusButton from './FocusButton.vue';

export default defineComponent({
    components:{
        FocusButton,
    },
    props:{
        valueToToggle:{
            type:Boolean,
            required:true
        }
    },
    data(){
        return{
            toggleState:false,
        }
    },
    emits:{
        valueToggled:(value:boolean) => {
            if(typeof value == 'boolean') return true;
        },
    },
    methods:{
        toggleValue(){
            this.toggleState = !this.toggleState;
            this.$emit('valueToggled',this.toggleState);
        }
    },
    created(){
        this.toggleState = this.valueToToggle;
    }
})
</script>

<style scoped>
</style>