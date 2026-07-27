<template>
    <button data-testid="userlink" @click="e => showOptionsMenu(e,typeof userlinkValue != 'undefined' ? userlinkValue.slice(1) : '')"
    @contextmenu="e => showOptionsMenu(e,typeof userlinkValue != 'undefined' ? userlinkValue.slice(1) : '')" :title="`Create Feed for ${userlinkValue}`"
    class="group rounded bg-btn hover:bg-btnHover text-[12px] leading-3 shadow-none cursor-pointer
    border-none">
        <div class="w-full h-full rounded p-[3px] border-2 border-transparent
        group-focus-visible:border-searchbarFocusHightlight">
            <slot></slot>
        </div>
    </button>
</template>

<script lang="ts">
//Option Menu Icons
import MingcuteAddCircleLine from '~icons/mingcute/add-circle-line';
import MingcuteExternalLinkLine from '~icons/mingcute/external-link-line';
import MingcuteProfileFill from '~icons/mingcute/profile-fill';

import { defineComponent } from 'vue'
import { AddFeedToList, PrepareFeedData } from '../../state/FeedList.vue';
import { FeedEnums } from '../../enums/FeedEnums';
import { toast } from '../../state/AppState.vue';
import { OptionsMenuState } from '../../state/OptionsMenuState.vue';
import { IOptionMenuItem, ItemType } from './OptionsMenu.vue';
import { isTauri } from '@tauri-apps/api/core';
import { router } from '../../main';

/**
 * Method that adds a new User feed to the displayed list of Feeds based on
 * the User associated with this component.
 * Used by the context menu that is displayed when right-clicking `Userlink`.
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

/**
 * Displays specified User Profile in `UserFocusModal`.
 * @param userHandle Handle of the User Profile to display.
 */
function ShowUserProfile(userHandle:string){
    if(userHandle.trim() != '')
        router.push(`/profile/${userHandle}`);
}

export default defineComponent({
    props:{
        userlinkValue:String,
    },
    methods:{
        createUserFeed(){
            //Should cause a FeedColumn displaying posts
            //matching the clicked user (if they exist)
            this.$toast.add({summary:'Creating Feed...', detail:`Creating feed for ${this.userlinkValue }`, group:'tr', life:3000});
            PrepareFeedData(FeedEnums.Types.User,
            {
                id:'',
                did:'',
                handle:this.userlinkValue ? this.userlinkValue.slice(1) : '' ,
                name:'',
                type:FeedEnums.Types.User,
                icon:FeedEnums.Icons.User,
                tags:[]
            }
            )
            .then(res => AddFeedToList(res.description,res.data,res.cursor,res.seenAt,false))
            .catch(err => {
                toast.add({summary:'Error', detail:`${err}`, severity:'error', group:'tr', life:3000});
            });
        },
        /**
         * Shows Options Menu allowing user to perform different actions
         * relating to the User handle.
         */
        showOptionsMenu(e:MouseEvent, handle:string){
            e.preventDefault();
            OptionsMenuState.currentMenuItems = [
                {Icon:MingcuteProfileFill,Label:'View Profile',Action:function(){ShowUserProfile(handle)},Type:ItemType.Option},
                {Icon:MingcuteAddCircleLine,Label:'Create new User Feed',Action:function(){CreateUserFeed('',handle)},Type:ItemType.Option},
            ] as IOptionMenuItem[]
            if(!isTauri()){
                OptionsMenuState.currentMenuItems.push({Icon:MingcuteExternalLinkLine,Label:'Open Profile in New Tab',Action:function(){},Type:ItemType.RouterLink,route:`/profile/${handle}`});
            }
            OptionsMenuState.showOptionMenu(e);
        },
    }
})
</script>

<style scoped>
</style>