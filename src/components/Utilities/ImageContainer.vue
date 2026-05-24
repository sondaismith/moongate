<template>
    <div ref="imageContainer" class="h-full w-full content-center">
        <!-- <div v-if="Array.isArray(imagesToDisplay) && imagesToDisplay.length>0 && !isLargeContainerView" class="@container relative grid border
            border-outlineLighter rounded-lg overflow-hidden backdrop-blur-0 h-full w-full" :class="showFullsize ? 'min-w-0' : 'grid-cols-2 grid-flow-row grid-rows-2 gap-0.5'"
            :style="[
                (imagesToDisplay?.length === 1 && !imagesToDisplay[0].aspectRatio ? `aspect-ratio: 1 / 1`:''),
                (imagesToDisplay?.length === 1 && imagesToDisplay[0].aspectRatio && !showFullsize ? `aspect-ratio: ${imagesToDisplay[0].aspectRatio?.width} / ${imagesToDisplay[0].aspectRatio?.height}`:''),
                // (imagesToDisplay?.length === 1 && imagesToDisplay[0].aspectRatio ? `height: ${imagesToDisplay[0].aspectRatio?.height}px; width: ${imagesToDisplay[0].aspectRatio?.width}px;`:''),
                (imagesToDisplay?.length && imagesToDisplay.length > 1 ? 'aspect-ratio: 16 / 9':'')
            ]">
            <SpoilerOverlay :labels="labels" :has-sensitive-content="labels && labels.length>0" :media-type="MediaType.Image"/>
            <div v-for="(image, index) in imagesToDisplay" @click="showMediaFocusModal(index)" @contextmenu="showOptionsMenu($event, image, index, author, postId, postText)" class="overflow-hidden max-h-full max-w-full"
                :class="[
                            (imagesToDisplay?.length === 1 ? 'col-span-2 row-span-2 bg-white/10':''),
                            (imagesToDisplay?.length === 2 && index === 0 ? 'col-start-1 row-span-2':''),
                            (imagesToDisplay?.length === 2 && index === 1 ? 'col-start-2 row-span-2':''),
                            (imagesToDisplay?.length === 3 && index === 0 ? 'col-start-1 row-span-2':''),
                            showFullsize ? 'w-full' : 'cursor-pointer'
                        ]"> -->
                <!-- Hide image extension when in "fullsize/fullscreen" mode -->
                <!-- <div v-if="!showFullsize" @click.stop class="absolute z-[2] rounded-md bottom-1 left-2 p-1 text-xs text-white bg-black/70 select-none">{{ getImageExtension(image.fullsize) }}</div>
                <div v-if="!showFullsize" class="h-full w-full bg-center bg-no-repeat"
                :title="image.alt"
                :class="(imagesToDisplay?.length === 1 && !image.aspectRatio || showFullsize ? 'bg-contain' : 'bg-cover')"
                    :style="{'background-image': 'url('+(showFullsize ? image.fullsize : image.thumb)+')'}"></div>
                <img v-else @click="$emit('imageClicked', image)"  :src="showFullsize ? image.fullsize : image.thumb" class="max-h-full max-w-full object-contain mx-auto"/>
            </div>
        </div>
        <div v-else-if="Array.isArray(imagesToDisplay) && imagesToDisplay.length>0 && typeof imagesToDisplay[0] != 'undefined' && isLargeContainerView"
        @contextmenu="showOptionsMenu($event, imagesToDisplay[0], 0, author, postId, postText)" class="flex h-full w-full overflow-hidden">
            <div class="flex max-h-full max-w-full mx-auto" :class=imageContainerClasses>
                <img @click="$emit('imageClicked', imagesToDisplay[0])"  :src="showFullsize ? imagesToDisplay[0].fullsize : imagesToDisplay[0].thumb"
                class="max-h-full max-w-full object-contain border border-outline rounded-lg overflow-hidden"/>
            </div>
        </div> -->
        <div data-testid="imageContainer-focusFeedPost" v-if="typeof mediaEmbed != 'undefined' && AppBskyEmbedImages.isView(mediaEmbed) && Array.isArray(mediaEmbed.images) && mediaEmbed.images.length>0 && !isLargeContainerView" class="@container relative grid border
            border-outlineLighter rounded-lg overflow-hidden backdrop-blur-0 h-full w-full" :class="showFullsize ? 'min-w-0' : 'grid-cols-2 grid-flow-row grid-rows-2 gap-0.5'"
            :style="[
                (mediaEmbed.images.length === 1 && !mediaEmbed.images[0].aspectRatio ? `aspect-ratio: 1 / 1`:''),
                (mediaEmbed.images.length === 1 && mediaEmbed.images[0].aspectRatio && !showFullsize ? `aspect-ratio: ${mediaEmbed.images[0].aspectRatio?.width} / ${mediaEmbed.images[0].aspectRatio?.height}`:''),
                // (imagesToDisplay?.length === 1 && imagesToDisplay[0].aspectRatio ? `height: ${imagesToDisplay[0].aspectRatio?.height}px; width: ${imagesToDisplay[0].aspectRatio?.width}px;`:''),
                (mediaEmbed.images.length && mediaEmbed.images.length > 1 ? 'aspect-ratio: 16 / 9':'')
            ]">
            <SpoilerOverlay :labels="labels" :has-sensitive-content="labels && labels.length>0" :media-type="MediaType.Image"/>
            <div v-for="(image, index) in mediaEmbed.images" @click="showMediaFocusModal(index)" @contextmenu="showOptionsMenu($event, {$type:'app.bsky.embed.images#viewImage', ...image}, index, author, postId, postText)" class="overflow-hidden max-h-full max-w-full"
                :class="[
                            (mediaEmbed.images.length === 1 ? 'col-span-2 row-span-2 bg-white/10':''),
                            (mediaEmbed.images.length === 2 && index === 0 ? 'col-start-1 row-span-2':''),
                            (mediaEmbed.images.length === 2 && index === 1 ? 'col-start-2 row-span-2':''),
                            (mediaEmbed.images.length === 3 && index === 0 ? 'col-start-1 row-span-2':''),
                            showFullsize ? 'w-full' : 'cursor-pointer'
                        ]">
                <!-- Hide image extension when in "fullsize/fullscreen" mode -->
                <div v-if="!showFullsize" @click.stop class="absolute z-[2] rounded-md bottom-1 left-2 p-1 text-xs text-white bg-black/70 select-none">{{ getImageExtension(image.fullsize) }}</div>
                <!-- <div v-if="!showFullsize" class="h-full w-full bg-center bg-no-repeat"
                :title="image.alt"
                :class="(mediaEmbed.images.length === 1 && !image.aspectRatio || showFullsize ? 'bg-contain' : 'bg-cover')"
                    :style="{'background-image': 'url('+(showFullsize ? image.fullsize : image.thumb)+')'}"></div> -->
                <ImageLoader v-if="!showFullsize" :img-url="showFullsize ? image.fullsize : image.thumb" :title="image.alt" class="h-full w-full bg-center bg-no-repeat"
                :fill-container="true" :class="(mediaEmbed.images.length === 1 && !image.aspectRatio || showFullsize ? 'object-contain' : 'object-cover')"/>
                <img v-else @click="$emit('imageClicked', image)"  :src="showFullsize ? image.fullsize : image.thumb" class="max-h-full max-w-full object-contain mx-auto"/>
            </div>
        </div>
        <div data-testid="imageContainer-postFocusModal" v-else-if="typeof mediaEmbed != 'undefined' && AppBskyEmbedImages.isView(mediaEmbed) && Array.isArray(mediaEmbed.images) && mediaEmbed.images.length>0 && typeof mediaEmbed.images[0] != 'undefined' && isLargeContainerView"
        @contextmenu="showOptionsMenu($event, {$type:'app.bsky.embed.images#viewImage', ...mediaEmbed.images[0]}, mediaIndex, author, postId, postText)" class="flex h-full w-full overflow-hidden">
                <ImageLoader @click="$emit('imageClicked', mediaEmbed.images[0])" :img-url="showFullsize ? mediaEmbed.images[0].fullsize : mediaEmbed.images[0].thumb"
                :image-container-class="imageContainerClasses" class="max-h-full max-w-full object-contain border border-outline rounded-lg overflow-hidden"/>
        </div>
        <div v-else class="@container relative h-full w-full gap-0.5 border
        border-outlineLighter rounded-lg overflow-hidden backdrop-blur-0" :class="showFullsize ? '' : 'cursor-pointer'">
            <div v-if="typeof mediaEmbed != 'undefined' && !Array.isArray(mediaEmbed) && AppBskyEmbedExternal.isView(mediaEmbed)"
            class="flex flex-col max-w-full max-h-full cursor-pointer" @click="isGIFPaused = !isGIFPaused" @contextmenu="showOptionsMenu($event, mediaEmbed, 0, author, postId, postText)">
                <div class="absolute z-[2] rounded-md bottom-1 left-2 p-1 text-xs text-white bg-black/70 select-none">WebM</div>
                <ExternalGIF :url="mediaEmbed.external.uri" :is-paused="isGIFPaused"/>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
