<template>
    <div class="absolute z-10 flex w-full h-full bg-slate-800/40 backdrop-blur-sm">
        <div @click="closeModal" :class="$attrs.class" class="absolute z-10 w-full h-full"></div>
        {{void "Modal Control"}}
        <div class="z-20 flex flex-col w-4/5 md:w-2/3 h-2/3 mx-auto my-auto rounded bg-slate-800
            p-4 drop-shadow-lg">
            <div class="text-2xl">{{modalPages[currentPage].title}}</div>
            {{ void "Pages" }}
            <div class="flex items-center my-1 w-full">
                <template v-for="n in totalPages">
                    <div class="border border-white rounded-full aspect-square p-1"
                        :class="{'bg-white' : currentPage==n-1}"></div>
                    <div v-if="n != totalPages" class="h-[1px] bg-gray-500 w-full"></div>
                </template>
            </div>
            <div class="mb-2">{{ modalPages[currentPage].instruction }}</div>
            <div class="flex flex-col relative grow overflow-hidden">
                <Transition>
                    <div v-if="currentPage == 0" class="h-full w-full">
                        <div class="mb-2">
                            <div class="flex items-start flex-wrap gap-1">
                                <PillButton @click="selectFeedType(FeedEnums.Types.User)">User</PillButton>
                                <PillButton :disabled="true" @click="selectFeedType(FeedEnums.Types.Tag)">Tag</PillButton>
                                <PillButton :disabled="true">Mentions</PillButton>
                                <PillButton :disabled="true">DMs</PillButton>
                            </div>
                        </div>
                    </div>
                    <div v-else-if="currentPage == 1" class="flex flex-col h-full w-full">
                        <InLaInput v-if="selectedFeedType == FeedEnums.Types.Tag" v-model="feedFilters.tag" text-label="Tag"/>
                        <UserSearchBar v-if="selectedFeedType == FeedEnums.Types.User" @user-selected="selectUser" :data-list="searchResults"/>
                    </div>
                    <div v-else-if="currentPage == 2">
                        <div>Feed Type: {{ selectedFeedType }}</div>
                        <div v-if="selectedFeedType == FeedEnums.Types.Tag">Tags: {{ feedFilters.tag }}</div>
                        <div v-if="selectedFeedType == FeedEnums.Types.User">
                            <div>User DID: {{ feedFilters.user.did }}</div>
                            <div>User: {{ feedFilters.user.name }}</div>
                            <div>Handle: {{ feedFilters.user.handle }}</div>
                        </div>
                    </div>
                </Transition>
                <!-- <div v-for="page in modalPages">{{ page.title }}</div> -->
            </div>
            <div class="flex space-x-2 justify-between">
                <SquareButton @click="backOnePage" class="bg-gray-500 hover:bg-gray-600">
                    {{currentPage == 0 ? 'Cancel':'Back'}}
                </SquareButton>
                <div class="flex">
                    <SquareButton v-if="(feedFilters.tag != '') && currentPage != totalPages-1 && currentPage != 0" @click="forwardOnePage">Next</SquareButton>
                    <SquareButton @click="createFeed()" v-if="(feedTypeSelected && feedSpecificationsSet && currentPage == totalPages-1)"
                    :is-disabled="attemptingToCreateFeed">Submit</SquareButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { FeedEnums } from '../../enums/FeedEnums.ts'
import PillButton from '../Utilities/PillButton.vue';
import InLaInput from '../Utilities/InLaInput.vue';
import SquareButton from '../Utilities/SquareButton.vue';
import UserSearchBar from '../Utilities/UserSearchBar.vue';
import { AppState } from '../../state/AppState.vue';
import { getAuthorFeed } from '../../lib/api/Feed';
import { addUserFeed, createFeedDescription } from '../../state/FeedList.vue';
import { HandleAPIError, IsError } from '../../helpers/errors';

