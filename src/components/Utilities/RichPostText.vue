<template>
    <div>
        <component :is="transformed"></component>
    </div>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import { GenerateTagLinkText } from '../../helpers/parsers';
import Hashtag from './Hashtag.vue';
import Userlink from './Userlink.vue';

export default defineComponent({
    // template: '<component :is="transformed"></component>',
    props:{
        postText: String,
        hashTagStyle: String,
        userLinkStyle: String,
    },
    computed:{
        transformed(){
            const template = GenerateTagLinkText(this.postText, this.hashTagStyle, this.userLinkStyle);
            return{
                template: template,
                data(){
                    return{
                        Hashtag : markRaw(Hashtag),
                        Userlink : markRaw(Userlink),
                    }
                }
            }
        }
    },
})
</script>

<style scoped>
</style>