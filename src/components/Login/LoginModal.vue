<template>
    <div data-testid="login-modal" tabindex="-1" @keydown="(e) => TrapFocus($el,e)" class="absolute z-50 flex
        flex-col w-full h-full bg-slate-900/80 backdrop-blur-sm justify-center focus-visible:outline-none">
        <div @click="closeModal" class="absolute z-10 w-full h-full"></div>
        <div class="flex flex-col relative z-20 gap-4 w-[90%] md:w-2/3 lg:max-w-[700px]
            bg-focusBG text-primary p-4 mx-auto m-4 rounded-md overflow-hidden">
            <Transition>
                <div v-if="currentPage == 0" class="flex flex-col gap-3">
                    <div>
                        <div class="text-3xl text-loginBtn font-extrabold ">{{ modalPage[0].title }}</div>
                        <div class="text-[0.75rem] leading-[0.875rem] md:text-lg font-bold">{{ modalPage[0].description }}</div>
                    </div>
                    <div class="flex flex-col gap-1">
                        <div class="text-xs text-secondary">Note: Some content is unable to be viewed without an account due to Post visibility settings specified by the author.</div>
                        <RadioBarButton data-testid="browse-as-guest-button" @click="asGuestClicked" :selected="AppSettingsState.Settings.savedAccountState.state == LoginState.Guest">
                            <div class="text-xs md:text-base">Browse as guest</div>
                            <i-mdi:spy class="shrink-0"/>
                            <i-mdi:chevron-right class="ml-auto text-3xl"/>
                        </RadioBarButton>
                        <RadioBarButton data-testid="login-to-account-button" @click="loginToAccountClicked" :selected="AppSettingsState.Settings.savedAccountState.state == LoginState.Authorized">
                             <div class="flex flex-col md:gap-1.5 md:flex-row md:items-center text-left">
                                <div class="flex gap-1.5 items-center">
                                    <div class="text-xs md:text-base text-nowrap">Login to account</div>
                                    <i-mdi:login class="shrink-0"/>
                                </div>
                                <div class="text-[10px] leading-3 text-secondary text-nowrap bg-yellow-400s">Accounts saved: {{ AppSettingsState.Settings.savedAccountState.accounts.length }}</div>
                            </div>
                            <i-mdi:chevron-right class="ml-auto text-3xl shrink-0"/>
                        </RadioBarButton>
                    </div>
                </div>
                <div v-else-if="currentPage == 1" class="flex flex-col gap-3 overflow-hidden pb-1">
                    <div>
                        <div class="text-3xl text-loginBtn font-extrabold ">{{ modalPage[1].title }}</div>
                        <Transition name="swap">
                            <div v-if="!isRemovingSavedAccount" class="text-[0.75rem] leading-[0.875rem] md:text-lg font-bold">{{ modalPage[1].description }}</div>
                            <div v-else class="text-[0.75rem] leading-[0.875rem] md:text-lg font-bold text-red-500">Which account do you wish to remove?</div>
                        </Transition>
                    </div>
                    <div class="flexs flex-cols space-y-1 gap-1 overflow-hidden overflow-y-auto relative">
                        <TransitionGroup name="list">
                            <RadioBarButton v-for="(n, index) in AppSettingsState.Settings.savedAccountState.accounts" :key="n.id"
                            :selected="AppSettingsState.Settings.savedAccountState.currentAccount == index"
                            @click="clickedSavedAccount(n)">
                                <div class="flex aspect-square h-11 rounded overflow-hidden shrink-0"><img :src="n.avatar" class="object-cover"/></div>
                                <div title="Bluesky Account"><i-logos:bluesky class="shrink-0" /></div>
                                <!-- <i-fa6-brands:bluesky/> -->
                                <div class="flex text-left flex-col md:flex-row md:gap-1.5 md:items-center mr-auto overflow-hidden">
                                    <div class="text-xs md:text-base overflow-hidden text-ellipsis text-nowrap" :title="n.name">{{ n.name }}</div>
                                    <div class="text-xs w-auto text-secondary overflow-hidden text-ellipsis text-nowrap" :title="n.handle">{{ n.handle }}</div>
                                </div>
                                <Transition name="swap" class="right-1">
                                    <i-mdi:chevron-right v-if="!isRemovingSavedAccount" class="text-3xl shrink-0"/>
                                    <i-mingcute:delete-2-line v-else class="text-red-500 text-2xl shrink-0"/>
                                </Transition>
                            </RadioBarButton>
                        </TransitionGroup>
                        <RadioBarButton :hide-radio-button="true" @click="gotoLoginPage()">
                            <i-mingcute:add-circle-fill/>
                            <div>Add new account</div>
                        </RadioBarButton>
                        <div v-if="AppSettingsState.Settings.savedAccountState.accounts.length == 0"
                        class="text-secondary">
                            <div>No Saved Accounts Available</div>
                        </div>
                    </div>
                    <button v-if="AppSettingsState.Settings.savedAccountState.accounts.length>0" @click="editSavedAccountList"
                    class="flex gap-1 items-center rounded-none text-secondary text-sm shadow-none ml-auto mr-1"
                    :class="[{'!text-red-500' : isRemovingSavedAccount}]">
                        <i-mingcute:pencil-line/>
                        <div>{{isRemovingSavedAccount ? 'Cancel Edit' : 'Edit List'}}</div>
                    </button>
                </div>
                <div v-else>
                    {{ void "close button" }}
                    <div class="relative top-1">
                        <button v-if="AppState.canBrowse" @click="closeModal" class="absolute right-0 flex border rounded-full
                        bg-transparent border-red-500 size-7 p-0 text-sm text-red-500 hover:text-red-700 hover:border-red-700
                        focus-visible:outline focus-visible:outline-feedtypeBtnFocusHighlight active:bg-red-200
                        justify-center items-center cursor-pointer">
                            <i-mingcute:close-fill/>
                        </button>
                    </div>
                    {{ void "login form" }}
                    <div class="flex flex-col gap-2">
                        <div>
                            <div class="text-3xl text-loginBtn font-extrabold ">Login</div>
                            <div class="text-[0.75rem] leading-[0.875rem] md:text-lg font-bold">Enter your username and password</div>
                        </div>
                        <div class="h-[1px] bg-slate-500"></div>
                        <div class="flex gap-1 flex-col">
                            <!-- <div>Hosting Provider</div>
                            <div>bsky.social</div> -->
                            <div class="group-heading">Account</div>
                            <div class="flex">
                                <InLaInput data-testid="login-username-input" id="login-username-input" v-model="enteredUsername" class="rounded-r-none outline-none" textLabel="Handle" :fillContainer="true"/>
                                <!-- <InLaInput v-model="hostProvider" class="rounded-l-none border-l-0" textLabel="Host" :isDisabled="true" :fillContainer="true"/> -->
                                <div class="relative flex flex-col group w-full cursor-pointer">
                                    <button v-if="isUsingDefaultHost" @click="toggleAccountProvider" title="Change Hosting Provider"
                                    class="group relative flex w-full h-11 p-0.5 border bg-searchbarBG border-outline
                                    rounded-md rounded-l-none border-l-0 shadow-none transition-colors group-hover:bg-loginHostHover
                                    focus-visible:bg-loginHostHover">
                                        <div class="flex w-full h-full border-2 rounded-md transition-[border] border-transparent
                                        group-focus-visible:border-feedtypeBtnFocusHighlight">
                                            <div class="pt-[0.625rem] pl-1 text-searchbarBorderDisabled">Bluesky Social</div>
                                            <i-mdi:edit-box-outline class="self-center text-2xl ml-auto"/>
                                        </div>
                                        <!-- <div class="absolute flex w-full h-full px-2 bg-pink-500">
                                            <div class="pt-[0.625rem] text-searchbarBorderDisabled">bsky.social</div>
                                            <i-mdi:edit-box-outline class="self-center text-2xl ml-auto"/>
                                        </div> -->
                                    </button>
                                    <div v-else
                                    class="relative flex w-full h-11 p-0.5 border bg-searchbarBG border-outline
                                    rounded-md rounded-l-none border-l-0 shadow-none transition-colors group-hover:bg-loginHostHover
                                    focus-visible:bg-loginHostHover">
                                        <div class="flex w-full h-full border-2 rounded-md transition-[border] border-transparent
                                        group-focus-visible:border-feedtypeBtnFocusHighlight">
                                            <div class="pt-[0.625rem] pl-1 text-searchbarBorderDisabled">https://</div>
                                            <input data-testid="login-custom-host-input" v-model="customHostProvider"
                                            class="w-full pt-[0.625rem] rounded-none text-primary bg-transparent shadow-none"/>
                                            <button @click="toggleAccountProvider" title="Switch Back to Default Provider"
                                            class="group/cancel shadow-none text-red-400 hover:border-transparent
                                            active:bg-transparent active:border-transparent focus-visible:outline focus-visible:outline-feedtypeBtnFocusHighlight">
                                                <i-mdi:cancel-box class="shrink-0 self-center text-2xl ml-auto transition-transform
                                                group-hover/cancel:scale-110 group-focus-visible/cancel:scale-110"/>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="absolute top-[-2px] left-2 select-none text-feedTimestamp text-secondary">
                                        Hosting Provider
                                    </div>
                                </div>
                            </div>
                            <InLaInput data-testid="login-password-input" v-model="enteredPassword" textLabel="Password"
                                :isPasswordInput="true" :fillContainer="true"/>
                        </div>
                        <div class="text-sm text-red-500 whitespace-pre-line">{{ validationErrorMessage }}</div>
                        <div class="flex text-sm text-primary">
                            <div>Dont have an account? Create one using the</div>
                            <a href="https://bsky.app/" target="_blank" class="ml-1 text-blueskyBlue hover:underline">official client</a>
                            <div>.</div>
                        </div>
                    </div>
                </div>
            </Transition>
            <div class="flex">
                <SquareButton v-if="currentPage != 0" @click="clickedBackButton" :is-awaiting-response="attemptingLogin"
                class="mr-auto bg-btn hover:bg-btnHover w-12">Back</SquareButton>
                <SquareButton data-testid="login-button" v-if="currentPage == modalPage.length-1" @click="loginAccount" :is-disabled="isLoginDisabled"
                :is-awaiting-response="attemptingLogin" :title="titleMessage"
                class="bg-loginBtn font-semibold transition-colors hover:bg-loginBtnHover
                text-primary md:self-end md:w-40 h-10">Login</SquareButton>
            </div>
        </div>
        <ConfirmModal ref="confirm"/>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import InLaInput from '../Utilities/InLaInput.vue';
