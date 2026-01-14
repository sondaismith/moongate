<template>
    <div class="flex p-2 text-primary items-center gap-2 overflow-hidden hover:bg-btnHover
    cursor-pointer"
    title="Create Feed for Topic"
    @click="createFeedForTopic">
        <div class="select-none">#{{ position }}</div>
        <div class="flex flex-col overflow-hidden">
            <div class="flex gap-2 items-center">
                <div class="text-nowrap overflow-hidden font-bold text-ellipsis"
                :title="trend?.displayName">
                    {{ trend?.displayName }}
                </div>
                <div class="size-1 rounded-full bg-postMsg"></div>
                <div class="text-nowrap text-xs overflow-hidden text-ellipsis"
                :title="getTrendCategory">
                    {{ getTrendCategory }}
                </div>
            </div>
            <div class="flex gap-2 items-center">
                <div v-if="typeof trend != 'undefined' && trend.actors.length>0" class="flex overflow-hidden">
                    <div v-for="a in trend?.actors"
                    class="flex rounded-full size-5 shrink-0 bg-slate-700 bg-contain overflow-hidden"
                    :title="a.displayName ? a.displayName : a.handle">
                        <Image v-if="typeof a.avatar != 'undefined'" :img-url="a.avatar" loader-type="spinner" :fill-container="true" :spinner-width="10" />
                    </div>
                </div>
                <div class="text-xs text-secondary text-nowrap" :title="postCountText">
                    {{ postCountTextCompact }}
                </div>
            </div>
        </div>
        <div class="flex shrink-0 gap-1 rounded-full text-xs px-2 py-1 items-center ml-auto
        bg-btnSubtle border border-outlineLighter text-center select-none"
        :class="isTrendHot ? 'bg-red-600' : 'bg-postMsg'">
            <i-mdi:flame v-if="isTrendHot"/>
            <div>{{ trend?.status ? trend.status : convertToShortTimestamp(trend?.startedAt)}}</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { TrendView } from '@atproto/api/dist/client/types/app/bsky/unspecced/defs';
import { convertToShortTimestamp, getCompactNumberValue } from '../../helpers/converters';
import { GetBrowsingAgent } from '../../lib/api.vue';
import { AddFeedToList, PrepareFeedData } from '../../state/FeedList.vue';
import { FeedEnums } from '../../enums/FeedEnums';
import { toast } from '../../state/AppState.vue';
import { IUserSearchResult } from '../../interfaces/UserInterfaces';
import Image from '../Utilities/Image.vue';

export default defineComponent({
    props:{
        trend: Object as PropType<TrendView>,
        position:Number
    },
    components:{
        Image,
    },
    data(){
        return{
            convertToShortTimestamp,
            getCompactNumberValue,
        }
    },
    computed:{
        /**Indicates if Trend's status is Hot or not. */
        isTrendHot(){
            if(this.trend){
                if(this.trend.status && this.trend.status == 'hot') return true;
            }
            return false;
        },
        /**Returns post count in full form - e.g. 5897 posts. */
        postCountText(){
            if(this.trend){
                let suffix = ' post';
                if(this.trend.postCount>1) suffix = ' posts';
                return this.trend.postCount + suffix;
            }
            return '0 posts';
        },
        /**Returns post count in compact form - e.g. 5.9K posts. */
        postCountTextCompact(){
            if(this.trend){
                let suffix = ' post';
                if(this.trend.postCount>1) suffix = ' posts';
                return getCompactNumberValue(this.trend.postCount) + suffix;
            }
            return '0 posts';
        },
        /**Returns Trend category with title case capitalization. */
        getTrendCategory(){
            if(this.trend){
                if(this.trend.category){
                    let category = '';
                    let catWords = this.trend.category.split('-');
                    for (let i = 0; i < catWords.length; i++) {
                        category += catWords[i].charAt(0).toUpperCase() + catWords[i].slice(1) + ' ';
                    }
                    return category.trim();
                }
            }
            return 'N/A';
        },
    },
    methods:{
        /**
         * Method that allows the user to view the assoicated "trending topic"
         * Feed created by Bluesky's "trending.bsky.app" Feed Generator(s).
         * NOTE: The `feedTags` field is used to store the Feed name.
         */
        async createFeedForTopic(){
            toast.add({summary:"Creating Feed...", detail:`Creating feed containing posts related to '${this.trend?.displayName}''`,severity:'info',group:'tr',life:3000});
            if(this.trend){
                let urlParts = this.trend.link.split('\/');
                console.log('Returned Topic Feed Data:');
                let startOfProfile = this.trend.link.indexOf('\/profile');
                let endOfProfile = this.trend.link.indexOf('\/feed');
                let handleToUse = this.trend.link.substring(startOfProfile+9,endOfProfile);
                let feedSourceData:IUserSearchResult = {
                    did:'',
                    handle:'',
                    name:''
                }
                await GetBrowsingAgent().resolveHandle({handle:handleToUse})
                .then(res =>{
                    feedSourceData.did = `at://${res.data.did}/app.bsky.feed.generator/${urlParts[urlParts.length-1]}`;
                    feedSourceData.handle = handleToUse;
                    feedSourceData.name = this.trend?.displayName ? this.trend.displayName : "N/A";
                })

                PrepareFeedData(FeedEnums.Types.FeedGenerator,
                feedSourceData)
                .then(res => {
                    //Create the Feed
                    AddFeedToList(res.description,res.data,res.cursor,res.seenAt,false);
                })
                .catch(err => {
                    console.log(err);
                    toast.add({summary:'Error', detail:`${err}`, severity:'error', group:'tr', life:3000});
                });
            }
        }
    }
})
</script>

<style scoped>
</style>