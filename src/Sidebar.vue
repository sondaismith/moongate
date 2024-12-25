<script setup lang="ts">
import { ref } from "vue";
import SidebarButtonNormal from "./components/Navbar/SidebarButtonNormal.vue";
import UserButton from "./components/Navbar/UserButton.vue";
import FeedColumn from "./components/Feed/FeedColumn.vue";
</script>

<template>
    <div class="flex flex-row h-screen w-screen">
        {{ void "sidebar" }}
        <div class="flex flex-col bg-slate-400 w-16 p-2 space-y-1 items-center justify-between">
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
        <div class="bg-slate-700 flex-auto flex" >
            <FeedColumn />
            <!-- <FeedColumn /> -->
        </div>  
    </div>
</template>