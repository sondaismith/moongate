<template>
    <div class="relative flex flex-col items-start">
        <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
            class="peer bg-slate-900 leading-8 pl-2 pt-3 h-11 mb-2
            border-gray-500 hover:border-blue-400 focus:border-blue-600 rounded-md
            w-full"/>
        <div class="absolute top-[-2px] left-2 select-none text-feedTimestamp text-gray-300
            peer-focus:text-blue-300">
            {{ textLabel ? textLabel : "Unset Label" }}
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props: ['modelValue', 'textLabel'],
    emits: ['update:modelValue'],
    setup () {
        return {}
    }
})
</script>

<style scoped>
</style>