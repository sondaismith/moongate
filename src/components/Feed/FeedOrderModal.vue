<template>
    <div data-testid="feedOrderModal" class="absolute z-10 flex w-full h-full text-primary bg-slate-900/80 backdrop-blur-sm focus-visible:outline-none">
        <div @click="closeModal" :class="$attrs.class" class="absolute z-10 w-full h-full"></div>
        <div class="z-20 flex flex-col gap-2 w-4/5 md:w-2/3 lg:max-w-[700px]
            bg-focusBG text-primary p-4 mx-auto my-auto rounded-md">
            <div v-if="false">
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
                    <input data-testid="feedOrderModal-new-position-input" min="1" :max="totalFeedCount" type="number"
                    @blur="validateNewFeedColumnIndex" class="bg-searchbarBG leading-8 px-2 h-8 w-12
                border-gray-500 group-hover:border-blue-400 focus:border-searchbarFocusHightlight rounded-md
                disabled:border-searchbarBorderDisabled disabled:text-searchbarBorderDisabled disabled:group-hover:border-searchbarBorderDisabled shadow-none
                invalid:!border-red-500"
                v-model="FeedState.newFeedColumnIndex">
                </div>
            </div>
            <div class="flex justify-between mt-auto">
                <SquareButton data-testid="feedOrderModal-close-button" @click="closeModal" class="bg-btn hover:bg-btnHover">Cancel</SquareButton>
                <SquareButton data-testid="feedOrderModal-update-button" @click="updateFeedPosition"
                :is-disabled="!isPositionValid || !willPositionChange || awaitingFeedPositionUpdate">
                    <div class="flex gap-1 items-center">
                        <i-mingcute:loading-fill v-if="awaitingFeedPositionUpdate" class="spinner max-w-0 transition-[max-width]" :class="{'max-w-16' : awaitingFeedPositionUpdate}"/>
                        <div>Update</div>
                    </div>
                </SquareButton>
            </div>
            <button v-if="false" @click="getFeedToUpdatePositionOf" class="bg-yellow-500 rounded cursor-pointer">TEST-Look for match</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { FeedState, SaveFeedChanges } from '../../state/FeedList.vue'
import SquareButton from '../Utilities/SquareButton.vue';
import { AppState, toast } from '../../state/AppState.vue';
import { HandleAPIError } from '../../helpers/errors';

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
            /**Indicates if we are still waiting for the updated Feed position to be saved to disk. */
            awaitingFeedPositionUpdate:false,
        }
    },
    methods:{
        /**
         * Closes the `FeedOrderModal`.
         */
        closeModal(){
            AppState.hideFeedOrderModal();
        },
        /**
         * Updates the selected Feed's position in the "Feed List".
         * Will only perform action if the new position is different than the old.
         */
        async updateFeedPosition(){
            if(this.FeedState.newFeedColumnIndex != this.FeedState.oldFeedColumnIndex){
                // remove element from its oldIndex
                const elRemoved = this.FeedState.FeedList.splice(this.FeedState.oldFeedColumnIndex-1, 1)[0];
                // insert it at its new index
                this.FeedState.FeedList.splice(this.FeedState.newFeedColumnIndex-1, 0, elRemoved);
                this.awaitingFeedPositionUpdate = true;
                SaveFeedChanges().then(() => {
                    AppState.hideFeedOrderModal();
                })
                .catch(err => {
                    toast.add(HandleAPIError(err, 'Error updating Feed position'));
                    this.awaitingFeedPositionUpdate = false;
                })
            }
        },
        /**
         * TEST/DEBUG Method - This method gets the initial values needed to update the
         * Feed associated with the provided `feedId` value. Simulates the actions that
         * occur when displaying the `FeedOrderModal` normally (getting the original
         * position of the Feed on mount).
         */
        getFeedToUpdatePositionOf(){
            if(this.feedIdToUpdate && this.feedIdToUpdate.trim() != ''){
                // let index = FeedState.FeedList.findIndex(x => x.description.feedId == this.feedIdToUpdate);
                let index = this.FeedState.FeedList.findIndex(x => x.description.feedId == this.feedIdToUpdate);
                if(index != -1){
                    // this.originalFeedPos = this.newFeedPos = index;
                    this.FeedState.oldFeedColumnIndex = this.FeedState.newFeedColumnIndex = index+1;
                }
            }
        },
        /**
         * Method used to ensure the value of the new Feed position entered
         * is greater than zero and less than or equal to the total number of Feeds.
         */
        validateNewFeedColumnIndex(){
            let validVal = FeedState.newFeedColumnIndex;
            if(validVal<1) FeedState.newFeedColumnIndex = 1;
            else if(validVal > this.totalFeedCount) FeedState.newFeedColumnIndex = this.totalFeedCount;
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
        isPositionValid(){
            return this.FeedState.newFeedColumnIndex > 0 && this.FeedState.newFeedColumnIndex <= this.totalFeedCount;
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
<style scoped>
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}
</style>