<template>
    <div class="break-words">
        <!-- <component v-if="transformed.template && transformed.template.length>0" :is="transformed"></component> -->
        <component v-if="postText?.trim() != ''" :is="transformed"></component>
    </div>
</template>

<script lang="ts">
import { AppBskyRichtextFacet, RichText } from '@atproto/api';
import { defineComponent, markRaw, PropType } from 'vue'
import Hashtag from './Hashtag.vue';
import Userlink from './Userlink.vue';
import Hyperlink from './Hyperlink.vue';
import { isLink, Link } from '@atproto/api/dist/client/types/app/bsky/richtext/facet';

export default defineComponent({
    props:{
        /**
         * The text that will be displayed. Will be transformed to include Userlink
         * and/or Hyperlink components if needed.
         */
        postText: String,
        /**
         * Required to access the full URL string needed to reach intended target
         * when creating Hyperlink components.
         */
        postFacets: Object as PropType<AppBskyRichtextFacet.Main[]>,
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
                    let fullURL = this.getFullURLFromFacet(segment.link ? segment.link.uri : '')
                    this.markdown += `<component :is="Hyperlink" :urlLink="'${fullURL}'">${segment.text}</component>`
                }
                else if (segment.isMention()){
                    this.markdown += `<component :is="Userlink" :userlinkValue="'${segment.text}'">${segment.text}</component>`
                }
                else if(segment.isTag()){
                    this.markdown += `<component :is="Hashtag" tagValue="${segment.tag?.tag}">#${segment.tag?.tag}</component>`
                }
                else{
                    this.markdown += segment.text
                }
            }
           this.markdown = this.markdown.replace(/\n/g,"<br/>");
           if(this.markdown.trim() == '') this.markdown = '<div class="text-slate-400">No Description</div>';
           return this.markdown;
        },
        /**
         * Method used to get the full hyperlink URL from the `postFacets` object
         * using the partial URL string held in the Post text.
         * @param partialUrl The partial URL string provided by the post text.
         * @returns The full URL string.
         */
        getFullURLFromFacet(partialUrl:string):string|undefined{
            if(partialUrl.trim() == '') return; //String cannot be empty
            let cleanedPartial = partialUrl.split('..')[0]; //Remove 'ellipses' added to end of shortened Url before search
            if(this.postFacets && this.postFacets.length>0){ //Search for full URL
                let link = (this.postFacets[0].features.find(x => isLink(x) && x.uri.includes(cleanedPartial)) as Link);
                if(link && link.uri) return link.uri
            }
            else{
                return partialUrl;//We hope this shortened link works...
            }
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