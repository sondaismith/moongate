<template>
    <div @blurw="hideOptions" tabindex="0" class="relative flex flex-col overflow-hiddens h-fulls">
        <div @click="toggleOptions" class="flex items-center justify-between p-2 rounded-md bg-postBG border
        transition-colors border-outline hover:border-outlineLighter
        text-secondaryHover cursor-pointer select-none">
            <div>{{ placeholder ? placeholder : 'Select' }}</div>
            <i-mingcute:down-line class="text-xl"/>
        </div>
        <Transition>
            <div v-if="isOptionsVisible" class="relative w-full h-full overflow-hiddens">
                <div class="absolute w-full bg-focusBG border border-t-0 border-outline">
                    <div class="flex p-2 gap-2 border-b border-outline">
                        <input type="checkbox" :checked="isAllVisibleSelected" title="Select all visible"
                        @change="toggleAllVisibleOptions"/>
                        <input v-model="filterText" type="text" class="w-full px-2 py-1 bg-postFocusBG border border-outline"
                        placeholder="Filter">
                    </div>
                    <div class="px-2 pb-2 max-h-32 h-fulls overflow-y-scroll ">
                        <div v-for="item in filteredOptions" class="flex gap-2 py-1 items-center
                        transition-colors hover:bg-hover cursor-pointer"
                        :class="{'text-green-400' : item.selected}"
                        @click="toggleSelectedOption(item)">
                            <input type="checkbox" :checked="item.selected"/>
                            <div>{{ valueKey ? (item.option as IIndexable)[valueKey] : item.option.name }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
        <!-- <div>Selected Options</div>
        <div class="flex flex-wrap gap-2 h-full overflow-hidden">
            <div v-for="item in heldOptions.filter(x => x.selected)"
                title="Remove Item"
            class="rounded-full px-2 p-1 bg-slate-600 hover:bg-hover cursor-pointer"
            @click="toggleSelectedOption(item)">
                {{ valueKey ? (item.option as IIndexable)[valueKey] : item.option }}
            </div>
        </div> -->
    </div>
</template>

<script lang="ts" generic="T">
import { defineComponent, PropType } from 'vue'
import { AppSettingsState, LangCode, OptionHolder } from '../../state/AppSettingsState.vue';

//Thanks to Roberto - https://stackoverflow.com/questions/34727936/typescript-bracket-notation-property-access#comment109883263_55108590
/**Interface used to access object properties via bracket notation. */
interface IIndexable<T = any> { [key: string]: T }

export default defineComponent({
    props:{
        modelValue:Array,
        /**The values that will be displayed and held by the control. */
        options:Array as PropType<LangCode[]>,
        /**The placeholder text that will be displayed on the drop-down selector. */
        placeholder:String,
        /**Specifies what value from the `options` object will be displayed in the control. */
        valueKey:String,
    },
    data(){
        return{
            /**Is the option drop-down visible. */
            isOptionsVisible:false,
            /**
             * Collection of all the options displayed in the component, and if they're
             * selected or not.
             */
            heldOptions:[] as OptionHolder<LangCode>[],
            /**The current text used to filter the displayed options in the component. */
            filterText:'',
        }
    },
    methods:{
        /**Displays the options drop-down list.*/
        showOptions(){
            this.isOptionsVisible = true;
        },
        /**Hides the options drop-down list.*/
            hideOptions(){
            this.isOptionsVisible = false;
        },
        /**Toggles the visibility of the options drop-down list.*/
        toggleOptions(){
            this.isOptionsVisible = !this.isOptionsVisible;
        },
        /**
         * Toggles all of the visible options - if the list has been
         * filtered only the visible options will be selected.
         */
        toggleAllVisibleOptions(event:Event){
            this.filteredOptions.forEach(i => {
                i.selected = (event.target as HTMLInputElement).checked;
            });
            this.$emit('selectedOptionsChanged',this.selectedOptions);
        },
        /**Toggles the selection of a specific option. */
        toggleSelectedOption(option:OptionHolder<LangCode>){
            option.selected = !option.selected;
            this.$emit('selectedOptionsChanged',this.selectedOptions);
        },
        /**
         * Method that sets an option as "not selected". Should only be
         * called by the parent component (currently `SettingsPanel`).
         * @param option The option to deselect.
         */
        parentRemoveSelectedOption(option:LangCode){
            let match = this.heldOptions.find(x=> x.option == option);
            if(match){
                match.selected = !match.selected;
                this.$emit('selectedOptionsChanged',this.selectedOptions);
            }
        }
    },
    emits:{
        /**Event emitted whenever the selected options have changed (toggled/untoggled). */
        selectedOptionsChanged:(payload:LangCode[])=>{
            return payload;
        }
    },
    computed:{
        /**
         * List of options after being filtered by a provided string.
         */
        filteredOptions(){
            if(this.filterText.trim().length > 0){
                return this.heldOptions.filter((item) => (item.option as IIndexable)[this.valueKey ? this.valueKey : '0'].toLowerCase().startsWith(this.filterText.trim()));
                // return this.dataList.filter((record) => new RegExp(`^${this.debouncedSearchTerm}${/[a-zA-Z]*/.source}`, "gi").test(record.name));
            }
            return this.heldOptions;
        },
        /**
         * Method used to determine if the "Toggle All Visible" checkbox
         * should be checked or not.
         */
        isAllVisibleSelected(){
            let result = true;
            //Check if any currently displayed results are not selected -
            //if true return false
            if(this.filteredOptions.find(x => !x.selected)) result = false;
            return result;
        },
        selectedOptions(){
            return this.heldOptions.filter(i => i.selected).map(x => x.option);
        },
    },
    mounted() {
        if(this.options){
            //Load options
            this.options.forEach(item => {
                this.heldOptions.push({option:item,selected:false})
            });
            //Ensure selected options stored in state are reflected in the control
            AppSettingsState.selectedLanguages.forEach(selected => {
                let foundOption = this.heldOptions.find(x=>x.option == selected);
                if(foundOption) foundOption.selected = true;
            });
        }
    },
})
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease, transform 0.4s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  /* position: absolute; */
  transform: translateY(-10px);
}
</style>