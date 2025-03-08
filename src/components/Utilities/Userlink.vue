<template>
    <span @click="createUserFeed" class="p-1 rounded bg-blue-700 hover:bg-blue-500 text-[12px] leading-3 cursor-pointer">
        <slot></slot>
    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props:{
        userlinkValue:String,
    },
    methods:{
        createUserFeed(){
            //Should cause a FeedColumn displaying posts
            //matching the clicked user (if they exist)
            this.$toast.add({summary:'Creating Feed...', detail:`Creating feed for ${this.userlinkValue }`, group:'tr', life:3000});
        }
    }
})
</script>

<style scoped>
</style>