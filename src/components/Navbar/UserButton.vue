<template>
    <a @click="onUserButtonClick" :onmouseenter="displayButtonTooltip" :onmouseleave="hideButtonTooltip"
        @contextmenu="showOptionsMenu"
        class="group cursor-pointer relative flex justify-center
        rounded-full drop-shadow-md bg-blue-200 border
        border-blue-200 transition-[border] hover:border-gray-800
        aspect-square overflow-hidden">
        <Transition>
            <!-- <i-mingcute:user-1-line v-if="!AppState.canBrowse || !isVisible" class=" absolute h-full text-xl text-slate-800"/> -->
            <i-mingcute:lock-fill v-if="!AppState.canBrowse || !isVisible" class=" absolute h-full text-2xl text-slate-800"/>
            <div v-else-if="AppState.canBrowse || isVisible" class="absolute flex h-full w-full justify-center">
                {{ void "User initial - show if logged in" }}
                <div v-if="AppState.isAuthBrowsing" class="absolute flex h-full w-full text-[2rem]
                    font-black text-slate-700 items-center justify-center select-none z-[2]">
                    {{ AppState.currentUsername[0] }}
                </div>
                {{ void "Color Overlay for visibility" }}
                <div v-if="AppState.isAuthBrowsing" class="absolute flex h-full w-full bg-blue-400/60 z-[1]"></div>
                {{ void "User PFP/Guest Icon" }}
                <div v-if="AppState.isAuthBrowsing" class="absolute flex h-full w-full rounded-full"
                    style="background-image: url('src/assets/test-media/posts/image04.png');">
                </div>
                {{ void "Guest Icon" }}
                <i-mdi:account-off v-if="AppState.isGuestBrowsing" class="absolute h-full text-2xl text-slate-800 z-[1]"/>
                <div v-if="AppState.isGuestBrowsing" class="absolute flex h-full w-full rounded-full bg-blue-500"></div>
            </div>
        </Transition>
    </a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AppState } from '../../state/AppState.vue';
import { agent, LogoutAgent } from '../../lib/api';
import { IOptionMenuItem } from '../Utilities/OptionsMenu.vue';
import { OptionsMenuState } from '../../state/OptionsMenuState.vue';

//Options menu icons
import MingcuteProfileFill from '~icons/mingcute/profile-fill';
import MdiUserSwitch from '~icons/mdi/user-switch';
import MingcuteExitDoorLine from '~icons/mingcute/exit-door-line';

let optionsMenu:IOptionMenuItem[] = [
    {Icon:MingcuteProfileFill,Label:'View Profile',Action:displayCurrentUsersAccount},
    {Icon:MdiUserSwitch,Label:'Switch User',Action:()=>void 0},
    {Icon:MingcuteExitDoorLine,Label:'Log Out',Action:confirmLogout,LabelStyle:'text-red-500'},
]

/**
 * Opens the `UserFocusModal` component to the currently logged in
 * user's profile.
 */
 function displayCurrentUsersAccount(){
    var userToCheck = agent.assertDid;
    AppState.ToggleUserFocusModal(userToCheck);
}

/**
 * Prompts the User for confirmation that they want to log out of their account.
 */
function confirmLogout(){
    AppState.showConfirmModal('Are you sure you want to log out?',logoutOfAccount);
}

/**
 * Logs the User out of the currently logged in account, and updates the `AppState`
 * to reflext that.
 */
function logoutOfAccount(){
    LogoutAgent();
    AppState.canBrowse = AppState.isGuestBrowsing = AppState.isAuthBrowsing = false;
    AppState.currentUsername = "Login Here";
}

export default defineComponent({
    props: {
        tooltip: String
    },
    data(){
        return{
            isVisible: true, //DEBUG value
            AppState,
        }
    },
    methods:{
        displayButtonTooltip(event:PointerEvent){
            var tooltip = document.getElementById('navbar-tooltip');
            var button = (event.currentTarget as HTMLElement);
            var buttonCenter = button.offsetTop + button.offsetHeight/2;
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
        /**
         * Prompts user to log in if they aren't or toggles the
         * Options Menu related to the User's account.
         */
        async onUserButtonClick(e:Event){
            if(!AppState.canBrowse){
                AppState.ToggleLoginModal();
            }
            else if(AppState.canBrowse && AppState.isAuthBrowsing){
                this.showOptionsMenu(e);
            }
        },
        /**
         * Shows Options Menu allowing user to perform different actions
         * relating to User accounts, like logging out.
         */
        showOptionsMenu(e:Event){
            e.preventDefault();
            OptionsMenuState.currentMenuItems = optionsMenu;
            OptionsMenuState.showOptionMenu(e);
        }
    },
    setup (props) {
        props.tooltip
    }
})
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>