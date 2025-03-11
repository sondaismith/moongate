<template>
    <div class="border-slate-500 flex flex-col mb-2 h-full overflow-hidden">
        {{ void "Searchbar" }}
        <div class="flex">
            <InLaInput id="user-searchbar" @inlainput-submit="submitSearch" :emit-on-enter="true"
            :is-disabled="isWaitingForResult"
            class="peer grow rounded-r-none border-r-0" v-model="searchTerm"
            text-label="User Search"/>
            <div @click="submitSearch" class="peer-hover:border-blue-400 rounded-r p-2 bg-blue-500
            border border-l-0 border-blue-500 transition-colors cursor-pointer
            hover:bg-blue-400"
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
        border-inherit border-slate-500 rounded-b flex bg-slate-800 overflow-auto"
        :class="[filteredUsers.length<1 ? 'border-none' : 'border']">
            <div class="relative flex flex-col w-full">
                <div @click="selectUser(result)" class="flex items-center hover:bg-gray-700 px-2 py-2
                    cursor-pointer"
                    v-for="result, index in filteredUsers" :key="index">
                    <div class="flex rounded-full min-w-10 aspect-square bg-sky-400 justify-center items-center bg-cover"
                    :style="{'background-image': 'url('+result.pfp+')'}">
                        <i-mingcute:user-add-fill v-if="!result.pfp"/>
                    </div>
                    <div class="ml-2">{{ result.name }}</div>
                    <div class="text-xs text-sky-500 ml-1">@{{ result.handle }}</div>
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

export default defineComponent({
    name:'User Search Bar',
    components:{
        InLaInput,
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
            apiData: [] as IUserSearchResult[]
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
        userSelected:(payload:IUserSearchResult) => {
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
                },500)
                var query = `rocco`
                var searchResult = await SearchForAccounts(`${this.searchTerm}`);
                //Check if API call created Error
                if(IsError(searchResult)){
                    this.$toast.add(HandleAPIError(searchResult as Error));
                    return; //stop further actions
                }
                console.log(searchResult);
                this.payloadToUserSearchResult(searchResult.data.actors)
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
        selectUser(user:IUserSearchResult){
            this.$emit('userSelected',user);
        }

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