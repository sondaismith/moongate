<template>
    <div :data-testid="`feedButton-${feedDescription.feedId}`" class="relative cursor-pointer" :onmouseenter="displayButtonTooltip" :onmouseleave="hideButtonTooltip"
    @click="highlightFeed" @contextmenu="(e) => showFeedOptionsMenu(e,getFeedSourceHandle)">
        <button class="group relative flex justify-center items-center
            rounded-xl drop-shadow-md bg-feedBtn border border-outline outline-none transition-[border]
            hover:border-secondary aspect-square !w-full p-0.5 overflow-hidden">
            <div class="w-full h-full z-[1] group-focus-visible:bg-black/60 border-2 rounded-lg transition-[border] border-transparent
            group-focus-visible:border-feedtypeBtnFocusHighlight"></div>
            <FeedIcon v-if="!hasAvatar" :icon="feedDescription.feedIcon"
            class="absolute h-full text-2xl text-primary select-none pointer-events-none"/>
            <div v-else class="absolute flex bg-blueskyBlue w-full h-full items-centers justify-centers">
                <img v-if="feedDescription.feedAvatar.trim() != ''" :src="feedDescription.feedAvatar" class="h-full w-full object-contain" :class="{'blur scale-150' : feedDescription.containsSensitiveContent && AppSettingsState.Settings.spoilerImagesContainingSensitiveContent}"/>
                <i-mingcute:radar-2-fill v-else class="text-white h-full w-full p-1"/>
            </div>
            <i-mingcute:loading-fill v-show="awaitingPFPRequest"
            class="absolute text-primary spinner self-center select-none pointer-events-none"/>
        </button>
        <UnreadMsgCount :data-testid="`unreadMsgCount-${feedDescription.feedIcon}`" :unreadCount="feedDescription.newPosts" :isAwaitingData="isAwaitingNewPostData" class="select-none"/>
    </div>
</template>

<script lang="ts">
import MingcuteProfileFill from '~icons/mingcute/profile-fill';
import MingcuteEdit4Line from '~icons/mingcute/edit-4-line';
import SolarTrashBinTrashBold from '~icons/solar/trash-bin-trash-bold';

import { defineComponent, PropType } from 'vue';
import { FeedState, RemoveFeed, UpdateSelectedFeed } from '../../state/FeedList.vue';
import { getUserProfile } from '../../lib/api/User.vue';
import { AppState, toast } from '../../state/AppState.vue';
import { HandleAPIError } from '../../helpers/errors';
import { OptionsMenuState } from '../../state/OptionsMenuState.vue';
import { IOptionMenuItem, ItemType } from '../Utilities/OptionsMenu.vue';
import { IFeedDescription } from '../../interfaces/FeedInterfaces';
import { FeedEnums } from '../../enums/FeedEnums';
import { router } from '../../main';
import { BroadcastChannelTarget, BroadcastObject, toRawDeep } from '../../types/BroadcastChannelTypes';
import { AppSettingsState } from '../../state/AppSettingsState.vue';

/**
 * Method that ensures that the target position the FeedColumn display wants to
 * is valid and can actually be reached. This should actually be the entire calculation
 * process, but because I don't know how to test DOM elements we just have the modulo.
 * @param target The calculated x-axis target value.
 */
export function calculateValidTargetPos(target:number):number{
    return Math.floor(target);
}
/**
 * Used to update an already created Feed. Displays
 * the Feed Edit modal.
 */
function UpdateFeed(){
    console.log(`DEBUG: this is FeedId: ${FeedState.selectedFeed}`);
    if(!AppState.checkIfCanBrowse()) return;
    AppState.isUpdatingFeed = true;
    //Hide menu when edit modal opens
    // FeedState.isFeedOptionMenuVisible = false;
    OptionsMenuState.hideOptionMenu();
}
/**
 * Used to Delete an existing Feed. Currently does
 * NOT ask for confirmation.
 */
function DeleteFeed(){
    RemoveFeed(FeedState.selectedFeed);
    let feedSyncMessage:BroadcastObject = {target:BroadcastChannelTarget.FeedColumn, data:structuredClone(toRawDeep(FeedState.FeedList))};
    AppState.SendAppSyncMessage(feedSyncMessage);
    OptionsMenuState.hideOptionMenu();
}
/**
 * Displays specified User Profile in `UserFocusModal`.
 * @param userHandle Handle of the User Profile to display.
 */
