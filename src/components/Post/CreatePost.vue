<template>
    <div tabindex="-1" @keydown="(e) => TrapFocus($el,e)" class="absolute z-30 flex w-full h-full">
        <div @click="confirmClose(canSubmitPost,isAwaitingPostConfirm)" class="absolute w-full h-full bg-slate-800/60"/>
        <div class="relative rounded-lg flex flex-col w-full sm:w-3/5 text-primary bg-focusBG border
        border-outlineLighter p-3 my-auto m-4 sm:m-auto gap-3 overflow-hidden">
            <div class="flex items-center justify-between">
                <button @click="confirmClose(canSubmitPost,isAwaitingPostConfirm)" class="font-bold text-sky-500 hover:text-sky-300 cursor-pointer focus-visible:outline
                focus-visible:outline-searchbarFocusHightlight shadow-none">Cancel</button>
                <button @click="testUploadImagePost" class="flex gap-1 items-center bg-btn disabled:bg-disabledBG disabled:text-disabled disabled:border-transparent px-2 py-1 text-primary" :disabled="!canSubmitPost">
                    <i-mingcute:loading-fill v-if="isAwaitingPostConfirm" class="spinner"/>
                    <div>Test Image Post</div>
                </button>
                <PillButton data-test="create-post-button" :disabled="(!canSubmitPost || postDetails.isAwaitingFocusData)" @click="createNewPost"
                class="transition-colors px-4 py-1 bg-sky-500">Post</PillButton>
            </div>
            <div v-if="postDetails.currentPostAction == PostActions.Reply && postDetails.isAwaitingPostThreadData">
                <i-mingcute:loading-fill class="text-primary spinner self-center size-10"/>
            </div>
            <div v-else-if="postDetails.currentPostAction == PostActions.Reply" class="flex flex-col gap-1">
                <div class="flex flex-col self-start text-sm select-none">
                    <div>Replying to...</div>
                    <div class="h-[1px] bg-outlineLighter"></div>
                </div>
                <div v-for="post in [postDetails.currentPostData]"
                class="flex gap-2">
                    <div class="p-1">
                        <AvatarRound :avatar="post.author.avatar"/>
                    </div>
                    <div class="flex flex-col overflow-hidden shrink">
                        <div class="flex gap-1 text-nowrap">
                            <div class="text-sm overflow-hidden text-ellipsis font-bold"
                            :title="post.author.displayName">{{ post.author.displayName }}</div>
                            <div class="text-sm overflow-hidden text-ellipsis text-secondary"
                            :title="post.author.handle">@{{ post.author.handle }}</div>
                        </div>
                        <RichPostTextBsky :post-text="getPostText" class="text-sm"/>
                    </div>
                    <div v-if="postContainsImage" class="ml-auto shrink-0 h-16 w-fulls rounded overflow-hidden box-content border border-outlineLighter"
                    :style="`aspect-ratio:${getPostImages[0].aspectRatio?.width}/${getPostImages[0].aspectRatio?.height}`">
                        <div class="h-full bg-contain bg-no-repeat"
                        :style="{'background-image': `url(${getPostImages[0].fullsize})`}"></div>
                    </div>
                    <div v-if="postContainsVideo"
                    class="ml-auto rounded-md text-sm w-16 p-1 bg-focusBG
                    border border-secondary text-center self-center">
                        Video
                    </div>
                    <div v-if="postContainsExternalEmbed"
                    class="ml-auto rounded-md text-sm w-16 p-1 bg-focusBG
                    border border-secondary text-center self-center">
                        External Embed
                    </div>
                </div>
                <div class="h-[1px] bg-outlineLighter"></div>
            </div>
            <div class="flex gap-2">
                <div class="p-1">
                    <AvatarRound class=""/>
                </div>
                <textarea id="post-textarea" role="text" placeholder="What do you want to say?" contenteditable
                @input="limitChars" v-model="postText"
                class="block rounded p-2  bg-postBG w-full postPlaceholder"/>
                <!-- <span role="text" placeholder="What do you want to say?" contenteditable
                @focusin="postInputFocusGained" @focusout="postInputFocusLost"
                @input="limitChars"
                class="block rounded p-2 bg-slate-900 w-full postPlaceholder"/> -->
            </div>
            <div class="flex flex-wrap gap-1 w-full">
                <div v-for="(n, index) in uploadedMedia" :key="index" class="relative aspect-square max-h-32 max-w-32 flex-[0_1_30%]
                rounded-md border border-outline overflow-hidden origin-top-left">
                    <div v-if="(index == selectedImage)" class="absolute w-full h-full rounded-md border-4 border-primary"></div>
                    <img :src="n.blobURI" class="object-cover h-full w-full"/>
                    <div class="absolute top-0 left-0 flex flex-col gap-1 p-0.5 h-full w-full text-white">
                        <div v-if="checkIfMediaIsBeingUploaded(n)" class="z-[5] absolute justify-center top-0 left-0 flex w-full h-full bg-black/60">
                            <i-mingcute:loading-fill class="text-gray-300 spinner h-full w-full"/>
                        </div>
                        <div v-else-if="n.uploaded" class="z-[5] absolute justify-center top-0 left-0 flex w-full h-full bg-black/60">
                            <i-mingcute:check-fill class="text-green-400 p-5 h-full w-full"/>
                        </div>
                        <div v-else class="flex flex-col h-full w-full">
                            <div class="flex justify-between">
                                <button class="z-[1] aspect-square h-6 text-center align-middle bg-black/80 rounded-full
                                focus-visible:outline focus-visible:outline-searchbarFocusHightlight">{{ index+1 }}</button>
                                <button @click="removeUploadedMedia(index)" title="Remove Media"
                                class="z-[1] aspect-square h-6 p-0.5 text-center bg-black/80 rounded-full
                                focus-visible:outline focus-visible:outline-searchbarFocusHightlight">
                                    <i-mingcute:close-fill class="h-full w-full"/>
                                </button>
                            </div>
                            <button @click="toggleViewImageAltText(index)" :title="n.alt.trim() == '' ? n.fileName : n.alt" class="h-full w-full rounded-none shadow-none border-none active:bg-transparent
                            focus-visible:outline focus-visible:outline-searchbarFocusHightlight">
                            </button>
                            <button @click="toggleViewImageAltText(index)" :title="n.alt.trim() != '' ? n.alt : 'No ALT text provided'"
                            class="flex aspect-square h-5 pr-1 items-center self-start bg-black/80 rounded-md
                            focus-visible:outline focus-visible:outline-searchbarFocusHightlight">
                                <Transition>
                                <div v-if="n.alt.trim() == ''" class="absolute"><i-mingcute:add-fill class="h-3"/></div>
                                <div v-else class="absolute"><i-mingcute:check-fill class="h-3"/></div>
                                </Transition>
                                <div class="ml-5 text-xs">ALT</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="postDetails.currentPostAction == PostActions.Quote && postDetails.isAwaitingPostThreadData">
                <i-mingcute:loading-fill class="text-primary spinner self-center size-10"/>
            </div>
            <div v-else-if="postDetails.currentPostAction == PostActions.Quote" class="flex flex-col gap-1">
                <!-- <div class="flex flex-col self-start text-sm underlines select-none">
                    <div>Quoting...</div>
                    <div class="h-[1px] bg-outlineLighter"></div>
                </div> -->
                <div v-for="post in [postDetails.currentPostData]"
                class="flex flex-col rounded-md p-2 gap-1 border border-outline">
                    <div class="flex gap-1 items-center">
                        <AvatarRound :avatar="post.author.avatar" class="size-6"/>
                        <div class="flex gap-1 text-nowrap overflow-hidden">
                            <div class="text-sm overflow-hidden text-ellipsis font-bold"
                            :title="post.author.displayName">{{ post.author.displayName }}</div>
                            <div class="text-sm overflow-hidden text-ellipsis text-secondary"
                            :title="post.author.handle">@{{ post.author.handle }}</div>
                        </div>
                    </div>
                    <div class="flex items-start flex-col self-start gap-1 overflow-hidden shrink">
                        <RichPostTextBsky :post-text="getPostText" class="text-sm"/>
                        <div v-if="postContainsImage" class="flex min-h-48 rounded overflow-hidden box-content border border-outlineLighter"
                        :style="`aspect-ratio:${getPostImages[0].aspectRatio?.width}/${getPostImages[0].aspectRatio?.height}`">
                            <div class="w-full h-full bg-contain bg-no-repeat"
                            :style="{'background-image': `url(${getPostImages[0].fullsize})`}"></div>
                        </div>
                        <div v-if="postContainsVideo"
                        class="rounded-md text-sm w-16 p-1 bg-focusBG
                        border border-secondary text-center">
                            Video
                        </div>
                        <div v-if="postContainsExternalEmbed"
                        class="rounded-md text-sm w-16 p-1 bg-focusBG
                        border border-secondary text-center">
                            External Embed
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col gap-1">
                <div v-if="uploadedMedia.length>0">
                    <div v-for="n in getMediaAltTextState" class="flex gap-1 items-center">
                        <i-mingcute:information-line v-if="!n.allProvided" class="text-blue-400"/>
                        <i-mingcute:check-fill v-else class="text-green-400"/>
                        <div class="text-sm">{{ n.text }}</div>
                    </div>
                    <div v-if="webpSelectedForUpload" class="flex gap-1 items-center">
                        <i-mingcute:information-line class="text-blue-400"/>
                        <div class="text-sm">Animated WEBP files will be uploaded as a static image</div>
                    </div>
                </div>
                <Transition>
                    <div v-if="selectedImage > -1" class="absolutes max-h-80 flex flex-col gap-1 h-full w-full">
                        <div>ALT Text for Image {{ selectedImage+1 }}</div>
                        <textarea id="post-textarea" role="text" placeholder="Alt text" contenteditable
                        v-model="uploadedMedia[selectedImage].alt"
                        class="block rounded p-2 bg-postBG w-full postPlaceholder"/>
                        <div class="flex justify-between">
                            <div>Char limit of 2000 here</div>
                            <SquareButton class="bg-btn hover:bg-btnHover">Save</SquareButton>
                        </div>
                    </div>
                </Transition>
            </div>
            <div class="flex gap-1">
                <button @click="toggleThreadGateOptionsModal" class="flex rounded bg-btn hover:bg-btnHover p-2 items-center self-start gap-1 text-sm cursor-pointer">
                    <div class="flex gap-1 items-center">
                        <div>
                            <i-mingcute:world-2-line v-if="threadGateOptions[0].selected"/>
                            <i-mdi:do-not-disturb-alt v-else-if="threadGateOptions[1].selected"/>
                            <i-solar:users-group-rounded-bold v-else/>
                        </div>
                        <div>{{ generatedThreadGateLabel }}</div>
                    </div>
                </button>
                <button v-if="uploadedMedia.length>0" @click="toggleContentLabelOptionsModal" class="flex rounded bg-btn hover:bg-btnHover p-2 items-center self-start gap-1 text-sm cursor-pointer">
                    <i-mingcute:check-fill v-if="haveLabelsBeenAdded"/>
                    <i-mingcute:safe-shield-2-fill v-else/>
                    <div>{{ haveLabelsBeenAdded ? 'Labels Added' : 'Content Labels' }}</div>
                </button>
            </div>
            <CheckBox :model-value="showsPostAfterCreation" @value-toggled="n => showsPostAfterCreation = n">Show Post after creation?</CheckBox>
            <hr class="border-outline"/>
            <div class="flex items-center">
                <div class="flex gap-1">
                    <input id="file-upload" type="file" accept="image/*" multiple hidden @change="handleFileSelect"/>
                    <button @click="uploadMedia" :disabled="uploadDisabled" class="px-2 rounded-md hover:bg-btnHover text-xl text-blue-500 shadow-none transition-colors
                        disabled:bg-disabledBG disabled:hover:bg-disabledBG disabled:hover:border-disabledBG disabled:text-disabled disabled:cursor-not-allowed"
                        :title="uploadDisabled ? 'Max 4 Images Allowed' : 'Upload Image'">
                        <i-mdi:photo-library/>
                    </button>
                    <div v-for="option in mediaTypes" class="flex rounded p-2 hover:bg-btnHover
                    cursor-pointer text-blue-500 text-xl items-center justify-center">
                        <component :is="option.icon"></component>
                    </div>
                </div>
                <div class="flex items-center ml-auto gap-2 h-10">
                    <div class="font-bold text-sky-500 cursor-not-allowed" title="Language is English Only atm">English</div>
                    <div class="flex items-center gap-2 h-full">
                        <div class="flex min-w-8 justify-end">{{ charsRemaining }}</div>
                        <div class="flex border h-full">
                            <div class="relative flex bg-blue-400 w-2 self-end" :class="charUsagePercent == 100 ? 'bg-red-500' : ''"
                            :style="{'height':charUsagePercent+'%', 'transition':'height 0.4s ease'}"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="threadGateOptionsVisible" class="absolute flex w-full h-full">
            <div class="absolute w-full h-full bg-black/50"></div>
            <div class="z-30 flex flex-col gap-2 rounded-lg bg-focusBG p-4 mx-auto my-auto border border-outlineLighter text-primary">
                <div class="flex">
                    <div class="flex flex-col">
                        <div class="font-bold text-xl">Post interaction settings</div>
                        <div>Customize who can interact with this post.</div>
                    </div>
                    <button @click="closeThreadGateOptionsModal" class="flex self-start hover:border-transparent shadow-none">
                        <i-mingcute:close-fill class="text-outline"/>
                    </button>
                </div>
                <hr class="border-outline"/>
                <div class="flex">
                    <div class="flex flex-col w-full">
                        <div class="font-bold text-lg">Quote settings</div>
                        <div class="flex justify-between items-center">
                            <div class="text-sm text-secondary">Allow quote posts</div>
                            <ModernToggleButton :value-to-toggle="allowQuotePosts" @value-toggled="(newVal) => allowQuotePosts = newVal"/>
                        </div>
                    </div>
                </div>
                <hr class="border-outline"/>
                <div class="flex">
                    <div class="flex flex-col gap-1 w-full">
                        <div class="font-bold text-lg">Reply Setting</div>
                        <div class="flex flex-col gap-1">
                            <div class="text-sm text-secondary">Allow replies from:</div>
                            <div class="flex gap-2">
                                <CheckedButton @click="selectTopLevelThreadGateFilter(index)" v-for="(n,index) in threadGateOptions" :selected="n.selected" class="w-1/2">{{ n.name }}</CheckedButton>
                            </div>
                        </div>
                        <div v-if="threadGateOptions[0].selected || areAnySubEverythingThreadGatesSelected" class="flex flex-col gap-1">
                            <div class="text-sm text-secondary">Or combine options:</div>
                            <div class="flex flex-col gap-2">
                                <CheckedButton @click="selectSubEverythingThreadGateOptions(index)" v-for="(n,index) in threadGateOptions[0].options"
                                :selected="n.selected">{{ n.name }}</CheckedButton>
                            </div>
                        </div>
                    </div>
                </div>
                <SquareButton @click="closeThreadGateOptionsModal" class="mt-2 font-bold bg-blue-500">Close</SquareButton>
            </div>
        </div>
        <div v-if="contentLabelsModalVisible" class="absolute flex w-full h-full">
            <div class="absolute w-full h-full bg-black/50"></div>
            <div class="z-30 flex flex-col gap-2 rounded-lg bg-focusBG p-4 mx-auto my-auto max-w-[420px] border border-outlineLighter text-primary">
                <div class="flex">
                    <div class="flex flex-col">
                        <div class="font-bold text-xl">Add content warnings</div>
                        <div>Please add content warning labels that are applicable for the media you are posting.</div>
                    </div>
                    <button @click="closeContentLabelOptionsModal" class="flex self-start hover:border-transparent shadow-none">
                        <i-mingcute:close-fill class="text-outline"/>
                    </button>
                </div>
                <hr class="border-outline"/>
                <div class="flex flex-col gap-1 w-full">
                    <div class="font-bold text-lg">Adult Content</div>
                    <div class="flex flex-col gap-1">
                        <div class="flex flex-col gap-2">
                            <CheckedButton @click="selectAdultContentLabelOptions(index)" v-for="(n,index) in contentLabelOptions[0].options"
                            :selected="n.selected">{{ n.name }}</CheckedButton>
                        </div>
                        <div class="mt-1 text-sm">{{ generatedAdultContentLabel }}</div>
                    </div>
                </div>
                <hr class="border-outline"/>
                <div class="flex flex-col gap-1 w-full">
                    <div class="font-bold text-lg">Other</div>
                    <div class="flex flex-col gap-1">
                        <div class="flex flex-col gap-2">
                            <CheckedButton @click="selectOtherContentLabelOptions(index)" v-for="(n,index) in contentLabelOptions[1].options"
                            :selected="n.selected">{{ n.name }}</CheckedButton>
                        </div>
                        <div class="mt-1 text-sm">{{ generatedOtherContentLabel }}</div>
                    </div>
                </div>
                <SquareButton @click="closeContentLabelOptionsModal" class="mt-2 font-bold bg-blue-500">Close</SquareButton>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import MdiInsertPhoto from '~icons/mdi/insert-photo';
