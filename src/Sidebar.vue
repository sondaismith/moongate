<template>
    <div data-test="app-viewport" id="app-viewport" class="flex flex-row h-screen w-screen">
        {{ void "sidebar" }}
        <div class="flex flex-col h-full z-10 drop-shadow-md-harder bg-slate-400 min-w-16 items-center">
            {{ void "App Logo" }}
            <div class="w-full border-b border-gray-700 p-2 flex-none">
                <UserButton tooltip="[logo here]"/>
            </div>
            <div class="w-full flex flex-col flex-shrink overflow-hidden">
                {{ void "Feed List + Add btn" }}
                <div class="flex flex-col h-full">
                    <div class="flex-shrink preload-gutter overflow-x-hidden">
                        <div class="space-y-2 py-2 pl-2 pr-1">
                            <FeedButton type="home" tooltip="Home"/>
                            <FeedButton v-for="feeds in feedListing.feedList" :feedId="feeds.feedId" :type="feeds.feedType" :tooltip="feeds.feedName" :newPosts="feeds.newPosts"/>
                        </div>
                    </div>
                    <div class="border-t border-gray-700 px-2 py-2 flex-none">
                        <FeedButton type="add" tooltip="Add Feed" @click="addFeed"/>
                    </div>
                </div>
            </div>
            {{ void "Navbar Footer" }}
            <div class="w-full flex-none !mt-auto">
                <div class="p-2 space-y-2">
                <!-- <button class="bg-blue-200 h-10 w-full"></button> -->
                    <FeedButton type="settings" tooltip="App Settings"/>
                    <UserButton tooltip="[user]"/>
                </div>
            </div>
            <Tooltip id="navbar-tooltip" tooltip=""/>
        </div>
        {{ void "main content" }}
        <div data-test="feed-viewport" :onscroll="showScrollXPos" id="feedcolumnDisplay" class="bg-slate-700 flex overflow-y-hidden" >
            <div class="flex">
                <FeedColumn v-for="feed in feedListing.feedList" :feedData="feed" :feedId="feed.feedId" :post-count="feed.totalPosts" :feed-name="feed.feedName" :user-handle="feed.feedHandle"/>
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
            class="absolute z-10 p-4 space-y-1 w-72">
            <div @click="getBSkyAPIData" class="cursor-pointer bg-blue-600 hover:bg-blue-500 rounded p-2">Get Posts</div>
            <div class="p-4 bg-slate-950/90">
                Posts here:
                <div v-for="(data, index) in APIResponse.data?.feeds">
                    {{ index }} - {{ data.displayName }}
                </div>
            </div>
            <FeedPost/>
        </div>
        <LoginModal/>
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
        <!-- <Toast position="top-right" group="tr"
            :pt="{
                root:'',
                message:'rounded border border-blue-500',
                messageContent: 'flex bg-blue-700 p-2 space-x-2',
                summary: 'font-bold',
                detail: 'text-xs',
                transition:{
                    enterToClass: 'slide-fade'
                }
            }">
        </Toast> -->
        <DbDebugModal v-if="DebugFlags.showAppSettingsDBDebugModal"/>
        <PostOptionsMenu v-show="postDetails.isPostOptionsMenuVisible" :menuItems="OptionIconList"/>
        <PostDetailModal/>
        <PostFocusModal/>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { userFeedList, GenerateUniqueId } from "./state/FeedList.vue";
import { FeedEnums } from "./enums/FeedEnums";
import * as PostEnums from "./enums/PostEnums";
import { postDetails } from "./state/PostDetails.vue";
import { AppState } from "./state/AppState.vue";
import { DebugFlags } from "./state/Debug.vue";
import { OptionIconList } from "./fake-data/dumPostData";
//Remove ASAP
import {agent} from "./lib/api.ts"
import { IPostDetails } from "./interfaces/PostInterfaces";
import { getBlueskyPostThread } from "./lib/api/Post";
import {AppSettings, loadRecords, createAppSettingTable,
    initializeAppSettingsTable, updateAppSettings, checkIfAppSettingsTableExists,
    checkIfAppSettingsDatabaseExists, validateWindowPosition,
checkIfUserAccountsTableExists,
createUserAccountsTable} from "./lib/db/local_db";
import { invoke } from "@tauri-apps/api/core";
import { currentMonitor, getCurrentWindow, PhysicalPosition, PhysicalSize, Window } from "@tauri-apps/api/window";


    export default defineComponent({
        name:'Sidebar',
        data(){
            return{
                // feedList: [
                //     {feedName:'Friends', feedType:'friends', newPosts: 3},
                //     {feedName:'Local News', feedType:'news', newPosts: 5},
                //     {feedName:'Artists', feedType:'art', newPosts: 7},
                // ]
                feedListing: userFeedList,
                postDetails,
                AppState,
                DebugFlags,
                iconTypes:PostEnums.IconTypes,
                scrollXPos : 0,
                fdViewWidth : 0,
                OptionIconList,
                APIResponse: {},
                DBResponse: {},
            }
        },
        methods: {
            addFeed(){
                const feedTypes = [FeedEnums.Types.Art,FeedEnums.Types.Friends,FeedEnums.Types.News];
                userFeedList.feedList.push({feedId:GenerateUniqueId(10), feedName: 'AddedByBtn', feedHandle:'test', feedType: feedTypes[Math.floor(Math.random()*feedTypes.length)], newPosts: Math.floor(Math.random()*15), totalPosts: Math.floor(Math.random()*6)})
                let newestFeed = userFeedList.feedList[userFeedList.feedList.length-1];
                console.log(`Created new feed: [${newestFeed.feedName}, ${newestFeed.feedType}, ${newestFeed.newPosts}]`);
                this.showScrollXPos();
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
                const feedResults = await agent.app.bsky.unspecced.getPopularFeedGenerators({limit:15})
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
                var henkenDID = (await agent.app.bsky.actor.getProfile({actor:"henkensecond.bsky.social"})).data.did;
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
             * Method that loads the application settings saved in the
             * `app_settings` database and applies them.
             */
            async loadAppSettings(){
                var loadedWindowPosition = new PhysicalPosition(0,0);
                var loadedWindowSize = new PhysicalSize(800,600);
                var appSettings = await loadRecords() as AppSettings[];
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
            },
            async appStartupProcedure(){
                await this.appSettingsDatabaseSetup();
                await this.userAccountsDatabaseSetup();
                await this.setUpListeners();
                this.loadAppSettings();
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