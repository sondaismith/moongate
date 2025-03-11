<template>
    <div class="absolute z-20 flex
        flex-col w-full h-full bg-slate-900/80 backdrop-blur-sm">
        <div class="flex flex-col w-4/5 md:w-2/3 lg:max-w-[700px]
            h-2/3 md:h-auto bg-slate-800 p-4 mx-auto my-auto rounded-md">
            {{ void "close button" }}
            <div class="relative">
                <div v-if="AppState.canBrowse" @click="closeModal" class="absolute right-0 flex border rounded-full border-red-500
                    w-8 aspect-square text-red-500 hover:text-red-700 hover:border-red-700
                    justify-center items-center cursor-pointer">
                    <i-mingcute:close-fill/>
                </div>
            </div>
            {{ void "login form" }}
            <form>
                <div class="text-3xl text-blue-700 font-extrabold">Login</div>
                <div class="text-sm md:text-lg font-bold">Enter your username and password</div>
                <div class="h-[1px] bg-slate-500 my-2"></div>
                <div class="flex flex-col">
                    <!-- <div>Hosting Provider</div>
                    <div>bsky.social</div> -->
                    <div class="group-heading">Account</div>
                    <div class="flex">
                        <InLaInput v-model="enteredUsername" textLabel="Handle" :fillContainer="true"/>
                        <InLaInput v-model="hostProvider" textLabel="Host" :isDisabled="true" :fillContainer="true"/>
                    </div>
                    <InLaInput v-model="enteredPassword" textLabel="Password"
                        :isPasswordInput="true" :fillContainer="true"/>
                </div>
                <div class="flex flex-col md:float-end" :class="{ disabled: attemptingLogin}">
                    <a @click="loginAccount" tabindex="0" class="relative flex md:self-end rounded cursor-pointer
                        bg-blue-700 justify-center md:w-40 px-3 py-2 font-semibold
                        hover:text-white hover:bg-blue-500 focus:bg-blue-600
                        select-none">Login</a>
                </div>
            </form>
            <div class="h-[1px] bg-slate-500 my-2"></div>
            {{ void "browse without account" }}
            <div class="relative flex flex-col items-start">
                <div @click="browseAsGuest" tabindex="0" class="text-blue-400 hover:text-blue-500 cursor-pointer">
                    Or Browse without an account
                </div>
                <div class="text-feedPostName leading-4">Note: Some content is unable to be viewed without an account due to
                    Post visibility settings specified by the author.
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import InLaInput from '../Utilities/InLaInput.vue';
import { AppState } from '../../state/AppState.vue';
import { LoginBskyAccount } from '../../lib/api/Login.vue';

export default defineComponent({
    data(){
        return{
            enteredUsername: "",
            enteredPassword: "",
            hostProvider: "bsky.social",
            attemptingLogin: false,
            AppState
        }
    },
    methods:{
        async loginAccount(){
            this.attemptingLogin = true;
            this.$toast.add({summary:"Test", detail:`Hello ${this.enteredUsername}, attempting to login...`, severity:'info', group:'bc', life:1500});
            var handleAddress = `${this.enteredUsername}.${this.hostProvider}`;
            const result = await LoginBskyAccount(handleAddress, this.enteredPassword);
            // setTimeout(() => {
            //     this.attemptingLogin = false;
            // }, 2500);
            if(result.success){
                AppState.isAuthBrowsing = true;
                AppState.isGuestBrowsing = false;
                AppState.currentUsername = "Logged In";
                AppState.canBrowse = true;
                AppState.ToggleLoginModal();
                this.$toast.add({summary:"Login Success", detail:``,severity:'success',group:'tr',life:1000});
            }
            else{
                this.$toast.add({summary:"Login Error", detail:`${result.message}`,severity:'error',group:'tr',life:3000});
            }
            this.attemptingLogin = false;
        },
        browseAsGuest(){
            AppState.isAuthBrowsing = false;
            AppState.isGuestBrowsing = true;
            AppState.currentUsername = "Guest";
            AppState.canBrowse = true;
            AppState.ToggleLoginModal();
            this.$toast.add({summary:'Browsing', detail:'Viewing content as guest.', severity:'info', group:'tr', life:3000})
        },
        closeModal(){
            AppState.ToggleLoginModal();
        }
    },
    components:{
        InLaInput: InLaInput,
    },
    setup () {
        return {}
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