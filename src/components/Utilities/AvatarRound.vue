<template>
    <div @click="displaySelectedUserAccount" @contextmenu="showOptionsMenu($event,did?did:'',handle?handle:'')"
    @mouseover="AccountPeekState.waitBeforePeekingUser($event,did ? did : '')"
    @mouseleave="(_e) => AccountPeekState.cancelUserPeek()" class="flex rounded-full bg-slate-300 aspect-square
    border border-outline box-contents size-10 min-w-10 bg-contain hover:border-hover
    transition-[border-color] ease-linear duration-200 cursor-pointer overflow-hidden">
        <ImageLoader v-if="typeof avatar != 'undefined'" :img-url="avatar" :fill-container="true" :loader-type="'spinner'"/>
        <i-mingcute:butterfly-2-fill v-else class="text-2xl h-full w-full p-1 text-blue-600"/>
    </div>
</template>

<script lang="ts">
//Option Menu Icons
import MingcuteAddCircleLine from '~icons/mingcute/add-circle-line';
import MingcuteExternalLinkLine from '~icons/mingcute/external-link-line';

import { defineComponent } from 'vue'
import { AccountPeekState } from '../../state/AccountPeekState.vue';
import { AppState, toast } from '../../state/AppState.vue';
import { isDid } from '@atproto/api';
import { OptionsMenuState } from '../../state/OptionsMenuState.vue';
import { IOptionMenuItem, ItemType } from './OptionsMenu.vue';
import { AddFeedToList, PrepareFeedData } from '../../state/FeedList.vue';
import { FeedEnums } from '../../enums/FeedEnums';
import ImageLoader from './ImageLoader.vue';

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
        AddFeedToList(res.description,res.data,res.cursor,res.seenAt,false);
    })
    .catch(err => {
        toast.add({summary:'Error', detail:`${err}`, severity:'error', group:'tr', life:3000});
    });
}

/**
 * Opens the associated User's profile in a new tab.
 * @param handle The handle of the User's profile that will be displayed in the new tab.
 */
function OpenProfileInNewTab(handle:string){
    window.open(`/profile/${handle}`);
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
    components:{
        Image,
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
        displaySelectedUserAccount(e:Event){
            //Cancel displaying `AccountPeek`
            AccountPeekState.cancelUserPeek(true);
            this.$router.push(`/profile/${this.handle}`);
            e.stopPropagation();//Prevent click "bubbling"
        },
        /**
         * Shows Options Menu allowing user to perform different actions
         * relating to the selected User.
         */
        showOptionsMenu(e:MouseEvent, userDid:string, userHandle:string){
            e.preventDefault();
            OptionsMenuState.currentMenuItems = [
                {Icon:MingcuteAddCircleLine,Label:'Create new User Feed',Action:function(){CreateUserFeed(userDid,userHandle)},Type:ItemType.Option},
                {Icon:MingcuteExternalLinkLine,Label:'Open Profile in New Tab',Action:function(){OpenProfileInNewTab(userHandle)},Type:ItemType.Option},
            ] as IOptionMenuItem[]
            OptionsMenuState.showOptionMenu(e);
        }
    }
})
</script>

<style scoped>
</style>