<template>
    <div class="border-slate-500 flex flex-col mb-2 h-full overflow-hidden">
        {{ void "Searchbar" }}
        <div class="flex rounded-md shadow-[0_2px_2px_0_rgba(0,0,0,0.2)]">
            <InLaInput id="user-searchbar" @inlainput-submit="submitSearch" :emit-on-enter="true"
            :is-disabled="isWaitingForResult"
            class="peer grow rounded-r-none border-r-0" v-model="searchTerm"
            text-label="User Search"/>
            <div @click="submitSearch" class="peer-hover:border-blue-400 rounded-r p-2 bg-searchbarBtn
            border border-l-0 border-outline transition-colors cursor-pointer
            hover:bg-searchbarBtnHover"
            :class="[isWaitingForResult ? 'bg-gray-600 hover:bg-gray-500 cursor-wait' : '']">Search</div>
        </div>
        {{ void "Search for: elements" }}
        <div class="rounded-t border p-2 border-inherit cursor-pointer hover:bg-sky-500
        grow-0 shrink-0 bg-sky-600"
            v-if="searchTerm.trim() && debouncedSearchTerm.trim()">
            <div>Search for: "{{ searchTerm }}"</div>
        </div>
        {{ void "Loading Spinner" }}
        <div class="flex rounded-b border-t-0 border-slate-500 justify-center"
        :class="[searchTerm.trim() && searchTerm.trim() != debouncedSearchTerm.trim() && filteredUsers.length<1 ? 'border p-2' : 'border-none',
            !debouncedSearchTerm.trim() ? 'border-t-[1px] rounded' : 'border-t-0'
        ]">
            <div v-if="searchTerm.trim() && filteredUsers.length<1 && searchTerm.trim() != debouncedSearchTerm.trim()"
                class="loader w-[25px]"></div>
        </div>
        <div v-if="searchTerm.trim() && debouncedSearchTerm.trim()" class="border-t-0
        border-inherit border-outline rounded-b flex bg-feedColumnBG overflow-auto"
        :class="[filteredUsers.length<1 ? 'border-none' : 'border']">
            <div data-testid="userSearchBar-returned-users-container" class="relative flex flex-col w-full">
                <div @click="selectUser(result)" class="flex items-center hover:bg-searchbarResultHover p-2
                    cursor-pointer gap-1 w-full"
                    v-for="result, index in filteredUsers" :key="index">
                    <div class="flex rounded-full min-w-10 aspect-square bg-sky-400 justify-center items-center bg-cover"
                    :style="{'background-image': 'url('+result.avatar+')'}">
                        <i-mingcute:user-add-fill v-if="!result.avatar"/>
                    </div>
                    <div class="flex w-full overflow-hidden flex-col sm:flex-row sm:gap-1 sm:items-center">
                        <div class="whitespace-nowrap overflow-hidden text-ellipsis">{{ result.displayName }}</div>
                        <VerifiedBadge v-if="isUserVerified(result)" class="size-4"/>
                        <div class="text-xs text-searchbarHandle">@{{ result.handle }}</div>
                    </div>
                </div>
                <!-- <div class="px-2 py-2 select-none" v-if="filteredUsers.length == 0 && debouncedSearchTerm.trim().length>0">No Results</div> -->
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import InLaInput from './InLaInput.vue';
import { debounce } from '../../helpers/debouncer';
import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { HandleAPIError, IsError } from '../../helpers/errors';
import { SearchForAccounts } from '../../lib/api/Feed.vue';
import { IUserSearchResult } from '../../interfaces/UserInterfaces';
import { toast } from '../../state/AppState.vue';
import VerifiedBadge from './VerifiedBadge.vue';

