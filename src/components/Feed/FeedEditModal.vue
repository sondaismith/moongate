<template>
    <div data-testid="feed-edit-modal" class="absolute z-10 flex w-full h-full bg-slate-800/40 backdrop-blur-sm">
        <div @click="closeModal" :class="$attrs.class" class="absolute z-10 w-full h-full"></div>
        {{void "Modal Control"}}
        <div class="z-20 flex flex-col w-4/5 md:w-2/3 h-2/3 mx-auto my-auto rounded bg-slate-800
            p-4 drop-shadow-lg">
            <div class="flex gap-2">
                <div class="text-2xl">{{modalPages[currentPage].title}}</div>
                <div v-if="AppState.isCreatingFeed" class="flex bg-green-600 rounded-full px-2 py-1 items-center self-center">Creating</div>
                <div v-if="AppState.isUpdatingFeed" class="flex bg-orange-600 rounded-full px-2 py-1 items-center self-center">Editing</div>
            </div>
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
                                <PillButton data-testid="user-feed-type-button" @click="selectFeedType(FeedEnums.Types.User)">User</PillButton>
                                <PillButton @click="selectFeedType(FeedEnums.Types.Tag)">Tag</PillButton>
                                <PillButton @click="selectFeedType(FeedEnums.Types.Trending)">Trending</PillButton>
                                <PillButton :disabled="!AppState.isAuthBrowsing"
                                @click="selectFeedType(FeedEnums.Types.Notifications)"
                                :title="!AppState.isAuthBrowsing ? 'Login Required' : ''">
                                    Notifications
                                </PillButton>
                                <!-- <PillButton :disabled="true">Mentions</PillButton>
                                <PillButton :disabled="true">DMs</PillButton> -->
                            </div>
                        </div>
                    </div>
                    <div v-else-if="currentPage == 1" class="flex flex-col h-full w-full">
                        <InLaInput v-if="selectedFeedType == FeedEnums.Types.Tag" @inlainput-submit="trySubmitTags" :emit-on-enter="true" v-model="feedFilters.tag" text-label="Tag"/>
                        <div v-if="selectedFeedType == FeedEnums.Types.Tag" class="flex flex-col mt-1 overflow-x-hidden">
                            <div class="mb-1">Discovered Tags:</div>
                            <div class="flex gap-1 flex-wrap">
                                <div v-for="n, index in validTags" :key="index"
                                class="px-2 py-1 rounded-full select-none bg-blue-500 hover:bg-blue-400 break-all">
                                    {{ n }}
                                </div>
                            </div>
                        </div>
                        <UserSearchBar data-testid="create-feed-user-search" v-if="selectedFeedType == FeedEnums.Types.User" @user-selected="selectUser" :data-list="searchResults"/>
                        <div v-if="selectedFeedType == FeedEnums.Types.Notifications">
                            <CheckBox :model-value="feedFilters.notifications.justNotifs">Mentions Only</CheckBox>
                            <!-- <SquareButton @click="testGetNotifs">Load Notifs</SquareButton> -->
                        </div>
                        <div v-if="selectedFeedType == FeedEnums.Types.Trending">
                            <div>No Options Currently</div>
                            <!-- <SquareButton @click="getTrending">Get Trending</SquareButton> -->
                        </div>
                    </div>
                    <div v-else-if="currentPage == 2">
                        <div>Feed Type: {{ selectedFeedType }}</div>
                        <div v-if="selectedFeedType == FeedEnums.Types.Tag">Tags: {{ validTags.join(', ') }}</div>
                        <div v-else-if="selectedFeedType == FeedEnums.Types.User">
                            <div>User DID: {{ feedFilters.user.did }}</div>
                            <div>User: {{ feedFilters.user.name }}</div>
                            <div>Handle: {{ feedFilters.user.handle }}</div>
                        </div>
                        <div v-else-if="selectedFeedType == FeedEnums.Types.Notifications">
                            <div>Mentions Only? {{ feedFilters.notifications.justNotifs }}</div>
                        </div>
                        <div v-else-if="selectedFeedType == FeedEnums.Types.Trending">
                            <div>No Options Currently</div>
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
                    <SquareButton v-if="isTagSpecsEntryComplete || isSelectedTypeNotifications ||
                    isSelectedTypeTrending"
                    @click="forwardOnePage">Next</SquareButton>
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
import { AppState, toast } from '../../state/AppState.vue';
import { AddFeedToList, FeedState, GenerateUniqueId, GetFeed, GetFeedDataForFeedType, UpdateFeedDetails } from '../../state/FeedList.vue';
import { HandleAPIError } from '../../helpers/errors.ts';
import { IFeedColumnSettings, IFeedDescription, IFeedReturnedPostResults } from '../../interfaces/FeedInterfaces.ts';
import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import CheckBox from '../Utilities/CheckBox.vue';
import { GetBrowsingAgent } from '../../lib/api.vue';