//Option Menu icons
import MdiImageOutline from '~icons/mdi/image-outline';
import MdiImagePlusOutline from '~icons/mdi/image-plus-outline';
import MdiOpenInNew from '~icons/mdi/open-in-new';

import { defineComponent, PropType } from 'vue'
import { postDetails } from '../../state/PostDetails.vue';
import { isViewImage, ViewImage } from '@atproto/api/dist/client/types/app/bsky/embed/images';
import { Label } from '@atproto/api/dist/client/types/com/atproto/label/defs';
import SpoilerOverlay from './SpoilerOverlay.vue';
import { IOptionMenuItem, ItemType } from './OptionsMenu.vue';
import { OptionsMenuState } from '../../state/OptionsMenuState.vue';
import { AppState } from '../../state/AppState.vue';
import { MediaType } from '../../enums/PostEnums';
import { isExternal, isMain, isView, View, ViewExternal } from '@atproto/api/dist/client/types/app/bsky/embed/external';
import { isTauri } from '@tauri-apps/api/core';
import { router } from '../../main';
import { createPostRoute } from '../../lib/api/Post.vue';
import { AppBskyEmbedExternal, AppBskyEmbedImages, AppBskyEmbedRecordWithMedia } from '@atproto/api';
import ImageLoader from './ImageLoader.vue';
import ExternalGIF from './ExternalGIF.vue';

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
// async function saveImageWithAuthor(image:ViewImage|ViewExternal, index:number, author:string|undefined, postId:string|undefined, postText:string|undefined){
async function saveImageWithAuthor(image:ViewImage|View, index:number, author:string|undefined, postId:string|undefined, postText:string|undefined){
    let fileName = undefined;
    let safeHandle = undefined;
    // AppState.saveMedia = image;
    // if(!image.uri){//not Tenor GIF
    if(!AppBskyEmbedExternal.isView(image)){//not Tenor GIF
        AppState.saveMedia = image;
        // fileName = (image as ViewImage).fullsize.split('\/').pop()?.split('@')[0];
        fileName = image.fullsize.split('\/').pop()?.split('@')[0];
        safeHandle = '';
        if(author) safeHandle =  author.replace (/\./g,'_');
        AppState.fileSaveDetails.full = `${fileName} by ${safeHandle}`;
        AppState.fileSaveDetails.originalFilename = fileName ? fileName : '';
        AppState.fileSaveDetails.extension = '.webp'; //Need to create method that parses image URL to determine extension (the @jpeg part)
        AppState.fileSaveDetails.handle = author ? author : '';
        AppState.fileSaveDetails.postText = postText ? postText : '';

    }
    else{
        AppState.saveMedia = (image as View).external;
        // fileName = (image as ViewExternal).uri.split('\/').pop()?.split('@')[0];
        fileName = (image as View).external.uri.split('\/').pop()?.split('@')[0];
        fileName = fileName ? fileName.split('.gif')[0] : '';
        AppState.fileSaveDetails.full = `${fileName}`;
        AppState.fileSaveDetails.originalFilename = fileName ? fileName : '';
        AppState.fileSaveDetails.extension = '.gif';
        AppState.fileSaveDetails.handle = '';
        AppState.fileSaveDetails.postText = postText ? postText : '';
    }
    // AppState.isSavingMediaModalVisible = true;
    if(typeof author != 'undefined' && typeof postId != 'undefined'){
        let route = createPostRoute(author,postId);
        if(typeof route != 'undefined')
            router.push(`${route}/${index}/download`)
    }
}