export default defineComponent({
    components:{
        PillButton,
        SquareButton,
        InLaInput,
        UserSearchBar,
    },
    data(){
        return{
            AppState,
            userPromptText: 'What type of Feed do you want to add?',
            modalPages:[
                { title:'What type of Feed do you want to add?', instruction: 'Select Below:'},
                { title:'What do you want to see?', instruction: 'Select filter(s) below:'},
                { title:'Summary', instruction: 'Are these settings correct?'},
            ],
            feedFilters:{
                tag:'',
                user:{
                    did:'',
                    handle:'',
                    name:'',
                },
            },
            currentPage:0,
            totalPages:3,
            selectedFeedType:"",
            feedTypeSelected:false,
            feedSpecificationsSet:false,
            searchResults:[
                {did:'asjdy8383h31', name:'Jimmy', handle:'brainblast', pfp:'src/assets/test-media/posts/image04.png'},
                {did:'033jo3hcbccs', name:'James', handle:'serectserviced'},
                {did:'4000djjeaj33', name:'Johnathon', handle:'jjrenttoomuch', pfp:'src/assets/test-media/posts/image07.png'},
                {did:'skiei229iix9', name:'Jack', handle:'mybodyjackjack', pfp:'src/assets/test-media/posts/image08.png'},
                {did:'nneu302bshw3', name:'Samuel', handle:'wockafella'},
            ],
            searchTerm:'',
            debouncedSearchTerm:'',
            attemptingToCreateFeed: false,
            FeedEnums,
        }
    },
    methods:{
        /**
         * Moves forward one page in the modal. Will loop back
         * to the first page if attempting to reach an
         * out-of-bounds page.
         */
        forwardOnePage(){
            if(this.currentPage+1 >= this.totalPages){
                this.currentPage=0;
                this.selectedFeedType="";
            }
            else{
                this.currentPage++}
                this.feedTypeSelected = true;
                if(this.feedFilters.tag != '' || this.feedFilters.user) this.feedSpecificationsSet = true;
        },
        /**
         * Moves back one page in the modal. Closes the modal
         * if used when on the first page.
         */
        backOnePage(){
            if(this.currentPage-1 > -1){
                this.currentPage--;
                this.feedTypeSelected = false;
                this.feedSpecificationsSet = false;
            }
            else{
                this.closeModal()
            }
        },
        /**
         * Method that fires when the user chooses the type of
         * Feed they wish to create.
         * @param feedType The feed type the user wishes to create.
         */
        selectFeedType(feedType:string){
            this.selectedFeedType = feedType;
            console.log(this.selectedFeedType);
            this.forwardOnePage();
        },
        /**
         * Method that fires when a user is selected in the
         * `UserSearchBar` control.
         * @param user Object representing the chosen user.
         */
        selectUser(user:IUserSearchResult){
            this.feedFilters.user.did = user.did;
            this.feedFilters.user.handle = user.handle;
            this.feedFilters.user.name = user.name;
            this.forwardOnePage();
        },
        /**
         * Method that adds a new feed with specified options
         * to the App's `FeedList`.
         */
        async createFeed(){
            this.attemptingToCreateFeed = true;
            var userFeed = await getAuthorFeed(this.feedFilters.user.did);
            //Check if API call created Error
            if(IsError(userFeed)){
                this.$toast.add(HandleAPIError(userFeed as Error));
                this.attemptingToCreateFeed = false;
                return; //Stop further actions
            }
            var feedDescripton = createFeedDescription(this.feedFilters.user.handle,
                this.feedFilters.user.name,FeedEnums.Icons.Art,10,30);
            addUserFeed(feedDescripton,userFeed.data.feed);
            this.closeModal();
        },
        closeModal(){
            AppState.ToggleCreateFeedModal();
        }
    },
    setup () {
        return {}
    }
})
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.1s ease, transform 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  position: absolute;
  transform: translateY(10px);
}
/* .v-enter-from{
    transform: translateY(500px);
}
.v-leave-to{
    transform: translateY(-500px);
} */
</style>