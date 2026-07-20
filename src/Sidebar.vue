<template>
    <div data-testid="app-viewport" id="app-viewport" class="flex flex-row absolute h-full w-screen"
    :class="{'theme-light':!AppSettingsState.Settings.isDarkMode}">
        {{ void "sidebar" }}
        <div class="flex flex-col h-full z-10 drop-shadow-md-harder bg-sidebar w-16 shrink-0 items-center">
            {{ void "App Logo" }}
            <div class="flex w-full border-b border-outline p-1">
                <AppLogo @click="showAboutAppModal"/>
            </div>
            <div class="w-full flex flex-col flex-shrink overflow-hidden">
                {{ void "Feed List + Add btn" }}
                <div class="flex flex-col h-full">
                    <div class="flex-shrink preload-gutter overflow-x-hidden">
                        <div class="space-y-2 p-2">
                            <!-- <FeedButton :icon="FeedEnums.Icons.Home" tooltip="Home"/> -->
                            <TransitionGroup name="feedbutton">
                                <!-- <FeedButton v-for="feeds in feedListing.feedList" :key="feeds.feedId" :feedId="feeds.feedId" :type="feeds.feedType" :tooltip="feeds.feedName" :newPosts="feeds.newPosts"/> -->
                                <!-- <FeedButton v-for="(feed,index) in FeedState.FeedList" :key="feed.description.feedId"
                                :feedId="feed.description.feedId" :icon="feed.description.feedIcon"
                                :tooltip="feed.description.feedName" :newPosts="feed.description.newPosts"
                                :user-did="feed.description.feedType == FeedEnums.Types.User ? feed.description.feedSourceDID : ''"
                                :class="{'drag-start' : index === oldIndex, 'drag-over' : index === newIndex}"
                                draggable="true"
                                @dragstart="handleDragstart($event,index)" @dragover.prevent="handleDragover(index)"
                                @drop="handleDrop" @dragend="handleDragend"/> -->

                                <FeedButton v-if="!AppState.isAppOnMobileTouchscreenDevice" v-for="(feed,index) in FeedState.FeedList" :key="feed.description.feedId"
                                :tooltip="feed.description.feedName" :is-awaiting-new-post-data="feed.isAwaitingFeedData"
                                :feed-description="feed.description"
                                :button-being-dragged="isDraggingButton"
                                @pointerdown="handleFeedButtonLongpress($event,index)" @pointerup="handleFeedButtonMouseup"
                                @pointerover="handleFeedButtonMouseover($event,index)" @pointerleave="handleFeedButtonMouseLeave"
                                class="draggable"/>
                                <FeedButton v-else v-for="(feed) in FeedState.FeedList" :key="feed.description.feedId+'_mobile'"
                                :tooltip="feed.description.feedName":is-awaiting-new-post-data="feed.isAwaitingFeedData"
                                :feed-description="feed.description"
                                :button-being-dragged="isDraggingButton"/>
                            </TransitionGroup>
                        </div>
                    </div>
                    <div class="border-t border-gray-700 space-y-2 px-2 py-2 flex-none">
                        <SidebarButton data-testid="add-feed-button" :icon="FeedEnums.Icons.AddList" tooltip="Add Feed" @click="addFeed"/>
                        <SidebarButton data-testid="create-post-button" :icon="FeedEnums.Icons.CreatePost" tooltip="Create New Post" @click="createNewPost"/>
                    </div>
                </div>
            </div>
            {{ void "Navbar Footer" }}
            <div class="w-full flex-none !mt-auto">
                <div class="p-2 space-y-2">
                    <SidebarButton data-testid="app-settings-button" :icon="FeedEnums.Icons.Settings" tooltip="App Settings" @click="showSettingsPanel"/>
                    <UserButton :tooltip="AppState.currentUsername"/>
                </div>
            </div>
            <Tooltip id="navbar-tooltip" tooltip=""/>
        </div>
        {{ void "main content" }}
        <div data-test="feed-viewport" :onscroll="showScrollXPos" id="feedcolumnDisplay"
            class="flex w-full bg-viewportBG overflow-y-hidden" >
            <div class="flex">
                <TransitionGroup name="feedcolumn">
                    <IntroMessage v-cloak key="intro_message-a12u2uss1w" v-if="AppSettingsState.isSettingsLoaded && AppSettingsState.Settings.isShowingIntroMessage"/>
                    <!-- <FeedColumn v-for="feed in feedListing.feedList" :key="feed" :feedData="feed"/> -->
                    <FeedColumn v-for="(feed, index) in FeedState.FeedList" :list-index="index"
                    :key="feed.description.feedId" :feedData="feed"
                    @pointerover="handleFeedColumnMouseover($event,index+1)"
                    @pointerleave="handleFeedColumnMouseLeave"
                    class="draggable"/>
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
            <ConfirmModal v-if="AppState.isAskingForConfirmation"/>
        </Transition>
        <Transition name="modal">
            <FeedOrderModal v-if="AppState.isUpdatingFeedPosition" :feed-id-to-update="FeedState.selectedFeed"/>
        </Transition>
        <Transition name="modal">
            <UserLivestreamDetails v-if="AppState.isViewingUserLivestreamInfo" :user-profile="AppState.livestreamInfoUserProfile"/>
        </Transition>
        <Transition name="peek">
            <AccountPeek v-show="AccountPeekState.isUserPeeking"/>
        </Transition>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { FeedState, AddFeedToList, OLDcreateFeedDescription, AddSavedFeed, SaveFeedChanges, RefreshAllFeeds, LoadAllFeedPostsAsync } from "./state/FeedList.vue";
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
import { invoke, isTauri } from "@tauri-apps/api/core";
import { Window } from "@tauri-apps/api/window";
import { getUserHomeFeed } from "./lib/api/Feed.vue";
import { FeedEnums } from "./enums/FeedEnums";
import FeedEditModal from "./components/Feed/FeedEditModal.vue";
import UserFocusModal from "./components/User/UserFocusModal.vue";
import { OptionsMenuState } from "./state/OptionsMenuState.vue";
import { ResumeAuthSession, GetBrowsingAgent } from "./lib/api.vue";
import { SavedFeeds } from "./lib/db/local_db";
import { AccountPeekState } from "./state/AccountPeekState.vue";
import FeedButton from "./components/Navbar/FeedButton.vue";
import CreatePost from "./components/Post/CreatePost.vue"
import { AppBskyFeedDefs } from "@atproto/api";
import { HandleAPIError } from "./helpers/errors";
import PostFocusModal from "./components/Post/PostFocusModal.vue";
import SettingsPanel from "./components/Settings/SettingsPanel.vue";
import { AppSettingsState } from "./state/AppSettingsState.vue";
import FeedColumn from "./components/Feed/FeedColumn.vue";
import { IFeedDBData } from "./interfaces/FeedInterfaces";
import IntroMessage from "./components/Intro/IntroMessage.vue";
import SidebarButton from "./components/Navbar/SidebarButton.vue";
import { isOnMobileTouchscreen } from "./helpers/states";
import FeedOrderModal from "./components/Feed/FeedOrderModal.vue";
import AppLogo from "./components/SVG/AppLogo.vue";
import AboutAppModal from "./components/Settings/AboutAppModal.vue";
import UserButton from "./components/Navbar/UserButton.vue";
import { isBroadcastObject } from "./types/BroadcastChannelTypes";
import { BroadcastChannelTarget } from "./types/BroadcastChannelTypes";
import { LoginState } from "./interfaces/AccountInterfaces";
import { router } from "./main";
import UserLivestreamDetails from "./components/User/UserLivestreamDetails.vue";


    export default defineComponent({
        name:'Sidebar',
        components:{
            FeedButton,
            UserButton,
            SidebarButton,
            FeedColumn,
            FeedEditModal,
            FeedOrderModal,
            PostFocusModal,
            UserFocusModal,
            CreatePost,
            SettingsPanel,
            IntroMessage,
            AppLogo,
            AboutAppModal,
            UserLivestreamDetails,
        },
        data(){
            return{
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
                FeedEnums,
                oldFeedButtonIndex:-100,
                newFeedButtonIndex:-100,
                /**Holds the timeout object used to detect a longpress of a `FeedButton`. */
                longpressTimeout:-1,
                /**Holds a copy of the `FeedButton` element that is being dragged. */
                draggedButton: undefined,
                /**Indicates that one of the `FeedButton` components is being dragged. */
                isDraggingButton:false,
                /**Used to correctly position `FeedButton` when it is being dragged. */
                dragButtonStartingY:0,
                isOnMobileTouchscreen,
                isTauri,
            }
        },
        methods: {
            addFeed(){
                // addDummyFeed();
                this.$router.push(`/create/feed`);
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
                if(!AppState.checkIfLoggedIn("post")) return;
                AppState.showCreatePost();
            },
            showSettingsPanel(){
                this.$router.push('/settings');
            },
            showAboutAppModal(){
                this.$router.push('/about');
                if(document.activeElement instanceof HTMLElement) document.activeElement.blur();
            },
            /**
             * DEBUG - Displays the current x-axis scroll pos of the Feed Display.
             */
            showScrollXPos(){
                const el = document.getElementById("feedcolumnDisplay");
                if(el) this.scrollXPos = el.scrollLeft;
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
                var homeFeed:AppBskyFeedDefs.FeedViewPost[];
                await getUserHomeFeed()
                .then(res => {
                    homeFeed = res.data.feed
                    //FIX: NEED TO GET REAL CURRENT USER ID FROM APP STATE EVENTUALLY
                    var feedDesc = OLDcreateFeedDescription(1,'home','Home Timeline',FeedEnums.Types.Home, FeedEnums.Icons.Home,10,10, {width:444}, homeFeed[0].post.author.did);
                    AddFeedToList(feedDesc, homeFeed);
                })
                .catch(err => toast.add(HandleAPIError(err, 'Error getting Home timeline posts')));
            },
            /**Method used to set up event listeners for app actions.
             * Called during creation of component.
             */
            async setUpListeners(){
                if(isTauri()){
                    var window = Window.getCurrent();
                    //Listen to any attempt to close the app window.
                    const unlisten = await window.onCloseRequested(async (event) => {
                        const confirmed = await confirm('Are you sure?');
                        if (!confirmed) {
                            // user did not confirm closing the window; let's prevent it
                            event.preventDefault();
                        }
                    });
                    // unlisten();//unlistens, removes listener - WILL PREVENT EXECUTION
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
             * Method that ensures that the `saved_feeds` table exists.
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
             * `moongate_settings` store and applies them.
             */
            async loadAppConfig(){
                // //Load application settings
                // await AppSettingsState.loadSettingsFromStore();
                //Tauri - ensure databases exist
                if(isTauri()){
                    await this.userAccountsDatabaseSetup();
                    await this.savedFeedsDatabaseSetup();
                }
                //Load saved Feeds
                await loadSavedFeedsRecords()
                .then(async (res) => {
                    let feedResult = res as SavedFeeds[];
                    if(feedResult && feedResult.length>0){
                        let loadedFeeds:IFeedDBData[]|undefined = stringToJSON(feedResult[0].data);
                        console.log('Loaded Feeds:');
                        console.log(loadedFeeds);
                        //Ensure there is data to load before trying to display Feeds
                        if(loadedFeeds && loadedFeeds.length>0){
                            //Set AppState to "loading feeds" - prevent interaction until
                            //all data has been loaded
                            for (let i = 0; i < loadedFeeds.length; i++) {
                                await AddSavedFeed(loadedFeeds[i]);
                            }
                            if(router.currentRoute.value.path == '/'){
                                LoadAllFeedPostsAsync();
                            }
                            else console.log('blocking loading of feeds in FeedColumn')
                            //Set AppState "loading feeds" to false
                            //Update FeedDescription.latestPostDate value after Posts have been loaded
                            SaveFeedChanges(true).catch(err => {
                                toast.add(HandleAPIError(err, 'Error updating Feed position'));
                            })
                        }
                        else{console.log('No saved Feeds to restore.')}
                    }
                })
                .catch(err => {
                    toast.add({summary:'Error', detail:`${err}`, severity:'error', group:'tr', life:3000})
                });
            },
            /**
             * Method that sets up the listener actions for the `BroadcastChannel` used by the
             * application.
             */
            setupBroadcastChannel(){
                AppState.moongateBroadcastChannel.onmessage = (event) => {
                    //WIP
                    if(isBroadcastObject(event.data)){
                        console.log('This message contains a BroadcastObject object')
                        // if(event.data.target == BroadcastChannelTarget.FeedColumn){
                        //     //Update FeedList in other tabs/windows, but DO NOT save change to disk
                        //     console.log('This message is for updating the FeedColumn state.');
                        //     FeedState.FeedList = event.data.data;
                        // }
                        switch (event.data.target) {
                            case BroadcastChannelTarget.FeedColumn:
                                //Update FeedList in other tabs/windows, but DO NOT save change to disk
                                console.log('This message is for updating the FeedColumn state.');
                                FeedState.FeedList = event.data.data;
                                AppState.hasFeedDataBeenLoadedAfterInitiallization = true;
                                break;
                            case BroadcastChannelTarget.AppSettings:
                                //Update App Settings in other tabs/windows, but DO NOT save change to disk
                                console.log('This message is for updating the "App Settings" state.');
                                AppSettingsState.Settings = event.data.data;
                                //Set current account PFP after app setting sync
                                if(AppSettingsState.Settings.savedAccountState.currentAccount>-1 && AppSettingsState.Settings.savedAccountState.accounts.length>0){
                                    AppState.currentPFP = AppSettingsState.Settings.savedAccountState.accounts[AppSettingsState.Settings.savedAccountState.currentAccount].avatar;
                                }
                                //Sync login state
                                AppState.updateAppStateLoginValues();
                                break;
                            case BroadcastChannelTarget.LoginState:
                                console.log('This message is for updating the "Authorized Login" state.');
                                if(AppSettingsState.Settings.savedAccountState.state == LoginState.Authorized && typeof event.data.data == 'undefined') {console.log('this will be a logout action'); AppState.UpdateAppStateAfterLogout(); } //logout
                                else if(typeof event.data.data != 'undefined') {console.log('this will sync the auth login state'); ResumeAuthSession(event.data.data); RefreshAllFeeds();}
                                else console.log('this will have been syncing guest browsing')
                                break;
                            default:
                                break;
                        }
                    }
                    console.log(event);
                }
            },
            async appStartupProcedure(){
                await this.setUpListeners();
                this.setupBroadcastChannel();
                await this.loadAppConfig();
                if(isTauri()) invoke('show_main_window');//unhide main window and focus it via Rust
            },
            /**
             * Used to handle a "long press" on a {@link FeedButton}. Allows the User to drag
             * and reposition the Feed item.
             * @param e MouseDown/PointerDown `MouseEvent`.
             * @param oldIndex The index of the {@link FeedButton} currently being long pressed.
             */
            handleFeedButtonLongpress(e:Event,oldIndex:number){
                let pressedButton = (e.target as HTMLElement);
                this.longpressTimeout = setTimeout(() => {
                    this.isDraggingButton = true;
                    pressedButton.classList.add('drag-start','dragging');
                    this.oldFeedButtonIndex = oldIndex;
                    this.dragButtonStartingY = pressedButton.offsetTop;
                    document.addEventListener("mousemove", this.dragMoveFeedButton);//allows user to move button
                    document.addEventListener("mousedown", this.dropFeedButton);//when user "drops" button
                }, 800);
            },
            /**
             * Used to cancel a long press. Will still allow the click action
             * to be performed.
             */
            handleFeedButtonMouseup(){
                clearTimeout(this.longpressTimeout);
            },
            /**
             * Used to "drop" the currently selected Feed into its new position in the list.
             */
            dropFeedButton(){
                clearTimeout(this.longpressTimeout);
                let buttonBeingDropped = (document.getElementsByClassName('dragging')[0] as HTMLElement);

                if(buttonBeingDropped.classList.contains('drag-start')){
                    buttonBeingDropped.classList.remove('drag-start');
                    //Smoothly transition element to location - top element unfortunately will not move smoothly
                    buttonBeingDropped.style.transition = "top 0.3s ease";
                    buttonBeingDropped.style.top = "0px";
                    document.removeEventListener("mousemove", this.dragMoveFeedButton);
                    //If position is new
                    if(this.newFeedButtonIndex != this.oldFeedButtonIndex){
                        // remove element from its oldIndex
                        const elRemoved = FeedState.FeedList.splice(this.oldFeedButtonIndex, 1)[0];
                        // insert it at its new index
                        FeedState.FeedList.splice(this.newFeedButtonIndex, 0, elRemoved);
                    }
                    //delay removal of class to prevent click after longpress + let transition finish
                    setTimeout(() => {
                        buttonBeingDropped.style.removeProperty('top');
                        buttonBeingDropped.style.removeProperty('transition');
                        buttonBeingDropped.classList.remove('dragging');
                        this.isDraggingButton = false;
                    }, 300);
                }
                this.oldFeedButtonIndex = -100;
                this.newFeedButtonIndex = -100;
                document.removeEventListener("mousedown", this.dropFeedButton);
            },
            /**
             * Called when the User's pointer enters a `FeedButton`. Used to determine where
             * the dragged Feed will be repositioned to.
             * @param e MouseOver `MouseEvent`.
             * @param newIndex The index of the `FeedButton` that was hovered over.
             */
            handleFeedButtonMouseover(e:Event, newIndex:number){
                if(!this.isDraggingButton) return;
                if (newIndex !== this.oldFeedButtonIndex) {
                    this.newFeedButtonIndex = newIndex;
                }
            },
            /**
             * Called when the User's pointer leaves a `FeedButton`. Used to cancel Feed
             * repositioning.
             */
            handleFeedButtonMouseLeave(){
                this.newFeedButtonIndex = this.oldFeedButtonIndex;
            },
            /**
             * Method used to move the {@link FeedButton} that is being dragged in order
             * to re-order the Feed list.
             * @param e MouseEvent tracking User's pointer movement.
             */
            dragMoveFeedButton(e:MouseEvent){
                let y = e.clientY;
                let currentDraggedButton = document.getElementsByClassName('dragging')[0];
                let scrollPos = currentDraggedButton.parentElement?.parentElement ? currentDraggedButton.parentElement.parentElement.scrollTop : 0;
                // (currentDraggedButton as HTMLElement).style.top = `${y-20}px`;//absolute position version
                (currentDraggedButton as HTMLElement).style.top = `${y-20-this.dragButtonStartingY+scrollPos}px`;
            },
            /**
             * Called when the User's pointer enters a {@link FeedColumn}. Used to determine
             * where the dragged Feed will be repositioned to.
             * @param e `PointerEvent` of one Feed being dragged over another.
             * @param newIndex The index of the `FeedButton` that was hovered over.
             */
            handleFeedColumnMouseover(e:PointerEvent, newIndex:number){
                if(!FeedState.isGrabbingColumn) return;
                if (newIndex !== FeedState.oldFeedColumnIndex) {
                    FeedState.newFeedColumnIndex = newIndex;
                }
                (e.currentTarget as HTMLElement).querySelectorAll("[data-test='feedColumn-highlight']")[0].classList.add('feed-dropzone-highlight');
            },
            /**
             * Called when the User's pointer leaves a `FeedColumn`. Used to cancel Feed
             * repositioning.
             */
            handleFeedColumnMouseLeave(e:PointerEvent){
                FeedState.newFeedColumnIndex = FeedState.oldFeedColumnIndex;
                (e.currentTarget as HTMLElement).querySelectorAll("[data-test='feedColumn-highlight']")[0].classList.remove('feed-dropzone-highlight');
            },
        },
        computed:{
            onMobileTouchscreen(){
                return isOnMobileTouchscreen();
            }
        },
        created(){
            this.appStartupProcedure();
            AppState.isAppOnMobileTouchscreenDevice = isOnMobileTouchscreen();
        },
        mounted(){
            this.getFeedDisplayViewWidth();
            this.placeFeedDisplayCenterLine();
            // AppState.setupWindowResizeListener();
            //Calculate if app is being displayed with "mobile layout"
            AppState.windowWidth = window.innerWidth;
            if(AppState.windowWidth<AppState.mobileLayoutWidth) AppState.usingMobileLayout = true;
            window.addEventListener('resize', AppState.updateWindowResizedWithTimeout);
        },
        beforeUnmount(){
            AppState.removeWindowResizeListener();
        },
        beforeRouteEnter(to, from){
            if(!AppState.hasFeedDataBeenLoadedAfterInitiallization && from.path != '/' && to.path == '/') {LoadAllFeedPostsAsync(); console.log('reoaded feed list because of travelling to root')}

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

/* `FeedButton` drag & drop helper classes */
.draggable{
    transition: scale 0.3s ease, transform 0.3s ease;
}
.dragging{
    /* position: absolute; */
    z-index: 1;
    pointer-events: none;
}
.drag-start {
	background-color: var(--color-btn-hover);
	opacity: 85%; /* faded */
    scale: 120%;
    transform: rotate(10deg);
    cursor: grabbing;
}
.drag-over {
	outline: 2px dashed black;
	background-color: rgba(100, 100, 100, 0.6); /* greyed out */
}
</style>