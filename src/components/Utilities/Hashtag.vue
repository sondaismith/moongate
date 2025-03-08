<template>
    <span @click="createTagFeed" class="rounded cursor-pointer text-blue-500 hover:text-blue-400">
        <slot></slot>
    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

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
        }
    }
})
</script>

<style scoped>
</style>