<template>
    <span @click="createTagFeed" :title="`Create Feed for '#${tagValue}'`"
    class="rounded cursor-pointer whitespace-normal text-blue-500 hover:text-blue-400">
        <slot></slot>
    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { AddFeedToList, PrepareFeedData } from '../../state/FeedList.vue';
import { FeedEnums } from '../../enums/FeedEnums';

export default defineComponent({
    props:{
        tagValue:String,
    },
    methods:{
        createTagFeed(){
            //Should cause a FeedColumn displaying posts
            //matching the clicked tag
            // alert('ooh!');
            this.$toast.add({summary:'Creating Feed...', detail:`Creating feed for ${this.tagValue}`, group:'tr', life:3000});
            PrepareFeedData(FeedEnums.Types.Tag,undefined,this.tagValue).then(res => AddFeedToList(res.description,res.data,res.cursor,res.seenAt,false));
        }
    }
})
</script>

<style scoped>
</style>