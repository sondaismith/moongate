<template>
    <div class="absolute z-50 flex
        flex-col w-full h-full bg-slate-900/80 backdrop-blur-sm">
        <div class="flex flex-col w-4/5 md:w-2/3 lg:max-w-[700px]
            h-2/3 md:h-auto bg-focusBG text-primary p-4 mx-auto my-auto rounded-md">
            <div class="hidden">
                <div>Which account do you wish to use?</div>
                <div>
                    <div></div>
                    <div v-if="true" class="border-t-0
                        border-inherit border-slate-500 rounded-b flex bg-slate-800 overflow-auto"
                        :class="[2<1 ? 'border-none' : 'border']">
                        <div class="relative flex flex-col w-full">
                            <div class="flex items-center hover:bg-gray-700 px-2 py-2
                                cursor-pointer"
                                v-for="n in 2" :key="n">
                                <div class="flex rounded-full min-w-10 aspect-square bg-sky-400 justify-center items-center bg-cover"
                                :style="{'background-image': 'url()'}">
                                    <i-mingcute:user-add-fill v-if="true"/>
                                </div>
                                <div class="ml-2">Test {{ n }}</div>
                                <div class="text-xs text-sky-500 ml-1">@{{ n }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="hiddens">
                {{ void "close button" }}
                <div class="relative top-1">
                    <div v-if="AppState.canBrowse" @click="closeModal" class="absolute right-0 flex border rounded-full
                    border-red-500 size-7 text-sm text-red-500 hover:text-red-700 hover:border-red-700
                    justify-center items-center cursor-pointer">
                        <i-mingcute:close-fill/>
                    </div>
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
                            <InLaInput v-model="enteredUsername" class="rounded-r-none" textLabel="Handle" :fillContainer="true"/>
                            <!-- <InLaInput v-model="hostProvider" class="rounded-l-none border-l-0" textLabel="Host" :isDisabled="true" :fillContainer="true"/> -->
                            <div class="relative flex flex-col group w-full cursor-pointer">
                                <!-- <input data-testid="inlainput-input"
                                    class="peer bg-searchbarBG leading-8 px-2 pt-3 h-11
                                    border-gray-500 group-hover:border-blue-400 focus:border-searchbarFocusHightlight rounded-md
                                    disabled:border-searchbarBorderDisabled disabled:text-searchbarBorderDisabled disabled:group-hover:border-searchbarBorderDisabled shadow-none
                                    w-full"/> -->
                                <button class="group relative flex w-full h-11 p-0.5 border bg-searchbarBG border-outline
                                rounded-md rounded-l-none border-l-0 shadow-none transition-colors group-hover:bg-blue-100
                                focus-visible:bg-blue-100">
                                    <div class="flex w-full h-full border-2 rounded-md transition-[border] border-transparent
                                    group-focus-visible:border-feedtypeBtnFocusHighlight">
                                        <div class="pt-[0.625rem] pl-1 text-searchbarBorderDisabled">bsky.social</div>
                                        <i-mdi:edit-box-outline class="self-center text-2xl ml-auto"/>
                                    </div>
                                    <!-- <div class="absolute flex w-full h-full px-2 bg-pink-500">
                                        <div class="pt-[0.625rem] text-searchbarBorderDisabled">bsky.social</div>
                                        <i-mdi:edit-box-outline class="self-center text-2xl ml-auto"/>
                                    </div> -->
                                </button>
                                <div class="absolute top-[-2px] left-2 select-none text-feedTimestamp text-secondary">
                                    Hosting Provider
                                </div>
                            </div>
                        </div>
                        <InLaInput v-model="enteredPassword" textLabel="Password"
                            :isPasswordInput="true" :fillContainer="true"/>
                    </div>
                    <SquareButton @click="loginAccount" :is-disabled="isLoginDisabled"
                    :is-awaiting-response="attemptingLogin"
                    class="bg-loginBtn font-semibold transition-colors hover:bg-loginBtnHover
                    text-primary md:self-end md:w-40">Login</SquareButton>
                </div>
                <div class="h-[1px] bg-slate-500 my-2"></div>
                {{ void "browse without account" }}
                <div class="relative flex flex-col items-start">
                    <button data-testid="browse-as-guest-button" @click="browseAsGuest"
                    class="text-blue-400 hover:text-blue-500 border-none shadow-none cursor-pointer
                    focus-visible:outline outline-2 active:bg-transparent">
                        Or Browse without an account
                    </button>
                    <div class="text-feedPostName leading-4">Note: Some content is unable to be viewed without an account due to
                        Post visibility settings specified by the author.
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import InLaInput from '../Utilities/InLaInput.vue';
import { AppState, toast } from '../../state/AppState.vue';
import { LoginBskyAccount } from '../../lib/api/Login.vue';
import { HandleAPIError } from '../../helpers/errors';
import { AccountPeekState } from '../../state/AccountPeekState.vue';
import { FeedState, RefreshFeed } from '../../state/FeedList.vue';
import { GetBrowsingAgent } from '../../lib/api.vue';
import SquareButton from '../Utilities/SquareButton.vue';

export default defineComponent({
    components:{
        InLaInput: InLaInput,
        SquareButton,
    },
    data(){
        return{
            enteredUsername: "",
            enteredPassword: "",
            hostProvider: "bsky.social",
            attemptingLogin: false,
            AppState,
            AccountPeekState,
        }
    },
    methods:{
        async loginAccount(){
            /**Indicates whether or not the Login attemot was successful. */
            let loginError = false;
            this.attemptingLogin = true;
            toast.add({summary:"Test", detail:`Hello ${this.enteredUsername}, attempting to login...`, severity:'info', group:'bc', life:1500});
            var handleAddress = `${this.enteredUsername}.${this.hostProvider}`;
            var accountDID = '';
            await LoginBskyAccount(handleAddress, this.enteredPassword)
            .then(res => {
                console.log(res);
                AppState.isAuthBrowsing = true;
                AppState.isGuestBrowsing = false;
                AppState.currentUsername = "Logged In";
                accountDID = res.data.did;
                AppState.canBrowse = true;
                AppState.ToggleLoginModal();
                AccountPeekState.lastMouseEvent = new MouseEvent('login');
                AccountPeekState.profileData = {did:'',handle:''};
                this.refreshFeeds();//Refresh feeds so we can get likes, blocks etc.
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
                })
                .catch(err => {
                    toast.add(HandleAPIError(err, 'Error getting profile info'));
                })
            }
            this.attemptingLogin = false;
        },
        browseAsGuest(){
            AppState.isAuthBrowsing = false;
            AppState.isGuestBrowsing = true;
            AppState.currentUsername = "Guest";
            AppState.canBrowse = true;
            AppState.ToggleLoginModal();
            toast.add({summary:'Browsing', detail:'Viewing content as guest.', severity:'info', group:'tr', life:3000})
        },
        closeModal(){
            AppState.ToggleLoginModal();
        },
        /**
         * Method that refreshes all the displayed Feeds after the User logs in.
         * Used to get the displayed elements to reflect the User Account's
         * preferences/state (liked posts, blocked users, etc.).
         */
        refreshFeeds(){
            FeedState.FeedList.forEach(feed => {
                RefreshFeed(feed.description.feedId,new Date(),10);
            });
            console.log("Refreshed Feeds.");
        }
    },
    computed:{
        isLoginDisabled(){
            return this.enteredUsername.trim() == "" || this.enteredPassword.trim() == "";
        }
    },
    mounted(){
        console.log('login modal mounted')
        this.$el.focus();
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
</style>