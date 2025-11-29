<template>
    <button @click="createUserFeed" :title="`Create Feed for ${userlinkValue}`"
    class="group rounded bg-btn hover:bg-btnHover text-[12px] leading-3 shadow-none cursor-pointer
    border-none">
        <div class="w-full h-full rounded p-[3px] border-2 border-transparent
        group-focus-visible:border-searchbarFocusHightlight">
            <slot></slot>
        </div>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { AddFeedToList, PrepareFeedData } from '../../state/FeedList.vue';
import { FeedEnums } from '../../enums/FeedEnums';
import { toast } from '../../state/AppState.vue';

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
            })
            .then(res => AddFeedToList(res.description,res.data,res.cursor,res.seenAt,false))
            .catch(err => {
                toast.add({summary:'Error', detail:`${err}`, severity:'error', group:'tr', life:3000});
            });
        }
    }
})
</script>

<style scoped>
</style>