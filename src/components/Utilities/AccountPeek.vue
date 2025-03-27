<template>
    <div id="account-peek" class="absolute flex flex-col z-10 bg-slate-800 border
    border-slate-700 p-3 pb-4 rounded-md drop-shadow min-w-72 max-w-72 max-h-64 overflow-hidden"
    @mouseenter="AccountPeekState.keepPeekAlive" @mouseleave="AccountPeekState.cancelUserPeek">
        <i-mingcute:loading-fill v-show="AccountPeekState.awaitingAPIResponse" class="spinner size-8 self-center"/>
        <div v-show="!AccountPeekState.awaitingAPIResponse" class="flex flex-col overflow-auto">
            <div class="flex items-start grow-0 shrink-0">
                <div class="flex shrink-0 rounded-full bg-blue-500 size-14 items-center justify-center
                    bg-contain" :style="'background-image: url('+(AccountPeekState.profileData.avatar ? AccountPeekState.profileData.avatar : '')+')'">
                </div>
                <div class="relative ml-auto">
                    <Transition :name="isFollowing ? 'slide-left' : 'slide-right'">
                        <div v-if="!isFollowing" @click="toggleAccountFollow" class="flex rounded-full px-2 py-1 text-nowrap
                            cursor-pointer transition-colors bg-blue-500 hover:bg-blue-400">
                                <div class="flex items-center gap-1">
                                    <i-mingcute:plus-fill/>
                                    <div>Follow</div>
                                </div>
                        </div>
                        <div v-else-if="isFollowing" @click="toggleAccountFollow" class="flex rounded-full px-2 py-1 text-nowrap
                            cursor-pointer transition-colors bg-slate-500 hover:bg-slate-400">
                                <div class="flex items-center gap-1">
                                    <i-mingcute:check-fill/>
                                    <div>Following</div>
                                </div>
                        </div>
                    </Transition>
                </div>
            </div>
            <div class="grow-0 shrink-0">
                <div class="font-medium">{{ AccountPeekState.profileData.displayName }}</div>
                <div class="text-slate-500 leading-3">@{{ AccountPeekState.profileData.handle }}</div>
            </div>
            <div class="flex text-sm mt-2 mb-1 gap-1 grow-0 shrink-0">
                <div class="flex hover:underline cursor-pointer">
                    <div>{{ AccountPeekState.profileData.followersCount }}</div>
                    <div class="text-slate-400 whitespace-pre"> Followers</div>
                </div>
                <div class="flex hover:underline cursor-pointer">
                    <div>{{ AccountPeekState.profileData.followsCount }}</div>
                    <div class="text-slate-400 whitespace-pre"> Following</div>
                </div>
            </div>
            <RichPostText class="text-sm overflow-auto grow shrink break-words"
            :post-text="AccountPeekState.profileData.description"/>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import RichPostText from './RichPostText.vue';
import { AccountPeekState } from '../../state/AccountPeekState.vue';

export default defineComponent({
    name:'Account Peek',
    components:{
        RichPostText,
    },
    data(){
        return{
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

.spinner{
  animation: spin 1s linear infinite;
}

@keyframes spin {
 0%{
    transform: rotate(0deg);
   }
100%{
    transform: rotate(360deg);
   }
}
</style>