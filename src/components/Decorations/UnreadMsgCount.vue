<template>
    <!-- Maybe add ability to customize color? -->
    <span v-if="unreadCount && unreadCount > 0" class="absolute -left-2 -top-2
        bg-red-500 rounded-full size-5 text-sm text-center
        group-hover:text-white select-none">
        {{ unreadCount }}
    </span>
    <span v-else-if="isAwaitingData" class="absolute flex -left-2 -top-2 items-center justify-center
        bg-gray-300 rounded-full size-5 p-1 text-center
        group-hover:text-white select-none">
        <i-mingcute:loading-fill class="spinner text-primary"/>
    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        unreadCount: Number,
        /**
         * Indicates if still waiting for data to be loaded for the associated
         * Feed of the associated `FeedButton`
         */
        isAwaitingData:{
            type: Boolean,
            required: true
        },
    },
    setup (props) {
        props.unreadCount
    }
})
</script>