<template>
    <div class="flex p-2 text-primary items-center gap-2 overflow-hidden hover:bg-btnHover
    cursor-pointer">
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
        }
    }
})
</script>

<style scoped>
</style>