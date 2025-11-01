<template>
    <button v-if="!displayOnly" @click="clickedFeedGenerator" :title="'Select &quot;'+feedGeneratorView?.displayName+'&quot; Feed'"
    class="flex gap-2 p-3 text-left hover:bg-customFeedBtnBGHover
    active:bg-customFeedBtnBGActive focus-visible:bg-customFeedBtnBGHover border border-outline rounded"
    :class="[{'border-blueskyBlue bg-customFeedBtnBGHover' : selected},{'hover:bg-transparent active:bg-transparent focus-visible:bg-transparent' : displayOnly}]">
        <div v-if="!hideRadioButton && !displayOnly" class="flex items-center rounded-full aspect-square h-5 border border-secondary shrink-0 mt-2"
        :class="[{'bg-radioButtonSelected border-transparent' : selected}]">
            <i-mingcute:check-fill v-if="selected" class="h-full w-full p-0.5 text-white"/>
        </div>
        <div class="flex flex-col gap-2 w-full overflow-hidden">
            <div class="flex gap-1 items-center">
                <div class="flex bg-blueskyBlue aspect-square shrink-0 w-8 items-center justify-center">
                    <img v-if="feedGeneratorView?.avatar" :src="feedGeneratorView?.avatar"/>
                    <i-mingcute:radar-2-fill v-else class="text-white h-6 w-6"/>
                </div>
                <div class="flex flex-col overflow-hidden">
                    <div class="text-base leading-4 text-nowrap overflow-hidden text-ellipsis">{{ feedGeneratorView ? feedGeneratorView.displayName : 'PROP MISSING' }}</div>
                    <div class="text-xs text-secondary text-nowrap overflow-hidden text-ellipsis">Feed by @{{ feedGeneratorView ? feedGeneratorView.creator.handle : 'PROP MISSING' }}</div>
                </div>
                <button v-if="!displayOnly" @click.stop="clickedPinFeed" :title="'Save &quot;'+feedGeneratorView?.displayName+'&quot; Feed'" class="ml-auto mr-1 px-2 rounded-none bg-btn hover:bg-btnHover">Pin</button>
            </div>
            <div class="text-sm">{{ feedGeneratorView ? feedGeneratorView.description : 'Please supply the `:feed-generator-view` prop' }}</div>
            <div class="text-xs font-semibold mt-auto">Liked By: {{ feedGeneratorView ? feedGeneratorView.likeCount : 'PROP MISSING' }} users</div>
        </div>
    </button>
    <div v-else class="flex gap-2 p-3 text-left border border-outline hover:border-modernToggleBtnBorderHover cursor-pointers rounded select-none">
        <div class="flex flex-col gap-2 w-full overflow-hidden">
            <div class="flex gap-1 items-center">
                <div class="flex bg-blueskyBlue aspect-square shrink-0 w-8 items-center justify-center">
                    <img v-if="feedGeneratorView?.avatar" :src="feedGeneratorView?.avatar"/>
                    <i-mingcute:radar-2-fill v-else class="text-white h-6 w-6"/>
                </div>
                <div class="flex flex-col overflow-hidden">
                    <div class="text-base leading-4 text-nowrap overflow-hidden text-ellipsis">{{ feedGeneratorView ? feedGeneratorView.displayName : 'PROP MISSING' }}</div>
                    <div class="text-xs text-secondary text-nowrap overflow-hidden text-ellipsis">Feed by @{{ feedGeneratorView ? feedGeneratorView.creator.handle : 'PROP MISSING' }}</div>
                </div>
                <button @click="clickedFeedGenerator" :title="'Remove &quot;'+feedGeneratorView?.displayName+'&quot; Feed'"
                class="self-center ml-auto mr-0.5 rounded p-1 border bg-deleteBtnBG active:bg-deleteBtnBGActive text-xs text-white hover:border-primary shadow-none">Remove</button>
            </div>
            <div class="text-sm">{{ feedGeneratorView ? feedGeneratorView.description : 'Please supply the `:feed-generator-view` prop' }}</div>
            <div class="text-xs font-semibold mt-auto">Liked By: {{ feedGeneratorView ? feedGeneratorView.likeCount : 'PROP MISSING' }} users</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { AppBskyFeedDefs } from '@atproto/api/dist/client';
import { getCompactNumberValue } from '../../helpers/converters';

export default defineComponent({
    props:{
        feedGeneratorView: Object as PropType<AppBskyFeedDefs.GeneratorView>,
        selected:Boolean,
        hideRadioButton:{
            type: Boolean,
            default: false
        },
        /**Should the Feed Generator info be displayed in a non-interactive
         * way - just a `div` container instead of a `button`.
         */
        displayOnly:{
            type:Boolean,
            default: false
        }
    },
    data(){
        return{
            getCompactNumberValue
        }
    },
    components:{
    },
    emits:{
        /**Emit used to indicate a specific settings category has been clicked. */
        feedGeneratorSelected:(atUri:string|undefined) => {
            return atUri;
        }
    },
    methods:{
        /**
         * Emits message when the main control area is clicked.
         */
        clickedFeedGenerator(){
            // if(!this.displayOnly){
                this.$emit('feedGeneratorSelected',this.feedGeneratorView?.uri);
            // }
        },
        /**
         * Method that runs when the "Pin" button is clicked. Used to add
         * associated Feed Generator to User's list of saved Feeds.
         */
        clickedPinFeed(){
            alert('Pinned');
        }
    }
})
</script>

<style scoped>

</style>