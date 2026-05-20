<template>
    <div class="flex flex-col h-full overflow-hidden">
        <FilterBar :filter-vmodel="searchTermVModel" :placeholder-text="placeholderText" @update:filter-vmodel="emitVModelUpdate"
        @enter-key-up="submitSearch" @submit-clicked="submitSearch" :show-submit-button="isSearchTermValid" submit-button-text="Search"
        :show-clear-button="userResultsRef.length>0"
        clear-button-text="Clear Results" @clear-filter-clicked="clearUserAccountResults"
        :disabled="disabled"/>
        <div v-if="searchTerm.trim() != '' && !isSearchTermValid" class="border-x border-outline bg-searchbarValidationBG p-1 pl-3 grow-0 shrink-0 text-sm text-searchbarValidationText select-none">
            <div>Search term must be longer than 2 characters</div>
        </div>
        <div v-if="lastResultsTerm != ''" class="border-x border-outline bg-searchbarShowingResultsBG p-2 pl-3 grow-0 shrink-0 text-sm text-searchbarShowingResultsText select-none">
            <div>Showing results for: "{{ lastResultsTerm }}"</div>
        </div>
        <div v-if="searchTerm.trim() != '' || userResultsRef.length>0" class="flex border-t-0
        border-inherit border-outline rounded-b bg-feedColumnBG overflow-auto"
        :class="[userResultsRef.length<1 ? 'border-none' : 'border']">
            <div data-testid="userSearchBar-returned-users-container" class="relative flex flex-col w-full">
                <button :disabled="disabled" @click="emitUserSelected(result.profileData,index)" data-testid="user-search-bar-result"
                class="group flex items-center cursor-pointer disabled:cursor-not-allowed rounded-none hover:bg-searchbarResultHover disabled:bg-disabledBG
                disabled:border-transparent disabled:text-disabled"
                v-for="result, index in userResultsRef" :key="index" tabindex="0">
                    <div class="flex items-center gap-2 w-full border-2 p-2 border-transparent
                    group-focus:border-feedtypeBtnFocusHighlight">
                        <div class="flex items-center rounded-full h-5 w-5 border border-secondary shrink-0 my-auto"
                        :class="[{'bg-radioButtonSelected border-transparent' : result.selected}]">
                            <i-mingcute:check-fill v-if="result.selected" class="h-full w-full p-0.5 text-white"/>
                            <i-mingcute:loading-fill v-if="result.awaitingDetailedData" class="spinner mx-auto h-3 shrink-0 text-black"/>
                        </div>
                        <div class="flex rounded-full size-10 min-w-10 aspect-square justify-center items-center bg-cover overflow-hidden"
                        :class="[{'bg-searchbarHandle' : typeof result.profileData.avatar == 'undefined'}]">
                            <ImageLoader v-if="typeof result.profileData.avatar != 'undefined'" :img-url="result.profileData.avatar" :fill-container="true" :loader-type="'spinner'"/>
                            <i-mingcute:user-add-fill v-else/>
                        </div>
                        <div class="flex shrink-0 overflow-hidden flex-col items-start">
                            <div class="flex gap-1 items-center w-full overflow-hidden">
                                <div v-if="typeof result.profileData.displayName != 'undefined' && result.profileData.displayName.trim() == ''" class="whitespace-nowrap overflow-hidden text-ellipsis opacity-20">[Whitespace]</div>
                                <div v-if="typeof result.profileData.displayName != 'undefined'" class="whitespace-nowrap overflow-hidden text-ellipsis">{{ result.profileData.displayName }}</div>
                                <div v-else class="whitespace-nowrap overflow-hidden text-ellipsis opacity-20">No Display Name</div>
                                <VerifiedBadge v-if="isUserVerified(result.profileData)" class="size-4"/>
                            </div>
                            <div class="text-xs text-searchbarHandle mt-auto">@{{ result.profileData.handle }}</div>
                        </div>
                        <div class="w-full max-h-8 self-center text-secondary text-left line-clamp-2
                        overflow-hidden text-ellipsis text-xs"
                        :title="result.profileData.description">
                            {{result.profileData.description}}
                        </div>
                    </div>
                </button>
            </div>
        </div>
        <div v-if="lastResultsTerm.trim()!='' && userResultsRef.length == 0"
        class="border border-outline font-bold p-2 pl-3 grow-0 shrink-0 text-sm text-searchbarShowingResultsText select-none">
            <div>No Results Found for "{{ lastResultsTerm }}"</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { isUserVerified } from '../../helpers/states';
