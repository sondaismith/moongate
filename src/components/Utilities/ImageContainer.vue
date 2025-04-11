<template>
    <div ref="imageContainer" class="@container relative grid grid-cols-2 grid-flow-row grid-rows-2 w-full gap-0.5 border
        border-slate-600 rounded-lg overflow-hidden backdrop-blur-0 cursor-pointer"
        :style="[
            (imagesToDisplay?.length === 1 && !imagesToDisplay[0].aspectRatio ? `aspect-ratio: 1 / 1`:''),
            (imagesToDisplay?.length === 1 && imagesToDisplay[0].aspectRatio ? `aspect-ratio: ${imagesToDisplay[0].aspectRatio?.width} / ${imagesToDisplay[0].aspectRatio?.height}`:''),
            (imagesToDisplay?.length && imagesToDisplay.length > 1 ? 'aspect-ratio: 16 / 9':'')
        ]">
        <SpoilerOverlay :labels="labels" :has-sensitive-content="labels && labels.length>0"/>
        <div v-for="(image, index) in imagesToDisplay" @click="showMediaFocusModal(index)" @contextmenu="showOptionsMenu($event, image, author)" class="overflow-hidden cursor-pointer"
            :class="[
                        (imagesToDisplay?.length === 1 ? 'col-span-2 row-span-2 bg-white/10':''),
                        (imagesToDisplay?.length === 2 && index === 0 ? 'col-start-1 row-span-2':''),
                        (imagesToDisplay?.length === 2 && index === 1 ? 'col-start-2 row-span-2':''),
                        (imagesToDisplay?.length === 3 && index === 0 ? 'col-start-1 row-span-2':'')
                    ]">
            <div class="absolute z-[2] rounded-md bottom-1 left-2 p-1 text-xs bg-black/70 select-none">{{ getImageExtension(image.fullsize) }}</div>
            <div class="h-full w-full bg-center bg-no-repeat"
            :title="image.alt"
            :class="(imagesToDisplay?.length === 1 && !image.aspectRatio ? 'bg-contain' : 'bg-cover')"
                :style="{'background-image': 'url('+image.thumb+')'}"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';
import { ViewImage } from '@atproto/api/dist/client/types/app/bsky/embed/images';
import { Label } from '@atproto/api/dist/client/types/com/atproto/label/defs';
import SpoilerOverlay from './SpoilerOverlay.vue';
import { IOptionMenuItem } from './OptionsMenu.vue';
import { OptionsMenuState } from '../../state/OptionsMenuState.vue';
import { AppState } from '../../state/AppState.vue';

//Option Menu icons
import MdiImageOutline from '~icons/mdi/image-outline';
import MdiImagePlusOutline from '~icons/mdi/image-plus-outline';

export function calculateImageContainerMinHeight(elWidth:number):number{
    if(typeof elWidth !== 'number') throw new TypeError('Value must be a number');
    const aspectRatio = 9/16;
    var newMinHeight = Math.floor(elWidth*aspectRatio);
    return newMinHeight;
}

/**
 * Method used to display the `SaveMediaModal` component.
 * @param url The URL of the image to save.
 * @param author Value used to reference the author (uploader) of this image.
 */
async function saveImageWithAuthor(image:ViewImage, author:string|undefined){
    AppState.saveMedia = image;
    let fileName = image.fullsize.split('\/').pop()?.split('@')[0];
    let safeHandle = '';
    if(author) safeHandle =  author.replace (/\./g,'_');
    AppState.fileSaveDefaultFilename = `${fileName} by ${safeHandle}.jpg`;
    AppState.isSavingMediaModalVisible = true;
}

export default defineComponent({
    components:{
        SpoilerOverlay,
    },
    name:'ImageContainer',
    props:{
        imagesToDisplay: Object as PropType<ViewImage[]>,
        labels: Object as PropType<Label[]>,
        author: String,
    },
    methods:{
        /**
         * Method used to set the min-height of ImageContainer component based
         * on its width.
         */
        setImageContainerHeight(){
            var component = (this.$refs.imageContainer as HTMLElement);
            const aspectRatio = 9/16;
            var newMinHeight = Math.floor(component.clientWidth*aspectRatio);
            // component.style.minHeight = newMinHeight+'px';
        },
        showMediaFocusModal(index:number){
            this.$emit('media-click', index);
        },
        /**
         * Scans a given Image URL to get its ending file extension.
         * @param url The URL string to parse for the file extension.
         */
        getImageExtension(url:string):string{
            if(url.endsWith('jpeg')) return 'jpg'
            else if(url.endsWith('png')) return 'png'
            return 'N/A';
        },
        /**
         * Shows Options Menu allowing user to perform different actions
         * relating to Images.
         */
        showOptionsMenu(e:MouseEvent, image:ViewImage, author:string|undefined){
            e.preventDefault();
            OptionsMenuState.currentMenuItems = [
                {Icon:MdiImagePlusOutline,Label:'Save Image w/ Author Name',Action:function(){saveImageWithAuthor(image,author)}},
                {Icon:MdiImageOutline,Label:'Save Image',Action:()=>void 0},
            ] as IOptionMenuItem[]
            OptionsMenuState.showOptionMenu(e);
        },
    },
    data(){
        return{
            postDetails,
        }
    },
    mounted(){
        this.setImageContainerHeight();
        // if(this.imagesToDisplay) this.images = this.imagesToDisplay;
    }
})
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.spoiler-blur::before{
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(12px);
    /* transition: opacity 0.2s ease; */
}
</style>