/**
 * Method used to open a specific Image in a new browser tab.
 * @param imageToShow Object representing the Image to open in the new tab.
 */
function OpenImageInNewTab(imageToShow:ViewImage|View){
    // if(!imageToShow.uri){//not Tenor GIF
    if(AppBskyEmbedExternal.isView(imageToShow)){//Tenor GIF
        open(imageToShow.external.uri);
    }
    else if(AppBskyEmbedImages.isViewImage(imageToShow)){
        open(imageToShow.fullsize);
    }
}

export default defineComponent({
    components:{
        SpoilerOverlay,
        Image,
        ExternalGIF
    },
    name:'ImageContainer',
    props:{
        // imagesToDisplay: Object as PropType<ViewImage[]>|PropType<View>,//PropType<ViewExternal>,
        // imagesToDisplay: Object as PropType<ViewForImages>|PropType<AppBskyEmbedExternal.View>|PropType<View>,//PropType<ViewExternal>,
        mediaEmbed: Object as PropType<AppBskyEmbedImages.View>|PropType<AppBskyEmbedRecordWithMedia.View>|PropType<AppBskyEmbedExternal.View>,//PropType<ViewExternal>,
        labels: Object as PropType<Label[]>,
        author: String,
        postId:String,
        postText: String,
        /**The index of the media to display when selecting to 'Save Image'. Used when displaying component in `PostFocusModal`. */
        mediaIndex:{
            type:Number,
            default:0
        },
        /**Setting this to `true` will use the fullsize image instead of the thumbnail. Currently used for showing GIFs via `EmbedExternal`.*/
        showFullsize: {
            type: Boolean,
            default: false
        },
        /**Is the container using the styling used in the `PostFocusModal` layout? */
        isLargeContainerView:{
            type: Boolean,
            default: false
        }
    },
    data(){
        return{
            MediaType,
            postDetails,
            doesImageHeightSurpassContainer: false,
            isMain,
            isView,
            AppBskyEmbedImages,
            AppBskyEmbedExternal,
            imagesToDisplay: [] as ViewImage[], // AppBskyEmbedImages.View|AppBskyEmbedRecordWithMedia.View,
            isGIFPaused: false
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
            // return 'N/A';
            return 'webp';
        },
        /**
         * Shows Options Menu allowing user to perform different actions
         * relating to Images.
         */
        // showOptionsMenu(e:MouseEvent, image:ViewImage|ViewExternal, index:number, author:string|undefined, postId:string|undefined, postText:string|undefined){
        showOptionsMenu(e:MouseEvent, image:ViewImage|View, index:number, author:string|undefined, postId:string|undefined, postText:string|undefined){
            // if(isTauri()){
                e.preventDefault();
                OptionsMenuState.currentMenuItems = [
                    {Icon:MdiImagePlusOutline,Label:'Save Image w/ Author Name',Action:function(){saveImageWithAuthor(image,index,author,postId,postText)},Type:ItemType.Option},
                ] as IOptionMenuItem[];
                if(!isTauri()){
                    OptionsMenuState.currentMenuItems.push({Icon:MdiOpenInNew,Label:'Splitter',Action:()=>{},Type:ItemType.Splitter});
                    OptionsMenuState.currentMenuItems.push({Icon:MdiOpenInNew,Label:'Open Image in New Tab',Action:function(){OpenImageInNewTab(image)},Type:ItemType.Option});
                }
                OptionsMenuState.showOptionMenu(e);
            // }
        },
        /**
         * Method used to determine what should be done when clicking on an `ExternalEmbed`
         * related image. Actions performed are - open image in fullscreen view
         * (if `showFullsize` is true) or show `PostFocusModal` (usually from `FocusFeedPost`).
         * @param image Object representing the image to display full-size.
         */
        // handleExternalGIFCLick(image:ViewExternal){
        handleExternalGIFCLick(image:View){
            if(this.showFullsize)
                this.$emit('imageClicked',image);
            else
                this.showMediaFocusModal(0);
        },
        /**
         * Method used to update the value of `doesImageHeightSurpassContainer` which
         * is used to determine if certain styles need to be applied to the displayed
         * image.
         */
        updateDoesImageHeightSurpassContainer(){
            var component = (this.$refs.imageContainer as HTMLElement);
            // console.log("updating doesImageHeightSurpassContainer");//DEBUG
            if(component){
                if(Array.isArray(this.imagesToDisplay) && this.imagesToDisplay.length>0 && typeof this.imagesToDisplay[0] != 'undefined' && this.imagesToDisplay[0].aspectRatio){
                    let isImageWiderThanContainer = (component.clientWidth - this.imagesToDisplay[0].aspectRatio.width) <= 0;
                    let scale = 1;
                    if(isImageWiderThanContainer) scale = component.clientWidth/this.imagesToDisplay[0].aspectRatio.width;
                    //DEBUG
                    // console.log(`image container width is:${component.clientWidth}`);
                    // console.log(`image width is:${this.imagesToDisplay[0].aspectRatio.width}`);
                    // console.log(`image container height is:${component.clientHeight}`);
                    // console.log(`image height is:${this.imagesToDisplay[0].aspectRatio.height}`);
                    // console.log(`does image need to be scaled: ${isImageWiderThanContainer}`);
                    // console.log(`image scale to fit container is:${scale}`);
                    // console.log(`image container scaled height is:${(this.imagesToDisplay[0].aspectRatio.height * scale)}`);
                    // console.log(`image height larger than container:${(this.imagesToDisplay[0].aspectRatio.height * scale) >= component.clientHeight}`);
                    this.doesImageHeightSurpassContainer = (this.imagesToDisplay[0].aspectRatio.height * scale) >= component.clientHeight;
                }
            }
        }
    },
    computed:{
        /**Returns if image to display is in portrait orientation (height greater than width). */
        isImagePortrait(){
            if(Array.isArray(this.imagesToDisplay) && this.imagesToDisplay.length>0 && typeof this.imagesToDisplay[0] != 'undefined' && this.imagesToDisplay[0].aspectRatio){
                // console.log(`image is portrait?:${this.imagesToDisplay[0].aspectRatio.height > this.imagesToDisplay[0].aspectRatio.width}`)
                return this.imagesToDisplay[0].aspectRatio.height > this.imagesToDisplay[0].aspectRatio.width;
            }
        },
        /**Determines which CSS classes need to be applied to the image displayed in the `PostFocusModal` view.*/
        imageContainerClasses(){
            if(this.isImagePortrait || (!this.isImagePortrait && this.doesImageHeightSurpassContainer)){
                return 'justify-center';
            }
            else{
                return 'self-center';
            }
        }
    },
    watch:{
        imagesToDisplay(){
            this.updateDoesImageHeightSurpassContainer();
        }
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
    mounted(){
        // this.setImageContainerHeight();
        // if(this.imagesToDisplay) this.images = this.imagesToDisplay;
        if(this.isLargeContainerView){
            this.updateDoesImageHeightSurpassContainer();
        }
        if(typeof this.mediaEmbed != 'undefined'){
            if(AppBskyEmbedImages.isView(this.mediaEmbed)) this.imagesToDisplay = this.mediaEmbed.images
            else if(AppBskyEmbedRecordWithMedia.isView(this.mediaEmbed) && AppBskyEmbedImages.isView(this.mediaEmbed.media)) this.imagesToDisplay = this.mediaEmbed.media.images;
        }
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

.image-container::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(16px);
    /* z-index: 1; */
}
</style>