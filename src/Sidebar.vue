<template>
    <div data-test="app-viewport" id="app-viewport" class="flex flex-row h-screen w-screen"
    :class="{'theme-light':!AppSettingsState.Settings.isDarkMode}">
        {{ void "sidebar" }}
        <div class="flex flex-col h-full z-10 drop-shadow-md-harder bg-sidebar min-w-16 items-center">
            {{ void "App Logo" }}
            <div class="w-full border-b border-gray-700 p-2 flex-none">
                <UserButton tooltip="[logo here]"/>
            </div>
            <div class="w-full flex flex-col flex-shrink overflow-hidden">
                {{ void "Feed List + Add btn" }}
                <div class="flex flex-col h-full">
                    <div class="flex-shrink preload-gutter overflow-x-hidden">
                        <div class="space-y-2 py-2 pl-2 pr-1">
                            <FeedButton :icon="FeedEnums.Icons.Home" tooltip="Home"/>
                            <TransitionGroup name="feedbutton">
                                <!-- <FeedButton v-for="feeds in feedListing.feedList" :key="feeds.feedId" :feedId="feeds.feedId" :type="feeds.feedType" :tooltip="feeds.feedName" :newPosts="feeds.newPosts"/> -->
                                <FeedButton v-for="feed in FeedState.FeedList" :key="feed" :feedId="feed.description.feedId" :icon="feed.description.feedIcon" :tooltip="feed.description.feedName" :newPosts="feed.description.newPosts" :user-did="feed.description.feedType == FeedEnums.Types.User ? feed.description.feedSourceDID : ''"/>
                            </TransitionGroup>
                        </div>
                    </div>
                    <div class="border-t border-gray-700 space-y-2 px-2 py-2 flex-none">
                        <FeedButton :icon="FeedEnums.Icons.AddList" tooltip="Add Feed" @click="addFeed"/>
                        <FeedButton :icon="FeedEnums.Icons.RemoveList" tooltip="Remove Feed" @click="removeFeed"/>
                        <FeedButton :icon="FeedEnums.Icons.CreatePost" tooltip="Create New Post" @click="createNewPost"/>
                    </div>
                </div>
            </div>
            {{ void "Navbar Footer" }}
            <div class="w-full flex-none !mt-auto">
                <div class="p-2 space-y-2">
                    <FeedButton :icon="FeedEnums.Icons.Settings" tooltip="App Settings" @click="showSettingsPanel"/>
                    <UserButton :tooltip="AppState.currentUsername"/>
                </div>
            </div>
            <Tooltip id="navbar-tooltip" tooltip=""/>
        </div>
        {{ void "main content" }}
        <div data-test="feed-viewport" :onscroll="showScrollXPos" id="feedcolumnDisplay"
            class="flex w-full bg-slate-700 overflow-y-hidden" >
            <div class="flex">
                <TransitionGroup name="feedcolumn">
                    <!-- <FeedColumn v-for="feed in feedListing.feedList" :key="feed" :feedData="feed"/> -->
                    <FeedColumn v-for="feed in FeedState.FeedList" :key="feed.description.feedId" :feedData="feed"/>
                </TransitionGroup>
                <div v-if="DebugFlags.showFeedScrollStats" id="debug-feedViewportStats" class="absolute bottom-3 p-2 bg-blue-800/90">
                    <div>X Pos: {{ scrollXPos }}</div>
                    <div>Viewport Width: {{ fdViewWidth }}</div>
                </div>
                {{ void "debug: main viewport center marker" }}
                <div v-if="DebugFlags.showFeedViewportCenter" id="debug-feedViewportCenterLine" class="absolute h-full w-0.5 bg-red-700/60"></div>
            </div>
        </div>
        {{ void "Post Details Modal" }}
        <div v-if="DebugFlags.showPostFocusModalAPITestButton"
            class="absolute z-10 m-4 space-y-1 w-72">
            <div @click="getBSkyAPIData" class="cursor-pointer bg-blue-600 hover:bg-blue-500 rounded p-2">Get Posts</div>
            <div @click="getHomeFeed" class="cursor-pointer bg bg-sky-600 hover:bg-sky-500
                rounded p-2">Get Home Feed</div>
            <div class="p-4 bg-slate-950/90">
                Posts here:
                <div v-for="(data, index) in APIResponse.data?.feeds">
                    {{ index }} - {{ data.displayName }}
                </div>
            </div>
            <FeedPost/>
        </div>
        <Transition name="modal">
            <LoginModal v-if="AppState.isLoggingIntoAccount"/>
        </Transition>
        <Toast position="bottom-center" group="bc"/>
        <!-- <Toast position="bottom-center" group="bc":pt="{
                root:'mr-auto',
                message:'rounded border border-blue-500',
                messageContent: 'flex bg-blue-700 p-2 space-x-2',
                summary: 'font-bold',
                detail: 'text-xs',
                transition:{
                    enterToClass: 'slide-fade'
                }
            }">
        </Toast> -->
        <Toast position="top-right" group="tr"/>
        <DbDebugModal v-if="DebugFlags.showAppSettingsDBDebugModal"/>
        <PostOptionsMenu v-show="postDetails.isPostOptionsMenuVisible" :menuItems="OptionIconList"/>
        <FeedOptionsMenu v-show="FeedState.isFeedOptionMenuVisible"/>
        <OptionsMenu v-show="OptionsMenuState.isOptionsMenuVisible"/>
        <Transition name="modal">
            <ConfirmModal v-show="AppState.isAskingForConfirmation"/>
        </Transition>
        <Transition name="modal">
            <SaveMediaModal v-if="AppState.isSavingMediaModalVisible"/>
        </Transition>
        <PostDetailModal/>
        <Transition>
            <PostFocusModal v-if="postDetails.isFocusVisible"/>
        </Transition>
        <Transition name="modal">
            <FeedEditModal v-if="AppState.isCreatingFeed || AppState.isUpdatingFeed"/>
        </Transition>
        <Transition>
            <UserFocusModal v-if="AppState.isViewingUserAccount"/>
        </Transition>
        <Transition name="peek">
            <AccountPeek v-show="AccountPeekState.isUserPeeking"/>
        </Transition>
        <Transition name="modal">
            <CreatePost v-if="AppState.isCreatingNewPost" :post-ref="postDetails.currentPostData"/>
        </Transition>
        <Transition name="modal">
            <SettingsPanel v-if="AppState.isSettingsPanelVisible"/>
        </Transition>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { userFeedList, FeedState, AddFeedToList, createFeedDescription, AddSavedFeed } from "./state/FeedList.vue";
