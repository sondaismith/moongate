<template>
    <a @click="highlightFeed" class="group cursor-pointer relative flex justify-center rounded-xl drop-shadow-md bg-blue-200 border border-blue-200 transition-[border] hover:border-gray-800 h-10">
        <i-mingcute:home-4-line v-if="type === 'home'" class="h-full text-2xl text-slate-800"/>
        <i-mingcute:settings-2-line v-else-if="type === 'settings'" class="h-full text-2xl text-slate-800"/>
        <i-mdi:playlist-add v-else-if="type === 'add'" class="h-full text-2xl text-slate-800"/>
        <i-mdi:paint-outline v-else-if="type === 'art'" class="h-full text-2xl text-slate-800"/>
        <i-mdi:newspaper-variant-multiple v-else-if="type === 'news'" class="h-full text-2xl text-slate-800"/>
        <i-mingcute:group-3-fill v-else-if="type === 'friends'" class="h-full text-2xl text-slate-800"/>
        <span
            class="invisible absolute whitespace-nowrap start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible"
        >
            {{ tooltip }}
        </span>
        <UnreadMsgCount :unreadCount="newPosts"/>
    </a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import UnreadMsgCount from '../Decorations/UnreadMsgCount.vue';

export default defineComponent({
    props: {
        feedId: String,
        tooltip: String,
        type: {type: String, required: true},
        newPosts: Number,
    },
    methods:{
        highlightFeed(){
            //Only if it is related to a FeedDisplay
            if(this.feedId){
                var el = document.getElementById(this.feedId);
                // el?.scrollIntoView
                // if(el) el.style.backgroundColor = "red";
                this.scrollTo(el);
                console.log(el);
            }
        },
        scrollTo(el: HTMLElement) {
            const elRight = el.offsetLeft + el.offsetWidth;
            const elLeft = el.offsetLeft;

            //Center position of element we want to center on screen
            const elCenter = elLeft + ((elRight-elLeft)/2);
            //Width of element we want to scroll to
            const elWidth = elRight-elLeft;
            //The full width of the Feed Display container
            const fdTotalWidth = el.parentElement.scrollWidth;
            //The viewable width of the Feed Display container
            const fdViewWidth = el.parentElement.offsetWidth;
            //The current position of the scroll bar for the Feed Display container
            const fdScrollPos = el.parentElement.scrollLeft;
            const scrollWidth = fdTotalWidth - fdViewWidth;

            //Padding of the element we're trying to center (not used atm).
            const elPadLeft = getComputedStyle(el).paddingLeft;
            const elPadRight = getComputedStyle(el).paddingRight;

            const elParentRight = el.parentNode.offsetLeft + el.parentNode.offsetWidth;
            const elParentLeft = el.parentNode.offsetLeft;

            //Not used, kept just in case
            const isEleLeftReachable = (elCenter - (elWidth/2)) > 0;
            const isEleRightReachable = (elCenter + (elWidth/2)) < fdTotalWidth;

            //The "-2" on the (elParentLeft/2)-2) is for the padding-right
            //on the FeedColumn component. Haven't got a automatic computed solution
            //yet.
            const target = ((elCenter + ((fdViewWidth/2) - (elParentLeft/2)-2)) - fdTotalWidth + scrollWidth);
            el.parentElement.scrollBy({top:0, left:target-fdScrollPos, behavior:"smooth"});
        }
    },
    setup (props) {
        props.feedId,
        props.type,
        props.tooltip,
        props.newPosts
    }
})
</script>

<style scoped>

</style>