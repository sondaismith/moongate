<template>
    <div v-if="iconDetails?.type != 'option'" class="group flex items-center cursor-pointer hover:text-slate-300">
         <component :is="iconDetails?.icon" :class="'pointer-events-none text-lg '+iconDetails?.color"/>
        <div class="pl-1">{{ iconDetails?.label }}</div>
    </div>
    <div v-else>
        <div @click="postDetails.showPostOptionsMenu" class="group flex items-center cursor-pointer hover:text-slate-300">
            <component :is="iconDetails?.icon" :class="'pointer-events-none text-lg '+iconDetails?.color"/>
            <div class="pl-1">{{ iconDetails?.label }}</div>
        </div>
        <!-- <PostOptionsMenu @click="hidePostOptionsMenu" :menuItems="OptionIconList" v-show="isPostMenuVisible"/> -->
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { PostEnums } from '../../enums/PostEnums';
import { OptionIconList } from '../../fake-data/dumPostData';
import { postDetails } from '../../state/PostDetails.vue';

export default defineComponent({
    props:{
        iconDetails: Object
    },
    data(){
        return{
            isPostMenuVisible: false,
            iconTypes:PostEnums.IconTypes,
            OptionIconList,
            postDetails
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