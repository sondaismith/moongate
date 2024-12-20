<script setup lang="ts">
import { ref } from "vue";
import SidebarButtonNormal from "./SidebarButtonNormal.vue";
</script>

<template>
    <div class="flex flex-row h-screen w-screen">
        {{ void "sidebar" }}
        <div class="flex flex-col bg-slate-400 w-16 p-2 space-y-1 justify-between">
            <div>
                <button class="bg-blue-200 h-10 w-full"></button>
                <button class="bg-blue-200 h-10 w-full"></button>
                <SidebarButtonNormal type="home" tooltip="test"/>
            </div>
            <div><button class="bg-blue-200 h-10 w-full"></button></div>
        </div> 
        {{ void "main content" }} 
        <div class="bg-slate-700 flex-auto" ></div>  
    </div>
</template>