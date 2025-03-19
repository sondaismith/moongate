<template>
    <div class="absolute flex flex-col z-10 bg-slate-800 border border-slate-700 p-3 pb-4
    rounded-md drop-shadow max-w-64 overflow-hidden">
        <div class="flex items-start justify-betweens">
            <div class="flex shrink-0 rounded-full bg-blue-500 size-14 items-center justify-center
                bg-contain" :style="'background-image: url('+accountPFP+')'">
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
        <div>
            <div class="font-medium">{{ accountName }}</div>
            <div class="text-slate-500 leading-3">@{{ accountHandle }}</div>
        </div>
        <div class="flex text-sm mt-2 mb-1 gap-1">
            <div class="flex hover:underline cursor-pointer">
                <div>{{ numFollowers }}</div>
                <div class="text-slate-400 whitespace-pre"> Followers</div>
            </div>
            <div class="flex hover:underline cursor-pointer">
                <div>{{ numFollowing }}</div>
                <div class="text-slate-400 whitespace-pre"> Following</div>
            </div>
        </div>
        <RichPostText class="text-sm" :post-text="accountDescription"/>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import RichPostText from './RichPostText.vue';

export default defineComponent({
    name:'Account Peek',
    components:{
        RichPostText,
    },
    data(){
        return{
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
    }
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