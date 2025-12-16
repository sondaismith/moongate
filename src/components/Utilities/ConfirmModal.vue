<template>
    <div v-if="isVisible" class="absolute z-50 flex flex-col w-full h-full">
        <div :class="$attrs.class" class="absolute w-full h-full bg-slate-900/50 backdrop-blur-sm"></div>
        <div class="relative flex flex-col rounded bg-slate-800 m-auto p-4 gap-2 drop-shadow">
            <div v-if="confirmMessage.trim()!=''">{{ confirmMessage }}</div>
            <div v-else>{{ AppState.currentConfirmationTask.Message }}</div>
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
            resolvePromise: (result:any)=>{return result},
            rejectPromise: {},
            /**Confirm message to display in modal. */
            confirmMessage: '',
            /**Is the modal currently visible. */
            isVisible:false,
        }
    },
    methods:{
        /**Confirm action. */
        confirm(){
            // AppState.currentConfirmationTask.Task();
            this.resolvePromise(true);
            this.isVisible = false;
            // AppState.hideConfirmModal();
        },
        /**Cancel action. */
        cancel(){
            this.resolvePromise(false);
            this.isVisible = false;
            // AppState.hideConfirmModal();
        },
        /**
         * Method used to display the `ConfirmModal` component. Used to prompt the User
         * to confirm that they want to perform as specifc action.
         * NOTE: This is expected to be called via access through a component template ref
         * in a parent/related component (e.g. this.$refs.[ref]).
         * @param message The message to display to the User in the modal.
         */
        async show(message:string):Promise<boolean>{
            this.confirmMessage = message;
            this.isVisible = true;
            return new Promise((resolve, reject) => {
                this.resolvePromise = resolve
                this.rejectPromise = reject
            })
        }
    }
})
</script>

<style scoped>
</style>