export default defineComponent({
    name:'User Search Bar',
    components:{
        InLaInput,
        VerifiedBadge,
    },
    props:{
        /**
         * The list of Users matching the search term entered into
         * the control. You should use a debounce method to update
         * the results the control will display.
         */
        dataList:{
            type:Array<IUserSearchResult>,
            default:[],
        },
        /**
         * The debounce time delay before the search is updated.
         */
        delay:{
            type:Number,
            default:500
        }
    },
    data(){
        return{
            /**Realtime value of search term entered into input. */
            searchTerm:'',
            /**Debounced/delayed value of search term entered into input. */
            debouncedSearchTerm:'',
            /**Determines if waiting for result from data source. */
            isWaitingForResult:false,
            /**DEBUG FOR NOW - returned data from API */
            apiData2: [] as IUserSearchResult[],
            apiData: [] as ProfileView[]
        }
    },
    computed:{
        filteredUsers(){
            if(this.debouncedSearchTerm.trim().length > 0){
                // return this.searchResults.filter((record) => record.name.toLowerCase().includes(this.searchTerm.trim()));
                // return this.dataList.filter((record) => new RegExp(`^${this.debouncedSearchTerm}${/[a-zA-Z]*/.source}`, "gi").test(record.name));
                return this.apiData;
            }
            // return this.searchResults;
            return [];
        },
    },
    watch:{
        /**
         * Debounces the updating of the search term value. Used to limit the
         * number of calls made to the API when using "live" search requests.
         */
        searchTerm: debounce(function (newVal){
            console.log(`Call to API made, new search val: ${newVal}.`);
            //perform API call
            // this.debouncedSearchTerm = newVal; //DEBUG code
            },600)
    },
    emits:{
        /**Event used to indicate that a user returned via search has been selected/clicked. */
        userSelected:(payload:ProfileView) => {
            return payload && payload.did.startsWith('did:');
        }
    },
    methods:{
        /**
         * Method used to "submit" the search term entered into the control
         * on Enter Key or button press.
         */
        async submitSearch(){
            if(!this.isWaitingForResult && this.searchTerm.trim().length>0){
                this.isWaitingForResult = true;
                console.log(`Search term: ${this.searchTerm}`);//DEBUG
                //DEBUG - simulating API call
                setTimeout(() => {
                    this.debouncedSearchTerm = this.searchTerm;//DEBUG, updates the display filter
                    this.isWaitingForResult = false;
                    var searchbar = (document.getElementById('user-searchbar')?.children[0] as HTMLElement)
                    searchbar.focus();
                },500);
                var searchResult:ProfileView[] = [];
                await SearchForAccounts(`${this.searchTerm}`)
                .then(res => {
                    searchResult = res.data.actors
                    // this.payloadToUserSearchResult(searchResult);
                    this.apiData = searchResult;
                    console.log(searchResult);
                })
                .catch(err => toast.add(HandleAPIError(err, 'Error getting User search results')));
            }
            else{
                this.debouncedSearchTerm = this.searchTerm;//DEBUG, just here to allow clear
            }
        },
        /**
         * Changes the passed `ProfileView[]` object into a
         * `IUserSearchResult[]` object. Seems like this isn't
         * really needed?
         * @param data The returned list of user profiles.
         */
        payloadToUserSearchResult(data:ProfileView[]){
            var test = [] as (IUserSearchResult[])
            data.forEach(r => {
                test.push({
                    did:r.did,
                    handle:r.handle,
                    name:r.displayName ? r.displayName : '',
                    pfp: r.avatar
                })
            });
            this.apiData = test;
        },
        /**Emits the DID of the user selected from the search results. */
        selectUser(user:ProfileView){
            this.$emit('userSelected',user);
        },
        /**
         * Method used to see if the viewed User is verified.
         */
        isUserVerified(profile:ProfileView){
            if(profile != undefined && profile.verification && profile.verification.verifiedStatus == 'valid')
                return true;
            return false;
        },
    },
    setup () {
        return {}
    }
})
</script>

<style scoped>
.loader {
    padding: 4px;
    aspect-ratio: 1;
    border-radius: 50%;
    background: #25b09b;
    --_m:
    conic-gradient(#0000 10%,#000),
    linear-gradient(#000 0 0) content-box;
    -webkit-mask: var(--_m);
            mask: var(--_m);
    -webkit-mask-composite: source-out;
            mask-composite: subtract;
    animation: l3 1s infinite linear;
}
@keyframes l3 {to{transform: rotate(1turn)}}
</style>