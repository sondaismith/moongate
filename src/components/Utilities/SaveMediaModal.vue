<template>
    <div tabindex="-1" @keydown.tab="(e)=>{TrapFocus($el,e)}" class="absolute flex z-50 w-full h-full">
        <div data-testid="saveMediaModal-close" @click="closeModal" class="absolute w-full h-full bg-slate-800/60 backdrop-blur-sm"></div>
        <div data-testid="saveMediaModal" class="relative flex flex-col max-w-[48rem] w-4/5 m-auto z-50
        rounded bg-savemodalBG border border-slate-800 overflow-hidden drop-shadow-lg">
            <div class="px-2 py-1 bg-banner border-b border-slate-500">Save as</div>
            <div v-if="!isAwaitingPostData" class="flex flex-col gap-2 p-3 overflow-hidden">
                <img v-if="'fullsize' in saveMediaData" data-testid="saveMediaModal-media-preview" @contextmenu.prevent :src="saveMediaData.thumb" class="self-start rounded max-h-32 max-w-full bg-slate-500 overflow-hidden"
                :style="(typeof saveMediaData.aspectRatio != 'undefined') ? `aspect-ratio:${saveMediaData.aspectRatio?.width}/${saveMediaData.aspectRatio?.height}` : ''" />
                <div v-else data-testid="saveMediaModal-media-preview" tabindex="0" class="relative self-start rounded h-32 bg-slate-500 z-[2] overflow-hidden outline outline-2 -outline-offset-[6px] outline-transparent
                focus-visible:!outline-focusBorder" @click="isWebmPaused = !isWebmPaused" @keydown.space="isWebmPaused = !isWebmPaused"
                @keydown.enter="isWebmPaused = !isWebmPaused" @contextmenu.prevent>
                    <ExternalGIF :url="webmURL" :thumbnail="saveMediaData.external.thumb" :is-paused="isWebmPaused" class="cursor-pointer" video-styles="max-h-32"/>
                </div>
                <div class="flex text-primary">
                    <InLaInput v-if="isTauri()" data-testid="saveMediaModal-filename-input" class="text-[12px] rounded-r-none grow"
                    text-label="Filename" :model-value="AppState.fileSaveDetails.full"
                    @update:model-value="updateFileName" title="Edit filename"/>
                    <InLaInput v-else data-testid="saveMediaModal-filename-input" class="h-full text-[12px] rounded-r-none grow" text-label="Click to Copy Filename"
                    :model-value="AppState.fileSaveDetails.full" @update:model-value="updateFileName"
                    :is-text-copy-control="true"/>
                    <div data-testid="saveMediaModal-file-extension" class="flex items-end rounded-r px-2 py-1
                    text-sm text-searchbarBorder bg-savemodalFileExtBG border border-l-0 border-slate-500
                    select-none">
                    {{ AppState.fileSaveDetails.extension }}
                    </div>
                </div>
                <div v-if="isTauri()" class="relative">
                    <div @click="selectFolder" @keydown.space="selectFolder" @keydown.enter="selectFolder"
                    title="Select/Change folder" class="absolute z-[1] w-full h-full
                    rounded transition-colors border border-gray-500 hover:border-blue-400
                    cursor-pointer outline outline-2 outline-transparent focus-visible:!outline-focusBorder" tabindex="0"></div>
                    <InLaInput :is-disabled="true" text-label="Save Folder" :model-value="AppState.lastMediaSaveDirectory.trim() != '' ? AppState.lastMediaSaveDirectory : 'Please select save folder'"/>
                </div>
                <div v-show="!isFileNameValid" class="text-xs text-red-500">Invalid file name</div>
                <div v-show="isFileNameTaken" class="text-xs text-orange-300">WEBP File already exists, will be overwritten</div>
                <div v-show="isFileNameTakenJpg" class="text-xs text-orange-300">JPG File already exists, will be overwritten</div>
                <div v-show="isFileNameTakenWebm" class="text-xs text-orange-300">WEBM File already exists, will be overwritten</div>
                <div v-show="isFileNameTakenGif" class="text-xs text-orange-300">GIF File already exists, will be overwritten</div>
                <div v-if="isTauri()" class="rounded h-3 overflow-hidden bg-slate-400 border border-slate-800">
                    <div class="rounded bg-blue-500 h-full w-0"
                    :style="{'width' : downloadProgress+'%', 'transition':'width 0.4s ease'}"></div>
                </div>
                <template v-if="isGif">
                    <div class="flex flex-col gap-1">
                        <SquareButton v-if="isTauri()" :is-disabled="!isFileNameValid || !isFolderSyntaxValid || isDownloading" @click="saveImage()"
                        title="Download .webm file" class="bg-savemodalBtn hover:bg-savemodalBtnHover">
                            <div>Download</div>
                            <!-- <i-mingcute:loading-fill v-if="isDownloading" class="spinner"/> -->
                        </SquareButton>
                        <SquareButton v-else :is-disabled="isDownloading" @click="downloadGIFFromExternalCDN(webmURL,AppState.fileSaveDetails.originalFilename)"
                        title="Download .webm file" class="bg-savemodalBtn hover:bg-savemodalBtnHover">
                            <div>Download</div>
                            <!-- <i-mingcute:loading-fill v-if="isDownloading" class="spinner"/> -->
                        </SquareButton>
                        <template v-if="'external' in saveMediaData && !saveMediaData.external.uri.includes('giphy.com')">
                            <button v-if="isTauri()" :disabled="!isFileNameValid || !isFolderSyntaxValid || isDownloading" @click="saveImage(undefined,true)"
                            class="self-end rounded-none shadow-none border-none active:bg-transparent transition-colors hover:not-disabled:bg-transparent disabled:bg-disabledBG text-secondary
                            disabled:text-disabled hover:not-disabled:text-secondaryHover text-xs underline cursor-pointer disabled:cursor-not-allowed outline outline-2 outline-transparent focus-visible:outline-focusBorder"
                            title="Save as .GIF (File size may be large)">Save as GIF</button>
                            <button v-else :disabled="isDownloading"
                            @click="downloadGIFFromExternalCDN((AppState.saveMedia as AppBskyEmbedExternal.View).external.uri,AppState.fileSaveDetails.originalFilename)"
                            class="self-end rounded-none shadow-none border-none active:bg-transparent transition-colors hover:not-disabled:bg-transparent disabled:bg-disabledBG text-secondary
                            disabled:text-disabled hover:not-disabled:text-secondaryHover text-xs underline cursor-pointer disabled:cursor-not-allowed"
                            title="Save as .GIF (File size may be large)">Save as GIF</button>
                        </template>
                    </div>
                </template>
                <template v-else class="flex flex-col gap-2 overflow-hidden">
                    <SquareButton v-if="isTauri()" @click="saveImage()" title="Save Image [.webp]"
                    :is-disabled="!isFileNameValid || !isFolderSyntaxValid || isDownloading"
                    class="bg-savemodalBtn hover:bg-savemodalBtnHover">
                        Save Image [WEBP]
                    </SquareButton>
                    <!-- <SquareButton v-else :is-disabled="isDownloading" @click="saveImageWebCORSSafe" title="Opens in new tab">Save Image</SquareButton> -->
                    <SquareButton v-else :is-disabled="isDownloading"
                    @click="downloadFileFromBskyCDN('fullsize' in AppState.saveMedia ? AppState.saveMedia.fullsize : AppState.saveMedia.external.uri, AppState.fileSaveDetails.full)"
                    title="Save Image [.webp]" class="bg-savemodalBtn hover:bg-savemodalBtnHover">
                        <div>Save Image [WEBP]</div>
                        <!-- <i-mingcute:loading-fill v-if="isDownloading" class="spinner"/> -->
                    </SquareButton>
                    <SquareButton v-if="isTauri()" @click="saveImage(true)" title="Save Image [.jpg]"
                    :is-disabled="!isFileNameValid || !isFolderSyntaxValid || isDownloading"
                    class="bg-savemodalBtn hover:bg-savemodalBtnHover">
                        Save Image w/ Metadata [JPEG]
                    </SquareButton>
                    <!-- <SquareButton v-else :is-disabled="isDownloading" @click="saveImageWebCORSSafe" title="Opens in new tab">Save Image</SquareButton> -->
                    <SquareButton v-else :is-disabled="isDownloading"
                    @click="downloadFileFromBskyCDN('fullsize' in AppState.saveMedia ? AppState.saveMedia.fullsize : AppState.saveMedia.external.uri, AppState.fileSaveDetails.full, true)"
                    title="Save Image [.jpg]" class="bg-savemodalBtn hover:bg-savemodalBtnHover">
                        <div>Save Image [JPEG]</div>
                        <!-- <i-mingcute:loading-fill v-if="isDownloading" class="spinner"/> -->
                    </SquareButton>
                </template>
            </div>
            <div v-else class="flex flex-col gap-2 p-3 overflow-hidden">
                <div class="self-start rounded h-32 w-52 bg-placeholderPulseBG animate-pulse overflow-hidden">
                </div>
                <div class="flex h-10 w-full bg-placeholderPulseBG animate-pulse rounded">
                </div>
                <div v-if="isTauri()" class="relative h-10 w-full">
                </div>
                <div v-if="isTauri()" class="rounded h-3 w-full overflow-hidden bg-placeholderPulseBG animate-pulse">
                </div>
                <div v-else class="h-10 w-full bg-placeholderPulseBG animate-pulse rounded">
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { AppState, toast, TrapFocus } from '../../state/AppState.vue';
import { download } from '@tauri-apps/plugin-upload';
import InLaInput from './InLaInput.vue';
import SquareButton from './SquareButton.vue';
import { open } from '@tauri-apps/plugin-dialog';
import { exists } from '@tauri-apps/plugin-fs';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { CreateBskyMediaDownloadURL } from '../../helpers/converters';
import { getPostImages, getPostThread } from '../../lib/api/Post.vue';
import { emptyPostThread } from '../../fake-data/dumPostData';
import { AppBskyEmbedExternal, AppBskyEmbedImages, AppBskyEmbedRecordWithMedia, AppBskyFeedDefs } from '@atproto/api';
import ImageLoader from './ImageLoader.vue';
import ImageContainer from './ImageContainer.vue';
import ExternalGIF from './ExternalGIF.vue';

