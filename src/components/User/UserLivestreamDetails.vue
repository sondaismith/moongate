<template>
    <div class="absolute z-20 flex w-full h-full" tabindex="-1" @keydown.tab="(e) => TrapFocus($el,e)">
        <div data-testid="userLivestreamDetails-close" @click="closeModal" :class="$attrs.class" class="absolute z-20 w-full h-full bg-slate-800/60 cursor-pointer"></div>
        <div class="relative z-30 flex flex-col max-w-[420px] mx-5 sm:mx-auto mb-auto mt-[10vh] pb-4 rounded-lg border border-outline bg-feedColumnBG text-primary">
            <div class="flex aspect-[1.90476/1] bg-slate-800 rounded-t-lg overflow-hidden">
                <img class="w-full object-cover" :src="typeof profileEmbedExternal != 'undefined' ? profileEmbedExternal.thumb : '../../assets/placeholder/no_banner_pattern.png'"/>
            </div>
            <div class="flex flex-col px-4 pt-2">
                <div class="flex flex-col gap-2">
                    <div class="flex flex-col">
                        <div class="font-bold">{{typeof profileEmbedExternal != 'undefined' ? profileEmbedExternal.title : "{Title} Username - Platform"}}</div>
                        <div class="flex gap-1 text-sm items-center">
                            <i-solar:earth-outline class="size-3 shrink-0"/>
                            <div class="text-xs">{{typeof profileEmbedExternal != 'undefined' ? profileEmbedExternal.uri : "website-url.com"}}</div>
                        </div>
                        <div v-if="typeof profileEmbedExternal != 'undefined'" class="mt-2 text-xs text-secondary">{{ profileEmbedExternal.description }}</div>
                    </div>
                    <SquareButton @click="openStreamLink">
                        <div class="mr-1">Watch Now</div>
                        <i-mingcute:external-link-line/>
                    </SquareButton>
                </div>
                <div class="h-[1px] bg-outline my-3"></div>
                <div class="flex items-center gap-2 justify-between">
                    <div class="flex items-center gap-2 overflow-hidden">
                        <AvatarRound :author-details="userProfile"/>
                        <div class="flex overflow-hidden flex-col shrink">
                            <div class="flex items-center gap-1 overflow-hidden">
                                <div class="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                                    {{ userProfile.displayName }}
                                </div>
                                <VerifiedBadge v-if="isUserVerified" class="size-4"/>
                            </div>
                            <div class="text-xs text-secondary whitespace-nowrap overflow-hidden text-ellipsis">@{{ userProfile.handle }}</div>
                        </div>
                    </div>
                    <SquareButton :prevent-shrink="true">Open Profile</SquareButton>
                </div>
            </div>
            <div class="flex absolute top-2 right-2 rounded-full p-[1px] bg-btn size-8 items-center justify-center">
                <button @click="closeModal" class="h-full w-full rounded-full shadow-none"><i-mingcute:close-fill class="text-lg mx-auto"/></button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { AppBskyActorDefs, AppBskyEmbedExternal } from '@atproto/api';
import { defineComponent, PropType } from 'vue'
import SquareButton from '../Utilities/SquareButton.vue';
import AvatarRound from '../Utilities/AvatarRound.vue';
import VerifiedBadge from '../Utilities/VerifiedBadge.vue';
import { AppState, TrapFocus } from '../../state/AppState.vue';

export default defineComponent({
    components:{
        AvatarRound,
        SquareButton,
        // VerifiedBadge
    },
    data(){
        return{
            TrapFocus,
        }
    },
    props:{
        userProfile:{
            type: Object as PropType<AppBskyActorDefs.ProfileViewBasic|AppBskyActorDefs.ProfileView|AppBskyActorDefs.ProfileViewDetailed>,
            required: true,
        }
    },
    computed:{
        profileEmbedExternal():AppBskyEmbedExternal.ViewExternal|undefined{
            return (typeof this.userProfile.status != 'undefined' && typeof this.userProfile.status.embed != 'undefined' && 'external' in this.userProfile.status.embed) ? this.userProfile.status.embed.external : undefined;
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
        /**Open the link  */
        openStreamLink(){
            if(typeof this.profileEmbedExternal != 'undefined'){
                window.open(this.profileEmbedExternal.uri,'_blank');
            }
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