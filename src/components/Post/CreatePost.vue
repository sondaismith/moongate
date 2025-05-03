<template>
    <div class="absolute z-10 flex w-full h-full">
        <div @click="confirmClose(canSubmitPost)" class="absolute w-full h-full bg-slate-800/60"/>
        <div class="relative z-20 rounded-lg flex flex-col w-3/5 bg-slate-800 border
        border-slate-600 p-3 m-auto gap-3">
            <div class="flex items-center justify-between">
                <div @click="confirmClose(canSubmitPost)" class="font-bold text-sky-500 hover:text-sky-300 cursor-pointer">Cancel</div>
                <PillButton @click="createNewPost" class="transition-colors px-4 py-1 bg-sky-500" :class="!canSubmitPost ? '!bg-gray-400 text-gray-500 !cursor-default' : ''">Post</PillButton>
            </div>
            <div class="flex gap-2">
                <div class="rounded-full bg-slate-300 aspect-square
                border box-content size-12 bg-contain"
                :style="{'background-image' : 'url('+avatar+')'}">
                    <i-mingcute:butterfly-2-fill v-if="!avatar" class="text-2xl h-full w-full p-1 text-blue-600"/>
                </div>
                <textarea id="post-textarea" role="text" placeholder="What do you want to say?" contenteditable
                @input="limitChars" v-model="postText"
                class="block rounded p-2 bg-slate-900 w-full postPlaceholder"/>
                <!-- <span role="text" placeholder="What do you want to say?" contenteditable
                @focusin="postInputFocusGained" @focusout="postInputFocusLost"
                @input="limitChars"
                class="block rounded p-2 bg-slate-900 w-full postPlaceholder"/> -->
            </div>
            <div class="flex rounded bg-slate-700 p-2 items-center self-start gap-1 text-sm">
                <i-mingcute:world-2-line/>
                <div>Anybody can interact</div>
            </div>
            <div class="flex items-center">
                <div class="flex gap-1">
                    <div v-for="option in mediaTypes" class="flex rounded p-2 hover:bg-slate-700
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
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PillButton from '../Utilities/PillButton.vue';
import MdiInsertPhoto from '~icons/mdi/insert-photo';
import MdiFilmstripBoxMultiple from '~icons/mdi/filmstrip-box-multiple';
import MdiFileGifBox from '~icons/mdi/file-gif-box';
import { AppState } from '../../state/AppState.vue';
import { CreateNewPost } from '../../lib/api/Post.vue';

export default defineComponent({
    props:{
        avatar: String,
    },
    data(){
        return{
            postText:'',
            mediaTypes:[
                {label:'photo', icon:MdiInsertPhoto},
                {label:'video', icon:MdiFilmstripBoxMultiple},
                {label:'gif', icon:MdiFileGifBox},
            ],
            // canSubmitPost:false,
            confirmClose,
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
        createNewPost(){
            CreateNewPost({
                text: this.postText,
                createdAt: new Date().toISOString()
            });
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
            if(this.postText.length>0) return true;
            return false;
        }
    }
})

function confirmClose(postContentExists:boolean){
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
</style>