<template>
    <div class="flex py-2 text-feedPostName leading-4 flex-wrap">
        <div v-for="(breadcrumb, index) in postDetails.currentBreadcrumb"
        class="flex">
            <div class="cursor-pointer hover:text-slate-400"
            :class="[index == postDetails.currentBreadcrumb.length-1 ? 'underline pointer-events-none':'',
            index==0?'':'pl-1']"
            v-on="index==0 ? {click: () => postDetails.returnToThreadOrigin()} : {click:() => postDetails.setCurrentThreadView(breadcrumb.postCID)}">
                {{breadcrumb.userName}}
            </div>
            <div class="pl-1" v-if="index != postDetails.currentBreadcrumb.length-1">></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';

export default defineComponent({
    setup () {
        return {}
    },
    data(){
        return{
            postDetails
        }
    },
    props:{
        breadcrumbText: [Number],
        activeCrumb: Number,
    }
})
</script>

<style scoped>
</style>