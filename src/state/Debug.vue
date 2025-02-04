<script lang="ts">
import { defineComponent, reactive } from 'vue'

interface IDebugFlags{
    showFeedScrollStats: Boolean,
    showFeedViewportCenter: Boolean,
    showFeedColumnCenter: Boolean,
    showFeedColumnDragResizeStats: Boolean,
    showPostFocusModalAPITestButton: Boolean,
}

export const DebugFlags : IDebugFlags = reactive({
    showFeedScrollStats: false,
    showFeedViewportCenter: false,
    showFeedColumnCenter: false,
    showFeedColumnDragResizeStats: false,
    showPostFocusModalAPITestButton: false,
})
</script>