import MdiFilmstripBoxMultiple from '~icons/mdi/filmstrip-box-multiple';
import MdiFileGifBox from '~icons/mdi/file-gif-box';
import { AppState, toast, TrapFocus } from '../../state/AppState.vue';
import { CreateContentLabelObjects, CreateImageMediaObject, CreateNewPost, CreateThreadGateObject } from '../../lib/api/Post.vue';
import { isThreadViewPost, PostView, ThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { postDetails } from '../../state/PostDetails.vue';
import AvatarRound from '../Utilities/AvatarRound.vue';
import { isView, ViewImage } from '@atproto/api/dist/client/types/app/bsky/embed/images';
import RichPostTextBsky from '../Utilities/RichPostTextBsky.vue';
import { AppBskyEmbedRecordWithMedia, AppBskyEmbedVideo, AppBskyEmbedExternal, AppBskyEmbedRecord, ComAtprotoRepoUploadBlob, AtUri } from '@atproto/api';
import { isViewRecord } from '@atproto/api/dist/client/types/app/bsky/embed/record';
import { PostActions } from '../../enums/PostEnums';
import CheckBox from '../Utilities/CheckBox.vue';
import PillButton from '../Utilities/PillButton.vue';
import SquareButton from '../Utilities/SquareButton.vue';
import { INestedPostOptions, IUploadedFile } from "../../interfaces/PostInterfaces";
import {ArrToString} from '../../helpers/formaters.ts';
import ModernToggleButton from '../Utilities/ModernToggleButton.vue';
import CheckedButton from '../Utilities/CheckedButton.vue';
import { GetBrowsingAgent } from '../../lib/api.vue';
import { Record } from '@atproto/api/dist/client/types/app/bsky/feed/post';
import {imageDimensionsFromData} from 'image-dimensions';
import { AspectRatio } from '@atproto/api/dist/client/types/app/bsky/embed/defs';

export default defineComponent({
    components:{
        AvatarRound,
        RichPostTextBsky,
        CheckBox,
        SquareButton,
        PillButton,
        CheckedButton,
        ModernToggleButton,
    },
    props:{
        avatar: String,
        postRef: Object as PropType<PostView>,
    },
    data(){
        return{
            TrapFocus,
            URL,
            postText:'',
            allowedFileFormats:['jpe','jpeg','jpg','png','webp','svg','avif'],
            mediaTypes:[
                {label:'photo', icon:MdiInsertPhoto},
                // {label:'gif', icon:MdiFileGifBox},
            ],
            // uploadedMedia:[
            //     {image:'src/assets/test-media/posts/image02.png', alt:'Christmas'},
            //     {image:'src/assets/test-media/posts/image05.png', alt:'John halo'},
            //     {image:'src/assets/test-media/posts/image04.png', alt:'a game that i miss :('},
            //     {image:'src/assets/test-media/posts/image07.png', alt:'fornite'},
            // ],
            /**App friendly details of the uploaded files. */
            uploadedMedia:[] as IUploadedFile[],
            /**Raw collection of the uploaded files. */
            files: [] as File[],
            /**Indicates which of the uploaded media has been selected - usually used to add ALT text. */
            selectedImage:-1,
            /**Are other User's allowed to quote post this one? */
            allowQuotePosts:true,
            /**Is the Thread Gate Options modal currently visible? */
            threadGateOptionsVisible:false,
            /**Collection used to display and set all the "Thread Gate" options.*/
            threadGateOptions:[
                {name:'Everybody', selected:true,
                    options:[
                        {name:'Mentioned Users',selected:false,options:[]},
                        {name:'Users you follow',selected:false,options:[]},
                        {name:'Your followers',selected:false,options:[]},
                    ]
                },
                {name:'Nobody', selected:false, options:[] as {name:string,selected:boolean,options:[]}[]},
            ] as INestedPostOptions[],
            CreateThreadGateObject,
            /**Is the Content Label Options modal currently visible? */
            contentLabelsModalVisible:false,
            /**Collection used to display and set all the "Thread Gate" options.*/
            contentLabelOptions:[
                {name:'Adult Content', selected:false,
                    options:[
                        {name:'Suggestive',selected:false,options:[],value:'sexual'},
                        {name:'Nudity',selected:false,options:[],value:'nudity'},
                        {name:'Adult',selected:false,options:[],value:'porn'},
                    ]
                },
                {name:'Other', selected:false,
                    options:[
                        {name:'Graphic Media',selected:false,options:[],value:'graphic-media'}
                    ]
                },
            ] as INestedPostOptions[],
            CreateContentLabelObjects,
            // canSubmitPost:false,
            confirmClose,
            postDetails,
            isView,
            AppBskyEmbedRecord,
            PostActions,
            isAwaitingPostConfirm:false,
            showsPostAfterCreation:false,
        }
    },
    methods:{
        /**
         * Method used to remove post message placeholder when input is in focus.
         */
        postInputFocusGained(event:FocusEvent){
            (event.target as HTMLElement).classList.remove('postPlaceholder');
            ((event.currentTarget as HTMLElement).nextSibling as HTMLElement).classList.remove('hide');
        },
        /**
         * Method used to add post message placeholder when input loses focus and
         * text is empty.
         */
        postInputFocusLost(event:FocusEvent){
            if ((event.target as HTMLElement).textContent == ""){
                //textbox empty
                (event.target as HTMLElement).classList.add('postPlaceholder');
                ((event.currentTarget as HTMLElement).nextSibling as HTMLElement).classList.add('hide');
            }
        },
        limitChars(){
            //expand/contract textarea height
            var textarea = document.getElementById('post-textarea');
            if(textarea){
                if(textarea.scrollHeight>textarea.clientHeight) textarea.style.height = textarea.scrollHeight+'px';
                else{
                    textarea.style.height = '';
                    textarea.style.height = textarea.scrollHeight+'px';
                }
            }
            //limit char count
            let maxChars = 300;
            if(this.postText.length>maxChars) this.postText = this.postText.slice(0,maxChars);
        },
        /**
         * Toggles the textbox that allows the User to enter ALT text for a
         * specific piece of media selected to be uploaded.
         * @param index The index of the uploaded media to show the ALT text
         * for.
         */
        toggleViewImageAltText(index:number){
            if(index == this.selectedImage) this.selectedImage = -1;
            else this.selectedImage = index;
        },
        /**
         * Removes a specific selected media file from the Post attatch/upload list.
         * @param index The index of the uploaded media to remove from the upload
         * list.
         */
        removeUploadedMedia(index:number){
            if(index >-1 && index <= this.uploadedMedia.length-1){
                if(this.selectedImage == index) this.selectedImage = -1; //deselect removed image
                else if(this.selectedImage > index) this.selectedImage = this.selectedImage-1; //handle index values changing from removal
                this.uploadedMedia.splice(index,1);//clear from UI
                this.files.splice(index,1);//clear ref to file on disk
            }
            if(this.uploadedMedia.length == 0) this.deselectAllContentLabelOptions();//no media left - clear content labels
        },
        /**
         * Initiates the selection of files to Upload by programmatically
         * clicking hidden `<input type="file">` element.
         */
        uploadMedia(){
            let upload = document.getElementById('file-upload') as HTMLInputElement;
            if(upload) upload.click();
        },
        /**
         * Handles the selection of files to include with the created Post.
         * Process the selection and automatically rejects files with a simple
         * check - not foolproof. The assumption is that Bluesky's servers will
         * do more thorough checks to protect themselves. This metho only allows
         * images at the moment.
         * @param e The file upload <input> element's `onChange` event.
         */
        async handleFileSelect(e: Event){
            const input = e.target as HTMLInputElement;
            const filesAsArray = Array.from(input?.files || []);
            // if(this.files.length < 1) this.files = filesAsArray;
            //remove unsupported file formats
            let invalidFiles = [] as {name:string,index:number,reason:string}[];
            for (let i = 0; i < filesAsArray.length; i++) {
                if(!this.allowedFileFormats.some(f => filesAsArray[i].type.includes(f))){
                    invalidFiles.push({name:filesAsArray[i].name,index:i,reason:'Invalid Format'});
                }
            }
            for (let i = invalidFiles.length-1; i > -1; i--) {
                filesAsArray.splice(invalidFiles[i].index,1);
            }
            if(invalidFiles.length>0) toast.add({summary:'File type not supported', detail:`${invalidFiles.map(f => f.name).join(',\n')} cannot be uploaded.`, severity:'warn', group:'tr', life:5000});
            //remove files that are too large
            invalidFiles = []; //reset
            for (let i = 0; i < filesAsArray.length; i++) {
                if(filesAsArray[i].size>=1000000){
                    invalidFiles.push({name:filesAsArray[i].name,index:i,reason:'Too large'});
                }
            }
            for (let i = invalidFiles.length-1; i > -1; i--) {
                filesAsArray.splice(invalidFiles[i].index,1);
            }
            if(invalidFiles.length>0) toast.add({summary:'File size larger than 1MB', detail:`Invalid files: ${invalidFiles.map(f => f.name).join('\n')}`, severity:'warn', group:'tr', life:5000});
            //calculate how many files can be added to upload list
            let newMedia = [] as IUploadedFile[];
            if(this.uploadedMedia.length+filesAsArray.length>4){
                toast.add({summary:'Too many images', detail:`4 images max can be uploaded with a Post.`, severity:'warn', group:'tr', life:3000});
            }
            for (let i = 0; i < this.calculateAllowedMediaCount(filesAsArray.length); i++) {
                let parsedDimensions = imageDimensionsFromData(await filesAsArray[i].bytes())
                let imgDimensions:AspectRatio = typeof parsedDimensions != 'undefined' ? {height:parsedDimensions.height, width:parsedDimensions.width} : {height:0,width:0};
                newMedia.push({blobURI:this.URL.createObjectURL(filesAsArray[i]),fileName:filesAsArray[i].name,alt:'',aspectRatio:imgDimensions,type:filesAsArray[i].type,uploaded:false,uploadInProgress:false});
                this.files.push(filesAsArray[i]);//Add allowed files to array of references pointing to files on disk
            }
            this.uploadedMedia = this.uploadedMedia.concat(newMedia);
        },
        /**Checks to see how many more files can be added to be included with Post. */
        calculateAllowedMediaCount(itemsToAdd:number){
            let spacesLeft = 4-this.uploadedMedia.length;
            if(spacesLeft < 1) spacesLeft = 0;
            if(itemsToAdd<=spacesLeft) return itemsToAdd;
            else if(itemsToAdd>spacesLeft && spacesLeft>0) return spacesLeft;
            else return 0;
        },
        /**Shows or hides Thread Gate option modal. */
        toggleThreadGateOptionsModal(){
            this.threadGateOptionsVisible = !this.threadGateOptionsVisible;
        },
        /**Hides the Thread Gate option modal. */
        closeThreadGateOptionsModal(){
            this.threadGateOptionsVisible = false;
        },
        /**Shows or hides Content label options modal. */
        toggleContentLabelOptionsModal(){
            this.contentLabelsModalVisible = !this.contentLabelsModalVisible;
        },
        /**Hides the Content label options modal. */
        closeContentLabelOptionsModal(){
            this.contentLabelsModalVisible = false;
        },
        /**Toggles if the "Allow Quote posts" setting is on or off. */
        toggleAllowQuotePosts(){
            this.allowQuotePosts = !this.allowQuotePosts;
        },
        /**Used to set if all replies are allowed or no replies are allowed. */
        selectTopLevelThreadGateFilter(index:number){
            for(let i = 0; i < this.threadGateOptions.length; i++){
                if(i == index) this.threadGateOptions[i].selected = true;
                else this.threadGateOptions[i].selected = false;
            }
            this.deselectSubEverythingThreadGateOptions();
        },
        /**Used to set finely grained thread gate options. (Mentioned, Following, etc.) */
        selectSubEverythingThreadGateOptions(index:number){
            this.threadGateOptions[0].selected = false;
            this.threadGateOptions[0].options[index].selected = !this.threadGateOptions[0].options[index].selected;
            if(!this.areAnySubEverythingThreadGatesSelected) this.threadGateOptions[0].selected = true;
        },
        /**Clears all of the finely grained thread gate options from being set. */
        deselectSubEverythingThreadGateOptions(){
            for(let i = 0; i < this.threadGateOptions[0].options.length; i++) {
                this.threadGateOptions[0].options[i].selected = false;
            }
        },
        /**Used to set "Adult Content" content label options.*/
        selectAdultContentLabelOptions(index:number){
            this.contentLabelOptions[0].options[index].selected = !this.contentLabelOptions[0].options[index].selected;
            for (let i = 0; i < this.contentLabelOptions[0].options.length; i++) {
                if(i!=index) this.contentLabelOptions[0].options[i].selected = false;
            }
        },
        /**Used to set "Other" content label options.*/
        selectOtherContentLabelOptions(index:number){
            this.contentLabelOptions[1].options[index].selected = !this.contentLabelOptions[1].options[index].selected;
            for (let i = 0; i < this.contentLabelOptions[1].options.length; i++) {
                if(i!=index) this.contentLabelOptions[1].options[i].selected = false;
            }
        },
        /**Deselects all the Content label options. */
        deselectAllContentLabelOptions(){
            for (let i = 0; i < this.contentLabelOptions[0].options.length; i++) {
                this.contentLabelOptions[0].options[i].selected = false;
            }
            for (let i = 0; i < this.contentLabelOptions[1].options.length; i++) {
                this.contentLabelOptions[1].options[i].selected = false;
            }
        },
        /**Discoveres all of the Content Labels that have been applied by the User (checks `contentLabelOptions`). */
        discoverSelectedContentLabels():string[]{
            let labelVals:string[] = [];
            for (let i = 0; i < this.contentLabelOptions[0].options.length; i++) {
                let val = this.contentLabelOptions[0].options[i].value;
                if(this.contentLabelOptions[0].options[i].selected &&  typeof val != 'undefined') labelVals.push(val);
            }
            for (let i = 0; i < this.contentLabelOptions[1].options.length; i++) {
                let val = this.contentLabelOptions[1].options[i].value;
                if(this.contentLabelOptions[1].options[i].selected &&  typeof val != 'undefined') labelVals.push(val);
            }
            return labelVals;
        },
        /**
         * Returns an array containing the alt text content for each media file selected
         * to be attached to the created Post.
         */
        getCurrentMediaAltText():string[]{
            return this.uploadedMedia.map(m => m.alt);
        },
        /**
         * Returns an array containing the aspect ratio for each media file selected
         * to be attached to the created Post.
         */
        getCurrentMediaAspectRatios():AspectRatio[]{
            return this.uploadedMedia.map(ar => ar.aspectRatio);
        },
        /**
         * Check to see if a specific media file is in the process of being uploaded to
         * Bluesky so that it can be attached to the Post being created.
         * @param media The media file selected to be attached to the Post being created.
         */
        checkIfMediaIsBeingUploaded(media:IUploadedFile){
            return !media.uploaded && media.uploadInProgress;
        },
        async testUploadImagePost(){
            if(this.isAwaitingPostConfirm) return;
            if(!AppState.checkIfLoggedIn('post')) return;
            if(this.files.length<1){
                console.log('Must have at least 1 image selected to upload.')
                return;
            }
            this.isAwaitingPostConfirm = true;
            this.selectedImage = -1;//Hide any open ALT text input
            //Upload any prepped images to Bluesky to get the Blob ref to attach to the Post
            let uploadedImages:ComAtprotoRepoUploadBlob.Response[] = [];
            for (let i = 0; i < this.files.length; i++) {
                this.uploadedMedia[i].uploadInProgress = true;
                await GetBrowsingAgent().uploadBlob(this.files[i])
                .then(res => {
                    uploadedImages.push(res);
                    this.uploadedMedia[i].uploaded = true;
                    this.uploadedMedia[i].uploadInProgress = true;
                })
                .finally(()=>{
                    this.uploadedMedia[i].uploadInProgress = false;
                });
            }
            //Create embed object containing Post's uploaded images
            let imageEmbedObject = CreateImageMediaObject(uploadedImages,this.getCurrentMediaAltText(),this.getCurrentMediaAspectRatios());
            if(typeof imageEmbedObject != 'undefined' ){
                let selectedLabels:string[] = this.discoverSelectedContentLabels();
                let newPostRecord:Record = {
                    $type:'app.bsky.feed.post',
                    text: this.postText,
                    langs:['en-US'],
                    embed:imageEmbedObject,
                    createdAt: new Date().toISOString()
                };
                //Add content labels if selected
                if(selectedLabels.length>0) newPostRecord = {...newPostRecord,labels:CreateContentLabelObjects(selectedLabels)};
                await CreateNewPost(newPostRecord,this.showsPostAfterCreation,this.threadGateOptions)
                .then(() =>{this.isAwaitingPostConfirm = false});
            }
        },
        async createNewPost(){
            if(this.isAwaitingPostConfirm) return;
            this.isAwaitingPostConfirm = true;
            switch (postDetails.currentPostAction) {
                case PostActions.Post:
                    await CreateNewPost({
                        $type:'app.bsky.feed.post',
                        text: this.postText,
                        langs:['en-US'],
                        createdAt: new Date().toISOString()
                    },this.showsPostAfterCreation)
                    .then(()=>{this.isAwaitingPostConfirm = false});
                    break;
                case PostActions.Reply:
                    if(isThreadViewPost(postDetails.currentPostThreadData)){
                        let root:ThreadViewPost = postDetails.getPostThreadRoot(postDetails.currentPostThreadData);
                        console.log(root);
                        if(isThreadViewPost(root)){
                            await CreateNewPost({
                                $type:'app.bsky.feed.post',
                                text: this.postText,
                                reply:{
                                    root:{
                                        uri:root.post.uri,
                                        cid:root.post.cid
                                    },
                                    parent:{
                                        uri:postDetails.currentPostData.uri,
                                        cid:postDetails.currentPostData.cid
                                    }
                                },
                                langs:['en-US'],
                                createdAt: new Date().toISOString(),
                            },this.showsPostAfterCreation)
                            .then(() =>{
                                AppState.updateReplyParentsInLists(postDetails.currentPostData.cid, postDetails.currentPostData.replyCount ? postDetails.currentPostData.replyCount : 0);
                                this.isAwaitingPostConfirm = false;
                            })
                        }
                    }
                    else{
                        toast.add({summary:'Error', detail:'Referenced post thread is not set/valid', severity:'error', group:'tr', life:3000})
                    }
                    break;
                case PostActions.Quote:
                    if(isThreadViewPost(postDetails.currentPostThreadData)){
                        let root:ThreadViewPost = postDetails.getPostThreadRoot(postDetails.currentPostThreadData);
                        console.log(root);
                        if(isThreadViewPost(root)){
                            await CreateNewPost({
                                $type:'app.bsky.feed.post',
                                text: this.postText,
                                langs:['en-US'],
                                createdAt: new Date().toISOString(),
                                embed:{
                                    $type:'app.bsky.embed.record',
                                    record:{
                                        uri:postDetails.currentPostData.uri,
                                        cid:postDetails.currentPostData.cid
                                    }
                                }
                            },this.showsPostAfterCreation)
                            .then(()=>{this.isAwaitingPostConfirm = false});
                        }
                    }
                    else{
                        toast.add({summary:'Error', detail:'Referenced post thread is not set/valid', severity:'error', group:'tr', life:3000})
                    }
                    break;
                default:
                    break;
            }
        }
    },
    computed:{
        charsRemaining(){
            return 300-this.postText.length;
        },
        charUsagePercent(){
            return ((this.postText.length/300)*100).toFixed(2);
        },
        canSubmitPost(){
            if((this.postText.length>0 || this.files.length>0) && !this.isAwaitingPostConfirm) return true;
            return false;
        },
        /**
         * Determines if the current Post data held by the component contains any images.
         */
        postContainsImage(){
            //This is the standalone/parent Post, not a QRT (Quote Retweet)
            if(!isViewRecord(this.postRef)){
                if(this.postRef?.embed && this.postRef.embed.images){
                    //Is a parent Post with image(s)
                    return true;
                }
                else if(this.postRef?.embed && AppBskyEmbedRecordWithMedia.isView(this.postRef.embed) && this.postRef.embed.media.images){
                    //Is a parent Post with image(s) and a QRT
                    return true;
                }
            }
            else{
                //This is a QRT
                if(this.postRef?.embeds && this.postRef.embeds.length>0 && this.postRef.embeds[0].images){
                    //Is a QRT with image(s)
                    return true;
                }
                else if(this.postRef?.embeds && this.postRef.embeds.length>0 && this.postRef.embeds[0].media &&
                    this.postRef.embeds[0].media.images && this.postRef.embeds[0].media.images.length>0){
                    //Is a QRT with image(s)
                    return true;
                }
            }
        },
        /**
         * Computes the ALT text validation message that needs to be displayed to the User.
         */
        getMediaAltTextState(){
            let numWithAlt = 0;
            let state = {text:'ALT text provided for each piece of uploaded media.',allProvided:true};
            for (let i = 0; i < this.uploadedMedia.length; i++) {
                if(this.uploadedMedia[i].alt.trim()!='') numWithAlt++;
            }
            if(numWithAlt == 0) state = {text:'No ALT text has been provided for uploaded content.',allProvided:false};
            else if(numWithAlt < this.uploadedMedia.length) state = {text:'Some images do not have ALT text provided.',allProvided:false};
            return [state];
        },
        /**
         * Determines if the current Post data held by the component contains any video.
         */
        postContainsVideo(){
            //This is the standalone/parent Post, not a QRT (Quote Retweet)
            if(!isViewRecord(this.postRef)){
                if(this.postRef?.embed && AppBskyEmbedVideo.isView(this.postRef.embed)){
                    //Is a parent Post with video
                    return true;
                }
                else if(this.postRef?.embed && AppBskyEmbedVideo.isView(this.postRef.embed.media)){
                    //Is a parent Post with video and a QRT
                    return true;
                }
            }
            else{
                //This is a QRT
                if(this.postRef?.embeds && AppBskyEmbedVideo.isView(this.postRef.embeds[0])){
                    //Is a QRT with video
                    return true;
                }
            }
            return false;
        },
        /**
         * Determines if the current Post data held by the component contains external embed content.
         */
        postContainsExternalEmbed(){
            //This is the standalone/parent Post, not a QRT (Quote Retweet)
            if(!isViewRecord(this.postRef)){
                if(this.postRef?.embed && AppBskyEmbedExternal.isView(this.postRef.embed)){
                    //Is a parent Post with external embed
                    return true;
                }
                else if(this.postRef?.embed && this.postRef.embed.media && AppBskyEmbedExternal.isView(this.postRef.embed.media)){
                    //Is a parent Post with external embed and a QRT
                    return true;
                }
            }
            else{
                //This is a QRT
                if(this.postRef?.embeds && AppBskyEmbedExternal.isView(this.postRef.embeds[0])){
                    //Is a QRT with external embed
                    return true;
                }
                else if(this.postRef?.embeds && this.postRef.embeds.length>0 && AppBskyEmbedExternal.isView(this.postRef.embeds[0].media)){
                    //Is a QRT with external embed (GIF) with Text ?? not sure
                    return true;
                }
            }
            return false;
        },
        /**
         * Method that figures out what object to pass on to the `ImageContainer` component
         * based on what type of data configuration the current Post has.
         * @returns `ViewImage[]` containing Post images.
         */
        getPostImages():ViewImage[]{
            //This is a standalone/parent Post, not a QRT (Quote Retweet)
            if(!isViewRecord(this.postRef)){
                if(this.postRef?.embed && this.postRef.embed.images){
                    //Is a parent Post with image(s)
                    return this.postRef.embed.images as ViewImage[];
                }
                else if(this.postRef?.embed && AppBskyEmbedRecordWithMedia.isView(this.postRef.embed) && this.postRef.embed.media.images){
                    //Is a parent Post with image(s) and a QRT
                    return this.postRef.embed.media.images as ViewImage[];
                }
            }
            else{
                //This is a QRT
                if(this.postRef?.embeds && this.postRef.embeds.length>0 && this.postRef.embeds[0].images){
                    //Is a QRT with image(s)
                    return this.postRef.embeds[0].images as ViewImage[];
                }
                else if(this.postRef?.embeds && this.postRef.embeds.length>0 && this.postRef.embeds[0].media &&
                    this.postRef.embeds[0].media.images){
                    //Is a QRT with image(s)
                    return this.postRef.embeds[0].media.images as ViewImage[];
                }
            }
            return [];
        },
        /**
         * Method that figures out what object to pass on to the `VideoContainer` component
         * based on what type of data configuration the current Post has.
         * @returns `AppBskyEmbedVideo.View` containing Video details.
         */
        getPostVideo():AppBskyEmbedVideo.View|undefined{
            if(!isViewRecord(this.postRef)){
                if(this.postRef?.embed && AppBskyEmbedVideo.isView(this.postRef.embed)){
                    //Is a parent Post with video
                    return this.postRef.embed;
                }
                else if(this.postRef?.embed && AppBskyEmbedVideo.isView(this.postRef.embed.media)){
                    //Is a parent Post with video and a QRT
                    return this.postRef.embed.media;
                }
            }
            else{
                //This is a QRT
                if(this.postRef?.embeds && AppBskyEmbedVideo.isView(this.postRef.embeds[0])){
                    //Is a QRT with video
                    return this.postRef.embeds[0];
                }
            }
            // return {cid:'',playlist:''};//Empty AppBskyEmbedVideo.View object, shouldn't ever be returned
            return undefined;
        },
        /**
         * Method that figures out what object to pass on to the `EmbedExternal` component
         * based on what type of data configuration the current Post has.
         * @returns `AppBskyEmbedExternal.View` containing external embed details.
         */
        getPostEmbed():AppBskyEmbedExternal.View|undefined{
            //This is the standalone/parent Post, not a QRT (Quote Retweet)
            if(!isViewRecord(this.postRef)){
                if(this.postRef?.embed && AppBskyEmbedExternal.isView(this.postRef.embed)){
                    //Is a parent Post with external embed
                    return this.postRef.embed;
                }
                else if(this.postRef?.embed && this.postRef.embed.media && AppBskyEmbedExternal.isView(this.postRef.embed.media)){
                    //Is a parent Post with external embed and a QRT
                    return this.postRef.embed.media;
                }
            }
            else{
                //This is a QRT
                if(this.postRef?.embeds && AppBskyEmbedExternal.isView(this.postRef.embeds[0])){
                    //Is a QRT with external embed
                    return this.postRef.embeds[0];
                }
                else if(this.postRef?.embeds && this.postRef.embeds.length>0 && AppBskyEmbedExternal.isView(this.postRef.embeds[0].media)){
                    //Is a QRT with external embed (GIF) with Text ?? not sure
                    return this.postRef?.embeds[0].media;
                }
            }
        },
        /**
         * Method that figures out where the text associated with a Post is held based
         * on what type of data configuration the current Post has.
         */
        getPostText():string{
            if(!isViewRecord(this.postRef)) return this.postRef?.record.text;
            else return this.postRef.value.text;
        },
        /**Indicates if file uploading should be disabled (4 files have already been selected). */
        uploadDisabled():boolean{
            return this.uploadedMedia.length>3;
        },
        /**Indicates if a WEBP file has been select to be uploaded. Used to display message
         * informing the User that animated WEBPs will be posted as a static image.
         */
        webpSelectedForUpload():boolean{
            let result = false;
            for (let i = 0; i < this.uploadedMedia.length; i++) {
                if(this.uploadedMedia[i].type.includes('webp')){
                    i = this.uploadedMedia.length;
                    result = true;
                }
            }
            return result;
        },
        /**
         * Returns boolean value indicating if any finely grained thread gate
         * options have been selected.
         */
        areAnySubEverythingThreadGatesSelected(){
            let anySelected = false;
            for (let i = 0; i < this.threadGateOptions[0].options.length; i++) {
                if(this.threadGateOptions[0].options[i].selected){
                    anySelected = true;
                    i = this.threadGateOptions[0].options.length;
                }
            }
            return anySelected;
        },
        /**
         * Generates message listing the currently set Thread Gate settings.
         */
        generatedThreadGateLabel():string{
            let message = 'Everybody can reply';
            let subChoices = [] as string[]
            if(this.threadGateOptions[1].selected) message = 'No replies allowed';
            else if(!this.threadGateOptions[0].selected){
                if(this.threadGateOptions[0].options[0].selected) subChoices.push('Mentioned');
                if(this.threadGateOptions[0].options[1].selected) subChoices.push('Followed');
                if(this.threadGateOptions[0].options[2].selected) subChoices.push('Following');
                message = ArrToString(subChoices) + ' Users can Reply';
            }
            return message;
        },
        /**
         * Generates message listing the currently set Content label for "Adult" content.
         */
        generatedAdultContentLabel():string{
            let message = '';
            if(this.contentLabelOptions[0].options[0].selected) message = 'Pictures meant for adults.';
            if(this.contentLabelOptions[0].options[1].selected) message = 'Artistic or non-erotic nudity.';
            if(this.contentLabelOptions[0].options[2].selected) message = 'Sexual activity or erotic nudity.';
            return message;
        },
        /**
         * Generates message listing the currently set Content label for "Other" content.
         */
        generatedOtherContentLabel():string{
            let message = '';
            if(this.contentLabelOptions[1].options[0].selected) message = 'Media that may be disturbing or inappropriate for some audiences.';
            return message;
        },
        /**Have any content labels been added for uploaded media? */
        haveLabelsBeenAdded():boolean{
            if(this.generatedAdultContentLabel != '' || this.generatedOtherContentLabel != '') return true;
            else return false;
        }
    },
    mounted() {
        this.$el.focus();
    },
    beforeUnmount() {
        postDetails.currentPostThreadData = {} as ThreadViewPost;
        postDetails.currentPostAction = PostActions.Post;
    },
})

function confirmClose(postContentExists:boolean,awaitingPosting:boolean){
    if(awaitingPosting){
        toast.add({summary:"Please wait", detail:`Post creation in progress, please wait`, severity:'info', group:'tr', life:1500});
        return;
    }
    if(postContentExists){
        AppState.showConfirmModal('Are you sure you want to discard this post?',close);
    }
    else{
        close();
    }
}

function close(){
    AppState.hideCreatePost();
}
</script>

<style scoped>
.postPlaceholder::before{
  color: #94a3b8;
  content: attr(placeholder);
  pointer-events: none;
}

.v-enter-active,
.v-leave-active {
    transition: opacity 0.3s ease, transform 0.4s ease, max-height 0.8s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(20px);
}
</style>