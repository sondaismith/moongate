<template>
    <div class="flex flex-col gap-1">
        <div class="relative flex flex-wrap rounded border border-outline has-[input:focus]:outline has-[input:focus]:outline-blue-500 p-1 gap-1">
            <div data-testid="tag-entry-discovered-tags" class="flex gap-1">
                <div class="rounded flex gap-1 items-center bg-tagEntryTagBG px-1.5 py-0.5" v-for="n, index in tagQueue">
                    <div class="select-none">{{ n }}</div>
                    <FocusButton :disabled="disabled" class="rounded h-full border-0 text-xs text-secondary hover:text-secondaryHover outline-offset-[-2px]"
                    @click="removeTagFromQueue(index)" title="Remove Tag">
                        <i-mingcute:close-fill/>
                    </FocusButton>
                </div>
            </div>
            <input type="text" :disabled="disabled" class="peer grow min-h-7 px-1 border-none outline-none bg-transparent shadow-none"
            placeholder="Add tag..." autocapitalize="off" v-model="textEntry" @keyup.enter="addTagToQueue"/>
            <FocusButton data-testid="tag-entry-submit-tags" v-if="showSubmitButton" :disabled="disabled" @click="submitTagQueue"
            class="flex ml-auto gap-1 items-center px-2 rounded hover:border-transparent
            active:border-transparent bg-blue-400 hover:bg-blue-500 active:bg-blue-600
            disabled:bg-disabledBG disabled:cursor-not-allowed text-white"
            :title="submitButtonTooltip">
                <div class="text-nowrap">{{ submitButtonText }}</div>
            </FocusButton>
        </div>
        <div class="ml-auto text-xs text-secondary">{{ instructionText }}</div>
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
        /**Should the control be disabled? */
        disabled:{
            type:Boolean,
            default:false
        },
        /**Text displayed in "Submit" button. Default value is "Submit". */
        submitButtonText:{
            type:String,
            default:'Submit'
        },
        /**Text displayed when hovering over "Submit" button. Default value is "Submit entered tags". */
        submitButtonTooltip:{
            type:String,
            default:'Submit entered tags'
        },
        /**Text displayed as "instruction" label underneath input control. Default value is "Press Enter/Return to add tag to list". */
        instructionText:{
            type:String,
            default:'Press Enter/Return to add tag to list'
        }
    },
    data(){
        return{
            /**Represents text held in input control. */
            textEntry:'',
            /**Collection of all the tags added to specify the Feed results. */
            tagQueue:[] as string[]
        }
    },
    emits:{
        /**Emitted when User "submits" filter by pressing the submit button. */
        submitClicked(tags:string[]){
            return tags.length>0;
        },
    },
    computed:{
        /**
         * Method that takes the content put into the input control and parses it
         * for valid tag content - a "word" containing no illegal "hashtag" characters.
         * Currently the allowed length is unlimited.
         */
        validTag(){
            const tagRegex = new RegExp(`${/[^/\\!@\-()$%\^&\+~|[\]{}#,;'"`.<>=\s]+/.source}`,'g');
            //content must be longer than 1 character
            if(this.textEntry.length>1){
                var result = [];
                let matches = this.textEntry.matchAll(tagRegex);
                for(const match of matches){
                    result.push(match[0]);
                }
                // return result;
                return '#'+result.join('');
            }
            return '';
        },
        /**Value used to determine if "Submit" button should be displayed. */
        showSubmitButton(){
            return this.tagQueue.length>0;
        }
    },
    methods:{
        /**
         * Adds the hashtag currently entered in the input control
         * to the "Tag Queue" for the Tag Feed being created.
         */
        addTagToQueue(){
            if(this.validTag.length>1){
                this.tagQueue.push(this.validTag);
                this.textEntry = '';
            }
        },
        /**
         * Removes a specific tag from the "Tag Queue".
         * @param tagIndex The index of the tag to remove from the "Tag Queue".
         */
        removeTagFromQueue(tagIndex:number){
            if(tagIndex>-1) this.tagQueue.splice(tagIndex,1);
        },
        /**
         * "Submits" the current values in the "Tag Queue" by emitting the values with the 'submitClicked' event.
         */
        submitTagQueue(){
            this.$emit('submitClicked',this.tagQueue);
            this.tagQueue = [];
            this.textEntry = '';
        }
    }
})
</script>

<style scoped>
</style>