<template>
    <div class="flex justify-between items-center p-2
    rounded hover:bg-slate-500 select-none hover:cursor-pointer active:bg-slate-400">
            <div>{{ itemData?.name }}</div>
            <component :is="itemData?.icon"/>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props:{
        itemData: Object
    },
    setup () {
        return {}
    }
})
</script>