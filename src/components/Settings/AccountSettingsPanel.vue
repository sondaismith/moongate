<template>
    <div class="relative flex flex-col gap-2 overflow-hidden">
        <div class="flex gap-2 items-center h-10 border-b border-outline pb-2 text-lg">
            <button v-if="!noSubMenusSelected || breadcrumbs.length>0" @click="backUpMenuTree"
            class="h-full p-1 shadow-none bg-btn" data-testid="accountSettingsPanel-menu-back-button">
                <i-mingcute:arrow-left-line/>
            </button>
            <div data-testid="accountSettingsPanel-current-menu-label">{{ currentMenuLabel }}</div>
        </div>
        <div class="flex flex-col gap-1">
            <RadioBarButton v-for="(o,index) in getMenuViaBreadcrumbs" :hide-radio-button="true"
            @click="o.action(breadcrumbs)" :data-testid="'accountSettingsPanel-'+o.testId">
                <component :is="o.icon"></component>
                <div class="place-self-center">{{ o.label }}</div>
                <i-mdi:chevron-right class="text-3xl shrink-0 ml-auto"/>
            </RadioBarButton>
        </div>
        <div v-if="isViewingMutedAccounts" class="flex flex-col gap-2 h-full overflow-hidden">
            <div class="bg-yellow-600">Filter bar here</div>
            <div v-if="!isAwaitingMutedAccountData" class="text-sm text-secondary">{{ mutedAccountData.length }} muted account(s) loaded</div>
            <div class="overflow-y-auto preload-gutter">
                <div v-if="!isAwaitingMutedAccountData && mutedAccountData.length>0" class="flex flex-col gap-2">
                    <div v-for="mutedAccount in mutedAccountData" class="flex gap-2 p-3 text-left border border-outline hover:border-modernToggleBtnBorderHover rounded select-none">
                        <div class="flex flex-col gap-2 w-full overflow-hidden">
                            <div class="flex gap-1 items-center">
                                <div class="flex bg-blueskyBlue aspect-square rounded-full shrink-0 w-8 items-center justify-center">
                                    <img v-if="mutedAccount?.avatar" :src="mutedAccount?.avatar"/>
                                    <i-mingcute:radar-2-fill v-else class="text-white h-6 w-6"/>
                                </div>
                                <div class="flex flex-col overflow-hidden">
                                    <div class="text-base leading-4 text-nowrap overflow-hidden text-ellipsis">{{ mutedAccount.displayName ? mutedAccount.displayName : 'PROP MISSING' }}</div>
                                    <div class="text-xs text-secondary text-nowrap overflow-hidden text-ellipsis">@{{ mutedAccount.handle ? mutedAccount.handle : 'PROP MISSING' }}</div>
                                </div>
                                <button @click="" :title="'Remove &quot;'+mutedAccount?.displayName+'&quot; Feed'"
                                class="self-center ml-auto mr-0.5 rounded p-1 border bg-deleteBtnBG active:bg-deleteBtnBGActive text-xs text-white hover:border-primary shadow-none">Unmute</button>
                            </div>
                            <div class="text-sm">{{ mutedAccount ? mutedAccount.description : 'Please supply the `:feed-generator-view` prop' }}</div>
                        </div>
                    </div>
                    <button v-if="typeof mutedAccountDataCursor != 'undefined'" @click="loadMoreMutedUsers" :disabled="isAwaitingAdditionalMutedAccountData"
                    class="flex gap-1 items-center justify-center py-1 w-full rounded bg-btn hover:bg-btnHover
                    hover:border-hover disabled:bg-disabledBG disabled:border-transparent disabled:text-disabled">
                        <i-mingcute:loading-fill v-if="isAwaitingAdditionalMutedAccountData" class="spinner"/>
                        <i-mingcute:plus-fill v-else/>
                        <div>Load More</div>
                    </button>
                    <div v-else
                    class="flex gap-1 items-center justify-center py-1 w-full rounded bg-postMsg text-disabled select-none">
                        <div>End of List</div>
                    </div>
                </div>
                <div v-else-if="isAwaitingMutedAccountData" class="flex flex-wrap gap-2 py-1 pl-1 pr-2">
                    <CustomFeedButtonPlaceholder v-for="n in 5" :hide-toggle="true" :hide-liked-by="true" :use-rounded-pfp="true" class="min-w-64 w-full sm:flex-[1_0_32%]"/>
                </div>
                <div v-else>
                    No Muted Accounts
                </div>
            </div>
        </div>
        <div class="bg-purple-500">breadcrumbs: {{ breadcrumbs }}</div>
    </div>
</template>

<script lang="ts">
//Icons
import MdiHandFrontRight from '~icons/mdi/hand-front-right';
import MingcuteVolumeMuteFill from '~icons/mingcute/volume-mute-fill';
import MdiPersonBlock from '~icons/mdi/person-block';

import { defineComponent } from 'vue'
import { IAccountSettingsMenuItem } from '../../interfaces/SettingsInterfaces'
import { AppState, toast } from '../../state/AppState.vue';
import CustomFeedButtonPlaceholder from '../Placeholder/CustomFeedButtonPlaceholder.vue';
import { GetBrowsingAgent } from '../../lib/api.vue';
import { AppBskyActorDefs } from '@atproto/api/dist/client';