import * as PostEnums from "./enums/PostEnums";
import { postDetails } from "./state/PostDetails.vue";
import { AppState, toast } from "./state/AppState.vue";
import { DebugFlags } from "./state/Debug.vue";
import { OptionIconList } from "./fake-data/dumPostData";
import { IPostDetails } from "./interfaces/PostInterfaces";
import { getBlueskyPostThread } from "./lib/api/Post.vue";
import {AppSettings, loadAppSettingsRecords, createAppSettingTable,
    initializeAppSettingsTable, updateAppSettings, checkIfAppSettingsTableExists,
    checkIfAppSettingsDatabaseExists, validateWindowPosition,
checkIfUserAccountsTableExists,
createUserAccountsTable,
checkIfSavedFeedsTableExists,
createSavedFeedsTable, updateSavedFeedsTable,
loadSavedFeedsRecords,
stringifyFeedListData,
stringToJSON} from "./lib/db/local_db";
import { invoke } from "@tauri-apps/api/core";
import { currentMonitor, getCurrentWindow, PhysicalPosition, PhysicalSize, Window } from "@tauri-apps/api/window";
import { getUserHomeFeed } from "./lib/api/Feed.vue";
import { FeedEnums } from "./enums/FeedEnums";
import FeedEditModal from "./components/Feed/FeedEditModal.vue";
import UserFocusModal from "./components/User/UserFocusModal.vue";
import { OptionsMenuState } from "./state/OptionsMenuState.vue";
import { GetBrowsingAgent } from "./lib/api.vue";
import { SavedFeeds } from "./lib/db/local_db";
import { AccountPeekState } from "./state/AccountPeekState.vue";
import FeedButton from "./components/Navbar/FeedButton.vue";
import CreatePost from "./components/Post/CreatePost.vue"
import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { HandleAPIError } from "./helpers/errors";
import SaveMediaModal from "./components/Utilities/SaveMediaModal.vue";
import PostFocusModal from "./components/Post/PostFocusModal.vue";
import SettingsPanel from "./components/Settings/SettingsPanel.vue";
import { AppSettingsState } from "./state/AppSettingsState.vue";


    export default defineComponent({
        name:'Sidebar',
        components:{
            FeedButton,
            FeedEditModal,
            PostFocusModal,
            UserFocusModal,
            CreatePost,
            SettingsPanel,
        },
        data(){
            return{
                // feedList: [
                //     {feedName:'Friends', feedType:'friends', newPosts: 3},
                //     {feedName:'Local News', feedType:'news', newPosts: 5},
                //     {feedName:'Artists', feedType:'art', newPosts: 7},
                // ]
                feedListing: userFeedList,
                FeedState,
                OptionsMenuState,
                AccountPeekState,
                postDetails,
                AppState,
                AppSettingsState,
                DebugFlags,
                iconTypes:PostEnums.IconTypes,
                scrollXPos : 0,
                fdViewWidth : 0,
                OptionIconList,
                APIResponse: {},
                DBResponse: {},
                FeedEnums
            }
        },
        methods: {
            addFeed(){
                // addDummyFeed();
                if(!AppState.checkIfCanBrowse()) return;
                AppState.ToggleCreateFeedModal();
                this.showScrollXPos();
            },
            removeFeed(){
                // if(this.feedListing.feedList && this.feedListing.feedList.length>0){
                //     let removedIndex = Math.round(Math.random() * (this.feedListing.feedList.length-1));
                //     let removedFeed = this.feedListing.feedList[removedIndex];
                //     console.log(`Removing feed: [${removedFeed.feedName}, ${removedFeed.feedType}, ${removedFeed.newPosts}]`);
                //     this.feedListing.feedList.splice(removedIndex,1);
                // }
                stringifyFeedListData(FeedState.FeedList);
                this.showScrollXPos();
            },
            createNewPost(){
                // if(!AppState.checkIfLoggedIn("post")) return;
                AppState.showCreatePost();
            },
            showSettingsPanel(){
                AppState.ShowSettingsPanel();
            },
            /**
             * DEBUG - Displays the current x-axis scroll pos of the Feed Display.
             */
            showScrollXPos(){
                const el = document.getElementById("feedcolumnDisplay");
                this.scrollXPos = el.scrollLeft;
                this.getFeedDisplayViewWidth();
            },
            /**
             * DEBUG - Displays the current viewable width of the Feed Display.
             */
            getFeedDisplayViewWidth(){
                const el = document.getElementById("feedcolumnDisplay");
                if(el)
                    this.fdViewWidth = el.offsetWidth;
                else
                    return "feedcolumnDisplay could not be found.";
            },
            /**
             * DEBUG - Positions center line for FeedColumn display viewport,
             * taking into account the width of the sidebar.
             */
            placeFeedDisplayCenterLine(){
                var feedDisplayViewport = document.getElementById('feedcolumnDisplay');
                var centerLine = document.getElementById('debug-feedViewportCenterLine');
                if(feedDisplayViewport && centerLine){
                    centerLine.style.left = (feedDisplayViewport.clientWidth/2) + feedDisplayViewport.offsetLeft+"px";
                }
                else if(!feedDisplayViewport){console.log('There was an error positioning the `FeedColumn` display center line.')}
            },
            /**DEBUG - Test getting data through Bluesky API */
            async getBSkyAPIData(){
                const feedResults = await GetBrowsingAgent().app.bsky.unspecced.getPopularFeedGenerators({limit:15})
                this.APIResponse = feedResults;
                this.getExamplePost();
            },
            /**DEBUG - Get example post data */
            async getExamplePost(){
                // var did = await agent.app.bsky.actor.getProfile({actor:"mega64official.bsky.social"});
                // var did = await agent.app.bsky.actor.getProfile({actor:"qqqewie.bsky.social"});
                var pasDID = "did:plc:2ecumfvt54kiepru4leansvz";
                var pasPost = "3lginbvqidk26";
                // var eeeDID = (await agent.app.bsky.actor.getProfile({actor:"eulyin.bsky.social"})).data.did;
                var eeePost = "3leto5w64bs2u";
                var henkenDID = (await GetBrowsingAgent().app.bsky.actor.getProfile({actor:"henkensecond.bsky.social"})).data.did;
                var zzzPost = "3l7d5aw7t4426";
                var EXAMPLE_POST = "at://did:plc:7kf37yk3wjqjv6zjlryjypn4/app.bsky.feed.post/3lgj4pe5uz22o"
                EXAMPLE_POST = "at://"+henkenDID+"/app.bsky.feed.post/"+zzzPost;

                var postThread = await getBlueskyPostThread(henkenDID+"/app.bsky.feed.post/"+zzzPost)

                // var postData = thread.data.thread.post;
                var postData = postThread.thread.post;
                var post : IPostDetails = {
                    userName : postData.author.displayName ? postData.author.displayName : "",
                    userHandle: postData.author.handle,
                    postText: postData.record.text,
                    postType: PostEnums.PostTypes.Image,
                    // postMedia: [postData.embed?.images[0] ? postData.embed?.images[0].fullSize : ""],
                    postMedia: [postData.embed?.images[0].fullsize],
                    // postMedia: [postData.author.avatar ? postData.author.avatar : ""],
                    comments: [],
                    totalComments: postData.replyCount ? postData.replyCount : 0,
                    totalLikes: postData.likeCount ? postData.likeCount : 0,
                    totalReposts: postData.repostCount ? postData.repostCount : 0,
                }
                // console.log(thread.data);
                console.log(postThread);
                // postDetails.postThread = thread.data.thread;
                postDetails.postThread = postThread.thread;
                postDetails.currentThreadView = postThread.thread;
                postDetails.updateCurrentBreadcrumbs();
                // postDetails.showFocusModal(post, 0);
                postDetails.showFocusModalIndex(0);
            },
            async getHomeFeed(){
                var homeFeed:FeedViewPost[];
                await getUserHomeFeed()
                .then(res => {
                    homeFeed = res.data.feed
                    //FIX: NEED TO GET REAL CURRENT USER ID FROM APP STATE EVENTUALLY
                    var feedDesc = createFeedDescription(1,'home','Home Timeline',FeedEnums.Types.Home, FeedEnums.Icons.Home,10,10, {width:444}, homeFeed[0].post.author.did);
                    AddFeedToList(feedDesc, homeFeed);
                })
                .catch(err => toast.add(HandleAPIError(err, 'Error getting Home timeline posts')));
            },
            /**Method used to set up event listeners for app actions.
             * Called during creation of component.
             */
            async setUpListeners(){
                var window = Window.getCurrent();

                //Listen to any attempt to close the app window.
                const unlisten = await window.onCloseRequested(async (event) => {
                    var windowSize = (await getCurrentWindow().innerSize()).toJSON();
                    var windowPos = (await getCurrentWindow().innerPosition()).toJSON();
                    var monitor = (await currentMonitor())?.name;
                    const confirmed = await confirm('Are you sure?');
                    if (!confirmed) {
                        // user did not confirm closing the window; let's prevent it
                        event.preventDefault();
                    }
                    else{
                        await updateAppSettings({lastWindowWidth:windowSize.width,
                            lastWindowHeight:windowSize.height,
                            lastWindowPosX:windowPos.x,
                            lastWindowPosY:windowPos.y,
                            lastMonitor:monitor} as AppSettings);

                        await updateSavedFeedsTable({data:stringifyFeedListData(FeedState.FeedList)});
                    }
                });
                // unlisten();//unlistens, removes listener - WILL PREVENT EXECUTION
            },
            /**
             * Method that ensures that the `app_settings` database and tables
             * are set up. Called during creation of component.
             */
            async appSettingsDatabaseSetup(){
                var dbExist = await checkIfAppSettingsDatabaseExists();
                var tableExist = await checkIfAppSettingsTableExists();

                if(!dbExist){
                    console.log("db file missing - creating db file");
                    await createAppSettingTable();
                }
                if(!tableExist){
                    console.log("`app_settings` table missing - creating table");
                    await createAppSettingTable();
                    await initializeAppSettingsTable();
                }
            },
            /**
             * Method that ensures that the `user_accounts` table exists.
             * Called during creation of component.
             */
            async userAccountsDatabaseSetup(){
                var tableExist = await checkIfUserAccountsTableExists();
                if(!tableExist){
                    console.log("`user_accounts` table missing - creating table");
                    await createUserAccountsTable();
                }
            },
            /**
             * Method that ensures that the `user_accounts` table exists.
             * Called during creation of component.
             */
             async savedFeedsDatabaseSetup(){
                var tableExist = await checkIfSavedFeedsTableExists();
                if(!tableExist){
                    console.log("`saved_feeds` table missing - creating table");
                    await createSavedFeedsTable();
                }
            },
            /**
             * Method that loads the application settings saved in the
             * `app_settings` database and applies them.
             */
            async loadAppConfig(){
                var loadedWindowPosition = new PhysicalPosition(0,0);
                var loadedWindowSize = new PhysicalSize(800,600);
                var appSettings = await loadAppSettingsRecords() as AppSettings[];
                //move window to correct monitor first
                await invoke('position_on_monitor',{monitorName:appSettings[0].lastMonitor});
                //then get monitor for positioning
                var curMonitor = await currentMonitor();
                loadedWindowPosition = new PhysicalPosition(appSettings[0].lastWindowPosX ? appSettings[0].lastWindowPosX:0,
                    appSettings[0].lastWindowPosY ? appSettings[0].lastWindowPosY:0);
                loadedWindowSize = new PhysicalSize(appSettings[0].lastWindowWidth ? appSettings[0].lastWindowWidth:0,
                    appSettings[0].lastWindowHeight ? appSettings[0].lastWindowHeight:0);
                loadedWindowPosition = validateWindowPosition(curMonitor,loadedWindowPosition,loadedWindowSize);
                var curWindow = await getCurrentWindow();
                curWindow.setPosition(loadedWindowPosition);
                curWindow.setSize(loadedWindowSize);

                //Load application settings
                AppSettingsState.loadSettingsFromDB(appSettings[0].collection);

                //Load saved Feeds
                var lastOpenFeeds = await loadSavedFeedsRecords() as SavedFeeds[];
                console.log(lastOpenFeeds);
                //Ensure there is data to load before trying to display Feeds
                if(lastOpenFeeds && lastOpenFeeds[0].data.length>0){
                    var loadedFeeds = stringToJSON(lastOpenFeeds[0].data);
                    console.log(loadedFeeds);
                    //Set AppState to "loading feeds" - prevent interaction until
                    //all data has been loaded
                    for (let i = 0; i < loadedFeeds.length; i++) {
                        await AddSavedFeed(loadedFeeds[i]);
                    }
                    //Set AppState "loading feeds" to false
                }
                else{console.log('No saved Feeds to restore.')}
            },
            async appStartupProcedure(){
                await this.appSettingsDatabaseSetup();
                await this.userAccountsDatabaseSetup();
                await this.savedFeedsDatabaseSetup();
                await this.setUpListeners();
                this.loadAppConfig();
                invoke('show_main_window');//unhide main window and focus it via Rust
            },
        },
        created(){
            this.appStartupProcedure();
        },
        mounted(){
            this.getFeedDisplayViewWidth();
            this.placeFeedDisplayCenterLine();
        },
        setup () {
            return {}
        }
    })
</script>
<style scoped>
.modal-move,
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0 !important;
    transform: translateY(-10px);
}

.feedbutton-move,
.feedbutton-enter-active,
.feedbutton-leave-active {
    transition: margin 0.4s ease, opacity 0.2s ease, height 0.4s ease, transform 0.2s ease;
}

.feedbutton-enter-from,
.feedbutton-leave-to {
    opacity: 0;
    height: 0;
    margin: 0 !important;
    transform: translateY(-10px);
}

.feedcolumn-move,
.feedcolumn-enter-active,
.feedcolumn-leave-active {
    transition: opacity 0.2s ease, transform 0.4s ease;
}
.feedcolumn-leave-active {
    position: absolute;
    /* z-index: -1; */
}

.feedcolumn-enter-from,
.feedcolumn-leave-to {
    /* width: 0 !important; */
    opacity: 0;
    transform: translateX(-10px);
}
.feedcolumn-leave-to{
    min-width: unset;
}

.peek-move,
.peek-enter-active,
.peek-leave-active {
    transition: opacity 0.15s ease, transform 0.2s ease;
}

.peek-enter-from,
.peek-leave-to {
    opacity: 0 !important;
    transform: translateY(-5px);
}
</style>