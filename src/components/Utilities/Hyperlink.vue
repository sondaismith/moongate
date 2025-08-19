<template>
    <a :title="`Open link in new tab`"
    class="underline font-light cursor-pointer transition-colors border-2 border-transparent
    focus-visible:!border-blue-500 focus-visible:!outline-none"
    :href="URL" target="_blank">
        <slot></slot>
    </a>
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
    methods:{
        /**
         * Used to allow button to open link in new tab.
         */
        openLink(){
            window.open(this.URL, '_blank')
        }
    },
    mounted(){
        if(this.urlLink) this.URL = this.urlLink
    }
})
</script>