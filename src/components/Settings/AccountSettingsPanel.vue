<template>
    <div class="flex flex-col gap-2">
        <div class="flex gap-2 items-center h-10 border-b border-outline pb-2 text-lg">
            <button v-if="!noSubMenusSelected || breadcrumbs.length>0" @click="backToMainMenu"
            class="h-full p-1 shadow-none bg-btn">
                <i-mingcute:arrow-left-line/>
            </button>
            <div>{{ currentMenuLabel }}</div>
        </div>
        <!-- <div v-if="noSubMenusSelected" class="flex flex-col gap-1">
            <RadioBarButton v-for="(o,index) in MainMenu" :hide-radio-button="true"
            @click="selectMainMenuItem(index)">
                <component :is="o.icon"></component>
                <div class="place-self-center">{{ o.label }}</div>
                <i-mdi:chevron-right class="text-3xl shrink-0 ml-auto"/>
            </RadioBarButton>
        </div> -->
        <div class="flex flex-col gap-1">
            <RadioBarButton v-for="(o,index) in getMenuViaBreadcrumbs" :hide-radio-button="true"
            @click="o.action(breadcrumbs)">
                <component :is="o.icon"></component>
                <div class="place-self-center">{{ o.label }}</div>
                <i-mdi:chevron-right class="text-3xl shrink-0 ml-auto"/>
            </RadioBarButton>
        </div>
        <div v-if="breadcrumbs.toString() == '0,0'">
            <div>Filter bar here</div>
            <div>
                <div class="flex gap-2 p-3 text-left border border-outline hover:border-modernToggleBtnBorderHover rounded select-none">
                    <div class="flex flex-col gap-2 w-full overflow-hidden">
                        <div class="flex gap-1 items-center">
                            <div class="flex bg-blueskyBlue aspect-square rounded-full shrink-0 w-8 items-center justify-center">
                                <img v-if="feedGeneratorView?.avatar" :src="feedGeneratorView?.avatar"/>
                                <i-mingcute:radar-2-fill v-else class="text-white h-6 w-6"/>
                            </div>
                            <div class="flex flex-col overflow-hidden">
                                <div class="text-base leading-4 text-nowrap overflow-hidden text-ellipsis">{{ feedGeneratorView ? feedGeneratorView.displayName : 'PROP MISSING' }}</div>
                                <div class="text-xs text-secondary text-nowrap overflow-hidden text-ellipsis">Feed by @{{ feedGeneratorView ? feedGeneratorView.creator.handle : 'PROP MISSING' }}</div>
                            </div>
                            <button @click="clickedFeedGenerator" :title="'Remove &quot;'+feedGeneratorView?.displayName+'&quot; Feed'"
                            class="self-center ml-auto mr-0.5 rounded p-1 border bg-deleteBtnBG active:bg-deleteBtnBGActive text-xs text-white hover:border-primary shadow-none">Remove</button>
                        </div>
                        <div class="text-sm">{{ feedGeneratorView ? feedGeneratorView.description : 'Please supply the `:feed-generator-view` prop' }}</div>
                    </div>
                </div>
            </div>
        </div>
        <!-- <div>{{ MainMenu }}</div> -->
        <div>{{currentMenuData}}</div>
        <!-- <div>{{currentMenu}}</div> -->
        <!-- <div>{{ MainMenu }}</div> -->
        <div>breadcrumbs: {{ breadcrumbs }}</div>
    </div>
</template>

<script lang="ts">
//Icons
import MdiHandFrontRight from '~icons/mdi/hand-front-right';
import MingcuteVolumeMuteFill from '~icons/mingcute/volume-mute-fill';
import MdiPersonBlock from '~icons/mdi/person-block';

import { defineComponent } from 'vue'
import { IAccountSettingsMenuItem } from '../../interfaces/SettingsInterfaces'

