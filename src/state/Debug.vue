<script lang="ts">
import { reactive } from 'vue'

interface IDebugFlags{
    showFeedScrollStats: Boolean,
    showFeedViewportCenter: Boolean,
    showFeedColumnCenter: Boolean,
    showFeedColumnDragResizeStats: Boolean,
    showPostFocusModalAPITestButton: Boolean,
    showAppSettingsDBDebugModal: Boolean,
}

export const DebugFlags : IDebugFlags = reactive({
    showFeedScrollStats: false,
    showFeedViewportCenter: false,
    showFeedColumnCenter: false,
    showFeedColumnDragResizeStats: false,
    showPostFocusModalAPITestButton: false,
    showAppSettingsDBDebugModal: false,
})
</script>