export default defineComponent({
    components:{
        InLaInput,
        SquareButton,
        ImageLoader,
        ImageContainer,
        ExternalGIF,
    },
    props:{
        /**The handle of the creator of the Post to show. */
        handle:{
            type:String,
        },
        /**
         * Indentifier that helps point to the initial Post Thread to show in modal.
         * Should be taken from the end section of a Post's URI.
         */
        postId:{
            type: String,
            default:''
        },
        /**
         * Index of initial media to show in modal.
         */
        clickedMediaIndex:{
            type: Number,
            default: 0
        },
    },
    data(){
        return{
            AppState,
            /**State indicating if a download is currently in progress. */
            isDownloading:false,
            /**Indicates current download progress. */
            progressSum:0,
            /**Indicates value `progressSum` needs to reach for download to be completed. */
            progressGoal:0,
            /**State value indicating if a WEBP file with the same name already exists in current directory. */
            isFileNameTaken:false,
            /**State value indicating if a JPG file with the same name already exists in current directory. */
            isFileNameTakenJpg:false,
            /**State value indicating if a WEBM file with the same name already exists in current directory. */
            isFileNameTakenWebm:false,
            /**State value indicating if a GIF file with the same name already exists in current directory. */
            isFileNameTakenGif:false,
            /**Are we waiting for the related Post's data to be returned. */
            isAwaitingPostData:false,
            /**Post data used to download related image. */
            postData:emptyPostThread,
            /**The previous page the User was at before moving to download media. If it exists, it is returned to when `SaveMediaModal` is closed. */
            previousURL:'',
            /**Is the WEBM "GIF" paused. Used when downloading a "GIF".*/
            isWebmPaused:false,
            isTauri,
            TrapFocus
        }
    },
    methods:{
        async selectFolder(){
            const path = await open({
                directory:true,
                defaultPath:AppState.lastMediaSaveDirectory.trim() != '' ? AppState.lastMediaSaveDirectory : undefined,
            });
            if(path) AppState.lastMediaSaveDirectory = path;
            this.checkIfFileWillBeOverwritten();
        },
        /**
         * Method used to download images with metadata when using the application via
         * desktop app (Tauri web-view).
         * @param fetchAsJpeg Value indicating if we should request the Bluesky CDN to return the image as a JPEG.
         * @param fetchAsGif Value indicating if we should download the "GIF" from the external source as an actual .GIF file and not .WEBM.
         */
        async saveImage(fetchAsJpeg:boolean=false, fetchAsGif:boolean=false){
            this.progressSum = 0;
            this.progressGoal = 0;
            this.isDownloading = true;
            let downloadURL = '';
            if('fullsize' in AppState.saveMedia) downloadURL = AppState.saveMedia.fullsize
            else downloadURL = fetchAsGif ? AppState.saveMedia.external.uri : AppState.getExternalWebmUrlFromGifUri(AppState.saveMedia.external.uri);
            if(fetchAsJpeg){
                AppState.fileSaveDetails.extension = '.jpg';
                downloadURL+='@jpeg';
            }
            else if(fetchAsGif) AppState.fileSaveDetails.extension = '.gif';
            await download(
                downloadURL,
                `${AppState.lastMediaSaveDirectory}\\${AppState.fileSaveDetails.full}${AppState.fileSaveDetails.extension}`,
                ({ progress, total }) => {
                    this.progressSum += progress;
                    this.progressGoal = total;
                    // console.log(`Downloaded ${this.progressSum} of ${total} bytes`) // a callback that will be called with the download progress
                }
            )
            .then(_ => {
                if(isTauri() && AppState.fileSaveDetails.extension == '.jpg'){
                    //in Tauri webview, not browser
                    invoke('write_metadata_to_file', ({
                        imageFile:`${AppState.lastMediaSaveDirectory}\\${AppState.fileSaveDetails.full}${AppState.fileSaveDetails.extension}`,
                        userHandle:`@${AppState.fileSaveDetails.handle}`,//AppState.fileSaveDefaultFilename.split(' ').pop()?.split('.')[0],
                        description:AppState.fileSaveDetails.postText
                    }));
                }
            }).catch(err=>{
                toast.add({summary:'Error',detail:err,severity:'error', group:'tr', life:3000});
                this.isDownloading = false;
            })
        },
        /**
         * Method used to download when using web/mobile. This implementation currently
         * does not work because of CORS policy.
         * Thanks to Vladimir Salguero - https://stackoverflow.com/a/68722398
         */
        async saveImageWeb(){
            fetch((AppState.saveMedia as AppBskyEmbedImages.ViewImage).fullsize ? (AppState.saveMedia as AppBskyEmbedImages.ViewImage).fullsize : (AppState.saveMedia.uri as string))
                .then(resp => resp.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    // the filename you want
                    a.download = AppState.fileSaveDetails.full+AppState.fileSaveDetails.extension;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    a.remove();
                })
                .catch(() => alert('An error sorry'));
        },
        /**
         * Method used to download images when using web/mobile. This implementation is
         * CORS policy safe.
         */
        saveImageWebCORSSafe(){
            window.open((AppState.saveMedia as AppBskyEmbedImages.ViewImage).fullsize ? (AppState.saveMedia as AppBskyEmbedImages.ViewImage).fullsize : (AppState.saveMedia.uri as string),'_blank');
        },
        /**
         * Method that updates the file name stored in `AppState` when
         * the value held in the `InLaInput` component is changed.
         */
        updateFileName(s:string|undefined){
            if(s){
                AppState.fileSaveDetails.full = s;
            }
            else{ AppState.fileSaveDetails.full = '' }
            this.checkIfFileWillBeOverwritten();
        },
        /**Method used to check if an existing file will be overwritten  when saving images in Desktop app.*/
        checkIfFileWillBeOverwritten(){
            this.checkIfFileNameAlreadyExists();
            this.checkIfFileNameAlreadyExistsJpg();
            this.checkIfFileNameAlreadyExistsWebm();
            this.checkIfFileNameAlreadyExistsGif();
        },
        async checkIfFileNameAlreadyExists(){
            if(this.isFileNameValid && this.isFolderSyntaxValid){
                await exists(`${AppState.lastMediaSaveDirectory}/${AppState.fileSaveDetails.full}.webp`)
                .then(res => {
                    this.isFileNameTaken = res;
                })
                .catch(err => console.log(err));
            }
            else{
                this.isFileNameTaken = false;
            }
        },
        async checkIfFileNameAlreadyExistsJpg(){
            if(this.isFileNameValid && this.isFolderSyntaxValid){
                await exists(`${AppState.lastMediaSaveDirectory}/${AppState.fileSaveDetails.full}.jpg`)
                .then(res => {
                    this.isFileNameTakenJpg = res;
                })
                .catch(err => console.log(err));
            }
            else{
                this.isFileNameTakenJpg = false;
            }
        },
        async checkIfFileNameAlreadyExistsWebm(){
            if(this.isFileNameValid && this.isFolderSyntaxValid){
                await exists(`${AppState.lastMediaSaveDirectory}/${AppState.fileSaveDetails.full}.webm`)
                .then(res => {
                    this.isFileNameTakenWebm = res;
                })
                .catch(err => console.log(err));
            }
            else{
                this.isFileNameTakenWebm = false;
            }
        },
        async checkIfFileNameAlreadyExistsGif(){
            if(this.isFileNameValid && this.isFolderSyntaxValid){
                await exists(`${AppState.lastMediaSaveDirectory}/${AppState.fileSaveDetails.full}.gif`)
                .then(res => {
                    this.isFileNameTakenGif = res;
                })
                .catch(err => console.log(err));
            }
            else{
                this.isFileNameTakenGif = false;
            }
        },
        /**
         * Method used to close `SaveMediaModal`.
         */
        closeModal(){
            if(!this.isDownloading){
                if(window.history.state.back != null && window.history.state.back.includes('/profile')) this.$router.go(-1);
                else this.$router.push(`/`);
            }
        },
        /**
         * Method that attempts to initiate download of specified file.
         * Code is from https://muhimasri.com/blogs/how-to-save-files-in-javascript/#download-and-save-a-file-using-the-fetch-api
         * @param url The URL of the file to download.
         * @param filename The string to use as the default/starting file name.
         */
        saveFile(url:string, filename:string) {
            const a = document.createElement("a");
            a.href = url;
            a.download = filename || "file-name";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },
        /**
         * Used to download media from Bluesky.
         * Code is modified from https://muhimasri.com/blogs/how-to-save-files-in-javascript/#download-and-save-a-file-using-the-fetch-api
         * @param url The URL of the file to download. Should begin with 'https://cdn.bsky.app'.
         * @param filename The string to use as the default/starting file name.
         * @param fetchAsJpeg Value indicating if we are requesting the Bluesky CDN to return the image as a JPEG.
         *
         */
        async downloadFileFromBskyCDN(url:string, filename:string, fetchAsJpeg:boolean=false) {
            const target = `${import.meta.env.VITE_BSKY_MEDIA_DOWNLOAD_PROXY_TARGET}`;
            if(!url.includes(target)){
                toast.add({summary:'Error', detail:`URL provided to download must be link to Bluesky CDN`, severity:'error', group:'tr', life:3000});
                console.log(`Provided URL was: ${url}`);
            }
            else{
                this.isDownloading = true;
                await fetch(CreateBskyMediaDownloadURL(url,fetchAsJpeg),{
                    headers:{
                        Accept:
                        "image/png, image/jpeg, image/*",
                    },
                })
                .then(async res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    const blob = await res.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    this.saveFile(blobUrl, filename);
                    URL.revokeObjectURL(blobUrl);
                    this.isDownloading = false;
                })
                .catch(err => {
                    console.error("Error in fetching and downloading file:", err);
                    this.isDownloading = false;
                })
            }
        },
        /**
         * Used to download GIFs from their external sites.
         * Code is modified from https://muhimasri.com/blogs/how-to-save-files-in-javascript/#download-and-save-a-file-using-the-fetch-api
         * @param url The URL of the file to download. Must be from a supported source.
         * @param filename The string to use as the default/starting file name.
         *
         */
        async downloadGIFFromExternalCDN(url:string, filename:string) {
            if(url.trim() == ''){
                toast.add({summary:'Error', detail:`URL provided to download must be link to supported external GIF source.`, severity:'error', group:'tr', life:3000});
                console.log(`Provided URL was: ${url}`);
            }
            else{
                this.isDownloading = true;
                await fetch(url,{
                    headers:{
                        Accept:
                        "video/webm, video/mp4, image/gif, image/webp",
                    },
                })
                .then(async res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    const blob = await res.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    this.saveFile(blobUrl, filename);
                    URL.revokeObjectURL(blobUrl);
                    this.isDownloading = false;
                })
                .catch(err => {
                    console.error("Error in fetching and downloading file:", err);
                    this.isDownloading = false;
                })
            }
        },
    },
    computed:{
        downloadProgress(){
            if(this.progressGoal != 0) return ((this.progressSum/this.progressGoal)*100).toFixed(2);
            return 0;
        },
        async doesSaveFolderExist(){
            let doesFolderExist = await exists(AppState.lastMediaSaveDirectory);
            if(doesFolderExist) return true;
            return false;
        },
        /**Confirms if file name is valid, meaning not an empty string. */
        isFileNameValid(){
            if(AppState.fileSaveDetails.full.trim() != '') return true;
            return false;
        },
        /**Confirms if folder name is valid, meaning not an empty string. */
        isFolderSyntaxValid(){
            //this is not safe since we're not ensuring that the directory value is
            //a valid accessible directory, but it should be fine since the value is
            //only set using an actual directory select dialog
            if(AppState.lastMediaSaveDirectory.trim() != '') return true;
            return false;
        },
        /**Post URI formated as URI beginning with 'at://'. */
        postUri(){
            return `at://${this.handle}/app.bsky.feed.post/${this.postId}`;
        },
        /**
         * Method that figures out what images exist in the passed in Post
         * based on what type of data configuration the current Post has.
         * @returns `AppBskyEmbedImages.ViewImage[]` containing Post images.
         */
        getPostImages():AppBskyEmbedImages.ViewImage[]|AppBskyEmbedExternal.ViewExternal{
            let imageContainer = getPostImages({$type:'app.bsky.feed.defs#postView',...this.postData.post});
            if(AppBskyEmbedImages.isView(imageContainer)){
                return imageContainer.images;
            }
            else if(AppBskyEmbedRecordWithMedia.isView(imageContainer)){
                return (imageContainer.media as AppBskyEmbedImages.View).images;
            }
            else if (AppBskyEmbedExternal.isView(imageContainer)){
                return imageContainer.external
            }
            return [];
        },
        /**Indicates if the data object being displayed/downloaded by `SaveMediaModal` a GIF(WEBM). */
        isGif(){
            return "external" in AppState.saveMedia;
        },
        /**Computed property that shortens the call to `AppState.saveMedia`. */
        saveMediaData():AppBskyEmbedImages.ViewImage|AppBskyEmbedExternal.View{
            return AppState.saveMedia;
        },
        /**Returns a WEBM URL converted from the original GIF URL. */
        webmURL(){
            return 'external' in this.saveMediaData ? AppState.getExternalWebmUrlFromGifUri(this.saveMediaData.external.uri) : '';
        }
    },
    watch:{
        /**
         * Used to track when a download has finished, since the  `plugin-upload:download()`
         * method doesn't allow for tracking when the `ProgressHandler` callback finishes
         * accurately. Used to close modal when download completes. Has a small delay to allow
         * progress bar to update fully.
         */
        progressSum(){
            if(this.progressSum+10 >= this.progressGoal ){
                setTimeout(() => {
                    console.log('Watcher condition met, closing modal');
                    this.isDownloading = false;
                    this.closeModal();
                }, 200);
            }
        }
    },
    beforeRouteEnter(to,from,next){
        next(vm => {
            vm.$data.previousURL = from.path
            document.title = `Saving Media Shared by ${vm.$props.handle} | moongate`;
        })
    },
    async created(){
        //Use saveMediaData
        if(('external' in AppState.saveMedia && typeof AppState.saveMedia.external.thumb != 'undefined' && AppState.saveMedia.external.thumb == 'unset') ||
        ('fullsize' in AppState.saveMedia && typeof AppState.saveMedia.thumb != 'undefined' && AppState.saveMedia.thumb == 'unset')){
            //retrieve post data
            this.isAwaitingPostData = true
            await getPostThread(this.postUri)
            .then(res => {
                this.postData = res.data.thread as AppBskyFeedDefs.ThreadViewPost;
            })
            .catch(err => toast.add({summary:'Error getting Post thread for focus modal', detail:`${err}`, severity:'error', group:'tr', life:3000}))
            .finally(()=>{
                this.isAwaitingPostData = false;
            });
            let fileName = undefined;
            let safeHandle = undefined;
            let postImages = this.getPostImages;
            let image:AppBskyEmbedImages.ViewImage|AppBskyEmbedExternal.View = postImages instanceof Array ? {...postImages[this.clickedMediaIndex],$type:'app.bsky.embed.images#viewImage'} : {$type:'app.bsky.embed.external#view',external:postImages}//this.getPostImages[this.clickedMediaIndex] //this.postData.post.embed
            AppState.saveMedia = image;
            if(typeof image != 'undefined' && AppBskyEmbedImages.isViewImage(image)){//not external GIF
                fileName = (image as AppBskyEmbedImages.ViewImage).fullsize.split('\/').pop()?.split('@')[0];
                safeHandle = '';
                if(typeof this.handle != 'undefined') safeHandle =  this.handle.replace (/\./g,'_');
                AppState.fileSaveDetails.full = `${fileName} by ${safeHandle}`;
                AppState.fileSaveDetails.originalFilename = fileName ? fileName : '';
                AppState.fileSaveDetails.extension = '.webp'; //Need to create method that parses image URL to determine extension (the @jpeg part)
                AppState.fileSaveDetails.handle = typeof this.handle != 'undefined' ? this.handle : '';
                // AppState.fileSaveDetails.postText = postText ? postText : '';

            }
            else{
                fileName = (image as AppBskyEmbedExternal.View).external.uri.split('\/').pop()?.split('@')[0];
                fileName = fileName ? fileName.split('.gif')[0] : '';
                AppState.fileSaveDetails.full = `${fileName}`;
                AppState.fileSaveDetails.originalFilename = fileName ? fileName : '';
                AppState.fileSaveDetails.extension = '.webm';
                AppState.fileSaveDetails.handle = '';
                // AppState.fileSaveDetails.postText = postText ? postText : '';
            }
        }
    },
    mounted(){
        this.checkIfFileWillBeOverwritten();
        (this.$el as HTMLElement).focus();
    },
    beforeUnmount(){
        AppState.saveMedia = {alt:'unset',description:'unset',fullsize:'',title:'unset',uri:'unset',thumb:'unset'} as AppBskyEmbedImages.ViewImage;//"clear" saveMedia variable
    }
})
</script>

<style scoped>

</style>