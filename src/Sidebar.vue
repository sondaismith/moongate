<template>
    <div class="flex flex-row h-screen w-screen">
        {{ void "sidebar" }}
        <div class="flex flex-col h-full z-10 drop-shadow-md-harder bg-slate-400 min-w-16 max-w-16 items-center">
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
                            <SidebarButtonNormal type="home" tooltip="Home"/>
                            <SidebarButtonNormal v-for="feeds in feedListing.feedList" :type="feeds.feedType" :tooltip="feeds.feedName" :newPosts="feeds.newPosts"/>
                            <!-- <SidebarButtonNormal type="art" tooltip="Good Art"/>
                            <SidebarButtonNormal type="art" tooltip="Good Art"/>
                            <SidebarButtonNormal type="art" tooltip="Good Art"/>
                            <SidebarButtonNormal type="art" tooltip="Good Art"/>
                            <SidebarButtonNormal type="art" tooltip="Good Art"/>
                            <SidebarButtonNormal type="art" tooltip="Good Art"/>
                            <SidebarButtonNormal type="art" tooltip="Good Art"/>
                            <SidebarButtonNormal type="art" tooltip="Good Art"/>
                            <SidebarButtonNormal type="art" tooltip="Good Art"/> -->
                        </div>
                    </div>
                    <div class="border-t border-gray-700 px-2 py-2 flex-none">
                        <SidebarButtonNormal type="add" tooltip="Add Feed" @click="addFeed"/>
                    </div>
                </div>
            </div>
            {{ void "Navbar Footer" }}
            <div class="w-full flex-none !mt-auto">
                <div class="p-2 space-y-2">
                <!-- <button class="bg-blue-200 h-10 w-full"></button> -->
                    <SidebarButtonNormal type="settings" tooltip="App Settings"/>
                    <UserButton tooltip="[user]"/>
                </div>
            </div>
        </div> 
        {{ void "main content" }} 
        <div class="bg-slate-700 flex flex-1 overflow-x-scroll" >
            <!-- <FeedColumn :post-count="2" :feed-name="'Home'" :user-handle="'home'"/>
            <FeedColumn :post-count="3" :feed-name="'Awesome Art'" :user-handle="'art'"/>
            <FeedColumn :post-count="1" :feed-name="'The Crazy Airplane Man'" :user-handle="'airplanebozo'"/>
            <FeedColumn :post-count="5" :feed-name="'Scottish News'" :user-handle="'News'"/> -->
            <FeedColumn v-for="feeds in feedListing.feedList" :post-count="feeds.totalPosts" :feed-name="feeds.feedName" :user-handle="feeds.feedHandle"/>
        </div>  
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import SidebarButtonNormal from "./components/Navbar/SidebarButtonNormal.vue";
import UserButton from "./components/Navbar/UserButton.vue";
import FeedColumn from "./components/Feed/FeedColumn.vue";
import { feedListing } from "./state/FeedList.vue";
import { FeedEnums } from "./enums/FeedEnums";

    export default defineComponent({
        data(){
            return{
                // feedList: [
                //     {feedName:'Friends', feedType:'friends', newPosts: 3},
                //     {feedName:'Local News', feedType:'news', newPosts: 5},
                //     {feedName:'Artists', feedType:'art', newPosts: 7},
                // ]
                feedListing
            }
        },
        mounted() {
        },
        methods: {
            addFeed(){
                // const feedTypes = ['art','friends','news'];
                // this.feedList.push({feedName: 'AddedByBtn', feedType: feedTypes[Math.floor(Math.random()*feedTypes.length)], newPosts: Math.floor(Math.random()*15)})
                // let newestFeed = this.feedList[this.feedList.length-1];
                // console.log(`Created new feed: [${newestFeed.feedName}, ${newestFeed.feedType}, ${newestFeed.newPosts}]`);
                
                const feedTypes = [FeedEnums.Types.Art,FeedEnums.Types.Friends,FeedEnums.Types.News];
                feedListing.feedList.push({feedName: 'AddedByBtn', feedHandle:'test', feedType: feedTypes[Math.floor(Math.random()*feedTypes.length)], newPosts: Math.floor(Math.random()*15), totalPosts: Math.floor(Math.random()*6)})
                let newestFeed = feedListing.feedList[feedListing.feedList.length-1];
                console.log(`Created new feed: [${newestFeed.feedName}, ${newestFeed.feedType}, ${newestFeed.newPosts}]`);
            }
        },
        created(){
        },
        setup () {        
            
            return {}
        }
    })
</script>