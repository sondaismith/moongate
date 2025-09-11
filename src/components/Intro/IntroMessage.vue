<template>
    <div class="p-2 text-primary min-w-[18rem] sm:w-[30rem] h-full overflow-y-scroll bg-green-600s">
        <div class="flex flex-col rounded p-1 border-2 border-outline text-sm h-fulls overflow-y-scrolls">
            <div class="flex gap-x-1 mb-1 text-xs self-end items-center text-messageDismiss
            hover:text-hover transition-colors cursor-pointer"
            @click="hideIntroMessage">
                <div>Dismiss message</div>
                <i-mingcute:close-fill/>
            </div>
            <div class="h-[1px] w-full bg-secondary"></div>
            <div class="flex flex-col gap-y-2">
                <div class="text-2xl mt-2">Getting Started</div>
                <div class="flex flex-wrap gap-x-1">
                    <div>To add a new Feed to the viewport, click the</div>
                    <div class="flex rounded px-1 border-secondary items-center
                    gap-1 border whitespace-nowrap text-sm select-none">
                        <i-mdi:playlist-add/>
                        <div>Add Feed</div>
                    </div>
                    <div>button in the sidebar to the left. You will be asked to login - you
                        can choose to login using your Bluesky credentials, or to browse
                        as a Guest.
                    </div>
                </div>
                <div class="italic text-xs">
                    Note that you cannot access most of Bluesky's interactive features
                    (Creating Posts/Replies, Likes, etc.) as a Guest.
                </div>
                <div>
                    You can log out of your account by right-click/long-pressing the
                    circle button at the bottom of the sidebar.
                </div>
                <div class="text-2xl">Modifying Feeds</div>
                <div class="flex flex-wrap gap-x-1 items-center">
                    <div>
                        You can edit or remove a Feed by
                        right-clicking/long-pressing the created
                    </div>
                    <div class="flex h-9 w-11 text-xl rounded-xl bg-feedBtn border border-outline transition-[border]
                    hover:border-secondary items-center justify-center">
                        <i-mdi:paint-outline/>
                    </div>
                    <div class="inline">button on the left.</div>
                </div>
                <div class="text-2xl">Extras</div>
                <div class="flex flex-wrap gap-x-1 items-center">
                    <div>The Application Settings menu can be accessed by clicking the</div>
                    <div class="flex h-9 w-11 text-xl rounded-xl bg-feedBtn border border-outline transition-[border]
                    hover:border-secondary items-center justify-center">
                        <i-mingcute:settings-2-line/>
                    </div>
                    <div class="inline">button 2nd from the bottom of the sidebar.</div>
                </div>
                <div>
                    If you wish to see these instructions again, you can display them
                    from the Settings Menu.
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { AppSettingsState } from '../../state/AppSettingsState.vue';

export default defineComponent({
    name:"IntroMessage",
    data(){
        return{
            AppSettingsState,
        }
    },
    methods:{
        hideIntroMessage(){
            AppSettingsState.Settings.isShowingIntroMessage = false;
            AppSettingsState.saveSettingsToStore();
        }
    }
})
</script>

<style scoped>
</style>