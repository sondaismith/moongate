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
        scrollTo(el: Element) {
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
            //The relative position of the Feed Display scroll bar in relation
            //to its full width.
            const fdRelScrollPos = Math.round((fdScrollPos ? 1 : fdScrollPos/(fdTotalWidth-fdViewWidth))*fdTotalWidth);
            // const fdRelScrollRatio = (fdTotalWidth-fdViewWidth);

            const elParentRight = el.parentNode.offsetLeft + el.parentNode.offsetWidth;
            const elParentLeft = el.parentNode.offsetLeft;

            const elParentCenter = elParentLeft + ((elParentRight-elParentLeft)/2);
            const elParentScrollWidth = el.parentElement.scrollWidth;

            // el.parentElement.scrollBy({top:0, left:fdScrollPos-fdRelScrollPos, behavior:"smooth"});
            const curWidthRatio = fdViewWidth/fdTotalWidth;
            const curPercentAlongScroll = fdScrollPos/(fdTotalWidth-fdViewWidth);
            const curPosAlongScroll = fdTotalWidth*curPercentAlongScroll;
            var reqMovement = (elCenter-curPosAlongScroll);
            reqMovement = (elCenter-elLeft-curPosAlongScroll)*(fdViewWidth/fdTotalWidth);

            const totalScrollableWidth = fdTotalWidth-fdViewWidth;
            const centerPosPercentAlongWidth = elCenter/fdTotalWidth;
            const targetScrollPos = totalScrollableWidth*centerPosPercentAlongWidth;

            el.parentElement.scrollBy({top:0, left:targetScrollPos-fdScrollPos, behavior:"smooth"});

            // el.parentElement.scrollBy({top:0, left:reqMovement, behavior:"smooth"});
            // if(elCenter > fdRelScrollPos){//scroll right
            //     el.parentElement.scrollBy({top:0, left:elCenter-fdRelScrollPos, behavior:"smooth"});
            // }
            // else if(elCenter < fdRelScrollPos){
            //     el.parentElement.scrollBy({top:0, left:elCenter-fdRelScrollPos, behavior:"smooth"});
            // }

            //check if right side of the element is not in view
            // if (elRight > elParentRight + el.parentNode.scrollLeft) {
            //     // el.parentNode.scrollLeft = elRight - elParentRight;
            //     el.parentElement.scrollBy({top:0, left:reqMovement, behavior:"smooth"});
            // }

            // // check if left side of the element is not in view
            // else if (elLeft < elParentLeft + el.parentNode.scrollLeft) {
            //     // el.parentNode.scrollLeft = elLeft - elParentLeft;
            //     el.parentElement.scrollBy({top:0, left:reqMovement, behavior:"smooth"});
            // }
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