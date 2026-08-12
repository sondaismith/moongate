<template>
    <div v-if="(typeof options == 'undefined')" class="rounded border border-outline w-full p-1">No Items have been provided.</div>
    <div v-else class="flex rounded w-full">
        <button v-for="(option, index) in options" @click="optionClicked(index)" class="group p-1 h-full w-full text-center border border-outline outline-none shadow-none rounded-none cursor-pointer
        bg-horizontalSelectorBG hover:bg-horizontalSelectorBGHover hover:border-outline active:!bg-horizontalSelectorBGActive"
        :class="{'rounded' : options.length == 1, 'rounded-l border-r-0' : index == 0, 'border-l-0' : index == options.length-1 && index != 1,
        'rounded-r' : index == options.length-1, '!bg-horizontalSelectorBGSelected hover:!bg-horizontalSelectorBGSelectedHover text-primaryInverted' : option.selected}">
            <div class="flex py-1 gap-1.5 items-center w-full h-full px-1 rounded justify-center border-2 border-transparent
            group-focus-visible:border-feedtypeBtnFocusHighlight overflow-hidden *:select-none">
                {{ option.label }}
            </div>
        </button>
    </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { defineComponent } from 'vue'

interface IHorizontalSelectorOption{
    label:string
    value:string
    selected:boolean
}

export default defineComponent({
    props:{
        options:{
            type:Object as PropType<IHorizontalSelectorOption[]>,
            required:true
        }
    },
    data(){
        return{
        }
    },
    emits:{
        selectionChanged(value:number){
            if(typeof value == 'number') return true;
        },
    },
    methods:{
        optionClicked(index:number){
            this.$emit('selectionChanged',index);
        }
    },
})
</script>

<style scoped>
</style>