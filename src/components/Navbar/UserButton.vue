<template>
    <div @click="onUserButtonClick" :onmouseenter="displayButtonTooltip" :onmouseleave="hideButtonTooltip"
        @contextmenu.prevent class="relative cursor-pointer">
        <div class="absolute z-10 border-[3px] border-sidebar w-3 -left-1 box-content aspect-square rounded-full" :class="GetLoginStateColor"
        :title="GetLoginStateText"></div>
        <a class="group relative flex justify-center aspect-square
            rounded-full bg-gray-00 border-[3px]
            border-outline transition-[border] hover:border-loginHighlight overflow-hidden">
            <Transition>
                <i-mingcute:key-2-line v-if="!AppState.canBrowse || !isVisible" class=" absolute h-full text-2xl transition-colors text-primary group-hover:text-loginHighlight"/>
                <div v-else-if="AppState.canBrowse || isVisible" class="absolute flex h-full w-full justify-center">
                    {{ void "User PFP" }}
                    <div v-if="AppState.isAuthBrowsing" class="absolute flex h-full w-full rounded-full bg-contain"
                        :style="`background-image: url(${AppState.currentPFP});`">
                    </div>
                    <div v-if="AppState.isAuthBrowsing && AppState.currentPFP == ''" class="flex items-center text-primary text-2xl">
                        <i-mingcute:loading-fill class="spinner"/>
                    </div>
                    {{ void "Guest Icon" }}
                    <i-mingcute:user-question-fill v-if="AppState.isGuestBrowsing" class="absolute h-full text-2xl transition-colors text-primary group-hover:text-loginHighlight z-[1]"/>
                </div>
            </Transition>
        </a>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AppState, toast } from '../../state/AppState.vue';
import { GetBrowsingAgent, LogoutAgent } from '../../lib/api.vue';
import { IOptionMenuItem } from '../Utilities/OptionsMenu.vue';
import { OptionsMenuState } from '../../state/OptionsMenuState.vue';
import { HandleAPIError } from '../../helpers/errors';
import ToastEventBus from 'primevue/toasteventbus';

//Options menu icons
import MingcuteProfileFill from '~icons/mingcute/profile-fill';
import MdiUserSwitch from '~icons/mdi/user-switch';
import MingcuteExitDoorLine from '~icons/mingcute/exit-door-line';
import { AccountPeekState } from '../../state/AccountPeekState.vue';
import { AppSettingsState } from '../../state/AppSettingsState.vue';
import { LoginState } from '../../interfaces/AccountInterfaces';

let optionsMenu:IOptionMenuItem[] = [
    {Icon:MingcuteProfileFill,Label:'View Profile',Action:displayCurrentUsersAccount},
    {Icon:MdiUserSwitch,Label:'Switch User',Action:AppState.ToggleLoginModal},
    {Icon:MingcuteExitDoorLine,Label:'Log Out',Action:confirmLogout,LabelStyle:'text-red-500'},
]

/**
 * Opens the `UserFocusModal` component to the currently logged in
 * user's profile.
 */
function displayCurrentUsersAccount(){
    var userToCheck;
    try{
        userToCheck = GetBrowsingAgent().assertDid;
        AppState.ShowUserFocusModal(userToCheck);
    }
    catch(e){
        //The code below plus the ToastEventBus import allow us to send
        //a Toast message outside of the component.
        const toast = {
            add: (message) => ToastEventBus.emit('add', message),
            removeGroup: (group) => ToastEventBus.emit('remove-group', group),
            removeAllGroups: () => ToastEventBus.emit('remove-all-groups'),
        };
        toast.add(HandleAPIError(e as Error));
    }
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
async function logoutOfAccount(){
    await LogoutAgent()
    .then(() => {
        AppState.canBrowse = AppState.isGuestBrowsing = AppState.isAuthBrowsing = false;
        AppState.currentUsername = "Login Here";
        AppSettingsState.Settings.savedAccountState = {
            ...AppSettingsState.Settings.savedAccountState,
            currentAccount:-1,
            state:LoginState.Unset
        }
        AccountPeekState.lastMouseEvent = new MouseEvent('logout');
        AccountPeekState.profileData = {did:'',handle:''};
    })
    .catch(err => toast.add(HandleAPIError(err, 'Error logging out')));
}

export default defineComponent({
    props: {
        tooltip: String
    },
    data(){
        return{
            isVisible: true, //DEBUG value
            AppState,
            AccountPeekState,
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
            if(!AppState.canBrowse || AppState.isGuestBrowsing){
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
    computed:{
        GetLoginStateColor():string{
            if(AppState.isGuestBrowsing) return 'bg-gray-400';
            else if(AppState.isAuthBrowsing) return 'bg-green-500';
            return 'bg-red-500'
        },
        GetLoginStateText():string{
            if(AppState.isGuestBrowsing) return 'Guest Browsing';
            else if(AppState.isAuthBrowsing) return 'Logged In/Active';
            return 'Currently Not Logged In'
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