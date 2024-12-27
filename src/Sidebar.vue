<template>
    <div class="flex flex-row h-screen w-screen">
        {{ void "sidebar" }}
        <div class="flex flex-col h-full z-10 drop-shadow-md-harder bg-slate-400 min-w-16 max-w-16 space-y-2 items-center">
            {{ void "App Logo" }}
            <div class="w-full border-b border-gray-700 p-2 flex-none">
                <!-- <i-mingcute:butterfly-2-line class="size-12"/> -->
                <UserButton tooltip="[user]"/>
            </div>
            <div class="w-full flex flex-col flex-shrink overflow-hidden">
                <!-- <button class="bg-blue-200 h-10 w-full"></button>
                <button class="bg-blue-200 h-10 w-full"></button> -->
                
                {{ void "Feed List + Add btn" }}
                <div class="flex flex-col h-full space-y-2">
                    <div class="flex-shrink preload-gutter overflow-x-hidden">
                        <div class="space-y-2 pl-2 pr-1">
                            <SidebarButtonNormal type="home" tooltip="Home"/>
                            <SidebarButtonNormal v-for="feeds in feedList" :type="feeds.feedType" :tooltip="feeds.feedName" :newPosts="feeds.newPosts"/>
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
                        <SidebarButtonNormal type="add" tooltip="Add Feed"/>
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
            <FeedColumn :post-count="2" :feed-name="'General'" :user-handle="'General'"/>
            <FeedColumn :post-count="3" :feed-name="'Awesome Art'" :user-handle="'Art'"/>
            <FeedColumn :post-count="1" :feed-name="'The Crazy Airplane Man'" :user-handle="'airplanebozo'"/>
            <FeedColumn :post-count="5" :feed-name="'Scottish News'" :user-handle="'News'"/>
        </div>  
    </div>
</template>

<script lang="ts">
    import { defineComponent, ref } from "vue";
    import SidebarButtonNormal from "./components/Navbar/SidebarButtonNormal.vue";
    import UserButton from "./components/Navbar/UserButton.vue";
    import FeedColumn from "./components/Feed/FeedColumn.vue";

    interface FeedButtonData{
        feedName: string
        feedType: string
        newPosts: number
    }

    export default defineComponent({
        data(){
            return{
                feedList: [
                    {feedName:'Friends', feedType:'friends', newPosts: 3},
                    {feedName:'Local News', feedType:'news', newPosts: 5},
                    {feedName:'Artists', feedType:'art', newPosts: 7},
                ]
            }
        },
        mounted() {
        },
        methods: {
            addFeed(){
                return 'Not implemented';
            }
        },
        created(){
        },
        setup () {        
            
            return {}
        }
    })
</script>