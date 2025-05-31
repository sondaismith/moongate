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
                <div class="flex overflow-hidden">
                    <div v-for="a in trend?.actors"
                    class="flex rounded-full size-5 shrink-0 bg-slate-700 bg-contain"
                    :style="`background-image:url(${a.avatar})`"
                    :title="a.displayName ? a.displayName : a.handle">
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
import { IFeedColumnSettings, IFeedDescription, IFeedReturnedPostResults } from '../../interfaces/FeedInterfaces';
import { AddFeedToList, GenerateUniqueId } from '../../state/FeedList.vue';
import { FeedEnums } from '../../enums/FeedEnums';

export default defineComponent({
    props:{
        trend: Object as PropType<TrendView>,
        position:Number
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
            if(this.trend){
                var feedResult:IFeedReturnedPostResults = {data:[], cursor:''};
                var usedFeedId:string =  GenerateUniqueId(10);
                var defaultAppearance:IFeedColumnSettings = {
                    width: FeedEnums.Widths.Small,
                }

                var desc:IFeedDescription = {
                    feedId: usedFeedId,
                    userId:1,
                    feedHandle:'loading_tag',
                    feedName:'[loading name]',
                    feedType:FeedEnums.Types.FeedGenerator,
                    feedIcon:FeedEnums.Icons.Trending,
                    newPosts:10,totalPosts:30,
                    feedColumnSettings:defaultAppearance,
                    feedSourceDID:'',
                    feedTags:''
                }

                let urlParts = this.trend.link.split('\/');
                let did = '';
                console.log('Returned Topic Feed Data:');
                await GetBrowsingAgent().resolveHandle({handle:urlParts[2]})
                .then(res =>{
                    did = res.data.did;
                    desc.feedHandle = urlParts[2];
                    desc.feedName = this.trend?.displayName ? this.trend.displayName : "N/A";
                    desc.feedSourceDID = `at://${did}/app.bsky.feed/${urlParts[urlParts.length-1]}`;
                    desc.feedTags = this.trend?.displayName ? this.trend.displayName : ''; //Currently the only way I know to get the "Feed Generator" name when re-loading
                })
                await GetBrowsingAgent().app.bsky.feed.getFeed({feed:desc.feedSourceDID})
                .then(res => {
                    feedResult.data = res.data.feed;
                    feedResult.cursor = res.data.cursor;
                    console.log(res.data);
                })
                AddFeedToList(desc,feedResult.data,feedResult.cursor,'',false);
            }
        }
    }
})
</script>

<style scoped>
</style>