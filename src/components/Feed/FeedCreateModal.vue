<template>
    <div class="absolute z-10 flex w-full h-full bg-slate-800/40 backdrop-blur-sm">
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
                        <div>
                            <div class="flex items-start flex-wrap gap-1">
                                <PillButton @click="selectFeedType(FeedEnums.Types.User)">User</PillButton>
                                <PillButton :disabled="true" @click="selectFeedType(FeedEnums.Types.Tag)">Tag</PillButton>
                                <PillButton :disabled="true">Mentions</PillButton>
                                <PillButton :disabled="true">DMs</PillButton>
                            </div>
                        </div>
                        <div class="bg-violet-400">
                            <InLaInput v-model="searchTerm" text-label="User Search"/>
                            <div v-for="result, index in filterUsers" :key="index">
                                {{ result.name }}
                            </div>
                        </div>
                    </div>
                    <div v-else-if="currentPage == 1" class="h-full w-full">
                        <div>
                            <!-- <SquareButton @click="forwardOnePage" class="bg-sky-500 hover:bg-sky-600">Button2</SquareButton> -->
                            <div>
                                <InLaInput v-model="feedFilters.filterTag" text-label="Tag"/>
                            </div>
                        </div>
                    </div>
                    <div v-else-if="currentPage == 2">
                        <div>Feed Type: {{ selectedFeedType }}</div>
                        <div>Tags: {{ feedFilters.filterTag }}</div>
                    </div>
                </Transition>
                <!-- <div v-for="page in modalPages">{{ page.title }}</div> -->
            </div>
            <div class="flex space-x-2 justify-between">
                <SquareButton @click="backOnePage" class="bg-gray-500 hover:bg-gray-600">
                    {{currentPage == 0 ? 'Cancel':'Back'}}
                </SquareButton>
                <div class="flex">
                    <SquareButton v-if="(feedFilters.filterTag != '') && currentPage != totalPages-1 && currentPage != 0" @click="forwardOnePage">Next</SquareButton>
                    <SquareButton v-if="(feedTypeSelected && feedSpecificationsSet && currentPage == totalPages-1)">Submit</SquareButton>
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

export default defineComponent({
    components:{
        PillButton,
        SquareButton,
        InLaInput,
    },
    data(){
        return{
            userPromptText: 'What type of Feed do you want to add?',
            modalPages:[
                { title:'What type of Feed do you want to add?', instruction: 'Select Below:'},
                { title:'What do you want to see?', instruction: 'Enter filters below:'},
                { title:'Summary', instruction: 'Are these settings correct?'},
            ],
            feedFilters:{
                filterTag:'',
            },
            currentPage:0,
            totalPages:3,
            selectedFeedType:"",
            feedTypeSelected:false,
            feedSpecificationsSet:false,
            searchResults:[
                {name:'Jimmy', handle:'brainblast'},
                {name:'James', handle:'serectserviced'},
                {name:'Samuel', handle:'wockafella'},
            ],
            searchTerm:'',
            FeedEnums
        }
    },
    computed:{
        // filterUsers:{
        filterUsers(){
            // get(){
            //     if(!this.searchTerm) {console.log(this.searchTerm); return this.searchResults;}
            //     else{
            //         console.log(this.searchTerm);
            //         return this.searchResults.filter(x => x.name.toLowerCase().includes(this.searchTerm));
            //     }
            // },
            // set(v){
            //     if(!this.searchTerm) {console.log(this.searchTerm); return this.searchResults;}
            //     else{
            //         console.log(this.searchTerm);
            //         return this.searchResults.filter(x => x.name.toLowerCase().includes(this.searchTerm));
            //     }
            // }
            if(this.searchTerm.trim().length > 0){
                console.log(this.searchTerm);
                // return this.searchResults.filter((record) => record.name.toLowerCase().includes(this.searchTerm.trim()));
                return this.searchResults.filter((record) => new RegExp(`^${this.searchTerm}${/[a-zA-Z]*/.source}`, "gi").test(record.name));
            }
            return this.searchResults;
        }
    },
    methods:{
        forwardOnePage(){
            if(this.currentPage+1 == this.totalPages){
                this.currentPage=0;
                this.selectedFeedType="";
            }
            else{
                this.currentPage++}
                this.feedTypeSelected = true;
                if(this.feedFilters.filterTag != '') this.feedSpecificationsSet = true;
        },
        backOnePage(){
            if(this.currentPage-1 > -1){
                this.currentPage--;
                this.feedTypeSelected = false;
                this.feedSpecificationsSet = false;
            }
            else{
                //close modal
            }
        },
        selectFeedType(feedType:string){
            this.selectedFeedType = feedType;
            console.log(this.selectedFeedType);
            this.forwardOnePage();
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