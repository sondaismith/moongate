<template>
    <div tabindex="-1" @keydown.tab="(e) => TrapFocus($el,e)" class="z-30 flex w-full h-full" :class="[hideBackdrop ? '' : 'absolute']">
        <div v-if="!hideBackdrop" @click="closeModal" class="absolute bg-white/10 backdrop-blur-sm w-full h-full"></div>
        <div class="relative flex flex-col bg-focusBG w-[94%] max-w-[50rem]
        mx-auto my-auto rounded-lg overflow-hidden text-primary drop-shadow-md"
        :class="[hideBackdrop ? 'max-h-full' : 'max-h-[80%]']">
            <div class="flex flex-col bg-aboutPageBanner">
                <div class="flex items-center text-white md:h-24">
                    <AppLogo :is-button="false" class="h-28 text-white scale-100"/>
                    <div>
                        <div class="text-4xl" style="font-family: 'Cal Sans';"><span>Moongate</span></div>
                        <div class="text-sm sm:text-base font-light">Version: {{ versionDetails.version }}-{{ versionDetails.commitHash }}<span class="align-super text-xs">{{isTauri() ? 'Tauri' : 'Web'}}</span></div>
                        <div class="italic text-[10px] leading-[10px]">{{ versionDetails.buildDate }}</div>
                    </div>
                    <ExternalLink :link-url="repoURL" title="View GitHub Repo" class="text-primary hover:text-primary ml-auto mr-4 p-2
                    shadow-none text-xl transition-colors border-none rounded hover:bg-aboutPageBannerBtnHover
                    focus-visible:bg-aboutPageBannerBtnHover">
                        <i-simple-icons:github/>
                    </ExternalLink>
                </div>
            </div>
            <div class="flex flex-col h-full px-4 *:py-1  divide-outline divide-y">
                <div class="text-xl font-extralight">Desktop/Web Client for Bluesky</div>
                <div class="text-sm">Moongate is an alternative Client App for Bluesky, built using Tauri + Vue.
                    The goal is to create a lightweight, feature-filled app that is responsive and easy to use.</div>
            </div>
            <div class="flex flex-col md:flex-row md:items-center gap-1 px-4 pb-2 text-sm select-none">
                <div class="font-bold">Like the app? Support development by buying me a coffee:</div>
                <ExternalLink :link-url="donateURL" class="group flex self-start rounded p-1 text-primary
                transition-colors bg-donationButtonBG cursor-pointer outline-none focus-visible:outline-feedtypeBtnFocusHighlight">
                    <div class="flex gap-1 items-center">
                        <i-simple-icons:kofi class="transition-colors group-hover:text-donationButtonIconHover
                        group-focus-visible:text-donationButtonIconHover"/>
                        <div class="text-primary">Support</div>
                    </div>
                </ExternalLink>
            </div>
            <div class="h-0.5 bg-outline"></div>
            <div class="flex flex-col overflow-y-auto pt-2">
                <div class="px-4 text-xl font-semibold">Changelog:</div>
                <div class="flex flex-col gap-1 h-full px-4 divide-outline divide-y">
                    <div class="font-semibold">April 5th 2026</div>
                    <ul class="list-disc pl-4 py-1 text-sm">
                        <li>Updated how images are displayed when in the "Post Focus" view so that the User can swipe through any attached images.</li>
                        <li>
                            <span class="flex items-center gap-1">
                                <span>The User can now close the "Post Focus" view by pressing the</span>
                                <span class="flex items-center p-0.5 gap-1 px-1 rounded-md bg-primary/20"><i-mdi:keyboard-outline/><span>Esc</span></span>
                                <span>key.</span>
                            </span>
                        </li>
                        <li>See more details here: (<ExternalLink link-url="https://github.com/sondaismith/moongate/pull/298">#298</ExternalLink>)</li>
                    </ul>
                </div>
                <div class="flex flex-col gap-1 h-full px-4 divide-outline divide-y">
                    <div class="font-semibold">March 27th 2026</div>
                    <ul class="list-disc pl-4 py-1 text-sm">
                        <li>Updated display when viewing a Post Thread so that the quoted post in a Quote Retweet (QRT) is displayed underneath the main post content.</li>
                        <li>Post Thread view now has a "control bar" at the top of the component to provide post context as well as useful functions ('scroll to top', 'view post image' etc.).</li>
                        <li>See more details here: (<ExternalLink link-url="https://github.com/sondaismith/moongate/pull/294">#294</ExternalLink>)</li>
                    </ul>
                </div>
                <div class="flex flex-col gap-1 h-full px-4 divide-outline divide-y">
                    <div class="font-semibold">March 17th 2026</div>
                    <ul class="list-disc pl-4 py-1 text-sm">
                        <li>Fixed issue where image containers could not correctly identify the file extension of the new WEBP images the Bluesky CDN delivers by default.</li>
                        <li>Added ability to choose whether to save images as a WEBP or JPEG.</li>
                        <li>See more details here: (<ExternalLink link-url="https://github.com/sondaismith/moongate/pull/288">#288</ExternalLink>)</li>
                    </ul>
                </div>
                <div class="flex flex-col gap-1 h-full px-4 divide-outline divide-y">
                    <div class="font-semibold">March 13th 2026</div>
                    <ul class="list-disc pl-4 py-1 text-sm">
                        <li>Updated app so that the scroll position is saved and restored when navigating a Post Thread with the "Post Focus Modal" (<ExternalLink link-url="https://github.com/sondaismith/moongate/pull/286">#286</ExternalLink>).
                        </li>
                    </ul>
                </div>
                <div class="flex flex-col gap-1 h-full px-4 divide-outline divide-y">
                    <div class="font-semibold">February 10th 2026</div>
                    <ul class="list-disc pl-4 py-1 text-sm">
                        <li>Updated app so that application state is synced between all open web-based application instances.
                            <ul class="list-disc pl-4 text-sm">
                                <li>Modifying the displayed Feed List is synced between instances.</li>
                                <li>Modifying application settings is synced betweeen instances.</li>
                                <li>Logging in/out or changing browsing modes is synced betweeen instances.</li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div class="flex flex-col gap-1 h-full px-4 divide-outline divide-y">
                    <div class="font-semibold">January 22nd 2026</div>
                    <ul class="list-disc list-inside h-full py-1 text-sm">
                        <li>Updated "View Parent of Post" button that is displayed on "reply posts".
                            <ul class="list-disc list-inside h-full text-sm">
                                <li>Changed label from "Reply" to "View Parent".</li>
                                <li>Modified click behavior so that opening a Post that has been deleted is handled (albeit in a basic manner at the moment).</li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div class="flex flex-col gap-1 h-full px-4 divide-outline divide-y">
                    <div class="font-semibold">January 18th 2026</div>
                    <ul class="list-disc list-inside h-full py-1 text-sm">
                        <li>Updated how various app components handle loading images.</li>
                    </ul>
                </div>
                <div class="flex flex-col gap-1 h-full px-4 divide-outline divide-y">
                    <div class="font-semibold">January 1st 2026</div>
                    <ul class="list-disc list-inside h-full py-1 text-sm">
                        <li>Updated app to use Routes during interactions.
                            <ul class="list-disc list-inside h-full text-sm">
                                <li>This allows for easier navigation via backward/forward navigation buttons or shortcuts.</li>
                            </ul>
                        </li>
                        <li>Posts can be opened in a new tab via interacting with the Post timestamp.</li>
                        <li>User Accounts can be opened in a new tab via interacting with the User's Avatar.</li>
                    </ul>
                </div>
                <div class="flex flex-col gap-1 h-full px-4 divide-outline divide-y">
                    <div class="font-semibold">November 20th 2025</div>
                    <ul class="list-disc list-inside h-full py-1 text-sm">
                        <li>Added ability to Bookmark posts.
                            <ul class="list-disc list-inside h-full text-sm">
                                <li>The logged in User can view their Bookmarks by visiting their profile and selecting the "Saved" tab.</li>
                            </ul>
                        </li>
                        <li>Option Menus now have their items organized into groups.</li>
                    </ul>
                </div>
                <div class="flex flex-col gap-1 h-full px-4 divide-outline divide-y">
                    <div class="font-semibold">November 17th 2025</div>
                    <ul class="list-disc list-inside h-full py-1 text-sm">
                        <li>Added ability to Mute and Block Accounts.</li>
                        <li>Added "Account Settings" tab to Settings Panel.</li>
                        <li>Added "Moderation" options under "Account Settings". There are 2 available options:
                            <ul class="list-disc list-inside h-full text-sm">
                                <li>View Muted Accounts</li>
                                <li>View Blocked Accounts</li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div class="flex flex-col gap-1 h-full px-4 divide-outline divide-y">
                    <div class="font-semibold">November 8th 2025</div>
                    <ul class="list-disc list-inside h-full py-1 text-sm">
                        <li>Various Fixes:
                            <ul class="list-disc list-inside h-full text-sm">
                                <li>Feed Generator avatars are now displayed on Feed Buttons.</li>
                                <li>Fixed issue preventing "Trending Topic" Feeds from being created.</li>
                                <li>Fixed issue where placeholder account banner image was not accessible by application.</li>
                                <li>UI Updates.</li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div class="flex flex-col gap-1 h-full px-4 divide-outline divide-y">
                    <div class="font-semibold">November 5th 2025</div>
                    <ul class="list-disc list-inside h-full py-1 text-sm">
                        <li>Added ability to create "Feed Generator" Feeds.</li>
                    </ul>
                </div>
                <div class="flex flex-col gap-1 h-full px-4 divide-outline divide-y">
                    <div class="font-semibold">October 30th 2025</div>
                    <ul class="list-disc list-inside h-full py-1 text-sm">
                        <li>Updated Post creation process:
                            <ul class="list-disc list-inside h-full text-sm">
                                <li>Thread Gates can now be applied to Posts, limiting who can interact.</li>
                                <li>Posts can have images attached. Content labels can be applied, and ALT text can be added as well.</li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div class="flex flex-col gap-1 h-full px-4 divide-outline divide-y">
                    <div class="font-semibold">October 18th 2025</div>
                    <ul class="list-disc list-inside h-full py-1 text-sm">
                        <li>Updated Account Login process and account management:
                            <ul class="list-disc list-inside h-full text-sm">
                                <li>Used Account handles are now remembered and can be selected to quickly login again. (Password stil must be provided.)</li>
                                <li>The application now remembers if a Guest or an Authorized account was used last. If Guest was used last it will automatically be selected and used when returning.</li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div class="flex flex-col gap-1 h-full px-4 divide-outline divide-y">
                    <div class="font-semibold">October 10th 2025</div>
                    <ul class="list-disc list-inside h-full py-1 text-sm">
                        <li>Added "About" page.</li>
                        <li>Added application logo.</li>
                        <li>Added ability to reorder tabs on mobile/touch-screen devices.</li>
                        <li>Updated UI for "Post Focus" modal. Viewing on mobile/small-width screens should now be more user-friendly.</li>
                        <!-- <a href="#" class="text-xs text-blue-500 cursor-pointer">See more</a> -->
                    </ul>
                </div>
            </div>
            <div class="flex gap-1 px-4 py-2 text-xs">
                <div>Any issues? Report <ExternalLink :link-url="issuesURL">here!</ExternalLink></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import MingcuteCopyLine from '~icons/mingcute/copy-line';
import MingcuteWorld2Line from '~icons/mingcute/world-2-line';

import { isTauri } from '@tauri-apps/api/core';
import { defineComponent } from 'vue'
import { AppState, CopyTextToClipboard, TrapFocus } from '../../state/AppState.vue';
import { OptionsMenuState } from '../../state/OptionsMenuState.vue';
import { IOptionMenuItem, ItemType } from '../Utilities/OptionsMenu.vue';
import { openUrl } from '@tauri-apps/plugin-opener';
import AppLogo from '../SVG/AppLogo.vue';
import { GetVersion, IVersionDetails } from '../../lib/api/VersionService';
import ExternalLink from '../Utilities/ExternalLink.vue';

export default defineComponent({
    props:{
        hideBackdrop:{
            type:Boolean,
            default:false
        }
    },
    components:{
        AppLogo,
        ExternalLink,
    },
    data(){
        return{
            isTauri,
            TrapFocus,
            versionDetails:{} as IVersionDetails,
            repoURL: "https://github.com/sondaismith/moongate",
            issuesURL: "https://github.com/sondaismith/moongate/issues",
            donateURL: "https://ko-fi.com/sondaismith",
        }
    },
    methods:{
        /**
         * Method used to get the current version and build number
         * of the application. Returned values is based on what is
         * declared in package.json.
         */
        getBuildNumber(){
            console.log(import.meta.env.VITE_VUE_APP_VERSION);
            return import.meta.env.VITE_VUE_APP_VERSION;
        },
        closeModal(){
            this.$router.push('/');
        },
    },
    created() {
        this.versionDetails = GetVersion();
    },
    mounted() {
        this.$el.focus();
    },
})
</script>

<style scoped>
ul ul {
  @apply pl-4 list-disc
}
</style>