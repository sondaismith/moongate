<template>
    <div class="absolute z-10 flex w-full h-full bg-slate-800/60 backdrop-blur-sm outline-none" tabindex="0">
        <div @click="closeModal" :class="$attrs.class" class="absolute z-10 w-full h-full"></div>
        <div class="relative z-20 flex flex-col max-w-[40rem] w-full md:w-2/3s h-full max-h-[30rem]
        m-4 my-auto sm:m-auto rounded bg-focusBG text-primary border border-sidebar drop-shadow-lg
        overflow-hidden">
            <div class="flex gap-1 px-2 py-1 border-b border-outline items-center text-2xl font-light select-none">
                <i-mingcute:settings-2-line/>
                <div>Application Settings</div>
                <div @click="closeModal" class="rounded overflow-hidden borders border-outline text-2xl
                text-red-500 ml-auto sm:hidden cursor-pointer hover:bg-btnHover"
                title="Close Setting">
                    <i-mingcute:close-fill/>
                </div>
            </div>
            <div class="flex flex-col sm:flex-row grow overflow-hidden">
                <div class="flex sm:flex-col text-nowrap overflow-x-auto gap-1 bg-postBG text-primary p-2 drop-shadow min-w-36">
                    <template v-for="(category, index) in SettingData.Options">
                        <SettingsCategory v-if="!category.devOnly || isInDevEnvironment == category.devOnly" :index="index"
                        :selected="index == selectedCategoryIndex" @category-clicked="switchCategory">
                            {{ category.name }}
                        </SettingsCategory>
                </template>
                </div>
                <div class="relative grow p-2 w-full h-full overflow-hidden">
                    <div class="relative p-2 rounded border border-outline w-full h-full overflow-hidden">
                        <div class="relative w-full h-full overflow-hidden">
                            <TransitionGroup>
                                <div v-if="selectedCategoryIndex == Object.keys(SettingData.Options)[0]" class="h-full">
                                    <div class="flex flex-col gap-1 h-full">
                                        <div class="text-xl font-medium">Appearance</div>
                                        <CheckBox :model-value="AppSettingsState.Settings.isDarkMode" @value-toggled="toggleTheme">
                                            Dark Mode?
                                        </CheckBox>
                                        <div class="text-xs">Toggle between Light and Dark application theme colors.</div>
                                        <div class="text-xl font-medium">Hide Metrics</div>
                                        <div class="text-xs">Hide Post Metrics (comments, shares, likes) and User Metrics (followers, following).</div>
                                        <div class="flex gap-1 flex-wrap">
                                            <CheckBox title="Hide Comment Count on Posts" :model-value="AppSettingsState.Settings.isHidingComments"
                                            @value-toggled="togglePostCommentsCount">
                                                Hide Comments
                                            </CheckBox>
                                            <CheckBox title="Hide Share Count on Posts" :model-value="AppSettingsState.Settings.isHidingShares"
                                            @value-toggled="togglePostSharesCount">
                                                Hide Shares
                                            </CheckBox>
                                            <CheckBox title="Hide Likes Count on Posts" :model-value="AppSettingsState.Settings.isHidingLikes"
                                            @value-toggled="togglePostLikesCount">
                                                Hide Likes
                                            </CheckBox>
                                            <CheckBox title="Hide Following Count on User Pages" :model-value="AppSettingsState.Settings.isHidingFollowing"
                                            @value-toggled="toggleUserFollowingCount">
                                                Hide Following
                                            </CheckBox>
                                            <CheckBox title="Hide Follower Count on User Pages" :model-value="AppSettingsState.Settings.isHidingFollowers"
                                            @value-toggled="toggleUserFollowersCount">
                                                Hide Followers
                                            </CheckBox>
                                        </div>
                                        <SquareButton :is-disabled="AppSettingsState.Settings.isShowingIntroMessage"
                                        class="self-start bg-btn hover:bg-btnHover mt-1"
                                        title="Display Introductory Tutorial/Instructions"
                                        @click="AppSettingsState.Settings.isShowingIntroMessage = true">
                                            Show Intro Instructions
                                        </SquareButton>
                                        <SquareButton v-if="isTauri()" @click="confirmAppWindowSizeReset"
                                        class="self-start text-xs !p-1 bg-btn hover:bg-btnHover"
                                        title="Return Window Size to 800x600">
                                            Reset App Window Size
                                        </SquareButton>
                                    </div>
                                </div>
                                <div v-if="selectedCategoryIndex == Object.keys(SettingData.Options)[1]"
                                class="relative flex flex-col gap-2 w-full h-full overflow-auto">
                                    <div class="font-thin text-2xl">Language Selection</div>
                                    <CheckBox :model-value="AppSettingsState.Settings.isAcceptingAllLanguages" @value-toggled="toggleAcceptAllLanguages">
                                        Accept Posts in All Languages
                                    </CheckBox>
                                    <div class="text-sm">
                                        Please note: Currently only
                                        <span class="font-bold italic">one</span>
                                        language will be used to filter returned Posts. The first item shown under
                                        "Selected Languages" will be the one used.
                                    </div>
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
                                <div v-if="isInDevEnvironment && selectedCategoryIndex == Object.keys(SettingData.Options)[2]">
                                    <div class="italic">Account Settings are still not supported. Check back later!</div>
                                </div>
                                <div v-if="isInDevEnvironment && selectedCategoryIndex == Object.keys(SettingData.Options)[3]"
                                class="relative flex flex-col w-full h-full overflow-y-auto pr-2">
                                    <div class="italic">Devloper testing commands - Be careful!</div>
                                    <div v-if="!isTauri()" class="flex flex-col gap-1 border border-outline rounded p-2">
                                        <div class="font-thin text-2xl">IndexedDB Options</div>
                                        <hr class="border-outline pb-1"/>
                                        <SquareButton @click="debugGetSavedFeedsWeb"
                                            class="self-start text-xs !p-1 bg-btn hover:bg-btnHover"
                                            title="Click to load 'savedFeeds' table data">
                                            Load Saved Feeds
                                        </SquareButton>
                                        <div v-if="isSavedFeedsLoaded" class="text-sm">
                                            <div>
                                                {{ `There is/are ${SettingData.Options.Developer.data.recordsFromDB.length}
                                                SavedFeed record(s) stored via IndexedDB.` }}
                                            </div>
                                            <div>{{ `There is/are ${SettingData.Options.Developer.data.savedFeeds.length}
                                                Feed(s) saved.` }}</div>
                                        </div>
                                        <div v-if="isSavedFeedsLoaded" class="flex flex-col rounded border border-outline
                                        p-1 overflow-auto">
                                            <table class="text-sm whitespace-nowrap border-separate">
                                                <thead>
                                                    <th v-for="col in Object.keys(SettingData.Options.Developer.data.savedFeeds[0])">
                                                        {{ col }}
                                                    </th>
                                                </thead>
                                                <tbody>
                                                    <tr v-for="(feed, index) in SettingData.Options.Developer.data.savedFeeds"
                                                    class="bg-btn border">
                                                        <td v-for="(col, colIndex) in Object.keys(feed)" class="borders text-center px-1"
                                                        :class="{'rounded-tl' : index == 0 && colIndex == 0, 'rounded-tr' : index == 0 && colIndex == 6}">
                                                            {{ feed[col] }}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div v-else class="text-xs">
                                            Click button above to load savedFeed table data
                                        </div>
                                        <div v-if="noReturnedFeeds" class="rounded border border-outline p-1 text-sm">
                                            <span>There are no records in the </span>
                                            <span class="rounded-md bg-btn px-1 py-0.5 italic text-btnText">savedFeed</span>
                                            <span> table.</span>
                                        </div>
                                        <SquareButton @click="confirmDebugClearIndexedDBSavedFeeds"
                                            class="self-start text-xs text-white !p-1 bg-red-500 hover:bg-red-700"
                                            title="Clear 'Saved Feeds' from IndexedDB">
                                            Clear Saved Feeds
                                        </SquareButton>
                                    </div>
                                    <div v-else class="flex flex-col gap-1">
                                        <div class="font-thin text-2xl">IndexedDB Options</div>
                                        <hr class="pb-1"/>
                                        <div class="text-sm">IndexedDB Options are not available in the Desktop version of the app.</div>
                                    </div>
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
import { AppState, toast } from '../../state/AppState.vue'
import SettingsCategory from './SettingsCategory.vue';
import InLaInput from '../Utilities/InLaInput.vue';
import { LocalesObject } from '../../enums/Locales';
import FilterSelect from '../Utilities/FilterSelect.vue';
import { AppSettingsState } from '../../state/AppSettingsState.vue';
import ToggleButton from '../Utilities/ToggleButton.vue';
import SquareButton from '../Utilities/SquareButton.vue';
import { getCurrentWindow, PhysicalSize } from '@tauri-apps/api/window';
import { IAppSettings, LangCode } from '../../interfaces/SettingsInterfaces';
import CheckBox from '../Utilities/CheckBox.vue';
import { DeleteIndexedDBSavedFeeds, loadSavedFeedsRecords, SavedFeeds, stringToJSON } from '../../lib/db/local_db';
import { IFeedDBData } from '../../interfaces/FeedInterfaces';
import { isTauri } from '@tauri-apps/api/core';