import { AppState, toast, TrapFocus } from '../../state/AppState.vue';
import { LoginBskyAccount } from '../../lib/api/Login.vue';
import { HandleAPIError } from '../../helpers/errors';
import { AccountPeekState } from '../../state/AccountPeekState.vue';
import { RefreshAllFeeds } from '../../state/FeedList.vue';
import { GetAuthSession, GetBrowsingAgent } from '../../lib/api.vue';
import SquareButton from '../Utilities/SquareButton.vue';
import { AppSettingsState } from '../../state/AppSettingsState.vue';
import { ATPlatform, IAccount, LoginState } from '../../interfaces/AccountInterfaces';
import RadioBarButton from '../Utilities/RadioBarButton.vue';
import { GenerateUniqueID } from '../../helpers/generators';
import ConfirmModal from '../Utilities/ConfirmModal.vue';
import { BroadcastChannelTarget, BroadcastObject, toRawDeep } from '../../types/BroadcastChannelTypes';

/**
 * Asks the User if they're sure they would like to delete the selected
 * Feed record. If deletion is confirmed it will perform the passed Function.
 * @param action The function to use to delete the Feed record.
 */
function ConfirmSavedAccountRemoval(action:Function){
    AppState.showConfirmModal('Are you sure you wish to remove this Saved Account?', action);
}

