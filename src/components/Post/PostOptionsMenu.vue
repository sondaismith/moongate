<template>
    <div>
    <div class="relative h-full w-full">
        <div class="z-20 absolute right-0 rounded-lg px-0.5 *:py-0.5 min-w-36 divide-y divide-inherit border border-slate-500 text-sm leading-4 font-medium text-slate-100 bg-slate-600">
            <div v-for="group in menuItems">
                <PostOptionsMenuItem v-for="item in group" :itemData="item"/>
            </div>
        </div>
    </div>
    <div class="menu-closer z-10 bg-blue-600/0 left-0 top-0 h-full w-full absolute"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PostOptionsMenuItem from './PostOptionsMenuItem.vue';

export default defineComponent({
    props:{
        menuItems : Object
    },
    data(){
        return{
        }
    },
    setup () {
        return {}
    }
})
</script>