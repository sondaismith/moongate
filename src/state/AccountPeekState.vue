<script lang="ts">
import { reactive } from 'vue'

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
    lastMouseEvent:new MouseEvent('click'),
    /**
     * Boolean indicating if the `AccountPeek` is waiting for a data response
     * from the Bluesky API.
     */
    awaitingAPIResponse:false,
    /**
     * Method that fires when user cursor enters specific element.
     * Used to initially display `AccountPeek` component. Also used
     * to keep component displaying (e.g. moving between PFP and the
     * AccountPeek component).
     * @param event MouseEvent from when mouse enters element area.
     */
    waitBeforePeekingUser(event:MouseEvent){
        //If the AccountPeek is already being displayed, we only want to
        //update the lastMouseEvent event and its the Peek position if we
        //move over a new PFP.
        if((event.target as HTMLElement).id != 'account-peek' && this.lastMouseEvent.target !== event.target){
            this.lastMouseEvent = event;
            console.log('updating lastMouseEvent');
            //re-display AccountPeek after previous has hidden itself - take note
            //of animation/transition times
            setTimeout(() => {
                this.isUserPeeking = true;
                var peek = document.getElementById('account-peek');//important
                setTimeout(() => {
                    let pos = this.getSafePeekPosition(event);
                    peek.style.top = pos.y+'px';
                    peek.style.left = pos.x+'px';
                }, 2);
            }, this.delayPeekHide*2);
        }
        else{
            clearTimeout(this.pfpExit);//Stop leaving event
            //update the position if Peek is not visible or this is a new PFP
            if(!this.isUserPeeking){
                this.pfpEnter = setTimeout(() => {
                    this.isUserPeeking = true;
                    console.log('peek-a-boo');
                    var peek = document.getElementById('account-peek');//important
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
            // if(peek) peek.style.top = '-1000px';
            console.log('left early');
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
        var menu = document.getElementById('account-peek');//important
        var appViewport = document.getElementById('app-viewport');
        if(!menu || !appViewport) return; //do not continue if we do not find elements
        var menuHeight = menu.clientHeight;
        var menuWidth = menu.clientWidth;
        var viewportHeight = appViewport.offsetHeight;
        var viewportWidth = appViewport.offsetWidth;
        var menuSafePos = {x:0,y:0};
        menuSafePos = {x:event.clientX, y:event.clientY};
        var xTarget = menuSafePos.x;
        var yTarget = menuSafePos.y;
        var menuYClearence = viewportHeight - (menuHeight+yTarget);
        var menuXClearence = viewportWidth - (menuWidth+xTarget);

        if(menuYClearence < 0){
            yTarget = event.clientY-menuHeight;
        }
        if(menuXClearence < 0){
            xTarget = event.clientX-menuWidth;
        }
        menuSafePos = {x:xTarget, y:yTarget};
        return menuSafePos;
    }
})
</script>