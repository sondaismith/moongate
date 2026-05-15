<template>
    <div data-testid="feed-edit-modal" tabindex="-1" @keydown.tab="(e)=>{if(!isConfirmModalDisplayed) TrapFocus($el,e)}"
    class="absolute z-10 flex w-full h-full text-primary focus-visible:outline-none">
        <div data-testid="feedEditModal-close" @click="closeModal" :class="$attrs.class" class="absolute z-10 w-full h-full bg-slate-800/40 backdrop-blur-sm"></div>
        {{void "Modal Control"}}
        <div class="z-20 flex flex-col w-full md:max-w-[1024px] h-full md:h-[92%] mx-auto my-auto rounded bg-feedColumnBG
            pb-4 [&>*]:px-4 drop-shadow-lg backdrop-blur-0 overflow-hiddens">
            <div class="flex px-4s py-2 bg-aboutPageBanner items-center justify-between text-primary border-b border-outline">
                <div class="text-lg font-semibold select-none">Adding Feeds</div>
                <!-- <button class="flex gap-1 items-center px-2 py-0.5 rounded bg-btn hover:bg-btnHover hover:border-hover disabled:bg-disabledBG
                disabled:border-transparent disabled:text-disabled">View Queue</button> -->
                <!-- <SquareButton v-if="numberOfFeedsInStack>0" data-testid="feedEditModal-view-queue-button" class="bg-btn hover:bg-btnHover" button-padding-x="2" button-padding-y="0">
                    View Queue
                </SquareButton> -->
                <div class="text-secondary"># of Feeds:{{ feedStackItems.length }}</div>
            </div>
            <div class="flex flex-col py-1">
                <div class="flex gap-2s flex-wrap items-baseline">
                    <div class="text-2xl pr-2">{{modalPages[currentPage].title}}</div>
                    <div class="text-secondary text-sm">{{ modalPages[currentPage].instruction }}</div>
                    <!-- <div v-if="AppState.isCreatingFeed" class="flex bg-green-600 rounded-full px-2 py-1 items-center self-center">Creating</div>
                    <div v-if="AppState.isUpdatingFeed" class="flex bg-orange-600 rounded-full px-2 py-1 items-center self-center">Editing</div> -->
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
            <div class="flex flex-col relative grow !px-0s overflow-hidden shadow-scroll-inner-bottom">
                <Transition>
                    <div v-if="currentPage == 0" class="h-full w-full px-2s">
                        <div class="flex flex-col h-full gap-2 pt-2">
                            <div class="flex items-start flex-wrap gap-1 px-2s">
                                <!-- <PillButton :disabled="true">Mentions</PillButton>
                                <PillButton :disabled="true">DMs</PillButton> -->
                                <div class="flex flex-wrap gap-2">
                                    <button v-for="item in feedTypeOptions" :key="item.id"
                                    @click="selectFeedType(item.value)"
                                    tabindex="0"
                                    :data-testid="`feedEditModal-${item.name.toLowerCase().split(' ')[0]}-feed-button`"
                                    class="group flex gap-1 cursor-pointer items-center border-2 outline-none border-transparent rounded-md transition-colors
                                    bg-feedTypeButton select-none p-[1px] overflow-hidden active:bg-feedTypeButtonActive"
                                    :class="[item.value == selectedFeedType ? '!border-feedtypeBtnSelected' : '',
                                        !AppState.isAuthBrowsing && (item.value == FeedEnums.Types.Notifications || item.value == FeedEnums.Types.Following) ? '!bg-feedTypeButtonDisabled' : 'hover:bg-feedTypeButtonHover'
                                    ]">
                                        <div class="flex items-center gap-1 px-2 border-2 border-transparent group-focus-visible:border-feedtypeBtnFocusHighlight rounded-md">
                                            <FeedIcon :icon="item.value"/>
                                            <div>{{ item.name }}</div>
                                            <div v-if="item.value == FeedEnums.Types.Trending" class="flex rounded-full px-1s min-w-5 aspect-square bg-feedTypeButtonCounter group-hover:bg-feedTypeButtonCounterHover
                                            group-active:bg-feedTypeButtonCounterHover transition-colors text-white shadow-scroll-inner-window text-sm items-center justify-center"
                                            :class="[{'!bg-radioButtonSelected' : isTrendingTypeInStack}]">
                                                <i-mingcute:check-fill v-if="isTrendingTypeInStack" class="p-0.5"/>
                                            </div>
                                            <div v-else-if="item.value == FeedEnums.Types.Following" class="flex rounded-full px-1s min-w-5 aspect-square bg-feedTypeButtonCounter group-hover:bg-feedTypeButtonCounterHover
                                            group-active:bg-feedTypeButtonCounterHover transition-colors text-white shadow-scroll-inner-window text-sm items-center justify-center"
                                            :class="[{'!bg-radioButtonSelected' : isFollowingTypeInStack}, {'!bg-feedTypeButtonCounterDisabled' : !AppState.isAuthBrowsing}]">
                                                <i-mingcute:check-fill v-if="isFollowingTypeInStack" class="p-0.5"/>
                                            </div>
                                            <div v-else-if="item.value == FeedEnums.Types.Notifications" class="flex rounded-full px-1s min-w-5 aspect-square bg-feedTypeButtonCounter group-hover:bg-feedTypeButtonCounterHover
                                            group-active:bg-feedTypeButtonCounterHover transition-colors text-white shadow-scroll-inner-window text-sm items-center justify-center"
                                            :class="[{'!bg-radioButtonSelected' : isNotificationTypeInStack}, {'!bg-feedTypeButtonCounterDisabled' : !AppState.isAuthBrowsing}]">
                                                <i-mingcute:check-fill v-if="isNotificationTypeInStack" class="p-0.5"/>
                                            </div>
                                            <div v-else class="flex rounded-full px-1s min-w-5 aspect-square bg-feedTypeButtonCounter group-hover:bg-feedTypeButtonCounterHover group-active:bg-feedTypeButtonCounterHover transition-colors
                                            text-white shadow-scroll-inner-window text-sm items-center justify-center"
                                            :class="[{'!bg-radioButtonSelected' : getFeedCountForType(item.value)}]">
                                            {{getFeedCountForType(item.value)}}</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                            <div v-if="selectedFeedType.trim() != ''" class="flex self-start border border-outline rounded p-1 text-sm">
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
                            <div v-if="selectedFeedType.trim() != ''" class="flex flex-col items-start h-full overflow-hidden">
                                <TransitionGroup>
                                    <!-- <UserSearchBar data-testid="feedEditModal-user-search-bar" class="w-full"
                                    v-if="selectedFeedType == FeedEnums.Types.User"
                                    @user-selected="selectUser" :data-list="searchResults"/> -->
                                    <div v-if="selectedFeedType == FeedEnums.Types.User" class="flex flex-col gap-1 h-full w-full overflow-hidden">
                                        <UserSearchBar2 data-testid="feedEditModal-user-search-bar" :search-term-v-model="feedFilters.userSearch.searchTerm"
                                        :last-results-term="feedFilters.userSearch.lastResultsTerm" :feed-stack-ref="feedStackItems"
                                        :user-results-ref="userAccountSearchResults" placeholder-text="Search for Users..."
                                        @user-selected="selectUser" @filter-bar-update="newValue => feedFilters.userSearch.searchTerm = newValue"
                                        @search-submitted="submitUserSearch" @clear-results-clicked="clearUserAccountResults" :disabled="awaitingUserSearchResults"/>
                                    </div>
                                    <div v-if="selectedFeedType == FeedEnums.Types.Tag" class="w-full h-0 shadow-scroll-element-drop-shadow"></div>
                                    <div v-if="selectedFeedType == FeedEnums.Types.Tag" class="flex flex-col gap-1 w-full h-full pt-2 overflow-y-auto">
                                        <TagEntry data-testid="feedEditModal-tag-input" class="m-1" @submit-clicked="trySubmitTags" instruction-text="Press Enter/Return to add tag to Feed specification"/>
                                        <div class="flex flex-col mt-1 h-full">
                                            <div class="border-b pb-1">Tag Feeds</div>
                                            <div data-testid="feedEditModal-no-tag-feeds-message" v-if="numberOfTagFeedsInStack<1" class="flex flex-col pt-2 max-h-32 justify-center select-none">
                                                <div class="flex flex-col items-center">
                                                    <div>No Tags Feeds Queued</div>
                                                    <div class="text-xs italic">Submited Tag Feeds will show here</div>
                                                </div>
                                            </div>
                                            <div data-testid="feedEditModal-tag-feed-list" v-else class="flex flex-wrap gap-2 pr-2 py-2 pt-3">
                                                <FeedStackButton class="min-w-64 w-full sm:flex-[1_0_32%]"
                                                v-for="stackItem in feedStackItems.filter(x=>x.type == FeedEnums.Types.Tag)"
                                                :feed-type="stackItem.type" :profile-data="stackItem.profileData" :tags="stackItem.tags" :feed-name="stackItem.name" :feed-stack-identifier="stackItem.id"
                                                :display-only="true" @clicked-toggle-stack-item="removeFeedStackItem"/>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="selectedFeedType == FeedEnums.Types.FeedGenerator" class="flex w-full h-full">
                                        <div class="flex flex-col gap-1 w-full">
                                            <FilterBar :filter-vmodel="feedFilters.feedGenerator.searchTerm" :show-clear-button="viewingFeedGenSearchResults"
                                            :show-submit-button="feedFilters.feedGenerator.searchTerm.trim().length>1"
                                            placeholder-text="Search Feeds..." submit-button-text="Search"
                                            :disabled="awaitingInitialCustomFeedData || awaitingSearchCustomFeedData"
                                            @update:filter-vmodel="newValue => feedFilters.feedGenerator.searchTerm = newValue"
                                            @clear-filter-clicked="getCustomFeeds" @enter-key-up="searchForFeedGenerators" @submit-clicked="searchForFeedGenerators"/>
                                            <div v-if="selectedFeedItems.length>0" class="pt-1 w-full max-h-16 min-h-16 border-b pb-1 border-outline overflow-y-auto">
                                                <div class="flex gap-1">
                                                    <div tabindex="-1" class="flex flex-wrap gap-1 w-full items-start">
                                                        <!-- <button v-for="n in selectedFeedGenerators" @click="toggleFeedGeneratorSelection(n.generator.uri)" -->
                                                        <button v-for="n in selectedFeedItems" @click="removeFeedStackItem(FeedEnums.Types.FeedGenerator,n.uri)"
                                                        :title="'Remove &quot;'+n.displayName+'&quot; Feed'"
                                                        class="flex shrink-0 grow-0 items-center gap-1 bg-itemTagBG transition-colors border-2 border-transparent
                                                        active:bg-itemTagBGActive hover:border-itemTagBorder active:border-itemTagBGActive focus-visible:border-itemTagBorder
                                                        outline-none rounded p-0.5 px-1 text-primary text-xs text-nowrap cursor-pointer shadow-none">
                                                            <div>{{ n.displayName }}</div>
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
                                                <div class="flex gap-1 items-center sticky top-0 py-1 bg-feedColumnBG shadow-scroll-underline shadow-postFocusModalDetailsShadow/10">
                                                    <div class="text-lg">Discover New Feeds</div>
                                                    <div><i-mingcute:sparkles-fill title="Discover New Feed Generators" class="shrink-0 text-yellow-500" /></div>
                                                    <div class="text-sm text-secondary">{{ customFeedData.length }} feed(s) loaded</div>
                                                </div>
                                                <div v-if="!awaitingInitialCustomFeedData && !awaitingSearchCustomFeedData && customFeedData.length>0"
                                                    class="flex flex-wrap gap-2 py-2 pb-3 pl-1 pr-2">
                                                    <div data-testid="feedEditModal-custom-feed-list" class="flex flex-wrap gap-2">
                                                        <CustomFeedButton v-for="n in customFeedData" class="min-w-64 w-full sm:flex-[1_0_32%]" :feed-generator-view="n.generator"
                                                        @feed-generator-selected="toggleFeedGeneratorSelection" :selected="n.selected"/>
                                                    </div>
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
                                    <div v-if="selectedFeedType == FeedEnums.Types.Trending" class="flex flex-col w-full">
                                        <FeedStackButton data-testid="feedEditModal-toggle-trending-feed-button" :feed-type="FeedEnums.Types.Trending" :selected="isTrendingTypeInStack" feed-stack-identifier="this_is_trending_feed" @clicked-toggle-stack-item="toggleSingularFeedItem"/>
                                        <!-- <SquareButton @click="getTrending">Get Trending</SquareButton> -->
                                    </div>
                                    <div v-if="selectedFeedType == FeedEnums.Types.Following && AppState.isAuthBrowsing" class="flex flex-col w-full">
                                        <FeedStackButton data-testid="feedEditModal-toggle-following-feed-button" :feed-type="FeedEnums.Types.Following" :selected="isFollowingTypeInStack" feed-stack-identifier="this_is_following_feed" @clicked-toggle-stack-item="toggleSingularFeedItem"/>
                                    </div>
                                    <div v-if="selectedFeedType == FeedEnums.Types.Notifications && AppState.isAuthBrowsing" class="flex flex-col gap-2 w-full">
                                        <FeedStackButton data-testid="feedEditModal-toggle-notifications-feed-button" :feed-type="FeedEnums.Types.Notifications" :selected="isNotificationTypeInStack" feed-stack-identifier="this_is_notification_feed" @clicked-toggle-stack-item="toggleSingularFeedItem"/>
                                        <!-- <CheckBox class="px-3 self-start" @value-toggled="toggleJustMentions" :model-value="feedFilters.notifications.justNotifs" :checkbox-size="1.25" :text-gap="0.5">Mentions Only</CheckBox> -->
                                    </div>
                                </TransitionGroup>
                            </div>
                        </div>
                    </div>
                    <div data-testid="feedEditModal-summary-page" v-else-if="currentPage == 1" class="flex flex-col h-full w-full py-2 overflow-y-auto">
                        <div v-if="feedStackItems.length == 0" class="flex flex-col items-center">
                            <div class="flex gap-1 items-center">
                                <i-mingcute:warning-fill class="text-2xl"/>
                                <div>No Feeds currently in Queue</div>
                            </div>
                            <div class="text-sm text-secondary text-center">Click the 'back' button to move back to the Feed selection page</div>
                        </div>
                        <div v-else data-testid="feedEditModal-summary-page-feed-list" class="flex flex-wrap gap-2 pl-1 pr-2">
                            <FeedStackButton class="min-w-64 w-full sm:flex-[1_0_32%]"
                            v-for="stackItem in feedStackItems"
                            :feed-stack-identifier="stackItem.id" :feed-type="stackItem.type" :profile-data="stackItem.profileData" :tags="stackItem.tags" :feed-name="stackItem.name"
                            :generator-data="stackItem.generatorData" :display-only="true" @clicked-toggle-stack-item="removeFeedStackItem"/>
                        </div>
                    </div>
                    <!-- <div data-testid="feedEditModal-summary-page" v-else-if="currentPage == 2"
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
                    </div> -->
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
                    v-if="areCreatePostConditionsMet && feedStackItems.length>0"
                    :is-disabled="attemptingToCreateFeed"
                    class="bg-submitBtnBG hover:bg-submitBtnBGHover focus-visible:bg-submitBtnBGHover active:bg-submitBtnBGActive text-white">
                        <div class="flex gap-1 items-center">
                            <i-mingcute:loading-fill v-if="attemptingToCreateFeed" class="text-primary spinner h-4 w-4"/>
                            <div>Create Feeds</div>
                        </div>
                    </SquareButton>
                </div>
            </div>
            <Transition>
                <div v-if="attemptingToCreateFeed"
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
        <ConfirmModal ref="confirm"/>
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
import { IFeedCreationStatus, IFeedGeneratorSelection, IFeedStackItem } from '../../interfaces/FeedInterfaces';
import CustomFeedButtonPlaceholder from '../Placeholder/CustomFeedButtonPlaceholder.vue';
import { AppBskyFeedDefs } from '@atproto/api/dist/client';
import { IUserSearchResult } from '../../interfaces/UserInterfaces';
import FilterBar from '../Utilities/FilterBar.vue';
import { PropType } from 'vue';
import ImageLoader from '../Utilities/ImageLoader.vue';
import { BroadcastChannelTarget, BroadcastObject, toRawDeep } from '../../types/BroadcastChannelTypes.ts';
import FeedStackButton from '../Utilities/FeedStackButton.vue';
import UserSearchBar2 from '../Utilities/UserSearchBar2.vue';
import InsetLabel from '../Utilities/InsetLabel.vue';
import { SearchForAccounts } from '../../lib/api/Feed.vue';
import { HandleAPIError } from '../../helpers/errors';
import { GenerateUniqueID } from '../../helpers/generators';
import TagEntry from '../Utilities/TagEntry.vue';
import ConfirmModal from '../Utilities/ConfirmModal.vue';

