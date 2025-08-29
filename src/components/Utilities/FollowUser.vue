<template>
    <div class="flex relative h-full ml-auto">
        <Transition :name="isFollowing ? 'slide-left' : 'slide-right'">
            <div v-if="!isFollowing" @[!awaitingFollowRequest&&'click']="toggleAccountFollow" class="flex rounded-full px-2 py-1 text-nowrap
                cursor-pointer select-none transition-colors bg-blue-500 hover:bg-blue-400"
                :class="[$attrs.class,
                isDisabled ? 'bg-gray-500 text-gray-400 pointer-events-none' : '',
                awaitingFollowRequest ? '!cursor-not-allowed bg-blue-600 hover:bg-blue-600' : '']">
                    <div class="flex items-center gap-1">
                        <i-mingcute:plus-fill v-show="!awaitingFollowRequest"/>
                        <i-mingcute:loading-fill v-show="awaitingFollowRequest" class="spinner self-center"/>
                        <div>Follow</div>
                    </div>
            </div>
            <div v-else-if="isFollowing" @[!awaitingFollowRequest&&'click']="toggleAccountFollow" class="flex rounded-full px-2 py-1 text-nowrap
                cursor-pointer select-none transition-colors bg-slate-500 hover:bg-slate-400"
                :class="[$attrs.class,
                isDisabled ? 'bg-gray-500 text-gray-400 pointer-events-none' : '',
                awaitingFollowRequest ? '!cursor-not-allowed bg-blue-600 hover:bg-blue-600' : '']">
                    <div class="flex items-center gap-1">
                        <i-mingcute:check-fill v-show="!awaitingFollowRequest"/>
                        <i-mingcute:loading-fill v-show="awaitingFollowRequest" class="spinner self-center"/>
                        <div>Following</div>
                    </div>
            </div>
        </Transition>
        <div v-if="isDisabled" class="absolute rounded-full w-full h-full" :title="isDisabled ? 'You must login to follow a User.' : ''"/>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { FollowUser, UnfollowUser } from '../../lib/api/User.vue';
import { toast } from '../../state/AppState.vue';
import { HandleAPIError } from '../../helpers/errors';

export default defineComponent({
    inheritAttrs:false,
    props:{
        /**
         * Prop indicating if the User this control is related to is currently followed or not.
         * Used to set initial value of `isFollowing` state value.
         */
        isUserFollowed:{
            type: Boolean,
            required: true
        },
        /**
         * Indicates that the button is currently disabled. Used to prevent interaction if the user
         * is not currently logged in.
        */
        isDisabled:Boolean,
        /**DID of the associated User. */
        userDid:String,
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
        /**
         * Method used to follow or unfollow a User account. Triggered on click.
         */
        async toggleAccountFollow(){
            console.log(`${this.isFollowing ? 'Unfollow' : 'Follow'} request sent! ${(new Date()).toTimeString()}`)
            this.awaitingFollowRequest = true;
            //send request to follow/unfollow user
            if(this.userDid){
                if(!this.isFollowing){//Follow
                    await FollowUser(this.userDid)
                    .then(() => {
                        this.isFollowing = true;
                    })
                    .catch(err => toast.add(HandleAPIError(err, 'Error following user account')));
                }
                else{//Unfollow
                    await UnfollowUser(this.userDid)
                    .then(() => {
                        this.isFollowing = false;
                    })
                    .catch(err => {
                        toast.add(HandleAPIError(err, 'Error unfollowing user account'));
                        console.log(err);
                    });
                }
            }
            this.awaitingFollowRequest = false;

            //DEBUG - testing loading spinner + states
            // setTimeout(() => {
            //     if(this.isFollowing){
            //         this.isFollowing = false;
            //     }
            //     else{this.isFollowing = true;}
            //     this.awaitingFollowRequest = false;
            // }, 1250);
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