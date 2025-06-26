<script lang="ts">
import { reactive } from 'vue'
import { IOptionMenuItem } from '../components/Utilities/OptionsMenu.vue';

export default{
    name:"OptionsMenuState"
}

export const OptionsMenuState = reactive({
    /**Determines if the Options Menu is visible or not. */
    isOptionsMenuVisible: false,
    /**Defines the list of menu options that will be displayed. */
    currentMenuItems: [] as IOptionMenuItem[],
    /**Shows the Options Menu. */
    showOptionMenu(event:MouseEvent){
        this.isOptionsMenuVisible = true;
        var menu = document.getElementById('options-btn-menu');//important
        //delay to allow menu dimensions to update after being filled with items
        setTimeout(() => {
            if(menu){
                let pos = this.getSafeMenuPosition(event);
                menu.style.top = pos.y+'px';
                menu.style.left = pos.x+'px';
            }
        }, 2);
    },
    /**Hides the Option Menu and clears the menu item list. */
    hideOptionMenu(){
        var menu = document.getElementById('options-btn-menu');//important
        menu.style.top = '-1000px';
        this.isOptionsMenuVisible = false;
        this.currentMenuItems = []; //Clear menu item list
    },
    /**
     * Returns the safe position to place the Options Menu so that it does not
     * extend beyond the app window boundaries.
     * */
    getSafeMenuPosition(event:MouseEvent){
        var menu = document.getElementById('options-btn-menu');//important
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