function ShowUserProfile(userHandle:string){
    if(userHandle.trim() != '')
        // AppState.ShowUserFocusModal(userHandle);
        router.push(`/profile/${userHandle}`);
}

export default defineComponent({
    data(){
        return{
            AppSettingsState,
            isScrolling: false,
            userPfp:'',
            awaitingPFPRequest:false,
        }
    },
    props: {
        tooltip: String,
        feedDescription:{
            type:Object as PropType<IFeedDescription>,
            required:true
        },
        /**Is the data for the associated Feed still be loaded? */
        isAwaitingNewPostData:{
            type:Boolean,
            required:true
        },
        /**
         * Indicates if any `FeedButton` is being dragged when this one was "clicked".
         * Used to prevent click when button is being dropped.
         */
        buttonBeingDragged:Boolean
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
            //Also if we are not dragging the button
            if(this.feedDescription.feedId && !this.isScrolling && !this.buttonBeingDragged){
                var el = document.getElementById(this.feedDescription.feedId);
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
        },
        /**
         * Used to display the options available to perform on an
         * existing Feed. Current options are Edit and Delete.
         * @param e The MouseEvent fired after context clicking the FeedButton.
         */
        showFeedOptionsMenu(e:MouseEvent, feedSourceHandle:string){
            e.preventDefault();
            if(this.feedDescription.feedId){
                UpdateSelectedFeed(this.feedDescription.feedId);
                let menuOptions = [] as IOptionMenuItem[];
                if(typeof feedSourceHandle != "undefined" && feedSourceHandle.trim() != '' && this.feedDescription.feedType == FeedEnums.Types.User){
                    menuOptions.push({Icon:MingcuteProfileFill,Label:'View Profile',Action:function(){ShowUserProfile(feedSourceHandle)},Type:ItemType.Option});
                    menuOptions.push({Icon:MingcuteProfileFill,Label:'',Action:()=>{},Type:ItemType.Splitter});
                }
                //Need to update "feed edit" functionality, so removing this for now.
                // if(this.feedDescription.feedType != FeedEnums.Types.FeedGenerator){
                //     menuOptions.push({Icon:MingcuteEdit4Line,Label:'Edit Feed',Action:function(){UpdateFeed()}})
                // }
                menuOptions = [...menuOptions,
                    {Icon:SolarTrashBinTrashBold,Label:'Remove Feed',Action:function(){DeleteFeed()},Type:ItemType.Option,LabelStyle:'text-red-500'} as IOptionMenuItem,
                ] as IOptionMenuItem[]
                OptionsMenuState.currentMenuItems = menuOptions;
                OptionsMenuState.showOptionMenu(e);
            }
        },
        /**
         * Method used to get the Avatar/PFP of the User associated with a
         * User Feed `FeedButton`.
         */
        // async GetUserFeedPFP(){
        //     if(this.userDid && this.userDid.trim() != ''){
        //         this.awaitingPFPRequest = true
        //         await getUserProfile(this.userDid)
        //         .then(res => {
        //             this.userPfp = res.data.avatar ? res.data.avatar : '';
        //             this.awaitingPFPRequest = false;
        //         })
        //         .catch(err => toast.add(HandleAPIError(err, 'Error getting UserButton profile avatar')));
        //     }
        // }
    },
    computed:{
        hasAvatar(){
            return this.feedDescription.feedType == FeedEnums.Types.User || this.feedDescription.feedType == FeedEnums.Types.FeedGenerator;
        },
        getFeedSourceDID(){
            return this.feedDescription.feedType == FeedEnums.Types.User ? this.feedDescription.feedSourceDID : '';
        },
        getFeedSourceHandle(){
            return this.feedDescription.feedType == FeedEnums.Types.User ? this.feedDescription.feedHandle : '';
        }
    },
    watch:{
        /**
         * If the userDid changes, update the displayed Icon/PFP.
         */
        // userDid(newDid:string, oldDid:string){
        //     if(newDid.trim() != '') this.GetUserFeedPFP();
        //     else this.userPfp ='';
        // }
    },
    created(){
        // this.GetUserFeedPFP();
    }
})
</script>

<style scoped>
.button-size{
    width: 2.5rem;
    height: 2.5rem;
}
</style>