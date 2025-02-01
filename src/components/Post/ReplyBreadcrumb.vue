<template>
    <div class="flex py-2 text-feedPostName leading-4">
        <div v-for="(breadcrumb, index) in postDetails.currentBreadCrumb"
        class="flex">
            <div class="cursor-pointer hover:text-slate-400"
            :class="[index == postDetails.currentBreadCrumb.length-1 ? 'underline':'',
            index==0?'':'pl-1']"
            v-on="index==0 ? {click: () => postDetails.returnToThreadOrigin()} : {}">
                {{breadcrumb}}
            </div>
            <div class="pl-1" v-if="index != postDetails.currentBreadCrumb.length-1">></div>
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