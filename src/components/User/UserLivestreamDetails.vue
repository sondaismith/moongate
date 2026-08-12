<template>
    <div data-testid="userLivestreamDetails" class="absolute z-30 flex w-full h-full" tabindex="-1" @keydown.tab="(e) => TrapFocus($el,e)">
        <div data-testid="userLivestreamDetails-close" @click="closeModal" :class="$attrs.class" class="absolute z-30 w-full h-full bg-slate-800/60 cursor-pointer"></div>
        <div class="w-full px-5">
            <div class="relative z-40 flex flex-col max-w-[420px] mx-auto mb-auto mt-[10vh] pb-4 rounded-lg border border-outline bg-feedColumnBG text-primary">
                <div class="flex aspect-[1.90476/1] bg-slate-800 rounded-t-lg overflow-hidden">
                    <ImageLoader v-if="typeof streamThumbnailSource != 'undefined'" :img-url="streamThumbnailSource" :fill-container="true" class="w-full object-cover"/>
                    <div v-else class="w-full bg-white" :style="`mask: url(${getPlaceholderImageSrc})`"></div>
                </div>
                <div class="flex flex-col px-4 pt-2">
                    <div class="flex flex-col gap-2">
                        <div class="flex flex-col">
                            <div data-testid="userLivestreamDetails-stream-title" class="font-bold leading-4 pb-1">{{typeof profileEmbedExternal != 'undefined' ? profileEmbedExternal.title : "{Title} Username - Platform"}}</div>
                            <div class="flex gap-1 text-sm items-center" title="Stream Link">
                                <i-mdi:earth class="size-3 shrink-0"/>
                                <div class="text-xs">{{typeof profileEmbedExternal != 'undefined' ? profileEmbedExternal.uri : "website-url.com"}}</div>
                            </div>
                            <div class="flex gap-1">
                                <div v-if="typeof profileStatus != 'undefined' && 'createdAt' in profileStatus.record"
                                class="flex gap-1 items-center text-xs text-secondary">
                                    <div title="Stream Start Time"><i-mdi:stopwatch-start-outline class="text-sm size-3 shrink-0"/></div>
                                    <div>{{ convertToLongTimestamp((profileStatus.record as unknown as ILiveStatusRecord).createdAt) }}</div>
                                    <div v-if="typeof profileStatus != 'undefined' && 'durationMinutes' in profileStatus.record"
                                    data-testid="userLivestreamDetails-stream-duration"
                                    class="flex rounded bg-btn px-1 text-primary text-xs select-none" title="Expected Length">
                                        {{ convertToHourMinuteTimestamp((profileStatus.record as unknown as ILiveStatusRecord).durationMinutes) }}
                                    </div>
                                </div>
                            </div>
                            <div v-if="typeof profileEmbedExternal != 'undefined'" class="mt-2 text-xs text-secondary">{{ profileEmbedExternal.description }}</div>
                        </div>
                        <SquareButton v-if="!isTauri()" @click="openStreamLink">
                            <div class="mr-1">Watch Now</div>
                            <i-mingcute:external-link-line/>
                        </SquareButton>
                        <SquareButton v-else @click="tryToShowOptionsMenu">
                            <div class="mr-1">Watch Now</div>
                            <i-mingcute:external-link-line/>
                        </SquareButton>
                    </div>
                    <div class="h-[1px] bg-outline my-3"></div>
                    <div class="flex items-center gap-2 justify-between">
                        <div class="flex items-center gap-2 overflow-hidden">
                            <AvatarRound :author-details="userProfile" :display-only="true"/>
                            <div class="flex overflow-hidden flex-col shrink">
                                <div class="flex items-center gap-1 overflow-hidden">
                                    <div data-testid="userLivestreamDetails-displayName" class="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis" :title="userProfile.displayName">
                                        {{ userProfile.displayName }}
                                    </div>
                                    <VerifiedBadge v-if="isUserVerified" class="size-4"/>
                                </div>
                                <div data-testid="userLivestreamDetails-handle" class="text-xs text-secondary whitespace-nowrap overflow-hidden text-ellipsis" :title="userProfile.handle">@{{ userProfile.handle }}</div>
                            </div>
                        </div>
                        <SquareButton data-testid="userLivestreamDetails-open-profile-button" @click="openUserProfile" class="bg-btn hover:bg-btnHover active:bg-btnActive text-sm shadow-none" button-padding-x="1" button-padding-y="0"
                        :prevent-shrink="true">Open Profile</SquareButton>
                    </div>
                </div>
                <div class="flex absolute top-2 right-2 rounded-full p-[1px] bg-btn size-8 items-center justify-center">
                    <FocusButton @click="closeModal" class="h-full w-full rounded-full outline-offset-[-3px]"><i-mingcute:close-fill class="text-lg mx-auto"/></FocusButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import MingcuteCopyLine from '~icons/mingcute/copy-line';
import MingcuteWorld2Line from '~icons/mingcute/world-2-line';