export default defineComponent({
    data(){
        return{
            MainMenu:[
                {
                    label:'Moderation',
                    icon: MdiHandFrontRight,
                    selected:false,
                    submenu:[
                        {
                            label:'View Muted Accounts',
                            icon: MingcuteVolumeMuteFill,
                            selected:false,
                            action:(bc:number[])=>{bc.push(0);}
                        },
                        {
                            label:'View Blocked Accounts',
                            icon:MdiPersonBlock,
                            selected:false,
                            action:(bc:number[])=>{bc.push(1)}
                        },
                    ],
                    action:(bc:number[])=>{bc.push(0)}
                },
                {
                    label:'Privacy and Security',
                    selected:false,
                    submenu:[
                        {
                            label:'A test option under privacy',
                            icon: MingcuteVolumeMuteFill,
                            selected:false,
                            submenu:[{
                                label:'further sub option',
                                selected:false,
                                action:(bc:number[])=>{bc.push(0)}
                            }],
                            action:(bc:number[])=>{bc.push(0)}
                        },
                        {
                            label:'2nd test option under privacy',
                            icon: MingcuteVolumeMuteFill,
                            selected:false,
                            submenu:[{
                                label:'another option',
                                selected:false,
                                action:(bc:number[])=>{bc.push(0)}
                            }],
                            action:(bc:number[])=>{bc.push(1)}
                        },
                    ],
                    action:(bc:number[])=>{bc.push(1)}
                },
                {
                    label:'Accessibility',
                    icon:undefined,
                    selected:false,
                    submenu:undefined,
                    action:(bc:number[])=>{bc.push(2)}
                }
            ] as IAccountSettingsMenuItem[],
            // Moderation:[
            //     {
            //         label:'View Muted Accounts',
            //         icon: MingcuteVolumeMuteFill,
            //         selected:false,
            //         submenu:[{
            //             label:'Muted Accounts',
            //             selected:false
            //         }],
            //         action:(text:string)=>{alert(text)}
            //     },
            //     {
            //         label:'View Blocked Accounts',
            //         icon:MdiPersonBlock,
            //         selected:false
            //     },
            // ] as IAccountSettingsMenuItem[],
            mutedUserList:[],
            breadcrumbs:[] as number[],
            isViewingMutedAccounts:false,
        }
    },
    methods:{
        selectMainMenuItem(i:number){
            //deselect other options
            for (let i = 0; i < this.MainMenu.length; i++){
                this.MainMenu[i].selected = false;
            }
            this.MainMenu[i].selected = !this.MainMenu[i].selected;
        },
        backToMainMenu(){
            this.breadcrumbs.pop();
            // for (let i = 0; i < this.MainMenu.length; i++){
            //     this.MainMenu[i].selected = false;
            // }
            // let choices = this.currentMenuData;
            // let menuToClear = [] as IAccountSettingsMenuItem[];
            // if(choices.length>0){
            //     if(choices.length<2){

            //     }
            //     else{
            //         //for each decision made
            //         for (let i = 0; i < choices.length; i++) {
            //             let subMenu = this.MainMenu[choices[i]].submenu;
            //             if(typeof subMenu != 'undefined'){
            //                 menuToClear = subMenu;
            //                 i = choices.length;
            //             }
            //         }
            //         for (let i = 0; i < menuToClear.length; i++) {
            //             menuToClear[i].selected = false;
            //         }
            //     }
            // }

            // for (let i = 0; i < this.Moderation.length; i++){
            //     this.Moderation[i].selected = false;
            // }
        },
        selectModerationItem(i:number){
            //deselect other options
            for (let i = 0; i < this.MainMenu[0].submenu.length; i++){
                this.MainMenu[0].submenu[i].selected = false;
            }
            this.MainMenu[0].submenu[i].selected = !this.MainMenu[0].submenu[i].selected;
        },
        // selectModerationItem(i:number){
        //     //deselect other options
        //     for (let i = 0; i < this.Moderation.length; i++){
        //         this.Moderation[i].selected = false;
        //     }
        //     this.Moderation[i].selected = !this.Moderation[i].selected;
        // },
        getSelectedMenuItemAndDepth(menu:IAccountSettingsMenuItem[],depth:number=0,selection:number[]=[]){//:{depth:number;selection:number}{
            // let result = {depth:depth,selection:selection};
            // for (let i = 0; i < menu.length; i++) {
            //     if(menu[i].selected){
            //         let submenu = menu[i].submenu;
            //         if(typeof submenu != 'undefined' && submenu.length>0){
            //             result = this.getSelectedMenuItemAndDepth(submenu,depth+1,i);
            //         }
            //         else{
            //             result = {...result,selection:i}
            //         }
            //         i = menu.length;
            //     }
            // }
            let result:number[] = selection;
            for (let i = 0; i < menu.length; i++) {
                if(menu[i].selected){
                    selection.push(i);
                    let submenu = menu[i].submenu;
                    if(typeof submenu != 'undefined' && submenu.length>0){
                        result = this.getSelectedMenuItemAndDepth(submenu,depth+1,selection);
                    }
                    else{
                        result = selection;
                    }
                    i = menu.length;
                }
            }
            return result;
        }
    },
    computed:{
        noSubMenusSelected(){
            let result = true;
            for (let i = 0; i < this.MainMenu.length; i++){
                if(this.MainMenu[i].selected){
                    result = false;
                    i = this.MainMenu.length;
                }
            }
            return result;
        },
        // currentMenuLabel():string{
        //     let label = "Account Settings";
        //     for (let i = 0; i < this.MainMenu.length; i++){
        //         if(this.MainMenu[i].selected){
        //             label = this.MainMenu[i].label;
        //             i = this.MainMenu.length;
        //         }
        //     }
        //     return label;
        // },
        currentMenuLabel():string{
            let label = "Account Settings";
            if(this.breadcrumbs.length>0){
                let menu = this.MainMenu;
                if(this.breadcrumbs.length==1){
                    label = menu[this.breadcrumbs[0]].label
                }
                else if(this.breadcrumbs.length>1){
                    for (let i = 0; i < this.breadcrumbs.length; i++){
                        let sub = menu[this.breadcrumbs[i]].submenu;
                        //don't use submenu on last item
                        if(i+1 >= this.breadcrumbs.length) sub = [menu[this.breadcrumbs[i]]];
                        if(typeof sub != 'undefined')
                            menu = sub;
                    }
                    label = menu[0].label
                }
            }
            return label;
        },
        currentMenu(){
            let menu = this.MainMenu;
            for (let i = 0; i < this.currentMenuData.length; i++) {
                menu = menu[this.currentMenuData[i]].submenu;
            }
            return menu;
        },
        getMenuViaBreadcrumbs(){
            let menu = this.MainMenu;
            for (let i = 0; i < this.breadcrumbs.length; i++) {
                menu = menu[this.breadcrumbs[i]].submenu;
            }
            return menu;
        },
        currentMenuData(){
            return this.getSelectedMenuItemAndDepth(this.MainMenu);
        }
    }
})
</script>

<style scoped>

</style>