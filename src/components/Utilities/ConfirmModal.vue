<template>
    <div class="absolute z-50 flex flex-col w-full h-full">
        <div :class="$attrs.class" class="absolute w-full h-full bg-slate-900/50 backdrop-blur-sm"></div>
        <div class="relative flex flex-col rounded bg-slate-800 m-auto p-4 gap-2 drop-shadow">
            <div>{{ AppState.currentConfirmationTask.Message }}</div>
            <div class="h-[1px] bg-slate-600"></div>
            <div class="flex gap-2 justify-end">
                <SquareButton @click="confirm" @contextmenu.prevent class="bg-red-500 hover:bg-red-400">Yes</SquareButton>
                <SquareButton @click="cancel" @contextmenu.prevent>No</SquareButton>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SquareButton from './SquareButton.vue';
import { AppState } from '../../state/AppState.vue';

export interface IConfirmationTask{
    Task: Function,
    Message: string,
}

export default defineComponent({
    components:{
        SquareButton,
    },
    data(){
        return{
            AppState,
        }
    },
    methods:{
        confirm(){
            AppState.currentConfirmationTask.Task();
            AppState.hideConfirmModal();
        },
        cancel(){
            AppState.hideConfirmModal();
        }
    }
})
</script>

<style scoped>
</style>