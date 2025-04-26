<template>
    <div class="absolute z-10 flex w-full h-full bg-slate-800/60 backdrop-blur-sm outline-none" tabindex="0">
        <div @click="closeModal" :class="$attrs.class" class="absolute z-10 w-full h-full"></div>
        <div class="relative z-20 flex flex-col max-w-[40rem] w-4/5 md:w-2/3s h-4/5 max-h-[30rem] mx-auto my-auto rounded bg-focusBG
        text-primary border border-sidebar drop-shadow-lg overflow-hidden">
            <div class="flex gap-1 px-2 py-1 border-b border-outline text-3xl font-light select-none">
                <i-mingcute:settings-2-line/>
                <div>Application Settings</div>
            </div>
            <div class="flex grow overflow-hidden">
                <div class="flex flex-col gap-1 bg-postBG text-primary p-2 drop-shadow min-w-36">
                    <SettingsCategory v-for="(category, index) in SetttingData.Options" :index="index"
                    :selected="index == selectedCategoryIndex" @category-clicked="switchCategory">
                        {{ category.name }}
                    </SettingsCategory>
                </div>
                <div class="relative grow p-2 h-full">
                    <div class="relative p-2 rounded border border-outline h-full overflow-hidden">
                        <div class="relative h-full overflow-hidden">
                            <TransitionGroup>
                                <div v-if="selectedCategoryIndex == Object.keys(SetttingData.Options)[0]">
                                    <div class="flex gap-1">
                                        <div class="flex gap-1">
                                            <input type="checkbox" :checked="AppState.isDarkMode" @change="toggleTheme"/>
                                            <div>Dark Mode?</div>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="selectedCategoryIndex == Object.keys(SetttingData.Options)[1]"
                                class="relative flex flex-col gap-2 w-full h-full overflow-hidden">
                                    <div class="font-thin text-2xl">Language Selection</div>
                                    <div class="flex gap-1">
                                            <input type="checkbox" :checked="AppState.isDarkMode" @change="toggleTheme"/>
                                            <div>Dark Mode?</div>
                                        </div>
                                    <div class="flex gap-1">
                                        <input type="checkbox" v-model="AppSettingsState.Settings.isAcceptingAllLanguages"/>
                                        <div>Accept Posts in All Languages</div>
                                    </div>
                                    <div class="text-sm">
                                        Please note: Currently only
                                        <span class="font-bold italic">one</span>
                                        language will be used to filter returned Posts. The first item shown under
                                        "Selected Languages" will be the one used.
                                    </div>
                                    <!-- <div class="flex gap-1" :class="{'text-disabled' : AppSettingsState.isAcceptingAllLanguages}">
                                        <input type="checkbox" :checked="AppSettingsState.isWhitelist"
                                        @change="toggleAllowListType" :disabled="AppSettingsState.isAcceptingAllLanguages"/>
                                        <div>Whitelist</div>
                                    </div>
                                    <div class="flex gap-1" :class="{'text-disabled' : AppSettingsState.isAcceptingAllLanguages}">
                                        <input type="checkbox" :checked="!AppSettingsState.isWhitelist"
                                        @change="toggleAllowListType" :disabled="AppSettingsState.isAcceptingAllLanguages"/>
                                        <div>Blacklist</div>
                                    </div> -->
                                    <ToggleButton left-option="Whitelist" right-option="Blacklist"
                                    :toggle-value="AppSettingsState.Settings.isWhitelist"
                                    @toggle-action="toggleAllowListType" :disabled="AppSettingsState.Settings.isAcceptingAllLanguages"/>
                                    <!-- <MultiSelect @change="console.log(SetttingData.Options.PostFilters.data.languageBlacklist)" :model-value="SetttingData.Options.PostFilters.data.languageBlacklist" filter :options="LocalesObject" :max-selected-labels="2" size="large" placeholder="Select Languages" class="w-full"/> -->
                                    <!-- <div class="relative h-full overflow-hidden bg-lime-400"> -->
                                    <FilterSelect ref="languageSelector" placeholder="Select Languages" :options="LocalesObject" value-key="name"
                                    @selected-options-changed="updateSelectedLanguages" :disabled="AppSettingsState.Settings.isAcceptingAllLanguages"/>
                                    <!-- </div> -->
                                    <!-- <div class="flex flex-wrap gap-1 w-fulls">
                                        <div v-for="locale in SetttingData.Options.PostFilters.data.languageBlacklist" class="rounded-full px-2 py-1 bg-postMsg hover:bg-hover cursor-pointer">{{ locale }}</div>
                                    </div> -->
                                    <div class="relative flex flex-col gap-1 bg-red-500s h-full"
                                    :class="{'text-disabled' : langControlsDisabled}">
                                        <div>Selected Languages:</div>
                                        <div class="flex flex-wrap bg-pink-400s grows items-start gap-1 select-none overflow-y-scroll">
                                            <div v-for="n in AppSettingsState.Settings.selectedLanguages"
                                            @click="toggleLanguageOption(n)"
                                            class="relative group flex justify-center items-center rounded-full px-2 py-0.5 bg-btn hover:bg-btnHover
                                            border border-outline overflow-hidden cursor-pointer"
                                            :class="{'!bg-disabledBG !border-disabled pointer-events-none' : langControlsDisabled}"
                                            title="Remove">
                                                <div>{{n.name}}</div>
                                                <div class="absolute flex items-center justify-center bg-focusBG/90 text-red-600 w-full h-full rounded-full
                                                transition-transform translate-y-full group-hover:translate-y-0">
                                                    <i-mingcute:delete-2-fill/>
                                                </div>
                                            </div>
                                            <Transition>
                                                <div v-if="AppSettingsState.Settings.selectedLanguages.length < 1"
                                                class="bg-slate-400s italic text-btnText">~~None~~</div>
                                            </Transition>
                                        </div>
                                    </div>
                                    <!-- <InLaInput text-label="Tag Blacklist" :model-value="SetttingData.Options.PostFilters.data.tagBlacklist"/> -->
                                </div>
                                <div v-if="selectedCategoryIndex == Object.keys(SetttingData.Options)[2]">
                                    <div class="italic">Account Settings are still not supported. Check back later!</div>
                                </div>
                            </TransitionGroup>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { AppState } from '../../state/AppState.vue'
