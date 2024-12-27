<script setup lang="ts">
import { ref } from "vue";
import SidebarButtonNormal from "./components/Navbar/SidebarButtonNormal.vue";
import UserButton from "./components/Navbar/UserButton.vue";
import FeedColumn from "./components/Feed/FeedColumn.vue";
</script>

<template>
    <div class="flex flex-row h-screen w-screen">
        {{ void "sidebar" }}
        <div class="flex flex-col z-10 drop-shadow-md-harder bg-slate-400 min-w-16 p-2 space-y-1 items-center justify-between">
            <div class="space-y-1 w-full">
                <button class="bg-blue-200 h-10 w-full"></button>
                <button class="bg-blue-200 h-10 w-full"></button>
                <SidebarButtonNormal type="home" tooltip="Home"/>
            </div>
            <div class="w-full">
                <!-- <button class="bg-blue-200 h-10 w-full"></button> -->
                <UserButton tooltip="[user]"/>
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