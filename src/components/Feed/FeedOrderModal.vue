<template>
    <div data-testid="feedOrderModal" class="absolute z-10 flex w-full h-full text-primary bg-slate-900/80 backdrop-blur-sm focus-visible:outline-none">
        <div @click="closeModal" :class="$attrs.class" class="absolute z-10 w-full h-full"></div>
        <div class="z-20 flex flex-col gap-2 w-4/5 md:w-2/3 lg:max-w-[700px]
            h-2/3 md:h-auto bg-focusBG text-primary p-4 mx-auto my-auto rounded-md">
            <div v-if="true">
                <div>isUpdatingFeedPosition value:{{ AppState.isUpdatingFeedPosition }}</div>
                <div>Do any Feeds exist?: {{ totalFeedCount>0 }}</div>
                <div>FeedId: {{ feedIdToUpdate }}</div>
                <div>Feed found: {{ doesFeedExist }}</div>
                <div>New Pos different from Orig?: {{ willPositionChange }}</div>
            </div>
            <div v-if="!hasFeedIdBeenProvided" data-testid="feedOrderModal-no-feedId" class="flex gap-1 items-center text-2xl bg-green-400">
                <i-mdi:sms-failed-outline class="shrink-0"/>
                <div class="text-2xl">No FeedId provided...</div>
            </div>
            <div v-else-if="totalFeedCount<1" data-testid="feedOrderModal-no-feeds" class="flex gap-1 items-center text-2xl bg-green-400">
                <i-mdi:sms-failed-outline class="shrink-0"/>
                <div class="text-2xl">No Feeds exist to reorder...</div>
            </div>
            <div v-else-if="!doesFeedExist" data-testid="feedOrderModal-feed-not-found" class="flex gap-1 items-center text-2xl bg-green-400">
                <i-mdi:sms-failed-outline class="shrink-0"/>
                <div>Matching Feed could not be found...</div>
            </div>
            <div v-else class="flex flex-col">
                <div class="text-2xl">Update Feed Position</div>
                <div class="w-10s">
                    <!-- <input type="range" min="0" :max="totalFeedCount" step="1" v-model="newFeedPos" class="w-full shadow-none"/> -->
                    <input data-testid="feedOrderModal-order-position-range" type="range" min="1" :max="totalFeedCount" step="1" v-model="FeedState.newFeedColumnIndex" class="w-full shadow-none"/>
                    <div class="flex justify-between">
                        <div>1</div>
                        <div>{{ totalFeedCount }}</div>
                    </div>
                </div>
                <div class="flex gap-1">
                    <div>Original Position:</div>
                    <div data-testid="feedOrderModal-original-position-label">{{ FeedState.oldFeedColumnIndex }}</div>
                </div>
                <div class="flex items-center gap-1">
                    <div>New Position:</div>
                    <input data-testid="feedOrderModal-new-position-input" class="bg-searchbarBG leading-8 px-2 h-8 w-12
                border-gray-500 group-hover:border-blue-400 focus:border-searchbarFocusHightlight rounded-md
                disabled:border-searchbarBorderDisabled disabled:text-searchbarBorderDisabled disabled:group-hover:border-searchbarBorderDisabled shadow-none" v-model="FeedState.newFeedColumnIndex">
                </div>
            </div>
            <div>{{ FeedState.FeedList.length }}</div>
            <div class="flex justify-between mt-auto">
                <SquareButton data-testid="feedOrderModal-close-button" @click="closeModal">Cancel</SquareButton>
                <SquareButton data-testid="feedOrderModal-update-button" @click="updateFeedPosition" :is-disabled="!willPositionChange">Update</SquareButton>
            </div>
            <button @click="getFeedToUpdatePositionOf" class="bg-yellow-500 rounded cursor-pointer">TEST-Look for match</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { FeedState } from '../../state/FeedList.vue'
import SquareButton from '../Utilities/SquareButton.vue';
import { AppState } from '../../state/AppState.vue';

export default defineComponent({
    components:{
        SquareButton,
    },
    props:{
        feedIdToUpdate:{
            type:String,
            required:true
        }
    },
    data(){
        return{
            AppState,
            FeedState,
            originalFeedPos:-1,
            newFeedPos:-1,
        }
    },
    methods:{
        closeModal(){
            AppState.hideFeedOrderModal();
        },
        updateFeedPosition(){
            if(this.FeedState.newFeedColumnIndex != this.FeedState.oldFeedColumnIndex){
                // remove element from its oldIndex
                const elRemoved = this.FeedState.FeedList.splice(this.FeedState.oldFeedColumnIndex-1, 1)[0];
                // insert it at its new index
                this.FeedState.FeedList.splice(this.FeedState.newFeedColumnIndex-1, 0, elRemoved);
                AppState.hideFeedOrderModal();
            }
        },
        getFeedToUpdatePositionOf(){
            if(this.feedIdToUpdate && this.feedIdToUpdate.trim() != ''){
                // let index = FeedState.FeedList.findIndex(x => x.description.feedId == this.feedIdToUpdate);
                let index = this.FeedState.FeedList.findIndex(x => x.description.feedId == this.feedIdToUpdate);
                if(index != -1){
                    // this.originalFeedPos = this.newFeedPos = index;
                    this.FeedState.oldFeedColumnIndex = this.FeedState.newFeedColumnIndex = index+1;
                }
            }
        }
    },
    // watch:{
    //     feedIdToUpdate(newId){
    //         if(newId && newId.trim() != ''){
    //             let index = FeedState.FeedList.findIndex(x => x.description.feedId == this.feedIdToUpdate);
    //             if(index != -1){
    //                 // this.originalFeedPos = this.newFeedPos = index;
    //                 FeedState.oldFeedColumnIndex = FeedState.newFeedColumnIndex = index+1;
    //             }
    //         }
    //     }
    // },
    computed:{
        hasFeedIdBeenProvided():boolean{
            return this.feedIdToUpdate != undefined && this.feedIdToUpdate.trim() != '';
        },
        doFeedsExist():boolean{
            return this.FeedState.FeedList.length>0;
        },
        totalFeedCount():number{
            return this.FeedState.FeedList.length;
        },
        doesFeedExist():boolean{
            return this.FeedState.oldFeedColumnIndex > -1;
        },
        willPositionChange(){
            return this.FeedState.oldFeedColumnIndex != this.FeedState.newFeedColumnIndex;
        }
    },
    mounted(){
        if(this.feedIdToUpdate && this.feedIdToUpdate.trim() != ''){
            let index = this.FeedState.FeedList.findIndex(x => x.description.feedId == this.feedIdToUpdate);
            if(index != -1){
                // this.originalFeedPos = this.newFeedPos = index;
                this.FeedState.oldFeedColumnIndex = this.FeedState.newFeedColumnIndex = index+1;
            }
        }
    },
})
</script>