import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import FilterBar from './FilterBar.vue';
import { IFeedStackItem } from '../../interfaces/FeedInterfaces';
import { PropType } from 'vue';
import { IUserSearchResult } from '../../interfaces/UserInterfaces';

export default defineComponent({
    name:'User Search Bar (Updated)',
    components:{
        FilterBar
    },
    props:{
        /**Is the control currently disabled? */
        disabled:Boolean,
        /**Search term currently being entered into the control.*/
        searchTermVModel:{
            type:String,
            required:true
        },
        /**String value of the last search term submitted. */
        lastResultsTerm:{
            type:String,
            required:true
        },
        /**Instructional text that will be displayed in the search bar. Default is 'Filter results...' */
        placeholderText:{
            type:String,
        },
        feedStackRef:{
            type: Object as PropType<IFeedStackItem[]>,
            required:true
        },
        userResultsRef:{
            type: Object as PropType<IUserSearchResult[]>,
            required:true
        }
    },
    data(){
        return{
            isUserVerified,
            /**Realtime value of search term entered into input. */
            searchTerm:'',
            /**Debounced/delayed value of search term entered into input. */
            debouncedSearchTerm:'',
            /**Determines if waiting for result from data source. */
            isWaitingForResult:false,
            /**DEBUG FOR NOW - returned data from API */
            // apiData2: [] as IUserSearchResult[],
            apiData: [] as ProfileView[],
            userResults: [] as {profileData:ProfileView, selected:boolean}[]
        }
    },
    emits:['filterBarUpdate','userSelected','searchSubmitted','clearResultsClicked'],
    methods:{
        emitVModelUpdate(newValue:string){
            this.searchTerm = newValue;
            this.$emit('filterBarUpdate',this.searchTerm);
        },
        /**Emits the DID of the user selected from the search results. */
        emitUserSelected(user:ProfileView,index:number){
            // let clickedIndex = this.userResults.findIndex(x=>x.profileData.did == user.did);
            // if(clickedIndex>-1) this.userResults[clickedIndex].selected = !this.userResults[clickedIndex].selected;
            this.$emit('userSelected',user,index);
        },
        /**
         * Method used to "submit" the search term entered into the control
         * on Enter Key or button press.
         */
        async submitSearch(){
            if(this.isSearchTermValid)
                this.$emit('searchSubmitted',this.searchTerm);
        },
        /**
         * Method used to clear the latest User accounts that have been returned.
         * Emits message to parent component to clear the entered search term and
         * the User Account results array.
         */
        clearUserAccountResults(){
            this.searchTerm = '';
            this.$emit('clearResultsClicked');
        }
    },
    computed:{
        filteredUsers(){
            if(this.searchTerm.trim().length > 0){
                // return this.searchResults.filter((record) => record.name.toLowerCase().includes(this.searchTerm.trim()));
                // return this.dataList.filter((record) => new RegExp(`^${this.debouncedSearchTerm}${/[a-zA-Z]*/.source}`, "gi").test(record.name));
                return this.userResults;
            }
            // return this.searchResults;
            return [];
        },
        /**Has a valid search term been entered into the control? */
        isSearchTermValid(){
            return this.searchTerm.trim().length>2;
        }
    },
})
</script>

<style scoped>

</style>