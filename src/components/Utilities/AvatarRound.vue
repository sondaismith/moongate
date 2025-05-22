<template>
    <div @click="displaySelectedUserAccount" @contextmenu="showOptionsMenu($event,did?did:'',handle?handle:'')"
    @mouseover="AccountPeekState.waitBeforePeekingUser($event,did ? did : '')"
    @mouseleave="(_e) => AccountPeekState.cancelUserPeek()" class="rounded-full bg-slate-300 aspect-square
    border border-primary box-content size-10 bg-contain hover:border-hover
    transition-[border-color] ease-linear duration-200 cursor-pointer"
    :style="{'background-image' : 'url('+avatar+')'}">
        <i-mingcute:butterfly-2-fill v-if="!avatar" class="text-2xl h-full w-full p-1 text-blue-600"/>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { AccountPeekState } from '../../state/AccountPeekState.vue';
import { AppState, toast } from '../../state/AppState.vue';
import { isDid } from '@atproto/api';
import { OptionsMenuState } from '../../state/OptionsMenuState.vue';
import { IOptionMenuItem } from './OptionsMenu.vue';

//Option Menu Icons
import MingcuteAddCircleLine from '~icons/mingcute/add-circle-line';
import { AddFeedToList, PrepareFeedData } from '../../state/FeedList.vue';
import { FeedEnums } from '../../enums/FeedEnums';

/**
 * Method that adds a new User feed to the displayed list of Feeds based on
 * the User associated with this component.
 * Used by the context menu that is displayed when right-clicking `AvatarRound`.
 * @param userDid The DID of the User you want to add a new Feed for.
 * @param userHandle The handle of the User you want to add a new Feed for.
 */
function CreateUserFeed(userDid:string,userHandle:string){
    toast.add({summary:"Creating Feed...", detail:`Creating feed for @${userHandle}`,severity:'info',group:'tr',life:3000});
    PrepareFeedData(FeedEnums.Types.User,
    {
        did:userDid,
        handle:userHandle,
        name:''
    })
    .then(res => {
        AddFeedToList(res.description,res.data,res.cursor,false);
    });
}

export default defineComponent({
    data(){
        return{
            AppState,
            AccountPeekState,
        }
    },
    props:{
        avatar:String,
        did:String,
        handle:String,
    },
    emits:{
        /**Emit used to indicate the Avatar element has been clicked. */
        avatarClicked:(userDid:string|undefined) => {
            if(isDid(userDid)) return true;
            else return false;
        }
    },
    methods:{
        /**
         * Opens the `UserFocusModal` component to the currently selected
         * user's profile.
         */
        displaySelectedUserAccount(){
            //Cancel displaying `AccountPeek`
            AccountPeekState.cancelUserPeek(true);
            AppState.ShowUserFocusModal(this.did);
            this.$emit('avatarClicked',this.did);
        },
        /**
         * Shows Options Menu allowing user to perform different actions
         * relating to the selected User.
         */
        showOptionsMenu(e:MouseEvent, userDid:string, userHandle:string){
            e.preventDefault();
            OptionsMenuState.currentMenuItems = [
                {Icon:MingcuteAddCircleLine,Label:'Create new User Feed',Action:function(){CreateUserFeed(userDid,userHandle)}},
            ] as IOptionMenuItem[]
            OptionsMenuState.showOptionMenu(e);
        },
    }
})
</script>

<style scoped>
</style>