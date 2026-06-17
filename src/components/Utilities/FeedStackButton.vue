<template>
    <button v-if="!displayOnly" @click="toggleFeedStackItem" :title="buttonTitleText"
    class="flex gap-2 p-3 text-left hover:bg-customFeedBtnBGHover
    active:bg-customFeedBtnBGActive focus-visible:bg-customFeedBtnBGHover border border-outline rounded"
    :class="[{'border-blueskyBlue bg-customFeedBtnBGHover' : selected},{'hover:bg-transparent active:bg-transparent focus-visible:bg-transparent' : displayOnly}]">
        <div v-if="!hideRadioButton && !displayOnly" class="flex items-center rounded-full aspect-square h-5 my-autos border border-secondary shrink-0 mt-1.5"
        :class="[{'bg-radioButtonSelected border-transparent' : selected}]">
            <i-mingcute:check-fill v-if="selected" class="h-full w-full p-0.5 text-white"/>
        </div>
        <div class="flex flex-col gap-2 w-full overflow-hidden">
            <div class="flex gap-1 items-center">
                <div v-if="!isSingularFeedType" class="flex bg-blueskyBlue aspect-square shrink-0 w-8 items-center justify-center">
                    <ImageLoader v-if="typeof avatar != 'undefined' && avatar != ''"
                    :img-url="avatar" loader-type="spinner" :fill-container="true"/>
                    <i-mingcute:radar-2-fill v-else class="text-white h-6 w-6"/>
                </div>
                <div v-if="isSingularFeedType" class="flex items-center h-8">Selected</div>
                <div v-else class="flex flex-col overflow-hidden">
                    <div class="text-base leading-5 text-nowrap overflow-hidden text-ellipsis">{{ typeof displayName != 'undefined' && displayName != '' ? displayName : 'PROP MISSING' }}</div>
                    <div v-if="feedType == FeedEnums.Types.User" class="text-xs text-secondary text-nowrap overflow-hidden text-ellipsis">@{{ typeof handle != 'undefined' && handle != '' ? handle : 'PROP MISSING' }}</div>
                    <div v-if="feedType == FeedEnums.Types.FeedGenerator" class="text-xs text-secondary text-nowrap overflow-hidden text-ellipsis">Feed by @{{ typeof handle != 'undefined' && handle != '' ? handle : 'PROP MISSING' }}</div>
                </div>
                <!-- <button v-if="!displayOnly" @click.stop="clickedPinFeed" :title="'Save &quot;'+feedGeneratorView?.displayName+'&quot; Feed'" class="ml-auto mr-1 px-2 rounded-none bg-btn hover:bg-btnHover">Pin</button> -->
            </div>
            <div v-if="!isSingularFeedType">
                <div class="text-sm">{{ typeof description != 'undefined' && description != '' ? description : 'Please supply the `:feed-generator-view` prop' }}</div>
                <!-- <div class="text-xs font-semibold mt-auto">Liked By: {{ feedGeneratorView ? feedGeneratorView.likeCount : 'PROP MISSING' }} users</div> -->
                <div v-if="feedType == FeedEnums.Types.User" class="flex gap-2 text-sm text-secondary">
                    <div v-if="!AppSettingsState.Settings.isHidingFollowers" class="flex gap-1"><div class="font-bold">{{ getCompactNumberValue(profileData?.followersCount) }}</div> <div>followers</div></div>
                    <div v-if="!AppSettingsState.Settings.isHidingFollowing" class="flex gap-1"><div class="font-bold">{{ getCompactNumberValue(profileData?.followsCount) }}</div> <div>following</div></div>
                    <div class="flex gap-1"><div class="font-bold">{{ getCompactNumberValue(profileData?.postsCount) }}</div> <div>posts</div></div>
                </div>
            </div>
        </div>
    </button>
    <div v-else data-testid="feedStackButton-display-only-item" class="flex gap-2 p-3 text-left border border-outline hover:border-modernToggleBtnBorderHover rounded select-none">
        <div class="flex flex-col gap-2 w-full overflow-hidden">
            <div class="flex gap-1 items-center">
                <div class="flex text-white aspect-square shrink-0 w-8 items-center justify-center"
                :class="[{'bg-blueskyBlue' : typeof avatar == 'undefined'}]">
                    <ImageLoader v-if="typeof avatar != 'undefined' && avatar != ''"
                    :img-url="avatar" loader-type="spinner" :fill-container="true"/>
                    <FeedIcon v-else-if="feedType == FeedEnums.Types.Tag" :icon="FeedEnums.Icons.Hashtag"/>
                    <FeedIcon v-else-if="feedType == FeedEnums.Types.Trending" :icon="FeedEnums.Icons.Trending"/>
                    <FeedIcon v-else-if="feedType == FeedEnums.Types.Following" :icon="FeedEnums.Icons.Following"/>
                    <FeedIcon v-else-if="feedType == FeedEnums.Types.Notifications" :icon="FeedEnums.Icons.Notifications"/>
                    <i-mingcute:radar-2-fill v-else class="text-white h-6 w-6"/>
                </div>
                <div class="flex flex-col overflow-hidden">
                    <div class="text-base leading-5 text-nowrap overflow-hidden text-ellipsis" :class="[{'opacity-20' : displayName == ''}]">{{ displayName != '' ? displayName : '[No Display Name]' }}</div>
                    <div class="text-xs text-secondary text-nowrap overflow-hidden text-ellipsis">{{ typeof handle != 'undefined' && handle != '' ? handle : 'PROP MISSING' }}</div>
                </div>
                <button @click="toggleFeedStackItem" :title="'Remove &quot;'+displayName+'&quot; Feed'"
                class="group self-center ml-auto mr-0.5 rounded p-0.5 border-0 bg-deleteBtnBG hover:bg-deleteBtnBGHover active:bg-deleteBtnBGActive
                text-xs text-white shadow-none outline-none">
                    <div class="flex p-0.5 px-1 items-center justify-center w-full h-full rounded border-2 border-transparent
                    group-focus-visible:border-feedtypeBtnFocusHighlight">
                    Remove
                    </div>
                </button>
            </div>
            <div class="flex flex-col gap-1 grow justify-between">
                <div class="text-sm">{{ typeof description != 'undefined' && description != '' ? description : 'No Description Provided' }}</div>
                <!-- <div class="text-xs font-semibold mt-auto">Liked By: {{ feedGeneratorView ? feedGeneratorView.likeCount : 'PROP MISSING' }} users</div> -->
                <div v-if="feedType == FeedEnums.Types.User" class="flex gap-2 text-sm">
                    <div v-if="!AppSettingsState.Settings.isHidingFollowers" class="flex gap-1"><div class="font-bold">{{ getCompactNumberValue(profileData?.followersCount) }}</div> <div>followers</div></div>
                    <div v-if="!AppSettingsState.Settings.isHidingFollowing" class="flex gap-1"><div class="font-bold">{{ getCompactNumberValue(profileData?.followsCount) }}</div> <div>following</div></div>
                    <div class="flex gap-1"><div class="font-bold">{{ getCompactNumberValue(profileData?.postsCount) }}</div> <div>posts</div></div>
                </div>
                <div v-if="feedType == FeedEnums.Types.FeedGenerator" class="text-sm mt-auto"><span class="font-bold">{{ typeof generatorData != 'undefined' ? getCompactNumberValue(generatorData.likeCount) : 'PROP MISSING' }}</span> users liked</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { getCompactNumberValue } from '../../helpers/converters';
