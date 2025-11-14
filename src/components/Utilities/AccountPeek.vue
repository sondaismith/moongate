<template>
    <div id="account-peek" class="absolute flex flex-col z-10 bg-focusBG border
    border-outline p-3 pb-4 rounded-md drop-shadow min-w-72 max-w-72 max-h-64 overflow-hidden"
    @mouseenter="AccountPeekState.keepPeekAlive" @mouseleave="AccountPeekState.cancelUserPeek">
        <i-mingcute:loading-fill v-show="AccountPeekState.awaitingAPIResponse" class="spinner size-8 self-center"/>
        <div v-show="!AccountPeekState.awaitingAPIResponse" class="flex flex-col overflow-hidden">
            <div class="flex items-start grow-0 shrink-0">
                <div class="flex shrink-0 rounded-full bg-blue-500 size-14 items-center justify-center
                    bg-contain" :style="'background-image: url('+(AccountPeekState.profileData.avatar ? AccountPeekState.profileData.avatar : '')+')'">
                </div>
                <div class="flex flex-col gap-1 ml-auto self-center">
                    <FollowUser v-if="!AccountPeekState.awaitingAPIResponse && !isAccountBlocked"
                    :is-user-followed="isFollowingUser"
                    :user-did="AccountPeekState.profileData.did" :is-disabled="!AppState.isAuthBrowsing"/>
                    <div v-if="isAccountMuted" title="You have muted this account."
                    class="flex items-center gap-1 rounded-full px-2 bg-accountMuteLabelBG text-primary text-sm select-none">
                        <i-mdi:eye-off/>
                        <div class="whitespace-nowrap">Account Muted</div>
                    </div>
                    <div v-if="isAccountBlocked" title="You have blocked this account."
                    class="flex items-center gap-1 rounded-full px-2 bg-accountMuteLabelBG text-primary text-sm select-none">
                        <i-mdi:user-off/>
                        <div class="whitespace-nowrap">Account Blocked</div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col gap-1 grow-0 shrink-0 py-1 bg-green-400s">
                <div class="flex flex-wrap items-center *:leading-5 leading-5 gap-1">
                    <div class="inline text-primary font-medium">{{ AccountPeekState.profileData.displayName }}</div>
                    <VerifiedBadge v-if="isUserVerified" class="size-4"/>
                </div>
                <div class="text-secondary leading-3">@{{ AccountPeekState.profileData.handle }}</div>
            </div>
            <div v-if="!isAccountBlocked" class="flex text-sm text-primary gap-1 grow-0 shrink-0">
                <div class="flex hover:underline cursor-pointer">
                    <div>{{ AccountPeekState.profileData.followersCount }}</div>
                    <div class="text-secondary whitespace-pre"> Followers</div>
                </div>
                <div class="flex hover:underline cursor-pointer">
                    <div>{{ AccountPeekState.profileData.followsCount }}</div>
                    <div class="text-secondary whitespace-pre"> Following</div>
                </div>
            </div>
            <RichPostText v-if="!isAccountBlocked" class="text-sm overflow-auto grow shrink break-words"
            :post-text="AccountPeekState.profileData.description"/>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import RichPostText from './RichPostText.vue';
import { AccountPeekState } from '../../state/AccountPeekState.vue';
import FollowUser from './FollowUser.vue';
import { AppState } from '../../state/AppState.vue';
import VerifiedBadge from './VerifiedBadge.vue';

export default defineComponent({
    name:'Account Peek',
    components:{
        RichPostText,
        VerifiedBadge,
        FollowUser,
    },
    data(){
        return{
            AppState,
            AccountPeekState,
            accountPFP: 'src/assets/test-media/posts/image04.png',
            accountName: 'Firstname Lastname',
            accountHandle: 'handler',
            accountDescription: `Hello, I'm a test #dev @dummyplug.bsky.social's biggest fan.`,
            numFollowers: 67,
            numFollowing: 23,
            isFollowing: false
        }
    },
    methods:{
        toggleAccountFollow(){
            this.isFollowing = !this.isFollowing;
        }
    },
    computed:{
        /**
         * Method that checks to see if the User is following the currently displayed account.
         * In order for this value to be accurate, we must wait until the API call finishes, so
         * `AccountPeekState.awaitingAPIResponse` must be false. Currently handled via v-if on
         * the `FollowUser` component above.
         */
        isFollowingUser(){
            if(AccountPeekState.profileData.viewer && AccountPeekState.profileData.viewer.following){
                // console.log('true!');
                return true;
            }
            // console.log('false...');
            return false;
        },
        /**
         * Method used to see if the viewed User is verified.
         */
        isUserVerified(){
            let profile = AccountPeekState.profileData;
            if(profile != undefined && profile.verification && profile.verification.verifiedStatus == 'valid')
                return true;
            return false;
        },
        /**Is the viewed account muted by the logged in User? */
        isAccountMuted(){
            return typeof AccountPeekState.profileData.viewer != 'undefined' && typeof AccountPeekState.profileData.viewer.muted != 'undefined' && typeof AccountPeekState.profileData.viewer.muted;
        },
        /**Is the viewed account blocked by the logged in User? */
        isAccountBlocked(){
            return typeof AccountPeekState.profileData.viewer != 'undefined' && typeof AccountPeekState.profileData.viewer.blocking != 'undefined';
        }
    },
})
</script>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
    transition: transform 0.25s ease;
}

.slide-left-enter-from {
    position: absolute;
    opacity: 0;
    transform: translateX(5px);
}

.slide-left-leave-to {
    position: absolute;
    opacity: 0;
    transform: translateX(-20px);
}

.slide-right-enter-active,
.slide-right-leave-active {
    transition: transform 0.25s ease;
}

.slide-right-enter-from {
    position: absolute;
    opacity: 0;
    transform: translateX(-5px);
}

.slide-right-leave-to {
    position: absolute;
    opacity: 0;
    transform: translateX(20px);
}
</style>