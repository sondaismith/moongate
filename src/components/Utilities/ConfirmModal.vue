<template>
    <div v-if="isVisible || AppState.isAskingForConfirmation" tabindex="-1" @keydown.tab="(e) => TrapFocus($el,e)"
        data-testid="confirm-modal" class="absolute z-50 flex flex-col w-full h-full">
        <div :class="$attrs.class" @click="cancel" class="absolute w-full h-full bg-slate-900/50 backdrop-blur-sm"></div>
        <div class="relative flex flex-col rounded overflow-hidden bg-feedColumnBG text-primary m-auto gap-2 drop-shadows">
            <div class="flex items-center rounded-t bg-aboutPageBanner border-[3px] border-b-0 border-feedColumnBG h-8 px-4 font-semibold select-none">
                <div>Confirm Action</div>
            </div>
            <div class="flex flex-col px-4 pb-[10px] gap-2">
                <div v-if="confirmMessage.trim()!=''" class="select-none">{{ confirmMessage }}</div>
                <div v-else class="select-none">{{ AppState.currentConfirmationTask.Message }}</div>
                <div class="h-[1px] bg-outlineLighter"></div>
                <div class="flex gap-2 justify-end text-white">
                    <SquareButton ref="confirmButton" @click="confirm" @contextmenu.prevent class="bg-deleteBtnBG hover:bg-deleteBtnBGHover active:bg-deleteBtnBGActive">Yes</SquareButton>
                    <SquareButton ref="cancelButton" @click="cancel" @contextmenu.prevent>No</SquareButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SquareButton from './SquareButton.vue';
import { AppState, TrapFocus } from '../../state/AppState.vue';

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
            TrapFocus,
        }
    },
    methods:{
        /**Confirm action. */
        confirm(){
            if(AppState.isAskingForConfirmation){
                AppState.currentConfirmationTask.Task();
            }
            this.resolvePromise(true);
            this.isVisible = false;
            AppState.isAskingForConfirmation = false;
        },
        /**Cancel action. */
        cancel(){
            this.resolvePromise(false);
            this.isVisible = false;
            let parent = (this.$el as HTMLElement).parentElement;
            if(parent != null) parent.focus();//refocus parent when modal is hidden
            AppState.isAskingForConfirmation = false;
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
            this.$nextTick(()=>{
                this.$el.focus();
            });
            return new Promise((resolve, reject) => {
                this.resolvePromise = resolve
                this.rejectPromise = reject
            })
        }
    },
    beforeUnmount(){
        //Clear `AppState` ConfirmationTask
        AppState.currentConfirmationTask = {Message:'Default Message: Confirm Action', Task:()=>void 0} as IConfirmationTask;
    }
})
</script>

<style scoped>
</style>