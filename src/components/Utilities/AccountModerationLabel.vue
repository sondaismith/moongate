<template>
    <div class="flex gap-1" :class="{'flex-col' : columnDisplay}">
        <div v-if="isMuted" title="You have muted this account."
        class="flex items-center gap-1 rounded-full px-2 bg-accountMuteLabelBG text-sm select-none">
            <i-mdi:eye-off/>
            <div>Account Muted</div>
        </div>
        <div v-if="isBlocked" title="You have blocked this account."
        class="flex items-center gap-1 rounded-full px-2 bg-accountMuteLabelBG text-sm select-none">
            <i-mdi:user-off/>
            <div>Account Blocked</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props:{
        /**Is the associated account Muted by the logged in User? */
        isMuted:{
            type:Boolean,
            default:false,
        },
        /**Is the associated account Blocked by the logged in User? */
        isBlocked:{
            type:Boolean,
            default:false,
        },
        /**Should the labels be displayed stacked in a column instead of spread in a row. */
        columnDisplay:{
            type:Boolean,
            default:false,
        }
    }
})
</script>

<style scoped>
</style>