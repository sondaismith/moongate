<script setup lang="ts">
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import Sidebar from "./Sidebar.vue";
import DemoSidebar from "./DemoSidebar.vue";

const greetMsg = ref("");
const name = ref("");

async function greet() {
  // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  greetMsg.value = await invoke("greet", { name: name.value });
}
</script>

<template>
  <Sidebar/>
  <!-- <DemoSidebar/> -->
</template>
0
<style scoped>
.logo.vite:hover {
  filter: drop-shadow(0 0 2em #747bff);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #249b73);
}

</style>
<style>
:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  color: #0f0f0f;
  background-color: #f6f6f6;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

.container {
  margin: 0;
  padding-top: 10vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: 0.75s;
}

.logo.tauri:hover {
  filter: drop-shadow(0 0 2em #24c8db);
}

.row {
  display: flex;
  justify-content: center;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}

a:hover {
  color: #535bf2;
}

h1 {
  text-align: center;
}

input,
button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  color: #0f0f0f;
  background-color: #ffffff;
  transition: border-color 0.25s;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
}

button {
  cursor: pointer;
}

button:hover {
  border-color: #396cd8;
}
button:active {
  border-color: #396cd8;
  background-color: #e8e8e8;
}

input,
button {
  outline: none;
}

#greet-input {
  margin-right: 5px;
}

@media (prefers-color-scheme: dark) {
  :root {
    color: #f6f6f6;
    background-color: #2f2f2f;
  }

  a:hover {
    color: #24c8db;
  }

  input,
  button {
    color: #ffffff;
    background-color: #0f0f0f98;
  }
  button:active {
    background-color: #0f0f0f69;
  }
}

/* width */
::-webkit-scrollbar {
  height: 0.25rem;
  width: 0.25rem;
}

/* Track */
::-webkit-scrollbar-track {
  background: #8888883a;
  border-radius: 5px;
}

/* Handle */
::-webkit-scrollbar-thumb {
    background: #ffffff5b;
    border-radius: 5px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #969696;
}


.preload-gutter{
  scrollbar-gutter: stable;
}

.postPlaceholder::before{
  color: #94a3b8;
  content: attr(placeholder);
  pointer-events: none;
  /* display: block; */
}

[data-tooltip]:hover::after {
  display: block;
  position: absolute;
  content: attr(data-tooltip);
  border: 1px solid black;
  background: #101010c0;
  padding: .25em;
  font-size: 0.75rem;
  border-radius: 0.25rem;
}

.feed-highlight{
  border-color: var(--color-feed-highlight) !important;
  /* border-color: #eab308 !important; */
  /* border-color: #0ea5e9 !important; */
}

.feed-dropzone-highlight{
  border-color: greenyellow !important;
  background-color: rgba(112, 128, 144, 0.6) !important;
  /* opacity: 0.7 !important; */
  /* transition: background-color 0.3s ease, opacity 0.3s ease; */
}

.spinner{
  animation: spin 1s linear infinite;
}

@keyframes spin {
 0%{
    transform: rotate(0deg);
   }
100%{
    transform: rotate(360deg);
   }
}
</style>