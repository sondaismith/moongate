<template>
    {{ void "app_settings DB Debug Modal" }}
    <div class="absolute right-0 mr-2 mt-2 bg-purple-600 p-2 rounded drop-shadow-md">
            <div class="space-y-2">
                <div @click="refreshDBDisplay" class="cursor-pointer bg-blue-600 hover:bg-blue-500 rounded p-2 drop-shadow">Load Records</div>
                <div class="flex justify-between">
                    <div @click="createAppSettingsTable" class="cursor-pointer bg-green-600
                    hover:bg-green-500 rounded p-2 drop-shadow">Create app_setting table</div>
                    <div @click="debugInitializeAppSettings" class="cursor-pointer bg-orange-600
                    hover:bg-orange-500 rounded p-2 drop-shadow">(Re)Intitalize app_setting db+table</div>
                </div>
                <div @click="updateAppWindowPosition" class="cursor-pointer bg-yellow-600 hover:bg-yellow-500 rounded p-2 drop-shadow">Update Saved Window Pos+Size</div>
            </div>
            <div>
                <div class="flex justify-between px-2">
                    <div class="w-10">Id</div>
                    <div class="w-20">Monitor Width</div>
                    <div class="w-20">Monitor Height</div>
                    <div class="w-20">Window XPos</div>
                    <div class="w-20">Window YPOS</div>
                    <div class="w-20">[Delete]</div>
                </div>
                <div v-for="(data, index) in DBResponse" class="flex bg-blue-900 px-2 items-center">
                    <div class="w-10">{{ data.id }}</div>
                    <div class="w-20 overflow-hidden text-ellipsis">{{ data.lastWindowWidth}}</div>
                    <div class="w-20">{{ data.lastWindowHeight }}</div>
                    <div class="w-20">{{ data.lastWindowPosX }}</div>
                    <div class="w-20">{{ data.lastWindowPosY }}</div>
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
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {AppSettings, loadAppSettingsRecords, deleteAppSettingsDBFile,
    createAppSettingTable, initializeAppSettingsTable, updateAppSettings,
    checkIfAppSettingsTableExists, checkIfAppSettingsDatabaseExists,} from "../../lib/db/local_db";
import { currentMonitor, getCurrentWindow } from '@tauri-apps/api/window';

export default defineComponent({
    setup () {
        return {}
    },
    data() {
        return{
            DBResponse: {},
        }
    },
    methods:{
        /**DEBUG - (Re)Initialize app_settings table */
        async debugInitializeAppSettings(){
            console.log('(Re)Initializing app_settings db + table');
            await deleteAppSettingsDBFile();
            this.appSettingsDatabaseSetup();
        },
        /**DEBUG - Pull latest data from DB so it can be displayed */
        async refreshDBDisplay(){
            console.log('Pulling latest records from db');
            const result = await loadAppSettingsRecords();
            if(result) this.DBResponse = result;
            console.log(result);
        },
        /**DEBUG - Creates the app_settings table */
        async createAppSettingsTable(){
            console.log(createAppSettingTable());
        },
        async updateAppWindowPosition(){
            var windowSize = (await getCurrentWindow().innerSize()).toJSON();
            var windowPos = (await getCurrentWindow().outerPosition()).toJSON();
            var monitor = (await currentMonitor())?.name;
            await updateAppSettings({lastWindowWidth:windowSize.width,
                lastWindowHeight:windowSize.height,
                lastWindowPosX:windowPos.x,lastWindowPosY:windowPos.y,
                lastMonitor:monitor} as AppSettings)
            this.refreshDBDisplay();
        },
        /**
         * Method that ensures that the `app_settings` database and tables
         * are set up. Called during creation of component.
         */
        async appSettingsDatabaseSetup(){
            //technically trying to load the DB will create it, so...
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
    }
})
</script>

<style scoped>
</style>