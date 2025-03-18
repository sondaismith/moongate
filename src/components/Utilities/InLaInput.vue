<template>
    <div class="relative flex flex-col" :class="fillContainer ? 'w-full' : ''">
        <input @keyup.enter="emitValue" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
            class="peer bg-slate-900 leading-8 pl-2 pt-3 h-11
            border-gray-500 hover:border-blue-400 focus:border-blue-600 rounded-md
            disabled:border-gray-700 disabled:text-gray-500
            w-full" :class="$attrs.class" :type="isPasswordInput ? 'password' : 'text'"
            :disabled="isDisabled ? true : false"/>
        <div class="absolute top-[-2px] left-2 select-none text-feedTimestamp text-gray-300
            peer-focus:text-blue-300">
            {{ textLabel ? textLabel : "Unset Label" }}
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

interface Emits{
    /**Triggered when the passed `modelValue` is updated by the control. */
    (event: "update:modelValue"):void;
    /**Fired when the user presses the enter key or the submit button. */
    (event: "inlainput-submit"):void;
}

export default defineComponent({
    name: "InLaInput",
    props:{
        /**Used to set the initial value displayed in the control. */
        modelValue:{
            type: String,
        },
        /**Sets the text label that will be displayed in the control. */
        textLabel:{
            type: String,
        },
        /**Determines whether or not this control's input should be hidden, as
         * if it was an password entry control.
         */
        isPasswordInput:{
            type: Boolean,
        },
        /**Indicates whether or not this controller's interactivity should be
         * disabled.
         */
        isDisabled:{
            type: Boolean,
        },
        /**Determines whether or not this control will attempt to fill its
         * current container's width.
         */
        fillContainer:{
            type: Boolean,
            default: false,
        },
        /**Determines whether this control emits its currently held value
         * on Enter key press.
         */
        emitOnEnter:{
            type: Boolean,
            default: false,
        },
    },
    // emits: ['update:modelValue', 'inlainput-submit'],
    emits: {
        /**Fired when the `modelValue` value is updated. */
        'update:modelValue':(payload:string|undefined) => {
            return true;
        },
        /**Fired when the user presses the enter key or the submit button. */
        inlainputSubmit:(payload:string|undefined) => {
            return payload && payload.length>0;
        },
    },
    methods:{
        /**Emits the currently held `modelValue` value. */
        emitValue(){
            //don't emit if modelValue is empty/doesn't exist
            if(this.emitOnEnter && this.modelValue){
                // this.$emit('inlainput-submit', this.modelValue);
                this.$emit('inlainputSubmit', this.modelValue);
            }
        }
    },
    setup () {
        return {}
    },
})
</script>

<style scoped>
</style>