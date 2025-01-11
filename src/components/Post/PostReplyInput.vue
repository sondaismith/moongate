<template>
    <div class="flex flex-col rounded bg-slate-900">
        <span class="block w-full py-2 pl-2 rounded bg-slate-900 overflow-hidden
        max-h-36 postPlaceholder" role="text" placeholder="Post reply..."
        contenteditable @focusin="postInputFocusGained" @focusout="postInputFocusLost"/>
        <div id="post-buttons" class="hide flex justify-between px-1 py-2 h-11">
            <div class="flex space-x-1 overflow-hidden">
                <div v-for="icon in postButtonIcons" class="flex rounded-full aspect-square h-7 items-center justify-center cursor-pointer bg-blue-900 hover:bg-blue-600">
                    <component :is="icon" class="h-full"/>
                </div>
            </div>
            <div class="flex rounded-full px-4 items-center h-full overflow-hidden bg-slate-400 cursor-pointer hover:bg-slate-300 text-slate-900 font-semibold text-nowrap">Post</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, FunctionalComponent } from 'vue'

import MdiImageOutline from '~icons/mdi/image-outline';
import MdiFileGifBox from '~icons/mdi/file-gif-box';
import MdiLocation from '~icons/mdi/location';

var postButtonIcons : FunctionalComponent[] = [
    MdiImageOutline,
    MdiFileGifBox,
    MdiLocation
]

export default defineComponent({
    methods:{
        /**
         * Method used to remove post message placeholder when input is in focus.
         */
        postInputFocusGained(event:FocusEvent){
            (event.target as HTMLElement).classList.remove('postPlaceholder');
            document.getElementById('post-buttons')?.classList.remove('hide');
        },
        /**
         * Method used to add post message placeholder when input loses focus and
         * text is empty.
         */
        postInputFocusLost(event:FocusEvent){
            if ((event.target as HTMLElement).textContent == ""){
                //textbox empty
                (event.target as HTMLElement).classList.add('postPlaceholder');
                document.getElementById('post-buttons')?.classList.add('hide');
            }
        }
    },
    data(){
        return{
            postButtonIcons
        }
    },
    setup () {
        return {}
    }
})
</script>

<style scoped>
    #post-buttons{
        transition: height 0.2s ease;
    }
    #post-buttons.hide{
        height: 0;
        padding-top: 0;
        padding-bottom: 0;
    }
</style>