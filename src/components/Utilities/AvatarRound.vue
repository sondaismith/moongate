<template>
    <div class="relative">
        <div data-testid="avatar-round" @click="displaySelectedUserAccount" @contextmenu="showOptionsMenu($event,authorDetails.did,authorDetails.handle)"
        @mouseover="AccountPeekState.waitBeforePeekingUser($event,did ? did : '')"
        @mouseleave="(_e) => AccountPeekState.cancelUserPeek()" class="flex rounded-full bg-slate-300 aspect-square
        border border-outline box-contents size-10 min-w-10 bg-contain hover:border-hover
        transition-[border-color] ease-linear duration-200 cursor-pointer overflow-hidden" :class="{'border-2 !border-accountLiveAvatarBorder hover:!border-accountLiveAvatarBorderHover' : userIsLive}">
            <ImageLoader v-if="typeof authorDetails.avatar != 'undefined'" :img-url="authorDetails.avatar" :fill-container="true" :loader-type="'spinner'" :class="{'blur-sm' : accountContainsSensitiveContent}"/>
            <i-mingcute:butterfly-2-fill v-else class="text-2xl h-full w-full p-1 text-blue-600"/>
        </div>
        <div v-if="userIsLive" data-testid="avatar-round-live-label" @click="displaySelectedUserAccount" class="absolute bottom-[-4px] left-1/2 -translate-x-1/2 px-1 rounded bg-accountLiveAvatarBorder
        cursor-pointer text-white text-[10px] font-bold leading-[14px]">LIVE</div>
    </div>
</template>

<script lang="ts">
//Option Menu Icons
import MingcuteAddCircleLine from '~icons/mingcute/add-circle-line';
import MingcuteExternalLinkLine from '~icons/mingcute/external-link-line';

import { defineComponent } from 'vue'
import { AccountPeekState } from '../../state/AccountPeekState.vue';
import { AppState, toast } from '../../state/AppState.vue';
import { isDid, AppBskyActorDefs } from '@atproto/api';
import { OptionsMenuState } from '../../state/OptionsMenuState.vue';
import { IOptionMenuItem, ItemType } from './OptionsMenu.vue';
import { AddFeedToList, PrepareFeedData } from '../../state/FeedList.vue';
import { FeedEnums } from '../../enums/FeedEnums';
import ImageLoader from './ImageLoader.vue';
import { UserFocusModalState } from '../../state/UserFocusModalState.vue';
import { PropType } from 'vue';
import { AppSettingsState } from '../../state/AppSettingsState.vue';

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
        id:userDid,
        did:userDid,
        handle:userHandle,
        name:'',
        icon:FeedEnums.Icons.User,
        type:FeedEnums.Types.User,
        tags:[]
    })
    .then(res => {
        AddFeedToList(res.description,res.data,res.cursor,res.seenAt,false,true,true);
    })
    .catch(err => {
        toast.add({summary:'Error', detail:`${err}`, severity:'error', group:'tr', life:3000});
    });
}

export default defineComponent({
    data(){
        return{
            AppState,
            AppSettingsState,
            AccountPeekState,
        }
    },
    props:{
        authorDetails:{
            type: Object as PropType<AppBskyActorDefs.ProfileView|AppBskyActorDefs.ProfileViewDetailed|AppBskyActorDefs.ProfileViewBasic>,
            required: true
        }
    },
    components:{
        Image,
        ImageLoader
    },
    emits:{
        /**Emit used to indicate the Avatar element has been clicked. */
        avatarClicked:(userDid:string|undefined) => {
            if(isDid(userDid)) return true;
            else return false;
        }
    },
    computed:{
        /**Is the currently displayed account livestreaming? */
        userIsLive(){
            let result = false;
            if(typeof this.authorDetails.status != 'undefined')
                result = this.authorDetails.status.status == 'app.bsky.actor.status#live' &&
                typeof this.authorDetails.status.isActive != 'undefined' && this.authorDetails.status.isActive;
            return result;
        },
        /**Does the currently displayed account's avatar/account contain sensitive content? */
        accountContainsSensitiveContent(){
            return AppState.getIfUserAccountContainsSensitiveContent(this.authorDetails) && AppSettingsState.Settings.spoilerImagesContainingSensitiveContent;
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
            if(typeof UserFocusModalState.currentUserPageDetails.ProfileData != 'undefined' &&
            UserFocusModalState.currentUserPageDetails.ProfileData.handle == this.authorDetails.handle) return; //do nothing if already on destination User page
            else this.$router.push(`/profile/${this.authorDetails.handle}`);
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
                {Icon:MingcuteExternalLinkLine,Label:'Open Profile in New Tab',Action:function(){},Type:ItemType.RouterLink,route:`/profile/${userHandle}`},
            ] as IOptionMenuItem[]
            OptionsMenuState.showOptionMenu(e);
        }
    }
})
</script>

<style scoped>
</style>