import SettingsCategory from './SettingsCategory.vue';
import InLaInput from '../Utilities/InLaInput.vue';
import { LocalesObject } from '../../enums/Locales';
import FilterSelect from '../Utilities/FilterSelect.vue';
import { AppSettingsState, LangCode } from '../../state/AppSettingsState.vue';
import ToggleButton from '../Utilities/ToggleButton.vue';


export default defineComponent({
    data(){
        return{
            AppState,
            AppSettingsState,
            LocalesObject,
            SetttingData: {
                Options:{
                    General:{
                        name:'General',
                        data:{
                            isDarkMode:AppState.isDarkMode
                        }
                    },
                    PostFilters:{
                        name:'Post Filters',
                        data:{
                            acceptAllLanguages:true,
                            languageWhitelist:'',
                            languageBlacklist:[],
                            tagBlacklist:'',
                        }
                    },
                    Account:{
                        name:'Account',
                        data:{
                            TBA:true
                        }
                    }
                }
            },
            selectedCategoryIndex:'General',
        }
    },
    components:{
        SettingsCategory,
        InLaInput,
        FilterSelect,
        ToggleButton,
    },
    methods:{
        closeModal(){
            AppState.HideSettingsPanel();
        },
        toggleTheme(){
            AppState.isDarkMode = !AppState.isDarkMode;
        },
        /**Switch the currently viewed settings category. */
        switchCategory(category:string|undefined){
            if(category) this.selectedCategoryIndex = category;
        },
        toggleAllowListType(){
            AppSettingsState.Settings.isWhitelist = !AppSettingsState.Settings.isWhitelist;
        },
        updateSelectedLanguages(newSelection:LangCode[]){
            AppSettingsState.Settings.selectedLanguages = newSelection;
        },
        /**Used to cause the child `FilterSelect` component to update its
         * state by removing one of the selected options. Currently the event
         * jumps from `SettingsPanel`->`FilterSelect`->back to `SettingsPanel`.
         */
        toggleLanguageOption(option:LangCode){
            this.$refs.languageSelector.parentRemoveSelectedOption(option);
            // AppSettingsState.selectedLanguages.splice(AppSettingsState.selectedLanguages.indexOf(option),1);
        }
    },
    computed:{
        langControlsDisabled(){
            if(AppSettingsState.Settings.isAcceptingAllLanguages) return true;
            return false;
        }
    }
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
  position: absolute;
  transform: translateX(20px);
}

.option-move,
.option-enter-active,
.option-leave-active {
  /* transition: opacity 0.3s ease, transform 0.4s ease; */
  transition: all 0.5s ease;
}
.option-enter-from,
.option-leave-to {
  /* opacity: 0; */
  transform: translateY(-10px);
}
.option-leave-active {
  /* position: absolute; */
}
</style>