<template>
    <a class="flex justify-center rounded px-2 py-1.5">
        {{ tooltip }}
    </a>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props: {
        tooltip: String,
        type: {type: String, required: true}
    },
    setup (props) {        
        props.type,
        props.tooltip
    }
})
</script>

<style scoped>

</style>