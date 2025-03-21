<template>
    <div @click="displaySelectedUserAccount" @mouseover="AccountPeekState.waitBeforePeekingUser($event,did ? did : '')"
    @mouseleave="AccountPeekState.cancelUserPeek" class="rounded-full bg-slate-300 aspect-square
    border box-content size-10 bg-contain hover:border-slate-600
    transition-[border-color] ease-linear duration-200 cursor-pointer"
    :style="{'background-image' : 'url('+avatar+')'}">
        <i-mingcute:butterfly-2-fill v-if="!avatar" class="text-2xl h-full w-full p-1 text-blue-600"/>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { AccountPeekState } from '../../state/AccountPeekState.vue';
import { AppState } from '../../state/AppState.vue';

export default defineComponent({
    data(){
        return{
            AppState,
            AccountPeekState,
        }
    },
    props:{
        avatar:String,
        did:String,
    },
    methods:{
        /**
         * Opens the `UserFocusModal` component to the currently selected
         * user's profile.
         */
        displaySelectedUserAccount(){
            AppState.ToggleUserFocusModal(this.did);
        }
    }
})
</script>

<style scoped>
</style>