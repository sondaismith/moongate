<template>
    <div class="h-full content-center">
        <div v-if="Array.isArray(imagesToDisplay)" ref="imageContainer" class="@container relative grid border
            border-outlineLighter rounded-lg overflow-hidden backdrop-blur-0 max-h-full max-w-full" :class="showFullsize ? 'min-w-0' : 'grid-cols-2 grid-flow-row grid-rows-2 gap-0.5'"
            :style="[
                (imagesToDisplay?.length === 1 && !imagesToDisplay[0].aspectRatio ? `aspect-ratio: 1 / 1`:''),
                (imagesToDisplay?.length === 1 && imagesToDisplay[0].aspectRatio && !showFullsize ? `aspect-ratio: ${imagesToDisplay[0].aspectRatio?.width} / ${imagesToDisplay[0].aspectRatio?.height}`:''),
                // (imagesToDisplay?.length === 1 && imagesToDisplay[0].aspectRatio ? `height: ${imagesToDisplay[0].aspectRatio?.height}px; width: ${imagesToDisplay[0].aspectRatio?.width}px;`:''),
                (imagesToDisplay?.length && imagesToDisplay.length > 1 ? 'aspect-ratio: 16 / 9':'')
            ]">
            <SpoilerOverlay :labels="labels" :has-sensitive-content="labels && labels.length>0" :media-type="MediaType.Image"/>
            <div v-for="(image, index) in imagesToDisplay" @click="showMediaFocusModal(index)" @contextmenu="showOptionsMenu($event, image, author, postText)" class="overflow-hidden max-h-full max-w-full"
                :class="[
                            (imagesToDisplay?.length === 1 ? 'col-span-2 row-span-2 bg-white/10':''),
                            (imagesToDisplay?.length === 2 && index === 0 ? 'col-start-1 row-span-2':''),
                            (imagesToDisplay?.length === 2 && index === 1 ? 'col-start-2 row-span-2':''),
                            (imagesToDisplay?.length === 3 && index === 0 ? 'col-start-1 row-span-2':''),
                            showFullsize ? 'w-full' : 'cursor-pointer'
                        ]">
                <!-- Hide image extension when in "fullsize/fullscreen" mode -->
                <div v-if="!showFullsize" class="absolute z-[2] rounded-md bottom-1 left-2 p-1 text-xs text-white bg-black/70 select-none">{{ getImageExtension(image.fullsize) }}</div>
                <div v-if="!showFullsize" class="h-full w-full bg-center bg-no-repeat"
                :title="image.alt"
                :class="(imagesToDisplay?.length === 1 && !image.aspectRatio || showFullsize ? 'bg-contain' : 'bg-cover')"
                    :style="{'background-image': 'url('+(showFullsize ? image.fullsize : image.thumb)+')'}"></div>
                <img v-else @click="$emit('imageClicked', image)"  :src="showFullsize ? image.fullsize : image.thumb" class="max-h-full max-w-full bg-contain mx-auto"/>
            </div>
        </div>
        <div v-else ref="imageContainer" class="@container relative w-full gap-0.5 border
        border-outlineLighter rounded-lg overflow-hidden backdrop-blur-0" :class="showFullsize ? '' : 'cursor-pointer'">
            <div class="flex justify-center overflow-hidden cursor-pointer w-full h-full" @contextmenu="showOptionsMenu($event, imagesToDisplay, author, postText)">
                <div class="absolute z-[2] rounded-md bottom-1 left-2 p-1 text-xs text-white bg-black/70 select-none">GIF</div>
                <!-- GIF -->
                <img :title="imagesToDisplay?.title" :src="imagesToDisplay?.uri"/>
            </div>
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
import MdiOpenInNew from '~icons/mdi/open-in-new';
import { MediaType } from '../../enums/PostEnums';
import { ViewExternal } from '@atproto/api/dist/client/types/app/bsky/embed/external';
import { isTauri } from '@tauri-apps/api/core';

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
async function saveImageWithAuthor(image:ViewImage|ViewExternal, author:string|undefined, postText:string|undefined){
    let fileName = undefined;
    let safeHandle = undefined;
    AppState.saveMedia = image;
    if(!image.uri){//not Tenor GIF
        fileName = (image as ViewImage).fullsize.split('\/').pop()?.split('@')[0];
        safeHandle = '';
        if(author) safeHandle =  author.replace (/\./g,'_');
        AppState.fileSaveDetails.full = `${fileName} by ${safeHandle}`;
        AppState.fileSaveDetails.originalFilename = fileName ? fileName : '';
        AppState.fileSaveDetails.extension = '.jpg'; //Need to create method that parses image URL to determine extension (the @jpeg part)
        AppState.fileSaveDetails.handle = author ? author : '';
        AppState.fileSaveDetails.postText = postText ? postText : '';

    }
    else{
        fileName = (image as ViewExternal).uri.split('\/').pop()?.split('@')[0];
        fileName = fileName ? fileName.split('.gif')[0] : '';
        AppState.fileSaveDetails.full = `${fileName}`;
        AppState.fileSaveDetails.originalFilename = fileName ? fileName : '';
        AppState.fileSaveDetails.extension = '.gif';
        AppState.fileSaveDetails.handle = '';
        AppState.fileSaveDetails.postText = postText ? postText : '';
    }
    AppState.isSavingMediaModalVisible = true;
}

/**
 * Method used to open a specific Image in a new browser tab.
 * @param imageToShow Object representing the Image to open in the new tab.
 */
function OpenImageInNewTab(imageToShow:ViewImage|ViewExternal){
    if(!imageToShow.uri){//not Tenor GIF
        open((imageToShow as ViewImage).fullsize);
    }
    else{
        open((imageToShow as ViewExternal).uri);
    }
}

export default defineComponent({
    components:{
        SpoilerOverlay,
    },
    name:'ImageContainer',
    props:{
        imagesToDisplay: Object as PropType<ViewImage[]>|PropType<ViewExternal>,
        labels: Object as PropType<Label[]>,
        author: String,
        postText: String,
        /**Setting this to `true` will use the fullsize image instead of the thumbnail.*/
        showFullsize: {
            type: Boolean,
            default: false
        }
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
        showOptionsMenu(e:MouseEvent, image:ViewImage|ViewExternal, author:string|undefined, postText:string|undefined){
            // if(isTauri()){
                e.preventDefault();
                OptionsMenuState.currentMenuItems = [
                    {Icon:MdiImagePlusOutline,Label:'Save Image w/ Author Name',Action:function(){saveImageWithAuthor(image,author,postText)}},
                    {Icon:MdiImageOutline,Label:'Save Image',Action:()=>void 0},
                ] as IOptionMenuItem[];
                if(!isTauri()) OptionsMenuState.currentMenuItems.push({Icon:MdiOpenInNew,Label:'Open Image in New Tab',Action:function(){OpenImageInNewTab(image)}})
                OptionsMenuState.showOptionMenu(e);
            // }
        },
    },
    emits:{
        /**
         * Emit event called when clicking on image when in `showFullsize` mode.
         * Used to show image at "fullscreen" size when in the `PostFocusModal`.
         * @param image Object representing the image to display in fullscreen view.
         */
        imageClicked(image:ViewImage|ViewExternal){
            if(image) return true;
        },
        /**
         * Emit event called when clicking on image when not in `showFullsize` mode.
         * Used to open `PostFocusModal` at relevant media index.
        */
        'media-click'(index:number){
            if(index>-1) return true;
        }
    },
    data(){
        return{
            MediaType,
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