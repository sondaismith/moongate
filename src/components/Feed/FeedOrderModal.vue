<template>
    <div class="absolute z-10 flex w-full h-full text-primary bg-slate-900/80 backdrop-blur-sm focus-visible:outline-none">
        <div @click="closeModal" :class="$attrs.class" class="absolute z-10 w-full h-full"></div>
        <div class="z-20 flex flex-col gap-2 w-4/5 md:w-2/3 lg:max-w-[700px]
            h-2/3 md:h-auto bg-focusBG text-primary p-4 mx-auto my-auto rounded-md">
            <div v-if="false">
                <div>Do any Feeds exist?: {{ totalFeedCount>0 }}</div>
                <div>FeedId: {{ feedIdToUpdate }}</div>
                <div>Feed found: {{ doesFeedExist }}</div>
                <div>New Pos different from Orig?: {{ willPositionChange }}</div>
            </div>
            <div v-if="totalFeedCount<1" class="flex gap-1 items-center text-2xl bg-green-400">
                <i-mdi:sms-failed-outline class="shrink-0"/>
                <div class="text-2xl">No Feeds exist to reorder...</div>
            </div>
            <div v-else-if="!doesFeedExist" class="flex gap-1 items-center text-2xl bg-green-400">
                <i-mdi:sms-failed-outline class="shrink-0"/>
                <div>Matching Feed could not be found...</div>
            </div>
            <div v-else class="flex flex-col">
                <div class="text-2xl">Update Feed Position</div>
                <div class="w-10s">
                    <!-- <input type="range" min="0" :max="totalFeedCount" step="1" v-model="newFeedPos" class="w-full shadow-none"/> -->
                    <input type="range" min="0" :max="totalFeedCount" step="1" v-model="FeedState.newFeedColumnIndex" class="w-full shadow-none"/>
                    <div class="flex justify-between">
                        <div>0</div>
                        <div>{{ totalFeedCount }}</div>
                    </div>
                </div>
                <div class="flex gap-1">
                    <div>Original Position:</div>
                    <div>{{ FeedState.oldFeedColumnIndex }}</div>
                </div>
                <div class="flex items-center gap-1">
                    <div>New Position:</div>
                    <input class="bg-searchbarBG leading-8 px-2 h-8 w-12
                border-gray-500 group-hover:border-blue-400 focus:border-searchbarFocusHightlight rounded-md
                disabled:border-searchbarBorderDisabled disabled:text-searchbarBorderDisabled disabled:group-hover:border-searchbarBorderDisabled shadow-none" v-model="FeedState.newFeedColumnIndex">
                </div>
            </div>
            <div class="flex justify-between mt-auto">
                <SquareButton @click="closeModal">Cancel</SquareButton>
                <SquareButton @click="updateFeedPosition" :is-disabled="!willPositionChange">Update</SquareButton>
            </div>
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
            if(FeedState.newFeedColumnIndex != FeedState.oldFeedColumnIndex){
                // remove element from its oldIndex
                const elRemoved = FeedState.FeedList.splice(FeedState.oldFeedColumnIndex, 1)[0];
                // insert it at its new index
                FeedState.FeedList.splice(FeedState.newFeedColumnIndex, 0, elRemoved);
                AppState.hideFeedOrderModal();
            }
        }
    },
    computed:{
        doFeedsExist():boolean{
            return FeedState.FeedList.length>0;
        },
        totalFeedCount():number{
            return FeedState.FeedList.length-1;
        },
        doesFeedExist():boolean{
            // return this.originalFeedPos > -1;
            return FeedState.oldFeedColumnIndex > -1;
        },
        willPositionChange(){
            // return this.originalFeedPos != this.newFeedPos;
            return FeedState.oldFeedColumnIndex != FeedState.newFeedColumnIndex;
        }
    },
    mounted(){
        if(this.feedIdToUpdate.trim() != ''){
            let index = FeedState.FeedList.findIndex(x => x.description.feedId == this.feedIdToUpdate);
            if(index != -1){
                // this.originalFeedPos = this.newFeedPos = index;
                FeedState.oldFeedColumnIndex = FeedState.newFeedColumnIndex = index;
            }
        }
    }
})
</script>