export default defineComponent({
    components:{
        PillButton,
        SquareButton,
        InLaInput,
        UserSearchBar,
        CheckBox
    },
    data(){
        return{
            AppState,
            userPromptText: 'What type of Feed do you want to add?',
            modalPages:[
                { title:'What type of Feed is it?', instruction: 'Select Below:'},
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
                notifications:{
                    justNotifs:false,
                }
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
                if(this.validTags.length>0 || this.feedFilters.user) this.feedSpecificationsSet = true;
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
        selectFeedType(feedType:FeedEnums.Types){
            this.selectedFeedType = feedType;
            console.log(this.selectedFeedType);
            this.forwardOnePage();
        },
        /**
         * Method that fires when a user is selected in the
         * `UserSearchBar` control.
         * @param user Object representing the chosen user.
         */
        selectUser(user:ProfileView){
            this.feedFilters.user.did = user.did;
            this.feedFilters.user.handle = user.handle;
            this.feedFilters.user.name = user.displayName ? user.displayName : '';
            this.forwardOnePage();
        },
        grabHashtags(){
            var s = this.feedFilters.tag.split(',');
            //trim whitespace
            for (let i = 0; i < s.length; i++) {
                s[i] = `#${s[i].trim()}`;
            }
            return s.join(' ');
        },
        /**
         * Used by the Tag entry input control on Enter key press. Used to check if the
         * input values are valid before moving forward to the Feed creation details
         * summary page.
         */
        trySubmitTags(){
            if(this.isTagSpecsEntryComplete){
                this.forwardOnePage();
            }
        },
        async testGetNotifs(){
            if(AppState.isAuthBrowsing){
                await GetBrowsingAgent().listNotifications()
                .then(res => {
                    console.log(res.data);
                })
                .catch(err => console.log(err));
            }
        },
        async getTrending(){
            await GetBrowsingAgent().app.bsky.unspecced.getTrendingTopics()
            .then(res => {
                console.log('Result from getTrendingTopics():');
                console.log(res.data);
            });
            await GetBrowsingAgent().app.bsky.unspecced.getTrends()
            .then(res => {
                console.log('Result from getTrends():');
                console.log(res.data);
            });
        },
        /**
         * Method that adds a new feed with specified options
         * to the App's `FeedList`.
         * This should probably be in `FeedList`.
         */
        async createFeed(){
            this.attemptingToCreateFeed = true;
            /**The object that will be added to the FeedList. */
            var feedResult:IFeedReturnedPostResults = {data:[], cursor:''};

            //Perform required API call
            await GetFeedDataForFeedType(this.selectedFeedType as FeedEnums.Types,this.feedFilters.user.did,this.feedFilters.tag)//(<any>FeedEnums.Types)[this.selectedFeedType]
            .then(res => feedResult = res)
            .catch(err => {
                console.log(err);
                toast.add(HandleAPIError(err, 'Error getting data for creating feed'))
            });
            console.log(feedResult);//DEBUG
            var defaultAppearance:IFeedColumnSettings = {
                width: FeedEnums.Widths.Small,
            }

            var usedFeedId:string = '';
            if(AppState.isCreatingFeed) usedFeedId = GenerateUniqueId(10);
            else if(AppState.isUpdatingFeed) usedFeedId = FeedState.selectedFeed;
            //FIX: NEED TO GET REAL CURRENT USER ID FROM APP STATE EVENTUALLY
            /**Starting template for IFeedDescription used to create Feed. */
            var desc:IFeedDescription = {
                feedId: usedFeedId,
                userId:1,
                feedHandle:'loading_tag',
                feedType:FeedEnums.Types.User,
                feedIcon:FeedEnums.Icons.Art,
                newPosts:10,totalPosts:30,
                feedColumnSettings:defaultAppearance,
                feedSourceDID:'',
                feedTags:''
            }
            let concatTags = this.validTags.join(',');
            //Select correct returned Object value based on Feed Type
            switch (this.selectedFeedType) {
                case FeedEnums.Types.User:
                    //Generate Feed Description based on selected options
                    desc = {...desc,
                        feedHandle:this.feedFilters.user.handle,
                        feedName:this.feedFilters.user.name,
                        feedSourceDID:this.feedFilters.user.did
                    }
                    break;
                case FeedEnums.Types.Tag:
                    //Generate Feed Description based on selected options
                    desc = {...desc,
                        feedType:FeedEnums.Types.Tag,
                        feedIcon:FeedEnums.Icons.Hashtag,
                        feedHandle:'hashtag',
                        feedName:concatTags,
                        feedTags:concatTags
                    }
                    break;
                case FeedEnums.Types.Notifications:
                    desc = {...desc,
                        feedType:FeedEnums.Types.Notifications,
                        feedIcon:FeedEnums.Icons.Notifications,
                        feedHandle:'notifs',
                        feedName:'Notifications'
                    }
                    break;
                case FeedEnums.Types.Trending:
                    desc = {...desc,
                        feedType:FeedEnums.Types.Trending,
                        feedIcon:FeedEnums.Icons.Trending,
                        feedHandle:'trending',
                        feedName:'Trending'
                    }
                    break;
                default:
                    break;
            }
            //Create the Feed
            if(AppState.isCreatingFeed){
                AddFeedToList(desc,feedResult.data, feedResult.cursor, feedResult.seenAt, false);
            }
            else if(AppState.isUpdatingFeed){
                UpdateFeedDetails(FeedState.selectedFeed,desc,feedResult.data,feedResult.cursor);
            }
            this.closeModal();
        },
        closeModal(){
            // AppState.ToggleCreateFeedModal();
            AppState.HideEditFeedModal();
        }
    },
    computed:{
        /**
         * Method that takes the content put into the "Tag" input control
         * and parses it for valid tags - words starting with (#) and containing
         * no illegal hashtag characters. Currently the allowed length is unlimited.
         */
        validTags(){
            const tagRegex = new RegExp(`${/#[^/\\!@\-()$%\^&\+~|[\]{}#,;'"`.<>=\s]+/.source}`,'g');
            //content must be longer than 1 character
            if(this.feedFilters.tag.length>1){
                var result = [];
                let matches = this.feedFilters.tag.matchAll(tagRegex);
                for(const match of matches){
                    result.push(match[0]);
                }
                return result;
            }
            return [];
        },
        /**
         * Validates that the required conditions have been met during the
         * Tag-type Feed creation process to progress to the summary/creation page.
         */
        isTagSpecsEntryComplete(){
            return (this.validTags.length>0) &&
            this.selectedFeedType == FeedEnums.Types.Tag &&
            this.currentPage != this.totalPages-1 && this.currentPage != 0;
        },
        isSelectedTypeNotifications(){
            return this.selectedFeedType == FeedEnums.Types.Notifications &&
            this.currentPage != this.totalPages-1 && this.currentPage != 0;
        },
        isSelectedTypeTrending(){
            return this.selectedFeedType == FeedEnums.Types.Trending &&
            this.currentPage != this.totalPages-1 && this.currentPage != 0;
        }
    },
    mounted(){
        if(AppState.isUpdatingFeed){
            //Start on last/summary page
            this.currentPage = this.modalPages.length-1;
            //Get existing Feed
            var existingFeed = GetFeed(FeedState.selectedFeed);
            //Update the modal state to hold the existing feed's data
            switch (existingFeed?.description.feedType) {
                case FeedEnums.Types.User:
                    this.selectedFeedType = FeedEnums.Types.User;
                    this.feedFilters.user = {
                        did:existingFeed.description.feedSourceDID,
                        handle:existingFeed.description.feedHandle,
                        name:existingFeed.description.feedName
                    };
                    break;
                case FeedEnums.Types.Tag:
                    this.selectedFeedType = FeedEnums.Types.Tag;
                    this.feedFilters.tag = existingFeed.description.feedTags;
                    break;
            }

        }
    }
    // watch:{
    //     'feedFilters.tag': debounce(function (newVal){

    //     },400)
    // }
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