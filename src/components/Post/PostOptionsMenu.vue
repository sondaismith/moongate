<template>
    <div onload="setClickPos">
        <div class="h-full w-full">
            <div id="post-option-menu" class="z-50 absolute rounded-lg px-0.5 *:py-0.5 min-w-36 divide-y divide-inherit border border-slate-500 text-sm leading-4 font-medium text-slate-100 bg-slate-600" :style="'left:'+postDetails.menuClickPos[0]+'px; top:'+postDetails.menuClickPos[1]+'px;'">
                <div v-for="group in menuItems">
                    <PostOptionsMenuItem v-for="item in group" :itemData="item"/>
                </div>
            </div>
        </div>
        <div @click="postDetails.hidePostOptionsMenu" class="menu-closer z-40 bg-blue-600/0 left-0 top-0 h-full w-full absolute"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';

export default defineComponent({
    props:{
        menuItems : Object
    },
    methods:{
    },
    data(){
        return{
            postDetails
        }
    },
    setup () {
        return {}
    }
})
</script>