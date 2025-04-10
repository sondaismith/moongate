<script lang="ts">
import { reactive } from 'vue'
import { getUserProfile } from '../lib/api/User.vue';
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { postDetails } from './PostDetails.vue';
import { toast } from './AppState.vue';
import { HandleAPIError } from '../helpers/errors';

export const AccountPeekState = reactive({
    /**Indicates if `AccountPeek` component is visible. */
    isUserPeeking: false,
    /**Toggles `isUserPeeking` variable value between true and false. */
    ToggleUserPeeking(){
        this.isUserPeeking = !this.isUserPeeking;
    },
    /**The time in milliseconds before the AccountPeek will be shown. */
    delayPeekShow:600,
    /**The time in milliseconds before the AccountPeek will be hidden. */
    delayPeekHide:200,
    /**
     * Used to hold reference to Timeout object relating to entering element
     * that will display `AccountPeek` component.
     */
    pfpEnter:0,
    /**
     * Used to hold reference to Timeout object relating to exiting element
     * that will hide `AccountPeek` component.
     */
    pfpExit:0,
    /**
     * MouseEvent used to determine when a different User's "account peek" has
     * been requested. Updated in `waitBeforePeekingUser()`.*/
    lastMouseEvent:new MouseEvent('click'),
    /**
     * Boolean indicating if the `AccountPeek` is waiting for a data response
     * from the Bluesky API.
     */
    awaitingAPIResponse:false,
    profileData: {} as ProfileViewDetailed,
    /**
     * Method that fires when user cursor enters specific element.
     * Used to initially display `AccountPeek` component. Also used
     * to keep component displaying (e.g. moving between PFP and the
     * AccountPeek component).
     * @param event MouseEvent from when mouse enters element area.
     * @param authorDid The DID of the User you wish to peek the info of.
     */
    waitBeforePeekingUser(event:MouseEvent,authorDid:string){
        if(!event || !authorDid || authorDid.trim() == ''){
            console.log('ERROR: Invalid Request - No MouseEvent or DID has been passed to method.');
            return;
        }
        //Runs on first PFP hover/new PFP hover. New PFP hover is determined by checking
        //`lastMouseEvent.target`. If that changes, update `lastMouseEvent`.
        if((event.target as HTMLElement).id != 'account-peek' && this.lastMouseEvent.target !== event.target){
            this.lastMouseEvent = event;
            //re-display AccountPeek after previous has hidden itself - take note
            //of animation/transition times
            setTimeout(async() => {
                this.isUserPeeking = true;
                var peek = document.getElementById('account-peek');//get peek element
                //delay to position peek in "awaiting data" state
                await setTimeout(() => {
                    if(peek){
                        let pos = this.getSafePeekPosition(event);
                        peek.style.top = pos.y+'px';
                        peek.style.left = pos.x+'px';
                        //If a particular modal/component is already covering the screen
                        if(postDetails.isFocusVisible) peek.style.zIndex = '20';
                    }
                }, 2);
                if(this.profileData && this.profileData.did!=authorDid){
                    await this.getProfileData(authorDid)
                    .catch((err) => console.log(err));
                }
                //delay to allow menu dimensions to update after being filled with items
                setTimeout(() => {
                    if(peek){
                        let pos = this.getSafePeekPosition(event);
                        peek.style.top = pos.y+'px';
                        peek.style.left = pos.x+'px';
                        //If a particular modal/component is already covering the screen
                        if(postDetails.isFocusVisible) peek.style.zIndex = '20';
                    }
                }, 2);
            }, this.delayPeekHide*2);
        }
        //The PFP of the same user is hovered over - data will not be fetched, so no need to
        //position `awaiting data` version of peek component
        else{
            clearTimeout(this.pfpExit);//Stop mouse leaving event
            //update the position if Peek is not visible - prevents unnecessary call
            //on `account-peek` mouseenter
            if(!this.isUserPeeking){
                this.pfpEnter = setTimeout(async() => {
                    this.isUserPeeking = true;//display peek
                    var peek = document.getElementById('account-peek');//get peek element
                    //Check if profile data is already stored in cache (FUTURE)
                    //If cache data is old, get latest profile data
                    // if(this.profileData && this.profileData.did!=authorDid) await this.getProfileData(authorDid);
                    //delay to allow menu dimensions to update after being filled with items
                    setTimeout(() => {
                        if(peek){
                            let pos = this.getSafePeekPosition(event);
                            peek.style.top = pos.y+'px';
                            peek.style.left = pos.x+'px';
                        }
                    }, 2);
                }, this.delayPeekShow)
            }
        }
    },
    /**
     * Method that fires when user cursor leaves specific element.
     * Used to hide `AccountPeek` component.
     */
    cancelUserPeek(){
        clearTimeout(this.pfpEnter);//Stop enter event
        this.pfpExit = setTimeout(() => {
            var peek = document.getElementById('account-peek');//important
            this.isUserPeeking = false;
            if(peek) peek.style.top = '-1000px';
            // this.awaitingAPIResponse = false;//Stop waiting for API response
        }, this.delayPeekHide);
    },
    /**
     * Method used to prevent `AccountPeek` from disappearing.
     * Used on `AccountPeek`'s `mouseenter` to catch movement between
     * PFP and Peek control.
     */
    keepPeekAlive(){
        clearTimeout(this.pfpExit);//Stop leaving event
    },
    /**
     * Method used to ensure `AccountPeek` component will not be displayed
     * extending beyond the app viewport bounds.
     * @param event MouseEvent from when mouse enters element area.
     */
    getSafePeekPosition(event:MouseEvent){
        var peek = document.getElementById('account-peek');//important
        var appViewport = document.getElementById('app-viewport');
        if(!peek || !appViewport) return; //do not continue if we do not find elements
        var peekHeight = peek.offsetHeight;
        var peekWidth = peek.offsetWidth;
        var viewportHeight = appViewport.offsetHeight;
        var viewportWidth = appViewport.offsetWidth;
        var peekSafePos = {x:0,y:0};
        var trigger = (event.target as HTMLElement).getBoundingClientRect();
        var triggerBottomLeft = {x:trigger.left, y: trigger.top+trigger.height};
        peekSafePos = {x:triggerBottomLeft.x, y:triggerBottomLeft.y};
        var xTarget = peekSafePos.x;
        var yTarget = peekSafePos.y;
        var peekYClearence = viewportHeight - (peekHeight+yTarget);
        var peekXClearence = viewportWidth - (peekWidth+xTarget);

        if(peekYClearence < 0){
            yTarget = trigger.y-peekHeight;
        }
        if(peekXClearence < 0){
            xTarget = trigger.x-peekWidth;
        }
        peekSafePos = {x:xTarget, y:yTarget};
        return peekSafePos;
    },
    /**
     * Method used to get the User data to display in the `AccountPeek` component.
     * @param authorDid The DID of the User's data you wish to request.
     */
    async getProfileData(authorDid:string){
        this.awaitingAPIResponse = true;
        //Get profile data, then store it in the local variable +
        //place a copy in the cache
        await getUserProfile(authorDid)
        .then(res => this.profileData = res.data)
        .catch(err => {
            toast.add(HandleAPIError(err, 'Error getting ProfilePeek data'));
        });
        this.awaitingAPIResponse = false;
        // console.log(this.profileData);//DEBUG
    }
})
</script>