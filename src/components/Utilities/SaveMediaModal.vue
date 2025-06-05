<template>
    <div class="absolute flex z-50 w-full h-full">
        <div @click="closeModal" class="absolute w-full h-full bg-slate-800/60 backdrop-blur-sm"></div>
        <div class="relative flex flex-col max-w-[48rem] w-4/5 m-auto z-50
        rounded bg-slate-700 border border-slate-800 overflow-hidden">
            <div class="px-2 py-1 bg-slate-800 border-b border-slate-500">Save as</div>
            <div class="flex flex-col gap-2 p-3 overflow-hidden">
                <div v-if="!AppState.saveMedia.uri" class="self-start rounded h-32 bg-slate-500 overflow-hidden"
                :style="`aspect-ratio:${AppState.saveMedia.aspectRatio?.width}/${AppState.saveMedia.aspectRatio?.height}`">
                    <div class="h-full bg-cover" :style="`background-image: url(${AppState.saveMedia.thumb})`"></div>
                </div>
                <div v-else class="self-start rounded size-32 bg-slate-500 overflow-hidden" @contextmenu.prevent>
                    <div class="h-full bg-contain bg-no-repeat bg-center" :style="`background-image: url(${AppState.saveMedia.uri})`"></div>
                </div>
                <div class="flex">
                    <InLaInput v-if="isTauri()" class="h-10 text-[12px] rounded-r-none grow"
                    text-label="Filename" :model-value="AppState.fileSaveDetails.full"
                    @update:model-value="updateFileName"/>
                    <InLaInput v-else class="h-10 text-[12px] rounded-r-none grow" text-label="Click to Copy Filename"
                    :model-value="AppState.fileSaveDetails.full" @update:model-value="updateFileName"
                    :is-text-copy-control="true"/>
                    <div class="flex items-end rounded-r px-2 py-1
                    text-sm text-slate-400 bg-slate-800 border border-l-0 border-slate-500
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
                <div v-else class="text-xs">Currently on web/mobile you'll need to copy and use the filename yourself😔</div>
                <div v-show="!isFileNameValid" class="text-xs text-red-500">Invalid file name</div>
                <div v-show="isFileNameTaken" class="text-xs text-orange-300">File already exists, will be overwritten</div>
                <div v-if="isTauri()" class="rounded h-3 overflow-hidden bg-slate-400 border border-slate-800">
                    <div class="rounded bg-blue-500 h-full w-0"
                    :style="{'width' : downloadProgress+'%', 'transition':'width 0.4s ease'}"></div>
                </div>
                <SquareButton v-if="isTauri()" @click="saveImage" :is-disabled="!isFileNameValid || !isFolderSyntaxValid || isDownloading">Save Image</SquareButton>
                <SquareButton v-else @click="saveImageWebCORSSafe" title="Opens in new tab">Save Image</SquareButton>
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

export default defineComponent({
    components:{
        InLaInput,
        SquareButton,
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
            if(!this.isDownloading) AppState.isSavingMediaModalVisible = false;
        }
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
    mounted(){
        this.checkIfFileNameAlreadyExists();
    }
})
</script>

<style scoped>

</style>