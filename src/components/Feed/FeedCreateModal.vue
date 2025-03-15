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
                                <PillButton @click="selectFeedType(FeedEnums.Types.Tag)">Tag</PillButton>
                                <PillButton :disabled="true">Mentions</PillButton>
                                <PillButton :disabled="true">DMs</PillButton>
                            </div>
                        </div>
                    </div>
                    <div v-else-if="currentPage == 1" class="flex flex-col h-full w-full">
                        <InLaInput v-if="selectedFeedType == FeedEnums.Types.Tag" v-model="feedFilters.tag" text-label="Tag"/>
                        <div v-if="selectedFeedType == FeedEnums.Types.Tag" class="flex flex-col mt-1 overflow-x-hidden">
                            <div class="mb-1">Discovered Tags:</div>
                            <div class="flex gap-1 flex-wrap">
                                <div v-for="n, index in validTags" :key="index"
                                class="px-2 py-1 rounded-full select-none bg-blue-500 hover:bg-blue-400 break-all">
                                    {{ n }}
                                </div>
                            </div>
                        </div>
                        <UserSearchBar v-if="selectedFeedType == FeedEnums.Types.User" @user-selected="selectUser" :data-list="searchResults"/>
                    </div>
                    <div v-else-if="currentPage == 2">
                        <div>Feed Type: {{ selectedFeedType }}</div>
                        <div v-if="selectedFeedType == FeedEnums.Types.Tag">Tags: {{ validTags.join(', ') }}</div>
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
                    <SquareButton v-if="(validTags.length>0) && currentPage != totalPages-1 && currentPage != 0" @click="forwardOnePage">Next</SquareButton>
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
import { getAuthorFeed, getTagPosts } from '../../lib/api/Feed.vue';
import { addUserFeed, GenerateUniqueId } from '../../state/FeedList.vue';
import { HandleAPIError, IsError } from '../../helpers/errors';
import { IFeedColumnSettings, IFeedDescription } from '../../interfaces/FeedInterfaces';

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
        grabHashtags(){
            var s = this.feedFilters.tag.split(',');
            //trim whitespace
            for (let i = 0; i < s.length; i++) {
                s[i] = `#${s[i].trim()}`;
            }
            return s.join(' ');
        },
        /**
         * Method that adds a new feed with specified options
         * to the App's `FeedList`.
         */
        async createFeed(){
            this.attemptingToCreateFeed = true;
            /**The object that will be added to the FeedList. */
            var feedResult;
            //Perform required API call based on Feed Type
            switch (this.selectedFeedType) {
                case FeedEnums.Types.User:
                    // var userFeed = await getAuthorFeed(this.feedFilters.user.did);
                    feedResult = await getAuthorFeed(this.feedFilters.user.did);
                    break;
                case FeedEnums.Types.Tag:
                    // feedResult = await getTagPosts(this.grabHashtags());
                    feedResult = await getTagPosts(this.validTags.join(' '));
                    break;
                default:
                    break;
            }
            //Check if API call created Error
            if(IsError(feedResult)){
                this.$toast.add(HandleAPIError(feedResult as Error));
                this.attemptingToCreateFeed = false;
                return; //Stop further actions
            }
            console.log(feedResult);//DEBUG
            var defaultAppearance:IFeedColumnSettings = {
                width: FeedEnums.Widths.Small,
            }

            //FIX: NEED TO GET REAL CURRENT USER ID FROM APP STATE EVENTUALLY
            /**Starting template for IFeedDescription used to create Feed. */
            var desc:IFeedDescription = {
                feedId:GenerateUniqueId(10),
                userId:1,
                feedHandle:'hashtag',
                feedName:this.validTags.join(','),
                feedType:FeedEnums.Types.User,
                feedIcon:FeedEnums.Icons.Art,
                newPosts:10,totalPosts:30,
                feedColumnSettings:defaultAppearance,
                feedSourceDID:'',
                feedTags:''
            }
            //Select correct returned Object value based on Feed Type
            switch (this.selectedFeedType) {
                case FeedEnums.Types.User:
                    feedResult = feedResult.data.feed;
                    //Generate Feed Description based on selected options
                    desc = {...desc,
                        feedHandle:this.feedFilters.user.handle,
                        feedName:this.feedFilters.user.name,
                        feedSourceDID:this.feedFilters.user.did
                    }
                    break;
                case FeedEnums.Types.Tag:
                    var posts = [];
                    //Place Posts in a "Feed" shaped Object
                    feedResult.data.posts.forEach(p => {
                        posts.push({post:p})
                    });
                    feedResult = posts;
                    //Generate Feed Description based on selected options
                    desc = {...desc,
                        feedType:FeedEnums.Types.Tag,
                        feedIcon:FeedEnums.Icons.Hashtag,
                        feedTags:this.validTags.join(' ')
                    }
                    break;
                default:
                    break;
            }
            //Create the Feed
            addUserFeed(desc,feedResult);
            this.closeModal();
        },
        closeModal(){
            AppState.ToggleCreateFeedModal();
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
        }
    },
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