<template>
    <a :onmouseenter="displayButtonTooltip" :onmouseleave="hideButtonTooltip"
        @click="highlightFeed" class="group cursor-pointer relative flex justify-center
        rounded-xl drop-shadow-md bg-blue-200 border border-blue-200 transition-[border]
        hover:border-gray-800 h-10">
        <i-mingcute:home-4-line v-if="type === 'home'" class="h-full text-2xl text-slate-800"/>
        <i-mingcute:settings-2-line v-else-if="type === 'settings'" class="h-full text-2xl text-slate-800"/>
        <i-mdi:playlist-add v-else-if="type === 'add'" class="h-full text-2xl text-slate-800"/>
        <i-mdi:playlist-remove v-else-if="type === 'remove'" class="h-full text-2xl text-slate-800"/>
        <i-mdi:paint-outline v-else-if="type === 'art'" class="h-full text-2xl text-slate-800"/>
        <i-mdi:newspaper-variant-multiple v-else-if="type === 'news'" class="h-full text-2xl text-slate-800"/>
        <i-mingcute:group-3-fill v-else-if="type === 'friends'" class="h-full text-2xl text-slate-800"/>
        <!-- <span
            class="invisible absolute whitespace-nowrap start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible"
        >
            {{ tooltip }}
        </span> -->
        <UnreadMsgCount :unreadCount="newPosts"/>
    </a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/**
 * Method that ensures that the target position the FeedColumn display wants to
 * is valid and can actually be reached. This should actually be the entire calculation
 * process, but because I don't know how to test DOM elements we just have the modulo.
 * @param target The calculated x-axis target value.
 */
export function calculateValidTargetPos(target:number):number{
    return Math.floor(target);
}

export default defineComponent({
    data(){
        return{
            isScrolling: false
        }
    },
    props: {
        feedId: String,
        tooltip: String,
        type: {type: String, required: true},
        newPosts: Number,
    },
    methods:{
        displayButtonTooltip(event:PointerEvent){
            var tooltip = document.getElementById('navbar-tooltip');
            var button = (event.currentTarget as HTMLElement);
            //If the element below does not have a scroll, or cannot be found
            //it should fail gracefully and still work correctly.
            var containerScrollPos = button.parentElement?.parentElement?.scrollTop;
            var buttonCenter = button.offsetTop - containerScrollPos + button.offsetHeight/2;
            if(tooltip){
                tooltip.style.top = buttonCenter+'px';
                if(this.$props.tooltip){
                    tooltip.textContent = this.$props.tooltip;
                }
            }
        },
        hideButtonTooltip(event:PointerEvent){
            var tooltip = document.getElementById('navbar-tooltip');
            if(tooltip){
                tooltip.style.top = '-200px';
                tooltip.textContent = "";
            }
        },
        startScrolling(){
            this.isScrolling = true;
        },
        stopScrolling(){
            this.isScrolling = false;
        },
        /**
         * Method that highlights a specific `FeedColumn` by scrolling it into view
         * and highlighting with a "flash".
         */
        highlightFeed(){
            //Only if it is related to a FeedDisplay and we are not already scrolling
            if(this.feedId && !this.isScrolling){
                var el = document.getElementById(this.feedId);
                if(el){
                    this.startScrolling();
                    this.scrollTo(el);
                }
                // console.log(el);
            }
            // else{console.log("still scrolling")} //DEBUG
        },
        /**
         * Function used to "flash" highlight a FeedColumn
         * component.
         */
        flashElement(el : HTMLElement){
            setTimeout(() => {
                el.querySelectorAll("[data-test='feedColumn-highlight']")[0].classList.add('feed-highlight');
            }, 300);
            setTimeout(() => {
                el.querySelectorAll("[data-test='feedColumn-highlight']")[0].classList.remove('feed-highlight');
                //Allow highlight to happen again after "flash" completes.
                this.stopScrolling();
            }, 1050);
        },
        /**
         * Function used to determine if the target scroll position
         * has been reached, before it flashes the target element.
         * Has a timeout function to prevent waiting indefinitely.
         */
        isScrollByFinished(el : HTMLElement,targetPos : number){
            const checkIfScrollToIsFinished = setInterval(() => {
                //Make sure we're accessing the same element as set up in
                //scrollTo() so the flash doesn't happen until we reach the target
                if (el.parentElement?.parentElement.scrollLeft === targetPos ||
                el.parentElement?.parentElement.scrollLeft === 0 ||
                el.parentElement?.parentElement.scrollLeft === el.parentElement?.parentElement.scrollWidth - el.parentElement?.parentElement.offsetWidth) {
                    this.flashElement(el);
                    clearInterval(checkIfScrollToIsFinished);
                    clearTimeout(preventLoop);
                }
            }, 100);
            /**
             * Timeout function for isScrollByFinished.
             */
            const preventLoop = setTimeout(() => {
                this.flashElement(el);
                clearInterval(checkIfScrollToIsFinished);
            }, 6000);
        },
        /**
         * Function that attempts to scroll a specific element into view.
         * @param el The element we are trying to center in the viewport/scroll to.
         */
        scrollTo(el: HTMLElement) {
            const elRight = el.offsetLeft + el.offsetWidth;
            const elLeft = el.offsetLeft;

            const scrollContainer = el.parentElement?.parentElement;

            //Center position of element we want to center on screen
            const elCenter = elLeft + ((elRight-elLeft)/2);
            //Width of element we want to scroll to
            const elWidth = elRight-elLeft;
            //The left offset of the Feed Display container - effectively the sidebar width
            const fdOffsetLeft = scrollContainer.offsetLeft;
            //The full width of the Feed Display container
            const fdTotalWidth = scrollContainer.scrollWidth;
            //The viewable width of the Feed Display container
            const fdViewWidth = scrollContainer.offsetWidth;
            //The current position of the scroll bar for the Feed Display container
            const fdScrollPos = scrollContainer.scrollLeft;
            /**
             * The scrollbar length.
             * */
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
            const target = calculateValidTargetPos(((elCenter + ((fdViewWidth/2) - elParentLeft - 2)) - fdTotalWidth + scrollWidth));

            //If the scroll ends up breaking, check that the correct element is being accessed
            scrollContainer.scrollBy({top:0, left:target-fdScrollPos, behavior:"smooth"});

            this.isScrollByFinished(el, target);
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