<template>
    <div class="flex border border-outline rounded-sm p-1 gap-1 focus-within:border-blue-500 transition-colors" :class="{'bg-primary/10 cursor-not-allowed' : disabled}">
        <input :disabled="disabled" type="text" autocomplete="off" autocapitalize="off" :placeholder="placeholderText" :value="filterVmodel"
        @keyup.enter="$emit('enterKeyUp')"
        @input="$emit('update:filterVmodel',$event.target.value)"
        class="h-full w-full px-2 py-1 bg-transparent rounded-sm outline-none shadow-none"
        :class="{'cursor-not-allowed':disabled}">
        <FocusButton v-if="showClearButton" :disabled="disabled" @click="$emit('clearFilterClicked')"
        class="flex gap-1 items-center shadow-none px-2 rounded hover:border-transparent
        active:border-transparent bg-gray-400 hover:bg-gray-500 active:bg-gray-600
        disabled:bg-disabledBG disabled:cursor-not-allowed text-white">
            <div class="text-nowrap">{{ clearButtonText }}</div>
            <i-mingcute:close-circle-line/>
        </FocusButton>
        <FocusButton v-if="showSubmitButton" :disabled="disabled" @click="$emit('submitClicked')"
        class="flex gap-1 items-center shadow-none px-2 rounded hover:border-transparent
        active:border-transparent bg-blue-400 hover:bg-blue-500 active:bg-blue-600
        disabled:bg-disabledBG disabled:cursor-not-allowed text-white">
            <div class="text-nowrap">{{ submitButtonText }}</div>
        </FocusButton>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FocusButton from './FocusButton.vue';

export default defineComponent({
    components:{
        FocusButton,
    },
    props:{
        /**Placeholder text displayed in the FilterBar when it is empty. */
        placeholderText:{
            type:String,
            default:'Filter results...'
        },
        /**Should inline button be shown? */
        showClearButton:Boolean,
        /**The label text that will be shown on the inline button. */
        clearButtonText:{
            type:String,
            default:'Remove Filter'
        },
        /**Should button for submitting data be shown? */
        showSubmitButton:Boolean,
        /**The label text that will be shown on the submit button. */
        submitButtonText:{
            type:String,
            default:'Submit'
        },
        /**Vmodel to use with the FilterBar. Required. */
        filterVmodel:{
            type:String,
            required:true
        },
        /**Should the component be disabled? Default is false. */
        disabled:{
            type:Boolean,
            default:false
        }
    },
    emits:{
        /**Emitted when User clicks inline button. */
        clearFilterClicked:null,
        /**Emitted when User "submits" filter by pressing the enter key. */
        enterKeyUp:null,
        /**Emitted when User "submits" filter by pressing the submit button. */
        submitClicked:null,
        /**Emit that should be used to update the connected vmodel when text is modified.
         * Example: `newValue => vmodel_to_update = newValue`.*/
        'update:filterVmodel'(payload:string){
            return typeof payload == 'string';
        }
    }
})
</script>

<style scoped>
</style>