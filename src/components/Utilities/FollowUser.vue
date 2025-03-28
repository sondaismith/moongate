<template>
    <div class="flex relative ml-auto">
        <Transition :name="isFollowing ? 'slide-left' : 'slide-right'">
            <div v-if="!isFollowing" @click="toggleAccountFollow" class="flex rounded-full px-2 py-1 text-nowrap
                cursor-pointer select-none transition-colors bg-blue-500 hover:bg-blue-400"
                :class="[$attrs.class,
                isDisabled ? 'bg-gray-500 text-gray-400 pointer-events-none' : '']">
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
        <div v-if="isDisabled" class="absolute rounded-full w-full h-full" :title="isDisabled ? 'You must login to follow a User.' : ''"/>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { FollowUser } from '../../lib/api/User.vue';
import { toast } from '../../state/AppState.vue';
import { HandleAPIError } from '../../helpers/errors';

export default defineComponent({
    inheritAttrs:false,
    props:{
        /**Prop indicating if the User this control is related to is currently followed or not. */
        isUserFollowed:Boolean,
        /**Indicates that the button is currently disabled. */
        isDisabled:Boolean,
        /**DID of the associated User. */
        userDid:String
    },
    data(){
        return{
            /**State indicating if the User this control is related to is currently followed or not. */
            isFollowing:this.isUserFollowed,
            /**Indicates if we are waiting for a Un/follow API request to complete. */
            awaitingFollowRequest:false,
        }
    },
    methods:{
        toggleAccountFollow(){
            this.awaitingFollowRequest = true;
            //send request to follow/unfollow user
            if(this.userDid){
                if(!this.isUserFollowed){//Follow
                    FollowUser(this.userDid)
                    .then(res => console.log(res))
                    .catch(err => toast.add(HandleAPIError(err, 'Error following user account')));
                }
                else{//Unfollow

                }
                this.isFollowing = !this.isFollowing;
            }
            this.awaitingFollowRequest = false;
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