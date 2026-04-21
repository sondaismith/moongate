<template>
    <div data-testid="feed-edit-modal" tabindex="-1" @keydown="(e)=>TrapFocus($el,e)"
    class="absolute z-10 flex w-full h-full text-primary focus-visible:outline-none">
        <div data-testid="feedEditModal-close" @click="closeModal" :class="$attrs.class" class="absolute z-10 w-full h-full bg-slate-800/40 backdrop-blur-sm"></div>
        {{void "Modal Control"}}
        <div class="z-20 flex flex-col gap-1 w-[95%] md:max-w-[1024px] h-[92%] mx-auto my-auto rounded bg-feedColumnBG
            pb-4 [&>:not(:first-child)]:px-4 drop-shadow-lg backdrop-blur-0 overflow-hiddens">
            <div class="flex px-4 py-2 bg-aboutPageBanner items-center justify-between text-primary border-b border-outline">
                <div class="text-lg font-semibold select-none">Adding Feeds</div>
                <!-- <button class="flex gap-1 items-center px-2 py-0.5 rounded bg-btn hover:bg-btnHover hover:border-hover disabled:bg-disabledBG
                disabled:border-transparent disabled:text-disabled">View Queue</button> -->
                <SquareButton data-testid="feedEditModal-view-queue-button" class="bg-btn hover:bg-btnHover" button-padding-x="2" button-padding-y="0">
                    View Queue
                </SquareButton>
            </div>
            <div class="flex flex-col">
                <div class="flex gap-2 items-center">
                    <div class="text-2xl">{{modalPages[currentPage].title}}</div>
                    <div v-if="AppState.isCreatingFeed" class="flex bg-green-600 rounded-full px-2 py-1 items-center self-center">Creating</div>
                    <div v-if="AppState.isUpdatingFeed" class="flex bg-orange-600 rounded-full px-2 py-1 items-center self-center">Editing</div>
                    <div v-if="selectedFeedType.trim() != '' && currentPage != 0" class="flex border border-blue-600 rounded-full px-2 py-1 items-center self-center">{{ feedTypeOptions.find(x=> x.value == selectedFeedType)?.name.split(' ')[0] }} Feed</div>
                </div>
                {{ void "Pages" }}
                <div class="flex items-center w-full">
                    <template v-for="n in totalPages">
                        <div class="border border-primary rounded-full aspect-square p-1"
                            :class="{'bg-primary' : currentPage==n-1}"></div>
                        <div v-if="n != totalPages" class="h-[1px] bg-gray-500 w-full"></div>
                    </template>
                </div>
            </div>
            <div>{{ modalPages[currentPage].instruction }}</div>
            <div class="flex flex-col relative grow overflow-hidden">
                <Transition>
                    <div v-if="currentPage == 0" class="h-full w-full">
                        <div class="flex flex-col gap-2">
                            <div class="flex items-start flex-wrap gap-1">
                                <!-- <PillButton data-testid="feedEditModal-user-feed-button" @click="selectFeedType(FeedEnums.Types.User)"
                                class="px-4 py-2 border-2 border-outlineLighter bg-slate-700">User</PillButton>
                                <PillButton data-testid="feedEditModal-tag-feed-button" @click="selectFeedType(FeedEnums.Types.Tag)">Tag</PillButton>
                                <PillButton data-testid="feedEditModal-trending-feed-button" @click="selectFeedType(FeedEnums.Types.Trending)">Trending</PillButton>
                                <PillButton :disabled="!AppState.isAuthBrowsing"
                                @click="selectFeedType(FeedEnums.Types.Notifications)"
                                :title="!AppState.isAuthBrowsing ? 'Login Required' : ''">
                                    Notifications
                                </PillButton> -->
                                <!-- <PillButton :disabled="true">Mentions</PillButton>
                                <PillButton :disabled="true">DMs</PillButton> -->
                                <div class="flex flex-wrap gap-2">
                                    <button v-for="item in feedTypeOptions" :key="item.id"
                                    @click="selectFeedType(item.value)"
                                    tabindex="0"
                                    :data-testid="`feedEditModal-${item.name.toLowerCase()}-feed-button`"
                                    class="group flex gap-1 cursor-pointer items-center border-2 outline-none border-transparent rounded-md transition-colors
                                    bg-btn select-none p-[1px] overflow-hidden"
                                    :class="[item.value == selectedFeedType ? '!border-feedtypeBtnSelected' : '',
                                        !AppState.isAuthBrowsing && (item.value == FeedEnums.Types.Notifications || item.value == FeedEnums.Types.Following) ? 'bg-disabled' : 'hover:bg-feedTypeBtnHover'
                                    ]">
                                        <div class="flex items-center gap-1 px-2 border-2 border-transparent group-focus-visible:border-feedtypeBtnFocusHighlight rounded-md">
                                            <FeedIcon :icon="item.value"/>
                                            <div>{{ item.name }}</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                            <div v-if="selectedFeedType.trim() != ''" class="flex self-start border border-outline rounded p-1">
                                <TransitionGroup>
                                    <div v-if="selectedFeedType == FeedEnums.Types.User">A User feed allows you to see all the content shared by a specific User account (Posts, Shares, Replies, etc.)</div>
                                    <div v-else-if="selectedFeedType == FeedEnums.Types.Tag">A Tag Feed displays the latest posts matching specified hashtags.</div>
                                    <div v-else-if="selectedFeedType == FeedEnums.Types.Trending">A Trending Feed will display Bluesky's currently trending topics in a list.</div>
                                    <div v-else-if="selectedFeedType == FeedEnums.Types.FeedGenerator">Select a Custom Feed to display from a List.</div>
                                    <div v-else-if="selectedFeedType == FeedEnums.Types.Following">
                                        <div v-if="!AppState.isAuthBrowsing" class="font-medium text-feedHighlight">Login Required</div>
                                        View timeline of posts from all your followed accounts.
                                    </div>
                                    <div v-else-if="selectedFeedType == FeedEnums.Types.Notifications">
                                        <div v-if="!AppState.isAuthBrowsing" class="font-medium text-feedHighlight">Login Required</div>
                                        Notifications will create a Feed Column that displays all of the currently logged in User's notifications.
                                    </div>
                                </TransitionGroup>
                            </div>
                        </div>
                    </div>
                    <div data-testid="feedEditModal-options-page" v-else-if="currentPage == 1" class="flex flex-col h-full w-full">
                        <InLaInput data-testid="feedEditModal-tag-input" v-if="selectedFeedType == FeedEnums.Types.Tag" @inlainput-submit="trySubmitTags" :emit-on-enter="true" v-model="feedFilters.tag" text-label="Tag"/>
                        <div v-if="selectedFeedType == FeedEnums.Types.Tag" class="flex flex-col mt-1 overflow-x-hidden">
                            <div class="mb-1">Discovered Tags:</div>
                            <div data-testid="feedEditModal-valid-tag-container" class="flex gap-1 flex-wrap">
                                <div v-for="n, index in validTags" :key="index"
                                class="px-2 py-1 rounded-full select-none bg-blue-500 hover:bg-blue-400 break-all">
                                    {{ n }}
                                </div>
                            </div>
                        </div>
                        <UserSearchBar data-testid="feedEditModal-user-search-bar"
                        v-if="selectedFeedType == FeedEnums.Types.User"
                        @user-selected="selectUser" :data-list="searchResults"/>
                        <div v-if="selectedFeedType == FeedEnums.Types.Trending">
                            <div>No Options Currently</div>
                            <!-- <SquareButton @click="getTrending">Get Trending</SquareButton> -->
                        </div>
                        <div v-if="selectedFeedType == FeedEnums.Types.FeedGenerator" class="flex h-full">
                            <div class="flex flex-col gap-1 w-full">
                                <FilterBar :filter-vmodel="feedFilters.feedGenerator.searchTerm" :show-clear-button="viewingFeedGenSearchResults"
                                placeholder-text="Search Feeds..."
                                :disabled="awaitingInitialCustomFeedData || awaitingSearchCustomFeedData"
                                @update:filter-vmodel="newValue => feedFilters.feedGenerator.searchTerm = newValue"
                                @clear-filter-clicked="getCustomFeeds" @enter-key-up="searchForFeedGenerators"/>
                                <div v-if="selectedFeedItems.length>0" class="pt-1 w-full max-h-16 min-h-16 border-b pb-1 border-outline overflow-y-auto">
                                    <div class="flex gap-1">
                                        <div tabindex="-1" class="flex flex-wrap gap-1 w-full items-start">
                                            <button v-for="n in selectedFeedGenerators" @click="toggleFeedGeneratorSelection(n.generator.uri)"
                                            :title="'Remove &quot;'+n.generator.displayName+'&quot; Feed'"
                                            class="flex shrink-0 grow-0 items-center gap-1 bg-itemTagBG transition-colors border-2 border-transparent
                                            active:bg-itemTagBGActive hover:border-itemTagBorder active:border-itemTagBGActive focus-visible:border-itemTagBorder
                                            outline-none rounded p-0.5 px-1 text-primary text-xs text-nowrap cursor-pointer shadow-none">
                                                <div>{{ n.generator.displayName }}</div>
                                                <i-mingcute:close-circle-line/>
                                            </button>
                                        </div>
                                        <SquareButton v-if="selectedFeedItems.length>0" @click="clearSelectedFeeds" title="Clear All Selected Feeds"
                                        class="self-start h-auto sticky top-0 ml-auto bg-deleteBtnBG hover:bg-deleteBtnBGHover active:bg-deleteBtnBGActive text-white text-sm text-nowrap"
                                        focus-padding="0.5" button-padding="0.5">
                                            Clear Selected
                                        </SquareButton>
                                    </div>
                                </div>
                                <div class="flex flex-col gap-1 h-full overflow-y-auto preload-gutter">
                                    <div class="flex gap-1 items-center sticky top-0 py-1 bg-feedColumnBG shadow-scroll-underline">
                                        <div class="text-lg">Discover New Feeds</div>
                                        <div><i-mingcute:sparkles-fill title="Discover New Feed Generators" class="shrink-0 text-yellow-500" /></div>
                                        <div class="text-sm text-secondary">{{ customFeedData.length }} feed(s) loaded<span v-if="selectedFeedItems.length>0">, {{ selectedFeedItems.length }} selected</span></div>
                                    </div>
                                    <div v-if="!awaitingInitialCustomFeedData && !awaitingSearchCustomFeedData && customFeedData.length>0" class="flex flex-wrap gap-2 py-1 pt-2 pl-1 pr-2">
                                        <CustomFeedButton v-for="n in customFeedData" class="min-w-64 w-full sm:flex-[1_0_32%]" :feed-generator-view="n.generator"
                                        @feed-generator-selected="toggleFeedGeneratorSelection" :selected="n.selected"/>
                                        <button v-if="!viewingFeedGenSearchResults" @click="loadMoreFeedGenerators" :disabled="awaitingAdditionalCustomFeedData"
                                        class="flex gap-1 items-center justify-center py-1 w-full rounded bg-btn hover:bg-btnHover
                                        hover:border-hover disabled:bg-disabledBG disabled:border-transparent disabled:text-disabled">
                                            <i-mingcute:loading-fill v-if="awaitingAdditionalCustomFeedData" class="spinner"/>
                                            <i-mingcute:plus-fill v-else/>
                                            <div>Load More</div>
                                        </button>
                                    </div>
                                    <div v-else-if="awaitingInitialCustomFeedData || awaitingSearchCustomFeedData" class="flex flex-wrap gap-2 py-1 pl-1 pr-2">
                                        <CustomFeedButtonPlaceholder v-for="n in 5" class="min-w-64 w-full sm:flex-[1_0_32%]"/>
                                    </div>
                                    <div v-else-if="viewingFeedGenSearchResults && customFeedData.length<1" class="pt-2">
                                        <div class="flex flex-col gap-1 w-full p-3 rounded border border-outline">
                                            <div class="flex gap-1 items-center">
                                                <div class="text-lg font-semibold">No Results</div>
                                                <i-mingcute:search-3-line/>
                                            </div>
                                            <hr class="border-outline"/>
                                            <div class="text-sm">No Results found matching "{{ feedFilters.feedGenerator.lastSearchTerm }}"</div>
                                        </div>
                                    </div>
                                    <div v-else class="pt-2">
                                        <div class="flex flex-col gap-1 w-full p-3 rounded border border-outline">
                                            <div class="flex gap-1 items-center">
                                                <div class="text-lg font-semibold">Error Retrieving Feed Generators</div>
                                                <i-mingcute:wifi-off-line/>
                                            </div>
                                            <hr class="border-outline"/>
                                            <div class="text-sm">Feed Generators could not be reached at this time</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-if="selectedFeedType == FeedEnums.Types.Following">
                            <div>No Options</div>
                        </div>
                        <div v-if="selectedFeedType == FeedEnums.Types.Notifications">
                            <CheckBox @value-toggled="toggleJustMentions" :model-value="feedFilters.notifications.justNotifs">Mentions Only</CheckBox>
                            <!-- <SquareButton @click="testGetNotifs">Load Notifs</SquareButton> -->
                        </div>
                    </div>
                    <div data-testid="feedEditModal-summary-page" v-else-if="currentPage == 2"
                    class="flex flex-col gap-1 h-full overflow-hidden">
                        <div class="flex flex-col">
                            <div class="text-xl font-extralight">Feed Type</div>
                            <div class="leading-3 text-sm">{{ selectedFeedType.split('_').map(x => x[0].toUpperCase()+x.slice(1)).join(' ') }}</div>
                        </div>
                        <hr class="border-outline my-1"/>
                        <div v-if="selectedFeedType == FeedEnums.Types.FeedGenerator"
                        class="flex items-center gap-2 p-2 rounded text-white text-xs md:text-sm font-semibold bg-feedNoticeBG italic">
                                <i-mingcute:information-line class="size-5 shrink-0"/>
                                <div>Please note: Some Feeds may not be able to be created/viewed without using a Bluesky account,
                                while others may no longer be active/available.</div>
                        </div>
                        <div v-if="selectedFeedType == FeedEnums.Types.Tag">Tags: {{ validTags.join(', ') }}</div>
                        <div v-else-if="selectedFeedType == FeedEnums.Types.User"
                        class="flex flex-col overflow-auto divide-y divide-outline">
                            <div v-if="!isAwaitingProfileData" class="flex flex-col gap-1 w-full">
                                <div class="flex rounded-full overflow-hidden h-20 mx-auto aspect-square bg-searchbarHandle justify-center items-center bg-cover text-2xl">
                                    <i-mingcute:user-add-fill v-if="typeof feedFilters.user.avatar == 'undefined'"/>
                                    <ImageLoader v-else :img-url="feedFilters.user.avatar" :fill-container="true" loader-type="spinner"/>
                                </div>
                                <div class="flex w-full overflow-hidden flex-col items-start">
                                    <div class="flex gap-1 items-center w-full overflow-hidden">
                                        <div class="whitespace-nowrap overflow-hidden text-ellipsis">{{ feedFilters.user.displayName }}</div>
                                        <VerifiedBadge v-if="isUserVerified(feedFilters.user)" class="size-4"/>
                                    </div>
                                    <div class="text-xs text-searchbarHandle">@{{ feedFilters.user.handle }}</div>
                                </div>
                                <div class="flex gap-2 text-sm text-secondary">
                                    <div v-if="!AppSettingsState.Settings.isHidingFollowers" class="flex gap-1"><div class="font-bold">{{ getCompactNumberValue(feedFilters.user.followersCount) }}</div> <div>followers</div></div>
                                    <div v-if="!AppSettingsState.Settings.isHidingFollowing" class="flex gap-1"><div class="font-bold">{{ getCompactNumberValue(feedFilters.user.followsCount) }}</div> <div>following</div></div>
                                    <div class="flex gap-1"><div class="font-bold">{{ getCompactNumberValue(feedFilters.user.postsCount) }}</div> <div>posts</div></div>
                                </div>
                                <div class="w-full text-secondary text-xs whitespace-pre-wrap">
                                    {{feedFilters.user.description ? feedFilters.user.description : 'No Description'}}
                                </div>
                            </div>
                            <div v-else class="animate-pulse flex flex-col gap-2 w-full p-2">
                                <div class="flex rounded-full h-20 mx-auto aspect-square bg-slate-500 justify-center items-center bg-cover text-2xl">
                                    <i-mingcute:user-add-fill/>
                                </div>
                                <div class="flex flex-col gap-1">
                                    <div class="rounded-sm h-4 w-32 bg-slate-500"></div>
                                    <div class="rounded-sm h-4 w-40 bg-slate-500"></div>
                                </div>
                                <div class="flex flex-col gap-1">
                                    <div class="rounded-sm h-4 w-full bg-slate-500"></div>
                                    <div class="rounded-sm h-4 w-full bg-slate-500"></div>
                                    <div class="rounded-sm h-4 w-1/3 bg-slate-500"></div>
                                </div>
                            </div>
                        </div>
                        <div v-else-if="selectedFeedType == FeedEnums.Types.Trending">
                            <div>No Options Currently</div>
                        </div>
                        <div v-else-if="selectedFeedType == FeedEnums.Types.FeedGenerator" class="flex flex-col gap-2 overflow-y-auto preload-gutter">
                            <div class="flex items-center gap-1 bg-feedColumnBG sticky top-0 pb-1 shadow-scroll-underline">
                                <div class="text-xl font-bold">Selected Feeds</div>
                                <div class="text-sm text-secondary">{{ selectedFeedItems.length }} item(s)</div>
                            </div>
                            <div v-if="selectedFeedItems.length>0" class="flex flex-wrap gap-1 pt-1">
                                <CustomFeedButton v-for="fg in selectedFeedItems" :feed-generator-view="fg"
                                :display-only="true" @feed-generator-selected="toggleFeedGeneratorSelection" class="min-w-64 w-full sm:flex-[1_0_32%]"/>
                            </div>
                            <div v-else>
                                <div class="font-bold">No Feeds Selected</div>
                                <div class="text-sm">Please return to the previous page and select a Feed Generator.</div>
                            </div>
                        </div>
                        <div v-else-if="selectedFeedType == FeedEnums.Types.Following">
                            <div>No Options</div>
                        </div>
                        <div v-else-if="selectedFeedType == FeedEnums.Types.Notifications">
                            <div>Mentions Only? {{ feedFilters.notifications.justNotifs }}</div>
                        </div>
                    </div>
                </Transition>
                <!-- <div v-for="page in modalPages">{{ page.title }}</div> -->
            </div>
            <div class="flex mt-2 justify-between">
                <SquareButton data-testid="feedEditModal-back-button" @click="backOnePage"
                tabindex="0" class="bg-btn hover:bg-btnHover">
                    {{currentPage == 0 ? 'Cancel':'Back'}}
                </SquareButton>
                <div class="flex">
                    <SquareButton data-testid="feedEditModal-next-page-button"
                    v-if="canGoToNextPage"
                    @click="forwardOnePage"
                    class="bg-btn hover:bg-btnHover" tabindex="0">Next</SquareButton>
                    <SquareButton data-testid="feedEditModal-create-button" @click="createFeeds()"
                    v-if="areCreatePostConditionsMet && selectedFeedItems.length>0"
                    :is-disabled="attemptingToCreateFeed"
                    class="bg-submitBtnBG hover:bg-submitBtnBGHover focus-visible:bg-submitBtnBGHover active:bg-submitBtnBGActive text-white">
                        <div class="flex gap-1 items-center">
                            <i-mingcute:loading-fill v-if="attemptingToCreateFeed" class="text-primary spinner h-4 w-4"/>
                            <div>Create Feeds</div>
                        </div>
                    </SquareButton>
                    <SquareButton data-testid="feedEditModal-create-button" @click="createFeed()"
                    v-else-if="areCreatePostConditionsMet"
                    class="bg-submitBtnBG hover:bg-submitBtnBGHover focus-visible:bg-submitBtnBGHover active:bg-submitBtnBGActive text-white"
                    :is-disabled="attemptingToCreateFeed">Submit</SquareButton>
                </div>
            </div>
            <Transition>
                <div v-if="selectedFeedType == FeedEnums.Types.FeedGenerator && attemptingToCreateFeed"
                class="absolute z-10 flex justify-center h-full w-full right-0 bottom-0 rounded bg-slate-800/70">
                    <div class="flex flex-col gap-1 items-center justify-center">
                        <TransitionGroup name="list">
                            <div v-for="(n,index) in feedCreationStatus" :key="index"
                            class="flex gap-1 px-2 py-1 rounded items-center bg-focusBG border border-modernToggleBtnBorder select-none">
                                <div>{{ n.message }}</div>
                                <i-mingcute:loading-fill v-if="!n.attempted" class="text-primary spinner h-4 w-4"/>
                                <i-mingcute:check-fill v-else-if="n.attempted && n.success" class="text-green-400 h-4 w-4"/>
                                <i-mingcute:close-fill v-else-if="n.attempted && !n.success" class="text-deleteBtnBG h-4 w-4"/>
                            </div>
                        </TransitionGroup>
                    </div>
                </div>
            </Transition>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { FeedEnums } from '../../enums/FeedEnums.ts'
