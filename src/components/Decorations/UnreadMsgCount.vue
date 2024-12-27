<template>
    <!-- Maybe add ability to customize color? -->
    <span v-if="unreadCount > 0" class="absolute -left-2 -top-2 bg-red-500 rounded-full size-5 text-sm text-center group-hover:text-white">{{ unreadCount }}</span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        unreadCount: Number,
    },
    setup (props) {      
        props.unreadCount
    }
})
</script>