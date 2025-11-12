<template>
    <div class="flex gap-2 p-3 text-left border border-placeholderPulseBG rounded select-none animate-pulse">
        <div v-if="!hideToggle">
            <div class="h-5 w-5 rounded-full border border-placeholderPulseBG"></div>
        </div>
        <div class="flex flex-col gap-2 w-full overflow-hidden">
            <div class="flex gap-2">
                <div class="flex bg-placeholderPulseBG aspect-square shrink-0 w-8" :class="{'rounded-full' : useRoundedPfp}">
                </div>
                <div class="flex flex-col justify-between w-full">
                    <div class="rounded-sm h-4 w-28 bg-placeholderPulseBG"></div>
                    <div class="rounded-sm h-3 w-36 bg-placeholderPulseBG"></div>
                </div>
            </div>
            <div class="flex flex-col gap-1">
                <div class="rounded-sm h-[14px] bg-placeholderPulseBG w-4/5"></div>
                <div class="rounded-sm h-[14px] bg-placeholderPulseBG"></div>
                <div class="rounded-sm h-[14px] bg-placeholderPulseBG w-3/4"></div>
            </div>
            <div v-if="!hideLikedBy" class="flex gap-1">
                <div class="rounded-sm h-3 w-16 mt-auto bg-placeholderPulseBG"></div>
                <div class="rounded-sm h-3 w-24 mt-auto bg-placeholderPulseBG"></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props:{
        hideToggle:{
            type:Boolean,
            default:false
        },
        hideLikedBy:{
            type:Boolean,
            default:false
        },
        useRoundedPfp:{
            type:Boolean,
            default:false
        },
    }
})
</script>