import { AppBskyActorDefs, AppBskyEmbedExternal } from '@atproto/api';
import { defineComponent, PropType } from 'vue'
import SquareButton from '../Utilities/SquareButton.vue';
import AvatarRound from '../Utilities/AvatarRound.vue';
import VerifiedBadge from '../Utilities/VerifiedBadge.vue';
import { AppState, CopyTextToClipboard, OpenLink, TrapFocus } from '../../state/AppState.vue';
import { convertToLongTimestamp, convertToHourMinuteTimestamp } from '../../helpers/converters';
import FocusButton from '../Utilities/FocusButton.vue';
import { isTauri } from '@tauri-apps/api/core';
import { OptionsMenuState } from '../../state/OptionsMenuState.vue';
import { IOptionMenuItem, ItemType } from '../Utilities/OptionsMenu.vue';
import ImageLoader from '../Utilities/ImageLoader.vue';

/**
 * Interface created to remove TS warnings created when
 * trying to work with the `record` object held in
 * `userProfile.status` that is typed as an `unknown`
 * object.
 */
interface ILiveStatusRecord{
    $type:string,
    createdAt:string,
    durationMinutes:number,
    // embed:{}, //might be EmbedExternal, but I don't need this much detail right now
    status:string
}

export default defineComponent({
    components:{
        AvatarRound,
        ImageLoader,
        SquareButton,
        FocusButton,
        // VerifiedBadge
    },
    data(){
        return{
            TrapFocus,
            convertToLongTimestamp,
            convertToHourMinuteTimestamp,
            isTauri,
        }
    },
    props:{
        userProfile:{
            type: Object as PropType<AppBskyActorDefs.ProfileViewBasic|AppBskyActorDefs.ProfileView|AppBskyActorDefs.ProfileViewDetailed>,
            required: true,
        }
    },
    computed:{
        /**
         * Computed value. Checks to see if the [ProfileView].status.embed.external
         * object exists - if it does it returns it, otherwise it returns `undefined`.
         */
        profileEmbedExternal():AppBskyEmbedExternal.ViewExternal|undefined{
            return (typeof this.userProfile.status != 'undefined' && typeof this.userProfile.status.embed != 'undefined' && 'external' in this.userProfile.status.embed) ? this.userProfile.status.embed.external : undefined;
        },
        /**
         * Computed value. Tries to get the thumbnail associated with an account's
         * live-stream. If one does not exist a default pattern image is shown
         * instead.
         */
        streamThumbnailSource():string|undefined{
            if(typeof this.profileEmbedExternal != 'undefined'){
                if(typeof this.profileEmbedExternal.thumb != 'undefined')
                    return this.profileEmbedExternal.thumb;
                else return undefined;
            }
            else return undefined;
        },
        /**
         * Computed value. Returns the URI needed to display the "banner image
         * placeholder" pattern based on the current app environment.
         */
        getPlaceholderImageSrc():string{
            if(import.meta.env.DEV) return '../../assets/placeholder/no_banner_pattern.svg';
            else return './assets/placeholder/no_banner_pattern.svg'
        },
        /**
         * Computed value. Checks to see if the [ProfileView].status object exists - if
         * it does it returns it, otherwise it returns `undefined`.
         */
        profileStatus():AppBskyActorDefs.StatusView|undefined{
            return typeof this.userProfile.status != 'undefined' ? this.userProfile.status : undefined;
        },
        /**
         * Method used to see if the viewed User is verified.
         */
        isUserVerified(){
            if(typeof this.userProfile != 'undefined' && typeof this.userProfile.verification != 'undefined' && this.userProfile.verification.verifiedStatus == 'valid')
                return true;
            return false;
        },
    },
    methods:{
        /**Open link to livestream in new tab. */
        openStreamLink(){
            if(typeof this.profileEmbedExternal != 'undefined'){
                window.open(this.profileEmbedExternal.uri,'_blank');
            }
        },
        /**Open associated User's profile page if not already viewing. */
        openUserProfile(){
            AppState.hideUserLivestreamInfo();
            if(this.userProfile.handle.trim() != '' && this.$route.path != `/profile/${this.userProfile.handle}`) this.$router.push(`/profile/${this.userProfile.handle}`);
        },
        /**
         * Attempt to show options menu for stream link. Will only show menu
         * if "live status" data is available.
         */
        tryToShowOptionsMenu(e:MouseEvent|KeyboardEvent){
            if(typeof this.profileEmbedExternal !='undefined'){
                this.showOptionsMenu(e,this.profileEmbedExternal.uri);
            }
        },
        /**
         * Shows Options Menu allowing user to perform different actions
         * relating to the selected link.
         */
        showOptionsMenu(e:MouseEvent|KeyboardEvent, linkURL:string){
            e.preventDefault();
            OptionsMenuState.currentMenuItems = [
                {Icon:MingcuteWorld2Line,Label:'Open in Default Browser',Action:function(){OpenLink(linkURL)},Type:ItemType.Option},
                {Icon:MingcuteCopyLine,Label:'Copy link to clipboard',Action:function(){CopyTextToClipboard(linkURL,'link')},Type:ItemType.Option},
            ] as IOptionMenuItem[]
            OptionsMenuState.showOptionMenu(e);
        },
        /**Close the "User Livestream Info" modal. */
        closeModal(){
            AppState.hideUserLivestreamInfo();
        }
    }
})
</script>

<style scoped>

</style>