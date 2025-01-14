<template>
    <div id="app-viewport" class="flex flex-row h-screen w-screen">
        {{ void "sidebar" }}
        <div class="flex flex-col h-full z-10 drop-shadow-md-harder bg-slate-400 min-w-16 items-center">
            {{ void "App Logo" }}
            <div class="w-full border-b border-gray-700 p-2 flex-none">
                <!-- <i-mingcute:butterfly-2-line class="size-12"/> -->
                <UserButton tooltip="[logo here]"/>
            </div>
            <div class="w-full flex flex-col flex-shrink overflow-hidden">
                <!-- <button class="bg-blue-200 h-10 w-full"></button>
                <button class="bg-blue-200 h-10 w-full"></button> -->

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
        <div :onscroll="showScrollXPos" id="feedcolumnDisplay" class="bg-slate-700 flex flex-1 overflow-x-scroll" >
            <!-- <FeedColumn :post-count="2" :feed-name="'Home'" :user-handle="'home'"/>
            <FeedColumn :post-count="3" :feed-name="'Awesome Art'" :user-handle="'art'"/>
            <FeedColumn :post-count="1" :feed-name="'The Crazy Airplane Man'" :user-handle="'airplanebozo'"/>
            <FeedColumn :post-count="5" :feed-name="'Scottish News'" :user-handle="'News'"/> -->
            <FeedColumn v-for="feed in feedListing.feedList" :feedData="feed" :feedId="feed.feedId" :post-count="feed.totalPosts" :feed-name="feed.feedName" :user-handle="feed.feedHandle"/>
            <div v-if="DebugFlags.showFeedScrollStats" id="debug-feedViewportStats" class="absolute bottom-3 p-2 bg-blue-800/90">
                <div>X Pos: {{ scrollXPos }}</div>
                <div>Viewport Width: {{ fdViewWidth }}</div>
            </div>
            {{ void "debug: main viewport center marker" }}
            <div v-if="DebugFlags.showFeedViewportCenter" id="debug-feedViewportCenterLine" class="absolute h-full w-0.5 bg-red-700/60"></div>
        </div>
        {{ void "Post Details Modal" }}
        <!-- <PostDetailModal v-show="postDetails.isVisible"/> -->
        <PostDetailModal/>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { userFeedList, GenerateUniqueId } from "./state/FeedList.vue";
import { FeedEnums } from "./enums/FeedEnums";
import { PostEnums } from "./enums/PostEnums";
import { postDetails } from "./state/PostDetails.vue";
import { DebugFlags } from "./state/Debug.vue";

    export default defineComponent({
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
                fdViewWidth : 0
            }
        },
        methods: {
            addFeed(){
                // const feedTypes = ['art','friends','news'];
                // this.feedList.push({feedName: 'AddedByBtn', feedType: feedTypes[Math.floor(Math.random()*feedTypes.length)], newPosts: Math.floor(Math.random()*15)})
                // let newestFeed = this.feedList[this.feedList.length-1];
                // console.log(`Created new feed: [${newestFeed.feedName}, ${newestFeed.feedType}, ${newestFeed.newPosts}]`);

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
                this.fdViewWidth = el.offsetWidth;
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
                else{console.log('There was an error positioning the `FeedColumn` display center line.')}
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