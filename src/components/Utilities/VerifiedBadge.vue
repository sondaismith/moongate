<template>
    <div class="flex gap-1 items-center">
        <div class="flex p-1 rounded-full items-center justify-center bg-blue-500 text-white"
        :class="$attrs.class"
        title="Verified Account">
            <i-mingcute:check-fill/>
        </div>
    </div>
    <!-- <div class="inline-flex ml-1 gap-1 items-center bg-lime-400 align-middle">
        <div class="flex p-1 rounded-full items-center justify-center bg-blue-500 text-white"
        :class="$attrs.class"
        title="Verified Account">
            <i-mingcute:check-fill/>
        </div>
    </div> -->
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props:{
        label:Boolean
    }
})
</script>

<style scoped>
</style>