export default defineComponent({
    components:{
        InLaInput: InLaInput,
        SquareButton,
        RadioBarButton,
        ConfirmModal,
    },
    data(){
        return{
            enteredUsername: "",
            enteredPassword: "",
            defaultHostProvider: "bsky.social",
            /**Is the User using the default Host Provider or a custom Account Provider? */
            customHostProvider: "",
            isUsingDefaultHost: true,
            attemptingLogin: false,
            guestBrowseSelected:false,
            authBrowseSelected:false,
            AppState,
            AccountPeekState,
            AppSettingsState,
            LoginState,
            modalPage:[
                {title:'Browsing Mode',description:'How do you wish to browse?'},
                {title:'Account Selection',description:'Which account do you want to use?'},
                {title:'Login',description:'Enter your Username and'},
            ],
            currentPage:0,
            isRemovingSavedAccount:false,
            selectedAccount:{} as IAccount,
            TrapFocus,
        }
    },
    methods:{
        async loginAccount(){
            /**Indicates whether or not the Login attemot was successful. */
            let loginError = false;
            this.attemptingLogin = true;
            toast.add({summary:"Logging in...", detail:`Hello ${this.enteredUsername}, attempting to login...`, severity:'info', group:'bc', life:1500});
            var handleAddress = `${this.enteredUsername}.${this.defaultHostProvider}`;
            var accountDID = '';
            await LoginBskyAccount(handleAddress, this.enteredPassword)
            .then(res => {
                console.log(res);
                AppState.isAuthBrowsing = true;
                AppState.isGuestBrowsing = false;
                AppState.currentUsername = "Logged In";
                accountDID = res.data.did;
                AppState.canBrowse = true;
                AccountPeekState.lastMouseEvent = new MouseEvent('login');
                AccountPeekState.profileData = {did:'',handle:''};
                RefreshAllFeeds();//Refresh feeds so we can get likes, blocks etc.
                toast.add({summary:"Login Success", detail:``,severity:'success',group:'tr',life:3000});
            })
            .catch(err => {
                toast.add(HandleAPIError(err, 'Error logging in'));
                loginError=true;//Cancel rest of actions
            });
            if(!loginError){
                //Get User's PFP
                await GetBrowsingAgent().getProfile({actor:accountDID})
                .then(res => {
                    AppState.currentPFP = res.data.avatar ? res.data.avatar : '';
                    AppState.currentUsername = res.data.displayName ? res.data.displayName : res.data.handle;

                    /**Has account already been saved? */
                    let accExists = false;
                    for (let i = 0; i < AppSettingsState.Settings.savedAccountState.accounts.length; i++) {
                        let acc = AppSettingsState.Settings.savedAccountState.accounts[i];
                        if(acc.handle == res.data.handle){//account has already been saved, update that
                            acc.avatar = res.data.avatar ? res.data.avatar : '';
                            acc.did = res.data.did;
                            acc.handle = res.data.handle;
                            acc.id = 'generate me';
                            acc.name = res.data.displayName ? res.data.displayName : '';
                            acc.platform = ATPlatform.Bluesky;
                            AppSettingsState.Settings.savedAccountState.currentAccount = i;//mark account as last selected
                            AppSettingsState.Settings.savedAccountState.state = LoginState.Authorized;
                            i = AppSettingsState.Settings.savedAccountState.accounts.length;//skip rest of items
                            accExists = true;
                        }
                    }
                    if(!accExists){
                        let accId = GenerateUniqueID(12) + '_' + Date.now;
                        let newAcc:IAccount = {
                            avatar: res.data.avatar ? res.data.avatar : '',
                            did: res.data.did,
                            handle: res.data.handle,
                            id: accId,
                            name: res.data.displayName ? res.data.displayName : '',
                            platform: ATPlatform.Bluesky
                        }
                        AppSettingsState.Settings.savedAccountState.currentAccount = AppSettingsState.Settings.savedAccountState.accounts.push(newAcc)-1;
                        AppSettingsState.Settings.savedAccountState.state = LoginState.Authorized;
                    }
                    AppSettingsState.saveSettingsToStore();
                    //sync "login state"
                    let currentSession = GetAuthSession();
                    let authSyncMessage:BroadcastObject = {target:BroadcastChannelTarget.LoginState, data:toRawDeep(currentSession)};
                    AppState.SendAppSyncMessage(authSyncMessage);
                    this.closeModal();
                })
                .catch(err => {
                    toast.add(HandleAPIError(err, 'Error getting profile info'));
                })
            }
            this.attemptingLogin = false;
        },
        browseAsGuest(){
            AppState.browseAsGuest();
            AppSettingsState.saveSettingsToStore();
            // AppState.ToggleLoginModal();
            this.$router.go(-1);
        },
        /**Method called when User chooses to browse as guest. */
        asGuestClicked(){
            this.authBrowseSelected = false;
            this.guestBrowseSelected = true;
            this.browseAsGuest();
        },
        /**Method called when User chooses to log into an account. */
        loginToAccountClicked(){
            this.guestBrowseSelected = false;
            this.authBrowseSelected = true;
            if(AppSettingsState.Settings.savedAccountState.accounts.length>0) this.currentPage = 1;
            else this.gotoLoginPage();
        },
        /**Method called when a saved account is clicked/selected. */
        async clickedSavedAccount(account:IAccount){
            this.selectedAccount = account;
            if(account.id.trim() != '' && this.isRemovingSavedAccount){
                type ConfirmModalRef = InstanceType<typeof ConfirmModal>;
                await (this.$refs.confirm as ConfirmModalRef).show('Are you sure you wish to remove this Saved Account?')
                .then(res => {
                    if(res) this.removeSavedAccount();
                })
            }
            else this.gotoLoginPage(account.handle.split('.bsky.social')[0]);
        },
        /**
         * Method that deletes Saved Feed a specified index. Should not be
         * called directly - use `ConfirmModal.show()` or
         * `askAboutIndexedDBFeedDeletion()`.
         */
        removeSavedAccount(){
            try{
                if(!this.selectedAccount.id){
                    toast.add({summary:"Error", detail:`Account ID not retrieved - if this keeps displaying contact developer.`, severity:'warn', group:'tr', life:3000});
                    return; //cancel if no selected account object
                }
                let accIndex = AppSettingsState.Settings.savedAccountState.accounts.findIndex(acc => acc.id == this.selectedAccount.id);
                if(accIndex != -1) console.log( AppSettingsState.Settings.savedAccountState.accounts.splice(accIndex,1));
                //save changes to disk?
                this.selectedAccount = {} as IAccount; //Clear selection
                if(AppSettingsState.Settings.savedAccountState.accounts.length<1) this.isRemovingSavedAccount = false;
            }
            catch(err){
                toast.add({summary:"Error", detail:`${err}`, severity:'error', group:'tr', life:3000});
            }
        },
        /**
         * Method that navigates to the login page - where the User has to
         * their credentials.
         */
        gotoLoginPage(handle:string=''){
            this.currentPage = this.modalPage.length-1;
            this.enteredUsername = handle;
            setTimeout(() => {
                this.focusLoginInput();
            }, 20);
        },
        /**Method used to focus most relevant input when navigating to login page. */
        focusLoginInput(){
            let usernameInput = (this.$el.querySelector(`div[data-testid='login-username-input'] input`) as HTMLInputElement);
            if(usernameInput){
                if(usernameInput.value.trim() != ''){
                    let passwordInput = (this.$el.querySelector(`div[data-testid='login-password-input'] input`) as HTMLInputElement);
                    if(passwordInput) passwordInput.focus();
                }
                else usernameInput.focus();
            }
        },
        /**Method used to navigate to the starting "browsing mode select" page. */
        backToBrowseModeSelect(){
            this.currentPage = 0;
            this.isRemovingSavedAccount = false;
        },
        /**Method used to move back a page in the Login modal. */
        backOnePage(){
            if(this.currentPage - 1 >= 0 && this.currentPage - 1 < this.modalPage.length) this.currentPage = this.currentPage-1;
            else{
                this.currentPage = 0;
            }
            this.isRemovingSavedAccount = false;
                this.$el.focus();
        },
        clickedBackButton(){
            if(this.currentPage == this.modalPage.length-1 && AppSettingsState.Settings.savedAccountState.accounts.length == 0){
                this.backToBrowseModeSelect();
            }
            else this.backOnePage();
            this.isRemovingSavedAccount = false;
        },
        /**
         * Switches interaction between selecting a saved User account
         * or removing it from the saved list.
         */
        editSavedAccountList(){
            this.isRemovingSavedAccount = !this.isRemovingSavedAccount;
        },
        closeModal(){
            // AppState.ToggleLoginModal();
            console.log(window.history.state);
            if(window.history.state.back != null && (window.history.state.back.includes('/profile') || window.history.state.back.includes('/settings'))) this.$router.go(-1);
            else if(window.history.state.back == null) this.$router.push(`/`);
            else this.$router.push(`/`);
        },
        /**
         * Switches between using the default Bluesky Account Provider or
         * a custom user-provided one.
         */
        toggleAccountProvider(){
            this.isUsingDefaultHost = !this.isUsingDefaultHost;
        }
    },
    computed:{
        /**
         * Checks if the Login button should currently be disabled.
         */
        isLoginDisabled(){
            return this.enteredUsername.trim() == "" || this.enteredPassword.trim() == "" ||
            !this.isUsingDefaultHost;
        },
        /**
         * Determines the Login button `title` attribute value that is needed depending on
         * the current login form validation state.
         */
        titleMessage(){
            let message = 'Login';
            if(this.isLoginDisabled) message = 'Please provide a Username AND Password. Also, Custom Hosting Providers are not yet supported.';
            else if(this.attemptingLogin) message = 'Attempting to Login...'
            return message;
        },
        /**
         * Error message displayed when login form contents fail
         * validation check.
         */
        validationErrorMessage(){
            let msg = ''
            if(!this.isUsingDefaultHost) msg += "A Hosting Provider other than the default is not supported at the moment.😞\n";
            if(this.enteredUsername.trim() == ""){
                if(this.enteredPassword.trim() == "") msg += "Please provide a Username and Password."
                else msg += "Please provide a Username."
            }
            else if(this.enteredPassword.trim() == ""){
                msg += "Please provide a Password."
            }
            return msg;
        }
    },
    beforeMount() {
        if(AppState.loginModalStartPage == 1){
            this.loginToAccountClicked();
            AppState.loginModalStartPage = -1; //reset 'load page on open' variable
        }
    },
    mounted(){
        //Focus username input
        // ((this.$el as HTMLElement).querySelector('[data-testid="login-username-input"] > input') as HTMLElement).focus();
        switch (AppSettingsState.Settings.savedAccountState.state) {
            case LoginState.Guest:
                this.guestBrowseSelected = true;
                break;
            case LoginState.Authorized:
                this.authBrowseSelected = true;
                break;
            default:
                break;
        }
        (this.$el as HTMLElement).focus();
    }
})
</script>

<style scoped>
/* div{
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-weight: 300;
} */
div.group-heading{
    font-size: 12px;
    line-height: 20px;
    font-weight: 800;
    margin-bottom: 0.25rem;
}

.modal{
    transition: opacity 0.1s, visibility 0.1s;
    opacity: 100;
    visibility: hidden;
}
.modal.show{
    /* animation: show 0.2s; */
    opacity: 100;
    visibility: visible;
}
.modal.hide {
    /* animation: dismiss 0.2s forwards; */
    opacity: 0;
    visibility: hidden;
}

.disabled,
.disabled:focus,
.disabled:hover{
    cursor: wait;
}

.disabled a,
.disabled a:focus,
.disabled a:hover{
    /* user-select: none; */
    pointer-events: none;
    background-color: gray;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  position: absolute;
  transform: translateX(-30px);
}

.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.2s ease, transform 0.4s ease;
}

.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  /* right: 0; */
  position: absolute;
  transform: translateX(-10px);
}

.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: opacity 0.4s ease, transform 0.6s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
  /* transform: scale(0.6); */
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>