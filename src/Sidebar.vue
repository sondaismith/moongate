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
        <div class="absolute right-0 mr-2 mt-2 bg-purple-600 p-2 rounded drop-shadow-md">
            <div class="space-y-2">
                <div @click="addDBRecord" class="cursor-pointer bg-blue-600 hover:bg-blue-500 rounded p-2 drop-shadow">Add dummy record</div>
                <div @click="refreshDBDisplay" class="cursor-pointer bg-blue-600 hover:bg-blue-500 rounded p-2 drop-shadow">Load Records</div>
                <div @click="createTestTable" class="cursor-pointer bg-blue-600 hover:bg-blue-500 rounded p-2 drop-shadow">Create Table (sqlite backend)</div>
                <div class="flex justify-between">
                    <div @click="createAppSettingsTable" class="cursor-pointer bg-green-600
                    hover:bg-green-500 rounded p-2 drop-shadow">Create app_setting table</div>
                    <div @click="initializeAppSettings" class="cursor-pointer bg-orange-600
                    hover:bg-orange-500 rounded p-2 drop-shadow">(Re)Intitalize app_setting</div>
                </div>
                <div @click="getAppWindowPosition" class="cursor-pointer bg-yellow-600 hover:bg-yellow-500 rounded p-2 drop-shadow">Update Saved Window Size</div>
            </div>
            <div>
                <div class="flex justify-between px-2">
                    <div class="w-10">Id</div>
                    <div class="w-20">Monitor Width</div>
                    <div class="w-60">Monitor Height</div>
                    <div class="w-20">[Delete]</div>
                </div>
                <div v-for="(data, index) in DBResponse" class="flex bg-blue-900 px-2 items-center">
                    <div class="w-10">{{ data.id }}</div>
                    <div class="w-20 overflow-hidden text-ellipsis">{{ data.lastWindowWidth}}</div>
                    <div class="w-60">{{ data.lastWindowHeight }}</div>
                    <div class="w-20">
                        <div @click="deleteDBRecord(data.id)" class="bg-red-500 rounded text-center m-1 mr-0 select-none
                        cursor-pointer hover:bg-red-400">X</div>
                    </div>
                </div>
                <div v-if="DBResponse.length == undefined" class="flex bg-blue-900 px-2 justify-center">
                    <div>No Records to Display</div>
                </div>
            </div>
        </div>
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
import { DebugFlags } from "./state/Debug.vue";
import { OptionIconList } from "./fake-data/dumPostData";
//Remove ASAP
import {agent} from "./lib/api.ts"
import { AppBskyFeedDefs } from "@atproto/api/dist/client";
import { IPostDetails } from "./interfaces/PostInterfaces";
import { getBlueskyPostThread } from "./lib/api/Post";
import {createTestTable, addTestRecord, loadRecords,
    deleteRecord, clearAppSettings, createAppSettingTable,
    initializeAppSettingsTable, updateAppSettings } from "./lib/db/local_db";
import { invoke } from "@tauri-apps/api/core";
import { currentMonitor, getCurrentWindow } from "@tauri-apps/api/window";
import { AppSettings } from "./lib/db/local_db";

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
            /**DEBUG - (Re)Initialize app_settings table */
            async initializeAppSettings(){
                console.log('(Re)Initializing app_settings table');
                clearAppSettings();
                initializeAppSettingsTable();
            },
            /**DEBUG - Add dummy record to database */
            async addDBRecord(){
                console.log('Adding dummy record to db');
                console.log(await addTestRecord());
                this.refreshDBDisplay();
            },
            /**DEBUG - Add dummy record to database */
            async deleteDBRecord(recordId:number){
                console.log('Removing dummy record ['+recordId+'] from db');
                console.log(await deleteRecord(recordId));
                this.refreshDBDisplay();
            },
            /**DEBUG - Pull latest data from DB so it can be displayed */
            async refreshDBDisplay(){
                console.log('Pulling latest records from db');
                // const dummmyRecords = [
                //     {id:1, name:'Sarks', dateAdded:'02/01/2003'},
                //     {id:2, name:'Jameson', dateAdded:'02/01/2003'},
                //     {id:3, name:'Tommy', dateAdded:'02/01/2003'},
                // ]
                // this.DBResponse = dummmyRecords;
                const result = await loadRecords();
                if(result) this.DBResponse = result;
                console.log(result);
            },
            /**DEBUG - Creates the debug test table*/
            async createTestTable(){
                console.log(createTestTable());
            },
            /**DEBUG - Creates the app_settings table */
            async createAppSettingsTable(){
                // console.log(createTestTable());
                console.log(createAppSettingTable());
            },
            async getAppWindowPosition(){
                // invoke('get_app_window_size').then((message) => console.log(message));
                var windowSize = (await getCurrentWindow().innerSize()).toJSON();
                var monitor = (await currentMonitor())?.position;
                console.log("Window Size: "+windowSize.width+"x"+windowSize.height
                    +", Monitor X Start Pos: "+monitor?.x);
                await updateAppSettings({lastWindowWidth:windowSize.width,
                    lastWindowHeight:windowSize.height} as AppSettings)
                this.refreshDBDisplay();
            }
        },
        created(){
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