export default defineComponent({
    data(){
        return{
            AppState,
            AppSettingsState,
            LocalesObject,
            stringToJSON,
            isTauri,
            SettingData: {
                Options:{
                    General:{
                        name:'General',
                        data:{
                            isDarkMode:AppState.isDarkMode,
                            /**Should details like Follower count, Post Likes count be hidden? */
                            isHidingMetics:AppSettingsState.Settings.isHidingMetrics,
                            isHidingComments: AppSettingsState.Settings.isHidingComments,
                            isHidingShares: AppSettingsState.Settings.isHidingShares,
                            isHidingLikes: AppSettingsState.Settings.isHidingLikes,
                            isHidingFollowers: AppSettingsState.Settings.isHidingFollowers,
                            isHidingFollowing: AppSettingsState.Settings.isHidingFollowing
                        },
                        /**Indicates if the option should only be available in Dev mode. */
                        devOnly:false,
                    },
                    PostFilters:{
                        name:'Post Filters',
                        data:{
                            acceptAllLanguages:true,
                            languageWhitelist:'',
                            languageBlacklist:[],
                            tagBlacklist:'',
                        },
                        /**Indicates if the option should only be available in Dev mode. */
                        devOnly:false,
                    },
                    Account:{
                        name:'Account',
                        data:{
                            TBA:true
                        },
                        /**Indicates if the option should only be available in Dev mode. */
                        devOnly:true,
                    },
                    Developer:{
                        name:'Dev Options',
                        data:{
                            /**The Feeds that will currently be loaded in the application. */
                            savedFeeds:[] as IFeedDBData[],
                            /**
                             * A collection of every "Saved Feed" data row held in IndexedDB
                             * Only one should be returned, but if there are others you can see
                             * them here (they will be ignored by the app).
                             */
                            recordsFromDB:[] as SavedFeeds[],
                            /**
                             * Indicates that the User has requested to view the IndexedDB
                             * data. Used to display "no records" message.
                             */
                            hasIndexedDBDataBeenRequested: false
                        },
                        /**Indicates if the option should only be available in Dev mode. */
                        devOnly:true,
                    }
                }
            },
            /**
             * Holds state of settings when `SettingsPanel` was first displayed. Used
             * to check for changes when modal is being closed.
             */
            originalSettingsState: {} as IAppSettings,
            selectedCategoryIndex:'General',
            /**Variable the indicates if the application is currently running in dev mode. */
            isInDevEnvironment:false,
        }
    },
    components:{
        SettingsCategory,
        InLaInput,
        FilterSelect,
        CheckBox,
        ToggleButton,
        SquareButton
    },
    methods:{
        closeModal(){
            AppState.HideSettingsPanel();
        },
        toggleTheme(){
            AppSettingsState.Settings.isDarkMode = !AppSettingsState.Settings.isDarkMode;
        },
        toggleMetrics(){
            AppSettingsState.Settings.isHidingMetrics = !AppSettingsState.Settings.isHidingMetrics;
        },
        togglePostCommentsCount(){
            AppSettingsState.Settings.isHidingComments = !AppSettingsState.Settings.isHidingComments;
        },
        togglePostSharesCount(){
            AppSettingsState.Settings.isHidingShares = !AppSettingsState.Settings.isHidingShares;
        },
        togglePostLikesCount(){
            AppSettingsState.Settings.isHidingLikes = !AppSettingsState.Settings.isHidingLikes;
        },
        toggleUserFollowingCount(){
            AppSettingsState.Settings.isHidingFollowing = !AppSettingsState.Settings.isHidingFollowing;
        },
        toggleUserFollowersCount(){
            AppSettingsState.Settings.isHidingFollowers = !AppSettingsState.Settings.isHidingFollowers;
        },
        /**Switch the currently viewed settings category. */
        switchCategory(category:string|undefined){
            if(category) this.selectedCategoryIndex = category;
        },
        toggleAllowListType(){
            AppSettingsState.Settings.isWhitelist = !AppSettingsState.Settings.isWhitelist;
        },
        toggleAcceptAllLanguages(){
            AppSettingsState.Settings.isAcceptingAllLanguages = !AppSettingsState.Settings.isAcceptingAllLanguages;
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
        },
        /**
         * Method the asks User if they're sure that they want to reset the
         * app window size. Calls `resetAppWindowSizeReset()`.
         */
        confirmAppWindowSizeReset(){
            AppState.showConfirmModal('Are you sure you want to reset the Application Window?', this.resetAppWindowSize);
        },
        /**
         * Method that resets the application window size to it's default.
         * Default size is 800px by 600px.
         */
        resetAppWindowSize(){
            var loadedWindowSize = new PhysicalSize(800,600);
            var curWindow = getCurrentWindow();
            curWindow.setSize(loadedWindowSize);
        },
        /**
         * Debug method for viewing what is stored in the `savedFeeds` IndexedDB
         * table.
         */
        async debugGetSavedFeedsWeb(){
            await loadSavedFeedsRecords()
            .then(res => {
                console.log(res);
                let feedResult = res as SavedFeeds[];
                this.SettingData.Options.Developer.data.hasIndexedDBDataBeenRequested = true;
                if(feedResult && feedResult.length>0){
                    let loadedFeeds:IFeedDBData[]|undefined = stringToJSON(feedResult[0].data);
                    this.SettingData.Options.Developer.data.savedFeeds = loadedFeeds;
                    this.SettingData.Options.Developer.data.recordsFromDB = feedResult;
                }
            })
            .catch(err => {
                toast.add({summary:'Error', detail:`Error loading saved feeds: ${err}`, severity:'error', group:'tr', life:3000});
            })
        },
        /**
         * Debug method that ask the User for confirmation before clearing all records from
         * the `saveFeeds` IndexedDB array.
         */
        async confirmDebugClearIndexedDBSavedFeeds(){
            AppState.showConfirmModal('Are you sure you wish to clear the Saved Feeds?', this.clearSavedFeeds);
        },
        /**
         * Method that calls the method that clears the records held in the `savedFeeds`
         * IndexedDB table. Also clears the table displayed on the `SettingsPanel` table.
         */
        clearSavedFeeds(){
            DeleteIndexedDBSavedFeeds();
            this.SettingData.Options.Developer.data.savedFeeds = [];
            this.SettingData.Options.Developer.data.recordsFromDB = [];
            this.SettingData.Options.Developer.data.hasIndexedDBDataBeenRequested = false;
        }
    },
    computed:{
        langControlsDisabled(){
            if(AppSettingsState.Settings.isAcceptingAllLanguages) return true;
            return false;
        },
        isSavedFeedsLoaded(){
            if(this.SettingData.Options.Developer.data.savedFeeds.length>0) return true;
            return false;
        },
        /**
         * Indicates that a request for `savedFeeds` table data from IndexedDB has
         * been attempted and no records were found.
         */
        noReturnedFeeds(){
            if(this.SettingData.Options.Developer.data.hasIndexedDBDataBeenRequested &&
                this.SettingData.Options.Developer.data.savedFeeds.length<1) return true;
            return false;
        }
    },
    mounted(){
        //Finds out if the application is currently running in a dev environment.
        this.isInDevEnvironment = import.meta.env.DEV;
        this.originalSettingsState = AppSettingsState.getCurrentSettingsState();
    },
    async beforeUnmount(){
        //Save application settings if changes have been made
        let currentSettingsState = AppSettingsState.getCurrentSettingsState();
        if(JSON.stringify(this.originalSettingsState) !== JSON.stringify(currentSettingsState)){
            await AppSettingsState.saveSettingsToStore()
            .then(res => toast.add({summary:'Settings Saved', severity:'success', group:'bc', life:3000}))
            .catch(err => toast.add({summary:'Error',detail:err,severity:'error', group:'bc', life:3000}))
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