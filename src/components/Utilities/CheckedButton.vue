<template>
    <button class="flex p-2 px-3 rounded-lg text-sm font-semibold items-center justify-between
    bg-checkedButtonBG hover:bg-checkedButtonBGHover focus-visible:bg-checkedButtonBGHover"
    :class="[{'!bg-checkedButtonBGSelected' : selected}, $attrs.class]">
        <div><slot></slot></div>
        <i-mingcute:check-fill v-if="selected" class="text-checkedButtonCheckmark"/>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props:{
        selected:Boolean,
    },
    data(){
        return{
            itemSelected:false,
        }
    },
    created(){
        this.itemSelected = this.selected;
    }
})
</script>

<style scoped>

</style>