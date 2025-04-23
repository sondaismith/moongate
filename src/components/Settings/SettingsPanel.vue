<template>
    <div class="absolute z-10 flex w-full h-full bg-slate-800/60 backdrop-blur-sm outline-none" tabindex="0">
        <div @click="closeModal" :class="$attrs.class" class="absolute z-10 w-full h-full"></div>
        <div class="relative z-20 flex flex-col max-w-[40rem] w-4/5 md:w-2/3s h-4/5 max-h-[30rem] mx-auto my-auto rounded bg-focusBG
        text-primary border border-sidebar drop-shadow-lg overflow-hidden">
            <div class="flex gap-1 px-2 py-1 border-b border-outline text-3xl font-light select-none">
                <i-mingcute:settings-2-line/>
                <div>Application Settings</div>
            </div>
            <div class="flex grow">
                <div class="flex flex-col gap-1 bg-postBG text-primary p-2 drop-shadow min-w-36">
                    <SettingsCategory v-for="(category, index) in SetttingData.Options" :index="index"
                    :selected="index == selectedCategoryIndex" @category-clicked="switchCategory">
                        {{ category.name }}
                    </SettingsCategory>
                </div>
                <div class="grow p-2">
                    <div class="p-2 rounded border border-outline h-full overflow-hidden">
                        <div class="relative ">
                            <TransitionGroup>
                                <div v-if="selectedCategoryIndex == Object.keys(SetttingData.Options)[0]">
                                    <div class="flex gap-1"><input type="checkbox" :checked="AppState.isDarkMode" @change="toggleTheme">Dark Mode?</input></div>
                                </div>
                                <div v-if="selectedCategoryIndex == Object.keys(SetttingData.Options)[1]"
                                class="relative flex flex-col gap-2">
                                    <div class="font-thin text-2xl">Language Selection</div>
                                    <div class="flex gap-1"><input type="checkbox" :checked="SetttingData.Options.PostFilters.data.acceptAllLanguages">Accept Posts in All Languages</input></div>
                                    <!-- <InLaInput text-label="Language Whitelist" title="This is a placeholder control" :is-disabled="true" :model-value="SetttingData.Options.PostFilters.data.languageWhitelist"/> -->
                                    <div class="flex gap-1">
                                        <input type="checkbox"/>
                                        <div>Whitelist/Blacklist</div>
                                    </div>
                                    <div class="flex flex-wrap gap-1 w-fulls">
                                        <div v-for="locale in TestLocales" class="rounded-full px-2 py-1 bg-postMsg hover:bg-hover cursor-pointer">{{ locale[0] }}</div>
                                    </div>
                                    <InLaInput text-label="Tag Blacklist" :model-value="SetttingData.Options.PostFilters.data.tagBlacklist"/>
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
import { TestLocales } from '../../enums/Locales';

export default defineComponent({
    data(){
        return{
            AppState,
            TestLocales,
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
    },
    methods:{
        closeModal(){
            AppState.HideSettingsPanel();
        },
        toggleTheme(){
            AppState.isDarkMode = !AppState.isDarkMode;
        },
        switchCategory(category:string|undefined){
            if(category) this.selectedCategoryIndex = category;
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
</style>