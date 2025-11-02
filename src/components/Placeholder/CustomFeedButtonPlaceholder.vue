<template>
    <div class="flex gap-2 p-3 text-left border border-slate-400 rounded select-none animate-pulse">
        <div>
            <div class="h-5 w-5 rounded-full border border-slate-400"></div>
        </div>
        <div class="flex flex-col gap-2 w-full overflow-hidden">
            <div class="flex gap-1">
                <div class="flex bg-slate-400 aspect-square shrink-0 w-8">
                </div>
                <div class="flex flex-col justify-between w-full">
                    <div class="rounded-sm h-4 w-28 bg-slate-400"></div>
                    <div class="rounded-sm h-3 w-36 bg-slate-400"></div>
                </div>
            </div>
            <div class="flex flex-col gap-1">
                <div class="rounded-sm h-[14px] bg-slate-400 w-4/5"></div>
                <div class="rounded-sm h-[14px] bg-slate-400"></div>
                <div class="rounded-sm h-[14px] bg-slate-400 w-3/4"></div>
            </div>
            <div class="flex gap-1">
                <div class="rounded-sm h-3 w-16 mt-auto bg-slate-400"></div>
                <div class="rounded-sm h-3 w-24 mt-auto bg-slate-400"></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
})
</script>