export default defineComponent({
    components:{
        CustomFeedButtonPlaceholder,
    },
    data(){
        return{
            MainMenu:[
                {
                    label:'Moderation',
                    icon: MdiHandFrontRight,
                    testId:'moderation',
                    selected:false,
                    submenu:[
                        {
                            label:'View Muted Accounts',
                            icon: MingcuteVolumeMuteFill,
                            testId:'view-muted-accounts',
                            submenu:[],
                            selected:false,
                            action:(bc:number[])=>{bc.push(0);}
                        },
                        {
                            label:'View Blocked Accounts',
                            icon:MdiPersonBlock,
                            testId:'view-blocked-accounts',
                            selected:false,
                            action:(bc:number[])=>{bc.push(1)}
                        },
                    ],
                    action:(bc:number[])=>{bc.push(0)}
                },
                {
                    label:'Privacy and Security',
                    testId:'privacy-and-security',
                    selected:false,
                    submenu:[
                        {
                            label:'A test option under privacy',
                            icon: MingcuteVolumeMuteFill,
                            testId:'test-under-privacy',
                            selected:false,
                            submenu:[{
                                label:'further sub option',
                                testId:'further-sub-option',
                                selected:false,
                                action:(bc:number[])=>{bc.push(0)}
                            }],
                            action:(bc:number[])=>{bc.push(0)}
                        },
                        {
                            label:'2nd test option under privacy',
                            icon: MingcuteVolumeMuteFill,
                            testId:'second-test-option-under-privacy',
                            selected:false,
                            submenu:[{
                                label:'another option',
                                testId:'another-option',
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
                    testId:'accessibility',
                    selected:false,
                    submenu:undefined,
                    action:(bc:number[])=>{bc.push(2)}
                }
            ] as IAccountSettingsMenuItem[],
            mutedUserList:[],
            breadcrumbs:[] as number[],
            isViewingMutedAccounts:false,
            isAwaitingMutedAccountData:false,
            isAwaitingAdditionalMutedAccountData:false,
            mutedAccountData:{} as AppBskyActorDefs.ProfileView[],
            mutedAccountDataCursor:'' as string|undefined,
        }
    },
    methods:{
        /**
         * Method used to navigate back up the menu tree.
         */
        backUpMenuTree(){
            this.breadcrumbs.pop();
            //Clear variables
            this.isViewingMutedAccounts = false;
            this.isAwaitingMutedAccountData = false;
            this.mutedAccountData = [];
            this.mutedAccountDataCursor = '';
        },
        /**
         * Get initial list of muted accounts for currently logged in User. If User
         * is not currently logged in they will be prompted to do so.
         */
        async getMutedUsers(){
            if(this.isAwaitingMutedAccountData) return;
            if(!AppState.checkIfLoggedIn('post')){ this.backUpMenuTree(); return;}
            this.isAwaitingMutedAccountData = true;
            GetBrowsingAgent().app.bsky.graph.getMutes({limit:5, cursor:this.mutedAccountDataCursor})
            .then(res => {
                this.mutedAccountData = res.data.mutes
                this.mutedAccountDataCursor = res.data.cursor;
            })
            .catch(err => {
                console.log(err);
                toast.add({summary:'Error', detail:`${err}`, severity:'error', group:'tr', life:3000});
            })
            .finally(()=>{this.isAwaitingMutedAccountData=false});
        },
        /**
         * Load additional muted accounts that are in the list in the backend but haven't
         * been requested/displayed yet.
         */
        async loadMoreMutedUsers(){
            this.isAwaitingAdditionalMutedAccountData = true;
            GetBrowsingAgent().app.bsky.graph.getMutes({cursor:this.mutedAccountDataCursor})
            .then(res => {
                res.data.mutes.forEach(mute => {
                    this.mutedAccountData.push(mute)
                });
                this.mutedAccountDataCursor = res.data.cursor;
            })
            .catch(err => {
                console.log(err);
                toast.add({summary:'Error', detail:`${err}`, severity:'error', group:'tr', life:3000});
            })
            .finally(()=>{this.isAwaitingAdditionalMutedAccountData=false});
        },
        async unmuteAccount(did:string,index:number){
            GetBrowsingAgent().unmute(did)
            .then(()=>{
                this.mutedAccountData.splice(index,1);
            })
            .catch(err => {
                console.log(err);
                toast.add({summary:'Error', detail:`${err}`, severity:'error', group:'tr', life:3000});
            })
            .finally(()=>{

            })
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
        /**
         * Finds the title of the current menu item selected and returns it
         * so it can be used as a label.
         */
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
        /**
         * Returns the current menu to display based on the breadcrumbs created
         * when clicking on the displayed items.
         */
        getMenuViaBreadcrumbs(){
            let menu = this.MainMenu;
            for (let i = 0; i < this.breadcrumbs.length; i++) {
                menu = menu[this.breadcrumbs[i]].submenu;
            }
            return menu;
        },
    },
    watch:{
        //Use this to perform actions when certain options are selected/reached.
        breadcrumbs:{
            handler(newVal, oldVal){
                switch (newVal.toString()) {
                    case '0,0': //View Muted Accounts
                        this.isViewingMutedAccounts = true;
                        this.getMutedUsers();
                        break;
                    default:
                        break;
                }
            },
            deep:true
        }
    }
})
</script>

<style scoped>

</style>