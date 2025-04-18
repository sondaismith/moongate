<template>
    <span class="underline font-light hover:text-blue-400 cursor-pointer"
    :href="URL">
        <slot></slot>
    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props:{
        urlLink:String
    },
    data(){
        return{
            URL:''
        }
    },
    mounted(){
        if(this.urlLink) this.URL = this.urlLink
    }
})
</script>