<template>
    <div v-if="iconDetails?.type != 'option'" class="group flex items-center cursor-pointer hover:text-slate-300">
         <component :is="iconDetails?.icon" :class="'pointer-events-none text-lg '+iconDetails?.color"/>
        <div class="pl-1">{{ iconDetails?.label }}</div>
    </div>
    <div v-else>
        <div @click="showPostOptionsMenu" class="group flex items-center cursor-pointer hover:text-slate-300">
            <component :is="iconDetails?.icon" :class="'pointer-events-none text-lg '+iconDetails?.color"/>
            <div class="pl-1">{{ iconDetails?.label }}</div>
        </div>
        <PostOptionsMenu @click="hidePostOptionsMenu" :menuItems="OptionIconList" v-show="isPostMenuVisible"/>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { PostEnums } from '../../enums/PostEnums';
import PostOptionsMenu from './PostOptionsMenu.vue';
import { OptionIcon } from './PostInterfaces';

//Menu Icons
import MdiTranslateVariant from '~icons/mdi/translate-variant';
import MdiClipboard from '~icons/mdi/clipboard';
import MdiCode from '~icons/mdi/code';
import MingcuteVolumeMuteFill from '~icons/mingcute/volume-mute-fill';
import MdiHideOutline from '~icons/mdi/hide-outline';
import MdiBlock from '~icons/mdi/block';

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
    props:{
        iconDetails: Object
    },
    data(){
        return{
            isPostMenuVisible: false,
            iconTypes:PostEnums.IconTypes,
            OptionIconList
        }
    },
    methods:{
        /**
         * Shows the "Post Options" menu.
         */
         showPostOptionsMenu(event:FocusEvent){
            (event.target as HTMLElement).classList.add('text-white') //keep button "hover" state
            this.isPostMenuVisible = true;
        },
        /**
         * Hides the "Post Options" menu.
         */
        hidePostOptionsMenu(event:PointerEvent){
            // if((event.target === (event.currentTarget as HTMLElement).children[1])){
            if((event.target as HTMLElement).classList.contains('menu-closer')){
                //remove button "hover" state
                (event.target as HTMLElement).parentElement?.parentElement?.children[0].classList.remove('text-white');
                this.isPostMenuVisible = false;
            }
        },
    },
    setup () {
        return {}
    }
})
</script>