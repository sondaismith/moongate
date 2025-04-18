<template>
    <div class="break-words">
        <!-- <component v-if="transformed.template && transformed.template.length>0" :is="transformed"></component> -->
        <component v-if="postText?.trim() != ''" :is="transformed"></component>
    </div>
</template>

<script lang="ts">
import { RichText } from '@atproto/api';
import { defineComponent, markRaw } from 'vue'
import Hashtag from './Hashtag.vue';
import Userlink from './Userlink.vue';
import Hyperlink from './Hyperlink.vue';

export default defineComponent({
    props:{
        postText: String,
        hashTagStyle: String,
        userLinkStyle: String,
    },
    data() {
        return{
            rt: new RichText({text:'',}),
            markdown:'<div></div>',
            awaitingFacets:false,
        }
    },
    methods:{
        /**
         * Method that parses a passed in string for hashtags (words beginning with #)
         * or userlinks (words beginning with \@) and returns a modified version of
         * that string with components elements added describing those special pieces
         * of text.
         * @param text The text to scan for tich text facets.
         * @returns Text string with added hashtag/userlink/hyperlink component declaration.
         */
        async GenerateTagLinkText(text:RichText|undefined, hashTagStyle:string|undefined = undefined,
        userLinkStyle:string|undefined = undefined){
            this.markdown = '';
            if(text == undefined) return;
            // this.awaitingFacets = true;
            // await text.detectFacets(GetBrowsingAgent());
            text.detectFacetsWithoutResolution();
            // this.awaitingFacets = false;
            var hashStyle = '';
            var ulStyle = '';
            if(hashTagStyle) hashStyle = hashTagStyle;
            if(userLinkStyle) ulStyle = userLinkStyle;

            for (const segment of text.segments()) {
                if (segment.isLink()){
                    // this.markdown += `<a href="${segment.link?.uri}">${segment.text}</a>`
                    this.markdown += `<component :is="Hyperlink" :urlLink="'${segment.link?.uri}'">${segment.text}</component>`
                }
                else if (segment.isMention()){
                    this.markdown += `<component :is="Userlink" :userlinkValue="'${segment.text}'">${segment.text}</component>`
                }
                else if(segment.isTag()){
                    this.markdown += `<component :is="Hashtag" :tagValue="'${segment.tag?.tag}'">#${segment.tag?.tag}</component>`
                }
                else{
                    this.markdown += segment.text
                }
            }
           this.markdown = this.markdown.replace(/\n/g,"<br/>");
           if(this.markdown.trim() == '') this.markdown = '<div class="text-slate-400">No Description</div>';
           return this.markdown;
        }
    },
    mounted() {
        if(this.postText) this.rt = new RichText({text:this.postText});
        this.GenerateTagLinkText(this.rt);
    },
    computed:{
        transformed(){
            const template = this.markdown;
            return{
                template: template,
                data(){
                    return{
                        Hashtag : markRaw(Hashtag),
                        Userlink : markRaw(Userlink),
                        Hyperlink : markRaw(Hyperlink)
                    }
                }
            }
        }
    }
})
</script>

<style scoped>
a{
    text-decoration: underline !important;
    font-size: large;
}
</style>