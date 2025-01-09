<template>
    <div>
    <div class="relative h-full w-full">
        <div class="z-20 absolute right-0 rounded-lg px-0.5 *:py-0.5 min-w-36 divide-y divide-inherit border border-slate-500 text-sm leading-4 font-medium text-slate-100 bg-slate-600">
            <div v-for="group in OptionIconList">
                <PostOptionsMenuItem v-for="item in group" :itemData="item"/>
            </div>
        </div>
    </div>
    <div class="menu-closer z-10 bg-blue-600/0 left-0 top-0 h-full w-full absolute"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent, FunctionalComponent } from 'vue'
import PostOptionsMenuItem from './PostOptionsMenuItem.vue';

//Menu Icons
import MdiTranslateVariant from '~icons/mdi/translate-variant';
import MdiClipboard from '~icons/mdi/clipboard';
import MdiCode from '~icons/mdi/code';
import MingcuteVolumeMuteFill from '~icons/mingcute/volume-mute-fill';
import MdiHideOutline from '~icons/mdi/hide-outline';
import MdiBlock from '~icons/mdi/block';

/**
 * Interface used to specify the data needed by
 * a `PostOptionsMenuItem` component to display its
 * label and icon.
 */
interface OptionIcon{
    name: String,
    icon: FunctionalComponent
}

/**
 * Collection of all the options to display on the
 * `PostOptionsMenu` component.
 */
const OptionIconList : OptionIcon[][] = [
    [
        { name:'Translate', icon:MdiTranslateVariant },
        { name:'Copy link', icon:MdiClipboard },
        { name:'Embed', icon:MdiCode },
    ],
    [
        { name:'Mute', icon: MingcuteVolumeMuteFill }
    ],
    [
        { name:'Hide', icon: MdiHideOutline }
    ],
    [
        { name:'Block', icon: MdiBlock }
    ]
]

export default defineComponent({
    data(){
        return{
            OptionIconList
        }
    },
    setup () {
        return {}
    }
})
</script>