export default defineComponent({
    components:{
        PillButton,
        SquareButton,
        InLaInput,
        UserSearchBar,
        UserSearchBar2,
        CheckBox,
        CustomFeedButton,
        CustomFeedButtonPlaceholder,
        FilterBar,
        ImageLoader,
        FeedStackButton,
        InsetLabel,
        TagEntry,
        ConfirmModal,
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
            modalPages:[
                { title:'What type of Feed is it?', instruction: 'Select below'},
                { title:'Does this look alright?', instruction: 'Confirm Feed(s)'},
            ],
            feedFilters:{
                tag:'',
                user:{
                    did:'',
                    handle:'',
                    displayName:''
                } as ProfileViewDetailed,
                userSearch:{
                    searchTerm:'',
                    lastResultsTerm:''
                },
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
            totalPages:2,
            feedTypeOptions:[
                {id:0, name:'User',value:FeedEnums.Types.User},
                {id:1, name:'Tag',value:FeedEnums.Types.Tag},
                {id:2, name:'Custom Feed',value:FeedEnums.Types.FeedGenerator},
                {id:3, name:'Trending',value:FeedEnums.Types.Trending},
                {id:4, name:'Following',value:FeedEnums.Types.Following},
                {id:5, name:'Notifications',value:FeedEnums.Types.Notifications},
            ],
            selectedFeedType:"",
            feedTypeSelected:false,
            feedSpecificationsSet:false,
            /**Indicates if a Trending Type Feed is currently in the Feed Stack waiting to be created. */
            isTrendingTypeInStack:false,
            /**Indicates if a Following Type Feed is currently in the Feed Stack waiting to be created. */
            isFollowingTypeInStack:false,
            /**Indicates if a Notification Type Feed is currently in the Feed Stack waiting to be created. */
            isNotificationTypeInStack:false,
            searchResults:[
                {did:'asjdy8383h31', name:'Jimmy', handle:'brainblast', pfp:'src/assets/test-media/posts/image04.png'},
                {did:'033jo3hcbccs', name:'James', handle:'serectserviced'},
                {did:'4000djjeaj33', name:'Johnathon', handle:'jjrenttoomuch', pfp:'src/assets/test-media/posts/image07.png'},
                {did:'skiei229iix9', name:'Jack', handle:'mybodyjackjack', pfp:'src/assets/test-media/posts/image08.png'},
                {did:'nneu302bshw3', name:'Samuel', handle:'wockafella'},
            ],
            searchTerm:'',
            debouncedSearchTerm:'',
            /**Are we waiting for results from a User Account search to be returned? */
            awaitingUserSearchResults:false,
            /**Are we trying to download detailed User Profile data from a User search result being selected? */
            awaitingDetailsUserProfileData:false,
            /**
             * A cache of `ProfileViewDetailed` records for all the User account results that were selected.
             * Used to prevent a large number of request from being made against the API.
            */
            userAccountCache:[] as ProfileViewDetailed[],
            /**Array that holds the results from the latest User Account search. */
            userAccountSearchResults:[] as IUserSearchResult[],
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
            /**
             * Object that holds all the Feed Generators the User has selected.
             * Used by the pill-like controls that can be used to quickly
             * deselect/remove any of the Custom Feeds that have been selected,
             * even if they are currently not visible in the search results.
             */
            selectedFeedItems: [] as AppBskyFeedDefs.GeneratorView[],
            /**Object that holds all the Feeds that have been queued for creation. */
            feedStackItems: [] as IFeedStackItem[],
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
            /**
             * Is the "confirm Feed discard" message currently being displayed?
             * Used to temporarily disable `TrapFocus()` for this component while
             * the `ConfirmModal` component is being displayed.
             */
            isConfirmModalDisplayed:false,
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
                this.$router.push(`/create/feed`);
            }
            else{
                this.$router.push(`/create/feed/summary`);
            }
            (this.$el as HTMLElement).focus();
        },
        /**
         * Moves back one page in the modal. Closes the modal
         * if used when on the first page.
         */
        backOnePage(){
            if(this.currentPage-1 > -1){
                console.log(this.$route);
                this.$router.push('/create/feed');
                this.feedTypeSelected = false;
                this.feedSpecificationsSet = false;
                // if(this.currentPage >= 1) this.$router.push(this.$route.path.substring(0, this.$route.path.lastIndexOf('/')));
            }
            else{
                this.feedStackItems = [];//prevents the "confirm cancel" prompt from displaying
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
         * Method used to "submit" the search term entered into the control for User accounts
         * on Enter Key or button press.
         */
        async submitUserSearch(){
            if(!this.awaitingUserSearchResults && this.feedFilters.userSearch.searchTerm.trim().length>0){
                this.awaitingUserSearchResults = true;
                console.log(`Search term: ${this.feedFilters.userSearch.searchTerm}`);//DEBUG
                var searchResult:ProfileView[] = [];
                await SearchForAccounts(`${this.feedFilters.userSearch.searchTerm}`)
                .then(res => {
                    searchResult = res.data.actors
                    this.userAccountSearchResults = [];//clear results
                    this.feedFilters.userSearch.lastResultsTerm = this.feedFilters.userSearch.searchTerm;
                    searchResult.forEach(element => {
                        let matchIndex = this.feedStackItems.findIndex(x=>x.did == element.did);
                        this.userAccountSearchResults.push({profileData:element,selected:(matchIndex > -1 ? true : false),awaitingDetailedData:false});
                    });
                    console.log(this.userAccountSearchResults);
                })
                .catch(err => toast.add(HandleAPIError(err, 'Error getting User search results')))
                .finally(()=>{
                    this.awaitingUserSearchResults = false;
                });
            }
        },
        /**
         * Method that fires when a user is selected in the
         * `UserSearchBar` control.
         * @param user Object representing the chosen user.
         */
        async selectUser(user:ProfileView, index:number){
            let matchIndex = this.feedStackItems.findIndex(x => x.did == user.did);
            //If selected item is being deselected...
            if(matchIndex>-1){
                this.removeFeedStackItem(FeedEnums.Types.User,user.did,matchIndex);
            }
            else{//User account is being selected...
                //Detailed Profile data needs to be stored in a temp cache so a large number of request cannot be fired off
                //if the User spams clicking User Account results
                /**Value is greater than -1 if detailed profile data is already in cache. */
                let cacheIndex = this.userAccountCache.findIndex(x=>x.did == user.did);
                if(cacheIndex>-1){
                    this.feedStackItems.push({id:user.did,did:user.did,handle:user.handle,profileData:this.userAccountCache[cacheIndex],icon:FeedEnums.Icons.User,tags:[],type:FeedEnums.Types.User});
                    this.userAccountSearchResults[index].selected = true;
                }
                else{//we need to request data from API
                    this.userAccountSearchResults[index].awaitingDetailedData = true;
                    await this.getUserProfileViewDetailed(user.did)
                    .then(res => {
                        if(typeof res != 'undefined'){
                            //Add new User account data to cache, add to feed stack and indicate account has been selected in search results
                            if(this.userAccountCache.length+1>20) this.userAccountCache.shift(); //Limits cache to holding 20 records
                            this.userAccountCache.push(res);
                            this.feedStackItems.push({id:res.did,did:res.did,handle:res.handle,profileData:res,icon:FeedEnums.Icons.User,tags:[],type:FeedEnums.Types.User});
                            this.userAccountSearchResults[index].selected = true;
                        }
                    })
                    .catch(err => toast.add(HandleAPIError(err, 'Error getting detailed User Profile data')))
                    .finally(()=>{
                        this.userAccountSearchResults[index].awaitingDetailedData = false;
                    })
                }
            }
        },
        /**
         * Method fired when the 'clear results' button on the
         * `UserSearchBar2` is clicked.
         */
        clearUserAccountResults(){
            this.userAccountSearchResults = [];
            this.feedFilters.userSearch.searchTerm = this.feedFilters.userSearch.lastResultsTerm = '';
        },
        /**
         * Method used to remove a Feed reference from the Feed Stack as well as related
         * data structures.
         * @param feedType The `FeedEnum.Type` type of the Feed Stack item to remove.
         * @param identifier The unique identifier used to find the item in the Feed Stack to remove.
         * @param index OPTIONAL: The index of the record in the Feed Stack to remove. Used when the index has already been found before calling this method.
         */
        removeFeedStackItem(feedType:FeedEnums.Types,identifier:string,index=-1){
            switch (feedType) {
                case FeedEnums.Types.User:
                    //Deselect from User search results
                    let userResultIndexToDeselect = this.userAccountSearchResults.findIndex(x=>x.profileData.did == identifier);
                    if(userResultIndexToDeselect>-1) this.userAccountSearchResults[userResultIndexToDeselect].selected = false;
                    //Remove from Feed Stack
                    if(index>-1) this.feedStackItems.splice(index,1);
                    else {
                        let feedStackUserIndex = this.feedStackItems.findIndex(x => x.did == identifier);
                        if(feedStackUserIndex>-1) this.feedStackItems.splice(feedStackUserIndex,1);
                    }
                    break;
                case FeedEnums.Types.FeedGenerator:
                    //Sync deselection state between selectedFeedItems (mini buttons) and Feed Stack
                    let selectedIndexToRemove = this.selectedFeedItems.findIndex(f=>f.uri == identifier);
                    if(selectedIndexToRemove>-1) this.selectedFeedItems.splice(selectedIndexToRemove,1);
                    let stackIndexToRemove = this.feedStackItems.findIndex(i=>i.generatorData?.uri == identifier);
                    if(stackIndexToRemove>-1) this.feedStackItems.splice(stackIndexToRemove,1);
                    let customFeedDataIndex = this.customFeedData.findIndex(x => x.generator.uri == identifier);
                    this.customFeedData[customFeedDataIndex].selected = !this.customFeedData[customFeedDataIndex].selected;
                    break;
                case FeedEnums.Types.Trending:
                    this.isTrendingTypeInStack = false;
                    break;
                case FeedEnums.Types.Following:
                    this.isFollowingTypeInStack = false;
                    break;
                case FeedEnums.Types.Notifications:
                    this.isNotificationTypeInStack = false;
                    break;
                default:
                    break;
            }
            //Removal method is the same, the individual variable toggles are handled above
            switch (feedType) {
                case FeedEnums.Types.Tag:
                case FeedEnums.Types.Trending:
                case FeedEnums.Types.Following:
                case FeedEnums.Types.Notifications:
                    let stackIndexToRemove = this.feedStackItems.findIndex(x=>x.id==identifier);
                    if(stackIndexToRemove>-1) this.feedStackItems.splice(stackIndexToRemove,1);
                    break;

                default:
                    break;
            }
            //Needs to also remove the record from the User account results (or the results need to be cleared when navigating away from the first page)
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
         * Used by the Tag entry input control on Enter key press. If the entered tags are
         * valid, it adds them to the "feed stack" as a single Feed specification.
         * OLD
         * Used by the Tag entry input control on Enter key press. Used to check if the
         * input values are valid before moving forward to the Feed creation details
         * summary page.
         */
        async trySubmitTags(submittedTags:string[]){
            let tagDisplayName:string|undefined;
            tagDisplayName = submittedTags.join(' ');
            let identity = GenerateUniqueID(15);//might be best to find a way to generate an id using the tag text and time
            this.feedStackItems.push({id:identity,did:'',handle:'',name:tagDisplayName != 'undefined' ? tagDisplayName : '',icon:FeedEnums.Icons.Tag,tags:submittedTags,type:FeedEnums.Types.Tag});
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
            this.feedFilters.feedGenerator.searchTerm = '';
            this.feedFilters.feedGenerator.lastSearchTerm = '';
            this.customFeedDataCursor = '';
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
            .finally(()=>{
                //Compare returned results against items in Feed Stack and mark them as selected if they have already been added to the stack
                this.customFeedData.forEach(element => {
                    let matchIndex = this.feedStackItems.findIndex(x=>x.did == element.generator.uri);
                    if(matchIndex>-1) element.selected = true;
                });
                this.awaitingInitialCustomFeedData = false;
            })
        },
        /**Method used to load additional Feed Generators through Bluesky's API after the 1st request. */
        async loadMoreFeedGenerators(){
            this.awaitingAdditionalCustomFeedData = true;
            GetBrowsingAgent().app.bsky.unspecced.getPopularFeedGenerators({limit:10,cursor:this.customFeedDataCursor})
            .then(res => {
                res.data.feeds.forEach(element => {
                    //Compare returned results against items in Feed Stack and mark them as selected if they have already been added to the stack
                    let matchIndex = this.feedStackItems.findIndex(x=>x.did == element.uri);
                    this.customFeedData.push({generator:element,selected:matchIndex>-1 ? true : false});
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
                // this.selectedFeedItems = [];
                GetBrowsingAgent().app.bsky.unspecced.getPopularFeedGenerators({limit:100,query:searchTerm})
                .then(res => {
                    res.data.feeds.forEach(element => {
                        //Compare returned results against items in Feed Stack and mark them as selected if they have already been added to the stack
                        let matchIndex = this.feedStackItems.findIndex(x=>x.did == element.uri);
                        this.customFeedData.push({generator:element,selected:matchIndex>-1 ? true : false});
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
            this.selectedFeedItems.forEach(fi=>{
                //Remove all selected custom feeds from Feed Stack before emptying
                let stackMatchIndex = this.feedStackItems.findIndex(i=>i.generatorData?.uri == fi.uri);
                if(stackMatchIndex>-1) this.feedStackItems.splice(stackMatchIndex,1);
            })
            this.selectedFeedItems = [];
        },
        /**Method that selects or deselects a specific Feed Generator in the displayed list. */
        toggleFeedGeneratorSelection(atUri:string){
            let index = this.customFeedData.findIndex(x => x.generator.uri == atUri);
            if(index > -1){
                if(this.customFeedData[index].selected){
                    this.removeFeedStackItem(FeedEnums.Types.FeedGenerator,atUri);
                }
                else{
                    //Sync selection state between selectedFeedItems (mini buttons) and Feed Stack
                    this.customFeedData[index].selected = !this.customFeedData[index].selected;
                    let generator = this.customFeedData[index].generator;
                    this.selectedFeedItems.push(generator);
                    this.feedStackItems.push({id:generator.uri,did:generator.uri,handle:generator.creator.handle,generatorData:generator,
                        type:FeedEnums.Types.FeedGenerator,icon:FeedEnums.Icons.FeedGenerator,tags:[],name:generator.displayName});
                }
            }
        },
        /**Method that adds or removes singular Feed Types from the "Feed Stack". */
        toggleSingularFeedItem(feedType:FeedEnums.Types){
            // if(index > -1){
                switch (feedType) {
                    case FeedEnums.Types.Trending:
                        if(this.isTrendingTypeInStack){
                            let stackIndex = this.feedStackItems.findIndex(x=>x.type == FeedEnums.Types.Trending);
                            if(stackIndex>-1) this.feedStackItems.splice(stackIndex,1);
                        }
                        else{
                            this.feedStackItems.push({id:'this_is_trending_feed',did:'',handle:'',icon:FeedEnums.Icons.Trending,tags:[],type:FeedEnums.Types.Trending,name:'Trending'})
                        }
                        this.isTrendingTypeInStack = !this.isTrendingTypeInStack;
                        break;
                    case FeedEnums.Types.Following:
                        if(this.isFollowingTypeInStack){
                            let stackIndex = this.feedStackItems.findIndex(x=>x.type == FeedEnums.Types.Following);
                            if(stackIndex>-1) this.feedStackItems.splice(stackIndex,1);
                        }
                        else{
                            this.feedStackItems.push({id:'this_is_following_feed',did:'',handle:'',icon:FeedEnums.Icons.Following,tags:[],type:FeedEnums.Types.Following,name:'Following'})
                        }
                        this.isFollowingTypeInStack = !this.isFollowingTypeInStack;
                        break;
                    case FeedEnums.Types.Notifications:
                        if(this.isNotificationTypeInStack){
                            let stackIndex = this.feedStackItems.findIndex(x=>x.type == FeedEnums.Types.Notifications);
                            if(stackIndex>-1) this.feedStackItems.splice(stackIndex,1);
                        }
                        else{
                            this.feedStackItems.push({id:'this_is_notification_feed',did:'',handle:'',icon:FeedEnums.Icons.Notifications,tags:[],type:FeedEnums.Types.Notifications,name:'Notifications'})
                        }
                        this.isNotificationTypeInStack = !this.isNotificationTypeInStack;
                        break;
                    default:
                        break;
                }
            // }
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

            for (let i = 0; i < this.feedStackItems.length; i++) {
                lastFeedItem = (i == this.feedStackItems.length-1);
                const stackItem = this.feedStackItems[i];
                let feedName = `${typeof stackItem.name != 'undefined' ? stackItem.name : `@${stackItem.handle}`}`;
                this.feedCreationStatus.push({
                    message:`Attempting to create "${feedName}" Feed...`,
                    attempted:false,
                    success:false
                });

                //Get Feed data via API
                await PrepareFeedData(stackItem.type,stackItem)
                .then(res => {
                    //Add Feed to display list
                    if(AppState.isCreatingFeed){
                        AddFeedToList(res.description,res.data,res.cursor,res.seenAt,false,lastFeedItem);
                        this.feedCreationStatus[i] = {
                            message:`Created "${feedName}" Feed!`,
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
                        message:`Failed to create "${feedName}" Feed...`,
                        attempted:true,
                        success:false
                    };
                    // setTimeout(() => {
                    //     this.attemptingToCreateFeed = false;
                    // }, 800);
                });
            }
            if(successes>0){
                let feedSyncMessage:BroadcastObject = {target:BroadcastChannelTarget.FeedColumn, data:structuredClone(toRawDeep(FeedState.FeedList))};
                AppState.SendAppSyncMessage(feedSyncMessage);
                setTimeout(() => {
                    this.attemptingToCreateFeed = false;
                    this.feedStackItems = [];
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
        },
        /**Method that returns the total number of a specified Feed type that are currently in the "Feed Stack". */
        getFeedCountForType(feedType:FeedEnums.Types){
            switch (feedType) {
                case FeedEnums.Types.User:
                    return this.numberOfUserFeedsInStack;
                case FeedEnums.Types.Tag:
                    return this.numberOfTagFeedsInStack;
                case FeedEnums.Types.FeedGenerator:
                    return this.numberOfCustomFeedsInStack;
                default:
                    break;
            }
        },
        /**
         * Method used to close the `FeedEditModal` if the Escape Key is pressed.
         * @param e Key down event.
         */
        onEscapeKeyPressed(e:KeyboardEvent){
            if(e.key == 'Escape'){
                this.closeModal();
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
            return this.currentPage == 0 && this.feedStackItems.length>0;
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
                return this.feedStackItems.length>0;
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
        },
        /**Calculates the number of Feeds that are currently in the "Feed Stack". */
        numberOfFeedsInStack(){
            return this.feedStackItems.length;
        },
        /**Calculates the number of "User Feeds" that are currently in the "Feed Stack". */
        numberOfUserFeedsInStack(){
            return this.feedStackItems.filter(x=>x.type == FeedEnums.Types.User).length;
        },
        /**Calculates the number of "Tag Feeds" that are currently in the "Feed Stack". */
        numberOfTagFeedsInStack(){
            return this.feedStackItems.filter(x=>x.type == FeedEnums.Types.Tag).length;
        },
        /**Calculates the number of "Custom Feeds" that are currently in the "Feed Stack". */
        numberOfCustomFeedsInStack(){
            return this.feedStackItems.filter(x=>x.type == FeedEnums.Types.FeedGenerator).length;
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
        },
        /**Used to load default Custom Feed Generators when selecting the "Custom Feed" feed type button. */
        selectedFeedType(newType:string,oldType:string){
            if(oldType != FeedEnums.Types.FeedGenerator && newType == FeedEnums.Types.FeedGenerator){
                this.getCustomFeeds();
            }
        }
    },
    beforeRouteEnter(to, from, next){
        if(!AppState.canBrowse) next({path:'/login'});
        else{
            if(to.path == '/create/feed'){
                next(vm =>{
                    vm.$data.currentPage = 0;
                })
            }
            else if(to.path.includes('/create/feed/summary')){
                next(vm =>{
                    vm.$data.currentPage = 1;
                })
            }
            else next();
        }
    },
    async beforeRouteLeave(to, from){
        let canLeaveWithoutPrompt = false;
        if(to.path.includes('/create/feed')) return true;
        if(this.attemptingToCreateFeed){
            toast.add({summary:"Please wait", detail:`Feed creation in progress, please wait`, severity:'info', group:'tr', life:1500});
            return canLeaveWithoutPrompt;
        }
        if(this.numberOfFeedsInStack>0){
            type ConfirmModalRef = InstanceType<typeof ConfirmModal>;
            this.isConfirmModalDisplayed = true;
            await (this.$refs.confirm as ConfirmModalRef).show('Are you sure you want to cancel creating Feeds?')
            .then(res => {
                canLeaveWithoutPrompt = res;
                this.isConfirmModalDisplayed = false;
            })
        }
        else canLeaveWithoutPrompt = true;
        return canLeaveWithoutPrompt;
    },
    async created(){
        AppState.isCreatingFeed = true;
        document.title = this.getFeedTypeTitle;
    },
    mounted(){
        this.$el.addEventListener('keydown', this.onEscapeKeyPressed);
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
    },
    beforeUnmount() {
        this.$el.removeEventListener('keydown', this.onEscapeKeyPressed);
        AppState.isCreatingFeed = false;
    },
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