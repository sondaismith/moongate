<template>
    <div class="absolute flex z-50 w-full h-full">
        <div @click="closeModal" class="absolute w-full h-full bg-slate-800/60 backdrop-blur-sm"></div>
        <div class="relative flex flex-col max-w-[48rem] w-4/5 m-auto z-50
        rounded bg-savemodalBG border border-slate-800 overflow-hidden">
            <div class="px-2 py-1 bg-banner border-b border-slate-500">Save as</div>
            <div v-if="!isAwaitingPostData" class="flex flex-col gap-2 p-3 overflow-hidden">
                <div v-if="!AppState.saveMedia.uri" class="self-start rounded h-32 max-w-full bg-slate-500 overflow-hidden"
                :style="`aspect-ratio:${AppState.saveMedia.aspectRatio?.width}/${AppState.saveMedia.aspectRatio?.height}`">
                    <div class="h-full bg-cover" :style="`background-image: url(${AppState.saveMedia.thumb})`"></div>
                </div>
                <div v-else class="self-start rounded size-32 bg-slate-500 overflow-hidden" @contextmenu.prevent>
                    <div class="h-full bg-contain bg-no-repeat bg-center" :style="`background-image: url(${AppState.saveMedia.uri})`"></div>
                </div>
                <div class="flex h-10 text-primary">
                    <InLaInput v-if="isTauri()" class="h-full text-[12px] rounded-r-none grow"
                    text-label="Filename" :model-value="AppState.fileSaveDetails.full"
                    @update:model-value="updateFileName" title="Edit filename"/>
                    <InLaInput v-else class="h-full text-[12px] rounded-r-none grow" text-label="Click to Copy Filename"
                    :model-value="AppState.fileSaveDetails.full" @update:model-value="updateFileName"
                    :is-text-copy-control="true"/>
                    <div class="flex items-end rounded-r px-2 py-1
                    text-sm text-searchbarBorder bg-savemodalFileExtBG border border-l-0 border-slate-500
                    select-none">
                    {{ AppState.fileSaveDetails.extension }}
                    </div>
                </div>
                <div v-if="isTauri()" class="relative">
                    <div @click="selectFolder" title="Select/Change folder" class="absolute z-[1] w-full h-full
                    rounded transition-colors border border-gray-500 hover:border-blue-400
                    cursor-pointer"></div>
                    <InLaInput :is-disabled="true" text-label="Save Folder" :model-value="AppState.lastMediaSaveDirectory.trim() != '' ? AppState.lastMediaSaveDirectory : 'Please select save folder'"/>
                </div>
                <div v-show="!isFileNameValid" class="text-xs text-red-500">Invalid file name</div>
                <div v-show="isFileNameTaken" class="text-xs text-orange-300">File already exists, will be overwritten</div>
                <div v-if="isTauri()" class="rounded h-3 overflow-hidden bg-slate-400 border border-slate-800">
                    <div class="rounded bg-blue-500 h-full w-0"
                    :style="{'width' : downloadProgress+'%', 'transition':'width 0.4s ease'}"></div>
                </div>
                <SquareButton v-if="isTauri()" @click="saveImage" title="Save Image"
                :is-disabled="!isFileNameValid || !isFolderSyntaxValid || isDownloading">
                    Save Image
                </SquareButton>
                <!-- <SquareButton v-else :is-disabled="isDownloading" @click="saveImageWebCORSSafe" title="Opens in new tab">Save Image</SquareButton> -->
                <SquareButton v-else :is-disabled="isDownloading"
                @click="downloadFileFromBskyCDN((AppState.saveMedia as ViewImage).fullsize ? (AppState.saveMedia as ViewImage).fullsize : (AppState.saveMedia.uri as string), AppState.fileSaveDetails.full)"
                title="Download Image">
                    <div>Save Image</div>
                    <!-- <i-mingcute:loading-fill v-if="isDownloading" class="spinner"/> -->
                </SquareButton>
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
import { AppState, toast } from '../../state/AppState.vue';
import { download } from '@tauri-apps/plugin-upload';
import InLaInput from './InLaInput.vue';
import SquareButton from './SquareButton.vue';
import { open } from '@tauri-apps/plugin-dialog';
import { exists } from '@tauri-apps/plugin-fs';
import { ViewImage } from '@atproto/api/dist/client/types/app/bsky/embed/images';
import { ViewExternal } from '@atproto/api/dist/client/types/app/bsky/embed/external';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { CreateBskyMediaDownloadURL } from '../../helpers/converters';
import { getPostImages, getPostThread } from '../../lib/api/Post.vue';
import { emptyPostThread } from '../../fake-data/dumPostData';
import { ThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { router } from '../../main';

export default defineComponent({
    components:{
        InLaInput,
        SquareButton,
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
            /**State value indicating if a file with the same name already exists in current directory. */
            isFileNameTaken:false,
            /**Are we waiting for the related Post's data to be returned. */
            isAwaitingPostData:false,
            /**Post data used to download related image. */
            postData:emptyPostThread,
            /**The previous page the User was at before moving to download media. If it exists, it is returned to when `SaveMediaModal` is closed. */
            previousURL:'',
            isTauri,
        }
    },
    methods:{
        async selectFolder(){
            const path = await open({
                directory:true,
                defaultPath:AppState.lastMediaSaveDirectory.trim() != '' ? AppState.lastMediaSaveDirectory : undefined,
            });
            if(path) AppState.lastMediaSaveDirectory = path;
            this.checkIfFileNameAlreadyExists();
        },
        /**
         * Method used to download images with metadata when using the application via
         * desktop app (Tauri web-view).
         */
        async saveImage(){
            this.progressSum = 0;
            this.progressGoal = 0;
            this.isDownloading = true;
            let downloadURL = '';
            if(!AppState.saveMedia.uri) downloadURL = (AppState.saveMedia as ViewImage).fullsize
            else downloadURL = (AppState.saveMedia as ViewExternal).uri
            await download(
                downloadURL,
                `${AppState.lastMediaSaveDirectory}\\${AppState.fileSaveDetails.full}.${AppState.fileSaveDetails.extension}`,
                ({ progress, total }) => {
                    this.progressSum += progress;
                    this.progressGoal = total;
                    // console.log(`Downloaded ${this.progressSum} of ${total} bytes`) // a callback that will be called with the download progress
                }
            )
            .then(_ => {
                if(isTauri() && AppState.fileSaveDetails.extension != '.gif'){
                    //in Tauri webview, not browser
                    invoke('write_metadata_to_file', ({
                        imageFile:`${AppState.lastMediaSaveDirectory}\\${AppState.fileSaveDetails.full}.${AppState.fileSaveDetails.extension}`,
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
            fetch((AppState.saveMedia as ViewImage).fullsize ? (AppState.saveMedia as ViewImage).fullsize : (AppState.saveMedia.uri as string))
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
            window.open((AppState.saveMedia as ViewImage).fullsize ? (AppState.saveMedia as ViewImage).fullsize : (AppState.saveMedia.uri as string),'_blank');
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
            this.checkIfFileNameAlreadyExists();
        },
        async checkIfFileNameAlreadyExists(){
            if(this.isFileNameValid && this.isFolderSyntaxValid){
                await exists(`${AppState.lastMediaSaveDirectory}/${AppState.fileSaveDetails.full}.${AppState.fileSaveDetails.extension}`)
                .then(res => {
                    this.isFileNameTaken = res;
                })
                .catch(err => console.log(err));
            }
            else{
                this.isFileNameTaken = false;
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
         */
        async downloadFileFromBskyCDN(url:string, filename:string) {
            const target = `${import.meta.env.VITE_BSKY_MEDIA_DOWNLOAD_PROXY_TARGET}`;
            if(!url.includes(target)){
                toast.add({summary:'Error', detail:`URL provided to download must be link to Bluesky CDN`, severity:'error', group:'tr', life:3000});
                console.log(`Provided URL was: ${url}`);
            }
            else{
                this.isDownloading = true;
                await fetch(CreateBskyMediaDownloadURL(url),{
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
         * @returns `ViewImage[]` containing Post images.
         */
        getPostImages():ViewImage[]{
            return getPostImages(this.postData);
        },
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
        })
    },
    async created(){
        if(typeof AppState.saveMedia.thumb != 'undefined' && AppState.saveMedia.thumb == 'unset'){
            //retrieve post data
            this.isAwaitingPostData = true
            await getPostThread(this.postUri)
            .then(res => {
                this.postData = res.data.thread as ThreadViewPost;
            })
            .catch(err => toast.add({summary:'Error getting Post thread for focus modal', detail:`${err}`, severity:'error', group:'tr', life:3000}))
            .finally(()=>{
                this.isAwaitingPostData = false;
            });
            let fileName = undefined;
            let safeHandle = undefined;
            let image = this.getPostImages[this.clickedMediaIndex] //this.postData.post.embed
            AppState.saveMedia = image;
            if(!image.uri){//not Tenor GIF
                fileName = (image as ViewImage).fullsize.split('\/').pop()?.split('@')[0];
                safeHandle = '';
                if(typeof this.handle != 'undefined') safeHandle =  this.handle.replace (/\./g,'_');
                AppState.fileSaveDetails.full = `${fileName} by ${safeHandle}`;
                AppState.fileSaveDetails.originalFilename = fileName ? fileName : '';
                AppState.fileSaveDetails.extension = '.jpg'; //Need to create method that parses image URL to determine extension (the @jpeg part)
                AppState.fileSaveDetails.handle = typeof this.handle != 'undefined' ? this.handle : '';
                // AppState.fileSaveDetails.postText = postText ? postText : '';

            }
            else{
                fileName = (image as ViewExternal).uri.split('\/').pop()?.split('@')[0];
                fileName = fileName ? fileName.split('.gif')[0] : '';
                AppState.fileSaveDetails.full = `${fileName}`;
                AppState.fileSaveDetails.originalFilename = fileName ? fileName : '';
                AppState.fileSaveDetails.extension = '.gif';
                AppState.fileSaveDetails.handle = '';
                // AppState.fileSaveDetails.postText = postText ? postText : '';
            }
        }
    },
    mounted(){
        this.checkIfFileNameAlreadyExists();
    },
    beforeUnmount(){
        AppState.saveMedia = {alt:'unset',description:'unset',fullsize:'',title:'unset',uri:'unset',thumb:'unset'};//"clear" saveMedia variable
    }
})
</script>

<style scoped>

</style>