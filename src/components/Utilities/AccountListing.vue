<template>
    <div class="flex gap-2 p-3 text-left border border-outline hover:border-modernToggleBtnBorderHover active:bg-transparent rounded select-none">
        <div class="flex flex-col gap-2 w-full overflow-hidden">
            <div class="flex gap-1 items-center">
                <div class="flex bg-blueskyBlue aspect-square rounded-full shrink-0 w-8 items-center justify-center overflow-hidden">
                    <ImageLoader v-if="modItem.account.avatar" :img-url="modItem.account.avatar" :fill-container="true" loader-type="spinner"/>
                    <i-mingcute:radar-2-fill v-else class="text-white h-6 w-6"/>
                </div>
                <div class="flex flex-col overflow-hidden">
                    <div class="text-base leading-4 text-nowrap overflow-hidden text-ellipsis">{{ modItem.account.displayName ? modItem.account.displayName : '\n' }}</div>
                    <div class="text-xs text-secondary text-nowrap overflow-hidden text-ellipsis">@{{ modItem.account.handle ? modItem.account.handle : 'PROP MISSING' }}</div>
                </div>
                <FocusButton @click="$emit('actionClicked')" :title="actionText+' &quot;'+modItem.account.displayName+'&quot;'"
                class=" flex items-center gap-1 self-center ml-auto mr-0.5 rounded p-1 border bg-deleteBtnBG active:bg-deleteBtnBGActive
                text-xs text-white hover:border-primary disabled:bg-disabledBG disabled:text-disabled disabled:border-transparent shadow-none"
                :disabled="modItem.isAwaitingAction">
                    <i-mingcute:loading-fill v-if="modItem.isAwaitingAction" class="spinner"/>
                    <div>{{ actionText }}</div>
                </FocusButton>
                <FocusButton title="Account Options" class="px-1 rounded bg-checkedButtonBG hover:bg-checkedButtonBGHover
                border border-outlineLighter shadow-none mr-1"
                @click="e => $emit('optionsClicked',e)">...</FocusButton>
            </div>
            <AccountModerationLabel :is-muted="isAccountMuted" :is-blocked="isAccountBlocked"/>
            <div class="text-sm">{{ modItem ? modItem.account.description : 'Please supply the `:feed-generator-view` prop' }}</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import AccountModerationLabel from './AccountModerationLabel.vue';
import { IAccountModerationItem } from '../../interfaces/SettingsInterfaces';
import ImageLoader from './ImageLoader.vue';
import FocusButton from './FocusButton.vue';

export default defineComponent({
    props:{
        /**The IAccountModerationItem that this component will display. Required. */
        modItem:{
            type:Object as PropType<IAccountModerationItem>,
            required:true
        },
        /**Text that will be displayed in the action button. Required. */
        actionText:{
            type:String,
            required:true,
        }
    },
    components:{
        AccountModerationLabel,
        ImageLoader,
        FocusButton,
    },
    emits:{
        actionClicked:null,
        optionsClicked:null
    },
    computed:{
        /**Is the viewed account muted by the logged in User? */
        isAccountMuted(){
            return typeof this.modItem.account.viewer != 'undefined' && typeof this.modItem.account.viewer.muted != 'undefined' && this.modItem.account.viewer.muted;
        },
        /**Is the viewed account blocked by the logged in User? */
        isAccountBlocked(){
            return typeof this.modItem.account.viewer != 'undefined' && typeof this.modItem.account.viewer.blocking != 'undefined';
        }
    }
})
</script>

<style scoped>
</style>