import ImageLoader from './ImageLoader.vue';
import { FeedEnums } from '../../enums/FeedEnums';
import { AppBskyActorDefs, AppBskyFeedDefs } from '@atproto/api';
import { AppSettingsState } from '../../state/AppSettingsState.vue';
import FeedIcon from '../Feed/FeedIcon.vue';

export default defineComponent({
    props:{
        atUri:String,
        tags:Array as PropType<string[]>,
        /**Value used to identify/declare a Feed. */
        feedName:String,
        feedType:{
            type: String as PropType<FeedEnums.Types>,
            required:true
        },
        /**The unique identifier for the array item in the Feed Stack where the data being passed to this component came from. */
        feedStackIdentifier:{
            type:String,
            required:true
        },
        selected:Boolean,
        /**
         * `ProfileViewDetailed` data for a User-type Feed.
         */
        profileData:{
            type: Object as PropType<AppBskyActorDefs.ProfileViewDetailed>
        },
        /**
         * `AppBskyFeedDefs.GeneratorView` data for a "Feed Generator" type Feed.
         */
        generatorData:{
            type: Object as PropType<AppBskyFeedDefs.GeneratorView>
        },
        // /**The index that points to the record in the "Feed Stack" related to the information displayed in this control. */
        // stackIndex:{
        //     type:Number,
        //     required:true
        // },
        hideRadioButton:{
            type: Boolean,
            default: false
        },
        /**Should the Feed Generator info be displayed in a non-interactive
         * way - just a `div` container instead of a `button`.
         */
        displayOnly:{
            type:Boolean,
            default: false
        }
    },
    data(){
        return{
            AppSettingsState,
            getCompactNumberValue,
            FeedEnums,
        }
    },
    components:{
        ImageLoader,
        FeedIcon,
    },
    emits:{
        /**Emit used to indicate a specific settings category has been clicked. */
        clickedToggleStackItem:(type:FeedEnums.Types,identifier:string) => {
            return {feedType:type,id:identifier};
        }
    },
    methods:{
        /**
         * Emits message when the main control area is clicked.
         */
        toggleFeedStackItem(){
            // if(this.displayOnly){
                let identifier = '';
                switch (this.feedType) {
                    case FeedEnums.Types.User:
                        identifier = typeof this.profileData != 'undefined' ? this.profileData.did : 'profile data missing'
                        break;
                    default:
                        break;
                }
                this.$emit('clickedToggleStackItem',this.feedType,this.feedStackIdentifier);
            // }
        },
        /**
         * Method that runs when the "Pin" button is clicked. Used to add
         * associated Feed Generator to User's list of saved Feeds.
         */
        clickedPinFeed(){
            alert('Pinned');
        }
    },
    computed:{
        buttonTitleText(){
            switch(this.feedType){
                case FeedEnums.Types.Trending:
                    return 'Toggle Creation of Trending Feed';
                case FeedEnums.Types.Following:
                    return 'Toggle Creation of Following Feed';
                case FeedEnums.Types.Notifications:
                    return 'Toggle Creation of Notification Feed';
                default:
                    return `Select '${this.displayName}' Feed`
            }
        },
        /**Is the associated Feed Type a singular Feed? (Only one can be in the Feed Stack at a time) */
        isSingularFeedType(){
            if(this.feedType == FeedEnums.Types.Trending ||
                this.feedType == FeedEnums.Types.Following ||
                this.feedType == FeedEnums.Types.Notifications)
                return true;
            else return false;
        },
        /**"Handle" value to use based on the Feed type. */
        handle():string{
            if(this.feedType == FeedEnums.Types.User && typeof this.profileData != 'undefined') return `@${this.profileData.handle}`;
            else if(this.feedType == FeedEnums.Types.Tag) return 'Hashtag Feed';
            else if(this.feedType == FeedEnums.Types.FeedGenerator) return `Feed By @${typeof this.generatorData != 'undefined' ? this.generatorData.creator.handle : '[GeneratorData] prop is missing'}`;
            else if(this.feedType == FeedEnums.Types.Trending) return `Feed List by Bluesky`;
            else if(this.feedType == FeedEnums.Types.Following) return `Shows latest posts from following`;
            else if(this.feedType == FeedEnums.Types.Notifications) return `Shows account notifications`;
            else return 'Not yet implemented for Feed Type';
        },
        /**"Display Name" value to use based on the Feed type. */
        displayName():string|undefined{
            // if(this.feedType == FeedEnums.Types.User && typeof this.profileData != 'undefined') return this.profileData.displayName;
            // else return 'Not yet implemented for Feed Type';
            switch (this.feedType) {
                case FeedEnums.Types.User:
                    let dn = typeof this.profileData != 'undefined' ? this.profileData.displayName : 'ERROR: Profile data is missing';
                    return dn;
                case FeedEnums.Types.Tag:
                case FeedEnums.Types.FeedGenerator:
                case FeedEnums.Types.Trending:
                case FeedEnums.Types.Following:
                case FeedEnums.Types.Notifications:
                    return this.feedName;
                default:
                    return 'ERROR: Feed type not handled';
            }
        },
        /**"Description" value to use based on the Feed type. */
        description():string|undefined{
            if(this.feedType == FeedEnums.Types.User && typeof this.profileData != 'undefined') return this.profileData.description;
            else if(this.feedType == FeedEnums.Types.Tag) return `Will display Posts including the following hashtags: ${this.displayName}`;
            else if(this.feedType == FeedEnums.Types.FeedGenerator){
                if(typeof this.generatorData != 'undefined') return `${this.generatorData.description}`;
            }
            else if(this.feedType == FeedEnums.Types.Trending) return `Displays a list of the current trending topics on Bluesky.`;
            else if(this.feedType == FeedEnums.Types.Following) return `Displays the latest posts from the Users you follow.`;
            else if(this.feedType == FeedEnums.Types.Notifications) return `Displays account notifications (likes, follows etc.)`;
            else return 'Not yet implemented for Feed Type';
        },
        /**"Avatar URL" value to use based on the Feed type. */
        avatar():string|undefined{
            if(this.feedType == FeedEnums.Types.User && typeof this.profileData != 'undefined') return this.profileData.avatar;
            if(this.feedType == FeedEnums.Types.FeedGenerator && typeof this.generatorData != 'undefined') return this.generatorData.avatar;
            else return undefined;
        },
    }
})
</script>

<style scoped>

</style>