<template>
    <div class="z-30 flex w-full h-full" :class="[hideBackdrop ? '' : 'absolute']">
        <div v-if="!hideBackdrop" @click="closeModal" class="absolute bg-white/10 backdrop-blur-sm w-full h-full"></div>
        <div class="relative flex flex-col bg-focusBG w-[94%] max-w-[50rem] max-h-[30rem]
        mx-auto my-auto rounded-lg overflow-hidden text-primary drop-shadow-md"
        :class="[hideBackdrop ? 'max-h-full' : 'max-h-[30rem]']">
            <div class="flex flex-col gap-1 bg-aboutPageBanner">
                <div class="flex items-center text-white h-24">
                    <AppLogo class="h-28 text-white scale-100"/>
                    <div>
                        <div class="text-4xl font-thin">Moongate</div>
                        <div>Version: {{ getBuildNumber() }}<span class="align-super text-xs">{{isTauri() ? 'Tauri' : 'Web'}}</span></div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col h-full px-4 *:py-1  divide-outline divide-y">
                <div class="text-xl font-extralight">Desktop/Web Client for Bluesky</div>
                <div class="text-sm">Moongate is an alternative Client App for Bluesky, built using Tauri + Vue.
                    The goal is to create a lightweight, feature-filled app that is responsive and easy to use.</div>
            </div>
            <div class="px-4 text-xl font-semibold">Changelog:</div>
            <div class="flex flex-col gap-1 h-full px-4 mb-4 overflow-y-scroll divide-outline divide-y">
                <div class="font-semibold">October 7th 2025</div>
                <ul class="list-disc list-inside h-full py-1 text-sm">
                    <li>Added "About" page.</li>
                    <li>Added application logo.</li>
                    <li>Added ability to reorder tabs on mobile/touch-screen devices.</li>
                    <li>Updated UI for "Post Focus" modal. Viewing on mobile/small-width screens should now be more user-friendly.</li>
                    <a href="#" class="text-xs text-blue-500">See more</a>
                </ul>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { isTauri } from '@tauri-apps/api/core';
import { defineComponent } from 'vue'
import { AppState } from '../../state/AppState.vue';

export default defineComponent({
    props:{
        hideBackdrop:{
            type:Boolean,
            default:false
        }
    },
    data(){
        return{
            isTauri
        }
    },
    methods:{
        /**
         * Method used to get the current version and build number
         * of the application. Returned values is based on what is
         * declared in package.json.
         */
        getBuildNumber(){
            console.log(import.meta.env.VITE_VUE_APP_VERSION);
            return import.meta.env.VITE_VUE_APP_VERSION;
        },
        closeModal(){
            AppState.HideAboutAppModal();
        }
    }
})
</script>

<style scoped>
</style>