import PillButton from '../Utilities/PillButton.vue';
import InLaInput from '../Utilities/InLaInput.vue';
import SquareButton from '../Utilities/SquareButton.vue';
import UserSearchBar from '../Utilities/UserSearchBar.vue';
import { AppState, toast, TrapFocus } from '../../state/AppState.vue';
import { AddFeedToList, FeedState, GetFeed, PrepareFeedData, UpdateFeedDetails } from '../../state/FeedList.vue';
import { ProfileView, ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import CheckBox from '../Utilities/CheckBox.vue';
import { GetBrowsingAgent } from '../../lib/api.vue';
import { isUserVerified } from '../../helpers/states';
import { getCompactNumberValue } from '../../helpers/converters';
import { AppSettingsState } from '../../state/AppSettingsState.vue';
import CustomFeedButton from './CustomFeedButton.vue';
import { IFeedCreationStatus, IFeedGeneratorSelection } from '../../interfaces/FeedInterfaces';
import CustomFeedButtonPlaceholder from '../Placeholder/CustomFeedButtonPlaceholder.vue';
import { AppBskyFeedDefs } from '@atproto/api/dist/client';
import { IUserSearchResult } from '../../interfaces/UserInterfaces';
import FilterBar from '../Utilities/FilterBar.vue';
import { PropType } from 'vue';
import ImageLoader from '../Utilities/ImageLoader.vue';
import { BroadcastChannelTarget, BroadcastObject, toRawDeep } from '../../types/BroadcastChannelTypes.ts';

export default defineComponent({
    components:{
        PillButton,
        SquareButton,
        InLaInput,
        UserSearchBar,
        CheckBox,
        CustomFeedButton,
        CustomFeedButtonPlaceholder,
        FilterBar,
        ImageLoader,
    },
    props:{
        feedType: Object as PropType<FeedEnums.Types>,
        /**Used to show summary page for Feed creation - if value is not 'summary' navigation moves back to the start of the process. */
        summary: String,
    },
    data(){
        return{
            AppState,
            AppSettingsState,
            userPromptText: 'What type of Feed do you want to add?',
            modalPages:[
                { title:'What type of Feed is it?', instruction: 'Select Below:'},
                { title:'What do you want to see?', instruction: 'Select filter(s) below:'},
                { title:'Summary', instruction: 'Are these settings correct?'},
            ],
            feedFilters:{
                tag:'',
                user:{
                    did:'',
                    handle:'',
                    displayName:''
                } as ProfileViewDetailed,
                notifications:{
                    justNotifs:false,
                },
                feedGenerator:{
                    searchTerm:'',
                    lastSearchTerm:'',
                }
            },
            /**Are we currently waiting for Profile Data request(s) from the API to complete?*/
            isAwaitingProfileData:false,
            currentPage:0,
            totalPages:3,
            feedTypeOptions:[
                {id:0, name:'User',value:FeedEnums.Types.User},
                {id:1, name:'Tag',value:FeedEnums.Types.Tag},
                {id:2, name:'Trending',value:FeedEnums.Types.Trending},
                {id:3, name:'Custom Feed',value:FeedEnums.Types.FeedGenerator},
                {id:4, name:'Following',value:FeedEnums.Types.Following},
                {id:5, name:'Notifications',value:FeedEnums.Types.Notifications},
            ],
            selectedFeedType:"",
            feedTypeSelected:false,
            feedSpecificationsSet:false,
            searchResults:[
                {did:'asjdy8383h31', name:'Jimmy', handle:'brainblast', pfp:'src/assets/test-media/posts/image04.png'},
                {did:'033jo3hcbccs', name:'James', handle:'serectserviced'},
                {did:'4000djjeaj33', name:'Johnathon', handle:'jjrenttoomuch', pfp:'src/assets/test-media/posts/image07.png'},
                {did:'skiei229iix9', name:'Jack', handle:'mybodyjackjack', pfp:'src/assets/test-media/posts/image08.png'},
                {did:'nneu302bshw3', name:'Samuel', handle:'wockafella'},
            ],
            searchTerm:'',
            debouncedSearchTerm:'',
            /**Current text used to filter the displayed Feed Generators. */
            customFeedFilterText:'',
            /**Are we waiting for the 1st collection Custom Feed GeneratorView objects to be returned? */
            awaitingInitialCustomFeedData:false,
            /**Are we trying to load Custom Feed GeneratorView objects via "Load more" button? */
            awaitingAdditionalCustomFeedData:false,
            /**Are we waiting for results from a Feed Generator search query? */
            awaitingSearchCustomFeedData:false,
            /**Object that holds the default Bluesky-created Feeds. */
            defaultFeedData:[] as IFeedGeneratorSelection[],
            /**Object that holds the most popular custom Feed Generator objects. */
            customFeedData: [] as IFeedGeneratorSelection[],
            /**Object that holds all the Feed Generators the User has selected. */
            selectedFeedItems: [] as AppBskyFeedDefs.GeneratorView[],
            /**Array used to display the status of each attempt to create a Feed from multiple selection. */
            feedCreationStatus: [] as IFeedCreationStatus[],
            // [{
            //     generator:{
            //         cid:'',
            //         creator:{
            //             did:'fake-did',
            //             handle:'fake-dude.bsky.app',
            //             displayName:'moongate test suite',
            //             avatar:'src/assets/test-media/posts/image04.png'
            //         },
            //         did:'fake-did',
            //         avatar:'src/assets/test-media/posts/image01.png',
            //         displayName:'Fake Feed 1',
            //         description:'A dummy Custom Feed created for testing purposes.',
            //         likeCount:12345,
            //         indexedAt: new Date().toISOString(),
            //         uri:'www.google.com'
            //     },
            //     selected:false
            // }] as IFeedGeneratorSelection[],
            /**Cursor used to retrieve more Feed Generators via Bluesky API. */
            customFeedDataCursor:'' as string|undefined,
            /**Is the User currently viewing returned Feed Generators filter with a search term? */
            viewingFeedGenSearchResults: false,
            attemptingToCreateFeed: false,
            FeedEnums,
            TrapFocus,
            isUserVerified,
            getCompactNumberValue
        }
    },
    methods:{
        /**
         * Moves forward one page in the modal. Will loop back
         * to the first page if attempting to reach an
         * out-of-bounds page.
         */
        forwardOnePage(){
            if(this.currentPage+1 >= this.totalPages){
                this.currentPage=0;
                this.selectedFeedType="";
            }
            else{
                if(this.currentPage == 0 && this.selectedFeedType.trim() != '' && Object.values<string>(FeedEnums.Types).includes(this.selectedFeedType)){
                    this.$router.push(`/create/feed/${this.selectedFeedType}`);
                }
                else if(this.currentPage == 1){
                    this.$router.push(`/create/feed/${this.selectedFeedType}/summary`);
                }
            }
            this.feedTypeSelected = true;
            if(this.customFeedData.length<1 && this.currentPage == 1 && this.selectedFeedType == FeedEnums.Types.FeedGenerator) this.getCustomFeeds();
            if(this.validTags.length>0 || this.feedFilters.user) this.feedSpecificationsSet = true;
            (this.$el as HTMLElement).focus();
        },
        /**
         * Moves back one page in the modal. Closes the modal
         * if used when on the first page.
         */
        backOnePage(){
            if(this.currentPage-1 > -1){
                console.log(this.$route)
                if(this.currentPage >= 1) this.$router.push(this.$route.path.substring(0, this.$route.path.lastIndexOf('/')));
                this.feedTypeSelected = false;
                this.feedSpecificationsSet = false;
            }
            else{
                this.closeModal()
            }
        },
        /**
         * Method that fires when the user chooses the type of
         * Feed they wish to create.
         * @param feedType The feed type the user wishes to create.
         */
        selectFeedType(feedType:FeedEnums.Types){
            this.selectedFeedType = feedType;
            console.log(this.selectedFeedType);
            //this.forwardOnePage();
        },
        /**
         * Method that fires when a user is selected in the
         * `UserSearchBar` control.
         * @param user Object representing the chosen user.
         */
        selectUser(user:ProfileView){
            this.getUserProfileViewDetailed(user.did)
            .then(res => {
                if(typeof res != 'undefined') this.feedFilters.user = res
            })
            this.forwardOnePage();
        },
        /**
         * Method used to get detailed Bluesky profile information for a specific
         * User.
         * @param userDID The DID of the User to get the detailed Profile Details for.
         */
        async getUserProfileViewDetailed(userDID:string):Promise<ProfileViewDetailed|undefined>{
            let ud:ProfileViewDetailed|undefined = undefined;
            this.isAwaitingProfileData = true;
            await GetBrowsingAgent().getProfile({actor:userDID}).
            then(res => {
                ud = res.data
                this.isAwaitingProfileData = false;
            })
            .catch(err => {
                console.log(err);
            })
            return ud;
        },
        grabHashtags(){
            var s = this.feedFilters.tag.split(',');
            //trim whitespace
            for (let i = 0; i < s.length; i++) {
                s[i] = `#${s[i].trim()}`;
            }
            return s.join(' ');
        },
        /**
         * Used by the Tag entry input control on Enter key press. Used to check if the
         * input values are valid before moving forward to the Feed creation details
         * summary page.
         */
        trySubmitTags(){
            if(this.isTagSpecsEntryComplete){
                this.forwardOnePage();
            }
        },
        async testGetNotifs(){
            if(AppState.isAuthBrowsing){
                await GetBrowsingAgent().listNotifications()
                .then(res => {
                    console.log(res.data);
                })
                .catch(err => console.log(err));
            }
        },
        async getTrending(){
            await GetBrowsingAgent().app.bsky.unspecced.getTrendingTopics()
            .then(res => {
                console.log('Result from getTrendingTopics():');
                console.log(res.data);
            });
            await GetBrowsingAgent().app.bsky.unspecced.getTrends()
            .then(res => {
                console.log('Result from getTrends():');
                console.log(res.data);
            });
        },
        /**
         * Method that loads the Default and Most Popular Feed Generators via Bluesky's API.
         */
        async getCustomFeeds(){
            this.awaitingInitialCustomFeedData = true;
            this.viewingFeedGenSearchResults = false;
            this.defaultFeedData = [];
            this.customFeedData = [];
            this.selectedFeedItems = [];
            this.feedFilters.feedGenerator.searchTerm = '';
            this.feedFilters.feedGenerator.lastSearchTerm = '';
            //Get "Discover" Feed
            GetBrowsingAgent().app.bsky.feed.getFeedGenerators({feeds:['at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot']})
            .then(res => {
                res.data.feeds.forEach(element => {
                    this.defaultFeedData.push({generator:element,selected:false});
                });
            })
            .catch(err => {
                console.log(err);
                toast.add({summary:'Error', detail:`${err}`, severity:'error', group:'tr', life:3000});
            });
            //Get "User Created" Feeds
            GetBrowsingAgent().app.bsky.unspecced.getPopularFeedGenerators({limit:10,cursor:this.customFeedDataCursor})
            .then(res => {
                res.data.feeds.forEach(element => {
                    this.customFeedData.push({generator:element,selected:false});
                });
                this.customFeedDataCursor = res.data.cursor;
            })
            .catch(err => {
                console.log(err);
                toast.add({summary:'Error', detail:`${err}`, severity:'error', group:'tr', life:3000});
            })
            .finally(()=>{this.awaitingInitialCustomFeedData = false;})
        },
        /**Method used to load additional Feed Generators through Bluesky's API after the 1st request. */
        async loadMoreFeedGenerators(){
            this.awaitingAdditionalCustomFeedData = true;
            GetBrowsingAgent().app.bsky.unspecced.getPopularFeedGenerators({limit:10,cursor:this.customFeedDataCursor})
            .then(res => {
                res.data.feeds.forEach(element => {
                    this.customFeedData.push({generator:element,selected:false});
                });
                this.customFeedDataCursor = res.data.cursor;
            })
            .catch(err => {
                console.log(err);
                toast.add({summary:'Error', detail:`${err}`, severity:'error', group:'tr', life:3000});
            })
            .finally(()=>{this.awaitingAdditionalCustomFeedData = false;})
        },
        /**
         * Method used to return Feed Generators matching a provided search term.
         */
        async searchForFeedGenerators(){
            let searchTerm = this.feedFilters.feedGenerator.searchTerm;
            if(!this.awaitingInitialCustomFeedData && !this.awaitingAdditionalCustomFeedData &&
            typeof searchTerm != 'undefined' && searchTerm.trim() != ''){
                this.feedFilters.feedGenerator.lastSearchTerm = this.feedFilters.feedGenerator.searchTerm;
                this.awaitingSearchCustomFeedData = true;
                this.awaitingAdditionalCustomFeedData = true;
                this.customFeedData = [];
                this.selectedFeedItems = [];
                GetBrowsingAgent().app.bsky.unspecced.getPopularFeedGenerators({limit:100,query:searchTerm})
                .then(res => {
                    res.data.feeds.forEach(element => {
                        this.customFeedData.push({generator:element,selected:false});
                    });
                    this.customFeedDataCursor = res.data.cursor;
                    this.awaitingSearchCustomFeedData = false;
                    this.viewingFeedGenSearchResults = true;
                })
                .catch(err => {
                    console.log(err);
                    toast.add({summary:'Error', detail:`${err}`, severity:'error', group:'tr', life:3000});
                })
                .finally(()=>{this.awaitingAdditionalCustomFeedData = false;})
            }
            else if(this.viewingFeedGenSearchResults && searchTerm.trim() == '') this.getCustomFeeds();
        },
        /**Method that deselects all currently displayed Custom Feeds. */
        clearSelectedFeeds(){
            this.customFeedData.forEach(fd => {
                fd.selected = false;
            });
            this.selectedFeedItems = [];
        },
        /**Method that selects or deselects a specific Feed Generator in the displayed list. */
        toggleFeedGeneratorSelection(atUri:string|undefined){
            let index = this.customFeedData.findIndex(x => x.generator.uri == atUri);
            if(index > -1){
                //Toggle selection in array used as "View" source
                this.customFeedData[index].selected = !this.customFeedData[index].selected;
                //Update "selected items" array
                if(!this.customFeedData[index].selected){
                    let indexToRemove = this.selectedFeedItems.findIndex(f=>f.uri == atUri);
                    if(indexToRemove>-1) this.selectedFeedItems.splice(indexToRemove,1);
                }
                else this.selectedFeedItems.push(this.customFeedData[index].generator);
            }
        },
        toggleJustMentions(){
            this.feedFilters.notifications.justNotifs = !this.feedFilters.notifications.justNotifs;
        },
        /**
         * Method that adds a new feed with specified options
         * to the App's `FeedList`.
         */
        async createFeed(){
            this.attemptingToCreateFeed = true;

            let feedSourceData:IUserSearchResult = {
                did:this.feedFilters.user.did,
                handle:this.feedFilters.user.handle,
                name:''
            }
            if(this.selectedFeedType == FeedEnums.Types.FeedGenerator){
                feedSourceData.did = this.selectedFeedItems[0].uri;
                feedSourceData.handle = this.selectedFeedItems[0].creator.handle;
                feedSourceData.name = this.selectedFeedItems[0].displayName;
            }

            PrepareFeedData(this.selectedFeedType as FeedEnums.Types,
            feedSourceData,
            this.feedFilters.tag)
            .then(res => {
                //Create the Feed
                if(AppState.isCreatingFeed){
                    AddFeedToList(res.description,res.data,res.cursor,res.seenAt,false,true,true);
                    AppState.moongateBroadcastChannel.postMessage(`Created new feed for: ${res.description.feedHandle}.`)
                    this.closeModal();
                }
                else if(AppState.isUpdatingFeed){
                    UpdateFeedDetails(FeedState.selectedFeed,res.description,res.data,res.cursor);
                    this.closeModal();
                }
            })
            .catch(err => {
                console.log(err);
                toast.add({summary:'Error', detail:`${err}`, severity:'error', group:'tr', life:3000});
                setTimeout(() => {
                    this.attemptingToCreateFeed = false;
                }, 800);
            });
        },
        /**
         * Method used to create more than one Feed at a time.
         */
        async createFeeds(){
            this.attemptingToCreateFeed = true;
            this.feedCreationStatus = [];
            let successes = 0;
            let lastFeedItem = false;
            if(this.selectedFeedType == FeedEnums.Types.FeedGenerator){
                for (let i = 0; i < this.selectedFeedItems.length; i++) {
                    lastFeedItem = (i == this.selectedFeedItems.length-1);
                    let feedSourceData:IUserSearchResult = {
                        did: this.selectedFeedItems[i].uri,
                        handle: this.selectedFeedItems[i].creator.handle,
                        name: this.selectedFeedItems[i].displayName
                    }
                    this.feedCreationStatus.push({
                        message:`Attempting to create "${feedSourceData.name}" Feed...`,
                        attempted:false,
                        success:false
                    });

                    await PrepareFeedData(this.selectedFeedType as FeedEnums.Types,
                    feedSourceData,
                    this.feedFilters.tag)
                    .then(res => {
                        //Create the Feed
                        if(AppState.isCreatingFeed){
                            AddFeedToList(res.description,res.data,res.cursor,res.seenAt,false,lastFeedItem);
                            this.feedCreationStatus[i] = {
                                message:`Created "${feedSourceData.name}" Feed!`,
                                attempted:true,
                                success:true
                            };
                            successes++;
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        toast.add({summary:'Error', detail:`${err}`, severity:'error', group:'tr', life:3000});
                        this.feedCreationStatus[i] = {
                            message:`Failed to create "${feedSourceData.name}" Feed...`,
                            attempted:true,
                            success:false
                        };
                        // setTimeout(() => {
                        //     this.attemptingToCreateFeed = false;
                        // }, 800);
                    });
                };
                //DEBUG CODE
                // for (let i = 0; i < 5; i++) {
                //     this.feedCreationStatus.push({
                //         message:`Attempting to create "Feed ${i}" Feed...`,
                //         attempted:false,
                //         success:false
                //     });
                //     await new Promise((resolve) => setTimeout(resolve,800));
                //     this.feedCreationStatus[i] = {
                //         message:`Created "Feed ${i}" Feed!`,
                //         attempted:true,
                //         success:true
                //     };
                // }
                if(successes>0){
                    let feedSyncMessage:BroadcastObject = {target:BroadcastChannelTarget.FeedColumn, data:structuredClone(toRawDeep(FeedState.FeedList))};
                    AppState.SendAppSyncMessage(feedSyncMessage);
                    setTimeout(() => {
                        this.closeModal();
                    }, 3000);
                }
                else{
                    this.feedCreationStatus.push({
                        message:'Failed to create Feeds...',
                        attempted:true,
                        success:false
                    })
                    setTimeout(() => {
                        this.attemptingToCreateFeed = false;
                    }, 3000);
                }
            }
        },
        closeModal(){
            // AppState.ToggleCreateFeedModal();
            // AppState.HideEditFeedModal();
            this.$router.push(`/`);
        }
    },
    computed:{
        /**
         * Method that takes the content put into the "Tag" input control
         * and parses it for valid tags - words starting with (#) and containing
         * no illegal hashtag characters. Currently the allowed length is unlimited.
         */
        validTags(){
            const tagRegex = new RegExp(`${/#[^/\\!@\-()$%\^&\+~|[\]{}#,;'"`.<>=\s]+/.source}`,'g');
            //content must be longer than 1 character
            if(this.feedFilters.tag.length>1){
                var result = [];
                let matches = this.feedFilters.tag.matchAll(tagRegex);
                for(const match of matches){
                    result.push(match[0]);
                }
                return result;
            }
            return [];
        },
        /**
         * Validates that the required conditions have been met during the
         * Tag-type Feed creation process to progress to the summary/creation page.
         */
        isTagSpecsEntryComplete(){
            return (this.validTags.length>0) &&
            this.selectedFeedType == FeedEnums.Types.Tag &&
            this.currentPage != this.totalPages-1 && this.currentPage != 0;
        },
        /**
         * Validates that a Feed Type was selected from available
         * options.
         */
        isFeedTypeConfirmed(){
            if(this.selectedFeedType.trim() != "" &&
            this.currentPage != this.totalPages-1){
                if(!AppState.isAuthBrowsing && (this.selectedFeedType == FeedEnums.Types.Notifications || this.selectedFeedType == FeedEnums.Types.Following)) return false;
                return true;
            }
            // return this.selectedFeedType.trim() != "" &&
            // this.currentPage == 0;
        },
        /**A collection of all the currently selected Feed Geerators from the displayed list.*/
        selectedFeedGenerators(){
            return this.customFeedData.filter(fd => fd.selected == true);
        },
        /**The number of selected Feed Generators. */
        selectedFeedGeneratorsCount():number{
            return this.customFeedData.filter(fd => fd.selected == true).length;
        },
        /**
         * Validates that the User can navigate to the next page in the
         * Feed creation process.
         */
        canGoToNextPage(){
            if(this.currentPage == 0){
                return this.isFeedTypeConfirmed;
            }
            else if(this.currentPage != this.totalPages-1){
                switch (this.selectedFeedType) {
                    case FeedEnums.Types.User:
                        return this.feedFilters.user.did.trim() != "";
                    case FeedEnums.Types.Tag:
                        return this.validTags.length>0;
                    case FeedEnums.Types.FeedGenerator:
                        return !this.awaitingInitialCustomFeedData && this.selectedFeedItems.length>0;
                    default:
                        return true;
                }
            }
        },
        isSelectedTypeNotifications(){
            return this.selectedFeedType == FeedEnums.Types.Notifications &&
            this.currentPage != this.totalPages-1 && this.currentPage != 0;
        },
        isSelectedTypeTrending(){
            return this.selectedFeedType == FeedEnums.Types.Trending &&
            this.currentPage != this.totalPages-1 && this.currentPage != 0;
        },
        /**
         * Computed value used to determine if the required variables have been
         * set for the selected Feed Type to be created/added to Feed List.
         * Controls if the "Submit" button is visible.
         */
        areCreatePostConditionsMet(){
            if(this.currentPage == this.totalPages-1){
                switch (this.selectedFeedType) {
                    case FeedEnums.Types.User:
                        return this.feedFilters.user.did.trim() != "";
                    case FeedEnums.Types.Tag:
                        return this.validTags.length>0;
                    case FeedEnums.Types.FeedGenerator:
                        return this.selectedFeedItems.length>0;
                    case FeedEnums.Types.Trending:
                    case FeedEnums.Types.Following:
                    case FeedEnums.Types.Mentions:
                        return true;
                    default:
                        return false;
                }
            }
            else{
                return false;
            }
        },
        getFeedTypeTitle(){
            let cleanedFeedType = '';
            if(this.selectedFeedType == FeedEnums.Types.FeedGenerator) cleanedFeedType = 'Custom Feed'
            else if(this.selectedFeedType.trim() != '') cleanedFeedType = this.selectedFeedType[0].toUpperCase()+this.selectedFeedType.slice(1);
            let title = `Selecting Feed Type | moongate`;
            switch (this.currentPage) {
                case 1:
                    title = `Creating "${cleanedFeedType}" Feed | moongate`
                    break;
                case 2:
                    title = `"${cleanedFeedType}" Feed Summary | moongate`
                    break;
                default:
                    title = `Selecting Feed Type | moongate`;
                    break;
            }
            return title;
        }
    },
    watch:{
        feedType(newType:string, oldType:string){
            if(typeof newType == 'undefined') this.currentPage = 0;
            else if(newType != oldType){
                this.currentPage = 1;
                this.selectedFeedType = newType;
                if(newType == FeedEnums.Types.FeedGenerator) this.getCustomFeeds();
            }
        },
        summary(newSummary:string,oldSummary:string){
            if(typeof newSummary != 'undefined' && newSummary != oldSummary && newSummary.toLocaleLowerCase() == 'summary') {
                this.currentPage = 2; //go to Feed summary page
                document.title = this.getFeedTypeTitle;//Update page title when view Feed summary
            }
            else if(typeof oldSummary != 'undefined' && newSummary != oldSummary && oldSummary.toLocaleLowerCase() == 'summary') this.currentPage = 1; //go back to Feed options page
        }
    },
    beforeRouteEnter(to, from, next){
        if(!AppState.canBrowse) next({path:'/login'});
        else{
            //Determine if Feed is being created or updated
            if(to.path.includes('/create')){
                AppState.isCreatingFeed = true;
                AppState.isUpdatingFeed = false;
            }
            else{
                AppState.isUpdatingFeed = true;
                AppState.isCreatingFeed = false;
            }
            //Prevent creating Following or Notification feeds if not logged in
            if((to.path.includes('/following') || to.path.includes('/notification')) && !AppState.isAuthBrowsing){
                next({path:'/create/feed'});
            }
            //Direct navigation to summary prevented
            else if(!from.path.includes('/create/feed/') && to.name == 'create feed summary'){
                next(vm =>{
                    document.title = vm.getFeedTypeTitle;
                    vm.$router.replace('/create/feed');
                })
            }
            //Prevent jump to summary if type is not the same
            else if(to.name == 'create feed summary' && !to.path.includes(from.path)){
                next({path:from.path,replace:true})
            }
            else{//navigate as usual - but make sure the correct modal page is being shown
                if(to.path == '/create/feed'){
                    next(vm =>{
                        document.title = vm.getFeedTypeTitle;
                        vm.$data.currentPage = 0;
                    })
                }
                else if(to.name == 'feed type selected'){
                    next(vm =>{
                        document.title = vm.getFeedTypeTitle;
                        vm.$data.currentPage = 1;
                    })
                }
                else next();
            }
        }
    },
    beforeRouteUpdate(to, from, next){
        //Prevent creating Following or Notification feeds if not logged in
        if((to.path.includes('/following') || to.path.includes('/notification')) && !AppState.isAuthBrowsing){
            next({path:'/create/feed'});
        }
    },
    async created(){
        if(typeof this.feedType != 'undefined' && Object.values(FeedEnums.Types).includes(this.feedType)){
            this.selectedFeedType = this.feedType
            this.currentPage = 1;
            if(this.feedType == FeedEnums.Types.FeedGenerator){
                this.getCustomFeeds();
            }
        }
        else if(typeof this.feedType != 'undefined' && !Object.values(FeedEnums.Types).includes(this.feedType)){//invalid feed type
            this.$router.replace('/create/feed');
        }
        document.title = this.getFeedTypeTitle;
    },
    mounted(){
        if(AppState.isUpdatingFeed){
            //Start on last/summary page
            this.currentPage = this.modalPages.length-1;
            //Get existing Feed
            var existingFeed = GetFeed(FeedState.selectedFeed);
            //Update the modal state to hold the existing feed's data
            switch (existingFeed?.description.feedType) {
                case FeedEnums.Types.User:
                    this.getUserProfileViewDetailed(existingFeed.description.feedSourceDID)
                    .then(res => {
                        if(res != undefined) this.feedFilters.user = res
                    })
                    this.selectedFeedType = FeedEnums.Types.User;
                    this.feedFilters.user = {
                        did:existingFeed.description.feedSourceDID,
                        handle:existingFeed.description.feedHandle,
                        displayName:existingFeed.description.feedName
                    };
                    break;
                case FeedEnums.Types.Tag:
                    this.selectedFeedType = FeedEnums.Types.Tag;
                    this.feedFilters.tag = existingFeed.description.feedTags;
                    break;
                case FeedEnums.Types.Trending:
                    this.selectedFeedType = FeedEnums.Types.Trending;
                    break;
            }
        }
        (this.$el as HTMLElement).focus();
    }
    // watch:{
    //     'feedFilters.tag': debounce(function (newVal){

    //     },400)
    // }
})
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.1s ease, transform 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  position: absolute;
  transform: translateY(10px);
}
/* .v-enter-from{
    transform: translateY(500px);
}
.v-leave-to{
    transform: translateY(-500px);
} */

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

</style>