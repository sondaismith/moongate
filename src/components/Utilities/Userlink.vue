<template>
    <span @click="createUserFeed" :title="`Create Feed for ${userlinkValue}`"
    class="p-1 rounded bg-blue-700 hover:bg-blue-500 text-[12px] leading-3 cursor-pointer">
        <slot></slot>
    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { AddFeedToList, PrepareFeedData } from '../../state/FeedList.vue';
import { FeedEnums } from '../../enums/FeedEnums';

export default defineComponent({
    props:{
        userlinkValue:String,
    },
    methods:{
        createUserFeed(){
            //Should cause a FeedColumn displaying posts
            //matching the clicked user (if they exist)
            this.$toast.add({summary:'Creating Feed...', detail:`Creating feed for ${this.userlinkValue }`, group:'tr', life:3000});
            PrepareFeedData(FeedEnums.Types.User,
            {
                did:'',
                handle:this.userlinkValue ? this.userlinkValue.slice(1) : '' ,
                name:''
            },
            undefined)
            .then(res => AddFeedToList(res.description,res.data));
        }
    }
})
</script>

<style scoped>
</style>