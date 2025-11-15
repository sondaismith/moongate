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
            <FilterBar :filter-vmodel="mutedAccountFilter" :show-clear-button="mutedAccountFilter.trim().length>0" @clear-filter-clicked="clearFilterText"
            @update:filter-vmodel="newValue => mutedAccountFilter = newValue" :disabled="isAwaitingMutedAccountData"/>
            <div v-if="!isAwaitingMutedAccountData && mutedAccountFilter.trim() == ''" class="text-sm text-secondary">{{ filteredMutedAccounts.length }} muted account(s) loaded</div>
            <div v-else-if="mutedAccountFilter.trim() != ''" class="text-sm text-secondary">{{ filteredMutedAccounts.length }} muted account(s) found</div>
            <div class="flex flex-col gap-2 overflow-y-auto preload-gutter">
                <div v-if="!isAwaitingMutedAccountData && mutedAccountData.length>0" class="flex flex-col gap-2">
                    <div v-for="(mutedAccount,index) in filteredMutedAccounts" class="flex gap-2 p-3 text-left border border-outline hover:border-modernToggleBtnBorderHover rounded select-none">
                        <div class="flex flex-col gap-2 w-full overflow-hidden">
                            <div class="flex gap-1 items-center">
                                <div class="flex bg-blueskyBlue aspect-square rounded-full shrink-0 w-8 items-center justify-center overflow-hidden">
                                    <img v-if="mutedAccount?.account.avatar" :src="mutedAccount?.account.avatar"/>
                                    <i-mingcute:radar-2-fill v-else class="text-white h-6 w-6"/>
                                </div>
                                <div class="flex flex-col overflow-hidden">
                                    <div class="text-base leading-4 text-nowrap overflow-hidden text-ellipsis">{{ mutedAccount.account.displayName ? mutedAccount.account.displayName : '\n' }}</div>
                                    <div class="text-xs text-secondary text-nowrap overflow-hidden text-ellipsis">@{{ mutedAccount.account.handle ? mutedAccount.account.handle : 'PROP MISSING' }}</div>
                                </div>
                                <button @click="unmuteAccount(mutedAccount.account,index)" :title="'Remove &quot;'+mutedAccount?.account.displayName+'&quot; Feed'"
                                class=" flex items-center gap-1 self-center ml-auto mr-0.5 rounded p-1 border bg-deleteBtnBG active:bg-deleteBtnBGActive
                                text-xs text-white hover:border-primary disabled:bg-disabledBG disabled:text-disabled disabled:border-transparent shadow-none"
                                :disabled="mutedAccount.isAwaitingUnmute">
                                    <i-mingcute:loading-fill v-if="mutedAccount.isAwaitingUnmute" class="spinner"/>
                                    <div>Unmute</div>
                                </button>
                            </div>
                            <div class="text-sm">{{ mutedAccount ? mutedAccount.account.description : 'Please supply the `:feed-generator-view` prop' }}</div>
                        </div>
                    </div>
                </div>
                <div v-else-if="isAwaitingMutedAccountData" class="flex flex-wrap gap-2 py-1 pl-1 pr-2">
                    <CustomFeedButtonPlaceholder v-for="n in 5" :hide-toggle="true" :hide-liked-by="true" :use-rounded-pfp="true" class="min-w-64 w-full sm:flex-[1_0_32%]"/>
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
        </div>
        <div v-if="isViewingBlockedAccounts" class="flex flex-col gap-2 h-full overflow-hidden">
            <FilterBar :filter-vmodel="blockedAccountFilter" :show-clear-button="blockedAccountFilter.trim().length>0" @clear-filter-clicked="clearFilterText"
            @update:filter-vmodel="newValue => blockedAccountFilter = newValue" :disabled="isAwaitingBlockedAccountData"/>
            <div v-if="!isAwaitingMutedAccountData && blockedAccountFilter.trim() == ''" class="text-sm text-secondary">{{ filteredBlockedAccounts.length }} blocked account(s) loaded</div>
            <div v-else-if="blockedAccountFilter.trim() != ''" class="text-sm text-secondary">{{ filteredBlockedAccounts.length }} blocked account(s) found</div>
            <div class="flex flex-col gap-2 overflow-y-auto preload-gutter">
                <div v-if="!isAwaitingBlockedAccountData && blockedAccountData.length>0" class="flex flex-col gap-2">
                    <div v-for="(blockedAccount,index) in filteredBlockedAccounts" class="flex gap-2 p-3 text-left border border-outline hover:border-modernToggleBtnBorderHover rounded select-none">
                        <div class="flex flex-col gap-2 w-full overflow-hidden">
                            <div class="flex gap-1 items-center">
                                <div class="flex bg-blueskyBlue aspect-square rounded-full shrink-0 w-8 items-center justify-center overflow-hidden">
                                    <img v-if="blockedAccount?.account.avatar" :src="blockedAccount?.account.avatar"/>
                                    <i-mingcute:radar-2-fill v-else class="text-white h-6 w-6"/>
                                </div>
                                <div class="flex flex-col overflow-hidden">
                                    <div class="text-base leading-4 text-nowrap overflow-hidden text-ellipsis">{{ blockedAccount.account.displayName ? blockedAccount.account.displayName : '\n' }}</div>
                                    <div class="text-xs text-secondary text-nowrap overflow-hidden text-ellipsis">@{{ blockedAccount.account.handle ? blockedAccount.account.handle : 'PROP MISSING' }}</div>
                                </div>
                                <button @click="unBlockAccount(blockedAccount.account,index)" :title="'Remove &quot;'+blockedAccount?.account.displayName+'&quot; Feed'"
                                class=" flex items-center gap-1 self-center ml-auto mr-0.5 rounded p-1 border bg-deleteBtnBG active:bg-deleteBtnBGActive
                                text-xs text-white hover:border-primary disabled:bg-disabledBG disabled:text-disabled disabled:border-transparent shadow-none"
                                :disabled="blockedAccount.isAwaitingUnmute">
                                    <i-mingcute:loading-fill v-if="blockedAccount.isAwaitingUnmute" class="spinner"/>
                                    <div>Unblock</div>
                                </button>
                            </div>
                            <div class="text-sm">{{ blockedAccount ? blockedAccount.account.description : 'Please supply the `:feed-generator-view` prop' }}</div>
                        </div>
                    </div>
                </div>
                <div v-else-if="isAwaitingBlockedAccountData" class="flex flex-wrap gap-2 py-1 pl-1 pr-2">
                    <CustomFeedButtonPlaceholder v-for="n in 5" :hide-toggle="true" :hide-liked-by="true" :use-rounded-pfp="true" class="min-w-64 w-full sm:flex-[1_0_32%]"/>
                </div>
                <button v-if="typeof blockedAccountDataCursor != 'undefined'" @click="loadMoreBlockedUsers" :disabled="isAwaitingAdditionalBlockedAccountData"
                class="flex gap-1 items-center justify-center py-1 w-full rounded bg-btn hover:bg-btnHover
                hover:border-hover disabled:bg-disabledBG disabled:border-transparent disabled:text-disabled">
                    <i-mingcute:loading-fill v-if="isAwaitingAdditionalBlockedAccountData" class="spinner"/>
                    <i-mingcute:plus-fill v-else/>
                    <div>Load More</div>
                </button>
                <div v-else
                class="flex gap-1 items-center justify-center py-1 w-full rounded bg-postMsg text-disabled select-none">
                    <div>End of List</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
//Icons
import MdiHandFrontRight from '~icons/mdi/hand-front-right';
import MingcuteVolumeMuteFill from '~icons/mingcute/volume-mute-fill';
import MdiPersonBlock from '~icons/mdi/person-block';

import { defineComponent } from 'vue'
import { IAccountSettingsMenuItem, IUnmuteAccountItem } from '../../interfaces/SettingsInterfaces'
import { AppState, toast } from '../../state/AppState.vue';
import CustomFeedButtonPlaceholder from '../Placeholder/CustomFeedButtonPlaceholder.vue';
import { GetBrowsingAgent } from '../../lib/api.vue';
import RadioBarButton from '../Utilities/RadioBarButton.vue';
import { toggleBlock, toggleMute } from '../../lib/api/User.vue';
import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import FilterBar from '../Utilities/FilterBar.vue';

export default defineComponent({
    components:{
        RadioBarButton,
        CustomFeedButtonPlaceholder,
        FilterBar,
    },
    data(){
        return{
            /**Collection of all menu options available. */
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
            /**Array holding the index of each menu item selected. Used to figure out what menu to display. */
            breadcrumbs:[] as number[],
            /**Is the User currently viewing the accounts that they have muted? */
            isViewingMutedAccounts:false,
            /**Are we waiting for the initial batch of muted account data to be returned by the API? */
            isAwaitingMutedAccountData:false,
            /**Are we waiting for additional muted account data to be returned by the API? (Load more clicked) */
            isAwaitingAdditionalMutedAccountData:false,
            /**Collection of muted accounts returned from API. */
            mutedAccountData:[] as IUnmuteAccountItem[],
            /**
             * String cursor used to paginate requested muted account results.
             * Also determines if end of "muted account" list is reached - if
             * variable is undefined, there are no more records to return.
             */
            mutedAccountDataCursor:'' as string|undefined,
            /**Search term used to filter displayed "muted account" results. */
            mutedAccountFilter:'',
            /**Is the User currently viewing the accounts that they have blocked? */
            isViewingBlockedAccounts:false,
            /**Are we waiting for the initial batch of blocked account data to be returned by the API? */
            isAwaitingBlockedAccountData:false,
            /**Are we waiting for additional blocked account data to be returned by the API? (Load more clicked) */
            isAwaitingAdditionalBlockedAccountData:false,
            /**Collection of blocked accounts returned from API. */
            blockedAccountData:[] as IUnmuteAccountItem[],
            /**
             * String cursor used to paginate requested blocked account results.
             * Also determines if end of "blocked account" list is reached - if
             * variable is undefined, there are no more records to return.
             */
            blockedAccountDataCursor:'' as string|undefined,
            /**Search term used to filter displayed "blocked account" results. */
            blockedAccountFilter:'',
        }
    },
    methods:{
        /**
         * Method used to navigate back up the menu tree.
         */
        backUpMenuTree(){
            this.breadcrumbs.pop();
            //Clear variables//
            //Mutes
            this.isViewingMutedAccounts = false;
            this.isAwaitingMutedAccountData = false;
            this.isAwaitingAdditionalMutedAccountData = false;
            this.mutedAccountData = [];
            this.mutedAccountDataCursor = '';
            this.mutedAccountFilter = '';
            //Blocks
            this.isViewingBlockedAccounts = false;
            this.isAwaitingBlockedAccountData = false;
            this.isAwaitingAdditionalBlockedAccountData = false;
            this.blockedAccountData = [];
            this.mutedAccountDataCursor = '';
            this.blockedAccountFilter = '';
        },
        /**
         * Get initial list of muted accounts for currently logged in User. If User
         * is not currently logged in they will be prompted to do so.
         */
        async getMutedUsers(){
            if(this.isAwaitingMutedAccountData) return;
            if(!AppState.checkIfLoggedIn('view Muted Accounts')){ this.backUpMenuTree(); return;}
            this.isAwaitingMutedAccountData = true;
            GetBrowsingAgent().app.bsky.graph.getMutes({cursor:this.mutedAccountDataCursor})
            .then(res => {
                res.data.mutes.forEach(account => {
                    this.mutedAccountData.push({account:account,isAwaitingUnmute:false});
                });
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
                    this.mutedAccountData.push({account:mute,isAwaitingUnmute:false})
                });
                this.mutedAccountDataCursor = res.data.cursor;
            })
            .catch(err => {
                console.log(err);
                toast.add({summary:'Error', detail:`${err}`, severity:'error', group:'tr', life:3000});
            })
            .finally(()=>{this.isAwaitingAdditionalMutedAccountData=false});
        },
        /**
         * Unmutes specified account. Is expected to be used via an arrangement that displays the
         * contents of {@link mutedAccountData} in a list.
         * @param profile The ProfileView of the account to unmute.
         * @param index The index that points to where the provided ProfileView is stored inside {@link mutedAccountData}.
         */
        async unmuteAccount(profile:ProfileView, index:number){
            this.mutedAccountData[index].isAwaitingUnmute = true;
            await toggleMute(profile,true)
            .then(()=>{
                //remove item from displayed list
                let pos = this.mutedAccountData.findIndex(x=>x.account.did == profile.did);
                if(pos>-1){
                    this.mutedAccountData.splice(pos,1);
                }
            })
            .catch(()=>{
                this.mutedAccountData[index].isAwaitingUnmute = false;
            })
        },
        /**
         * Get initial list of blocked accounts for currently logged in User. If User
         * is not currently logged in they will be prompted to do so.
         */
        async getBlockedUsers(){
            if(this.isAwaitingBlockedAccountData) return;
            if(!AppState.checkIfLoggedIn('view Blocked Accounts')){ this.backUpMenuTree(); return;}
            this.isAwaitingBlockedAccountData = true;
            GetBrowsingAgent().app.bsky.graph.getBlocks({cursor:this.blockedAccountDataCursor})
            .then(res => {
                res.data.blocks.forEach(account => {
                    this.blockedAccountData.push({account:account,isAwaitingUnmute:false});
                });
                this.blockedAccountDataCursor = res.data.cursor;
            })
            .catch(err => {
                console.log(err);
                toast.add({summary:'Error', detail:`${err}`, severity:'error', group:'tr', life:3000});
            })
            .finally(()=>{this.isAwaitingBlockedAccountData=false});
        },
        /**
         * Load additional blocked accounts that are in the list in the backend but haven't
         * been requested/displayed yet.
         */
        async loadMoreBlockedUsers(){
            this.isAwaitingAdditionalBlockedAccountData = true;
            GetBrowsingAgent().app.bsky.graph.getBlocks({cursor:this.blockedAccountDataCursor})
            .then(res => {
                res.data.blocks.forEach(block => {
                    this.blockedAccountData.push({account:block,isAwaitingUnmute:false})
                });
                this.blockedAccountDataCursor = res.data.cursor;
            })
            .catch(err => {
                console.log(err);
                toast.add({summary:'Error', detail:`${err}`, severity:'error', group:'tr', life:3000});
            })
            .finally(()=>{this.isAwaitingAdditionalBlockedAccountData=false});
        },
        /**
         * Unblocks specified account. Is expected to be used via an arrangement that displays the
         * contents of {@link blockedAccountData} in a list.
         * @param profile The ProfileView of the account to unblock.
         * @param index The index that points to where the provided ProfileView is stored inside {@link blockedAccountData}.
         */
        async unBlockAccount(profile:ProfileView, index:number){
            this.blockedAccountData[index].isAwaitingUnmute = true;
            await toggleBlock(profile,true)
            .then(()=>{
                //remove item from displayed list
                let pos = this.blockedAccountData.findIndex(x=>x.account.did == profile.did);
                if(pos>-1){
                    this.blockedAccountData.splice(pos,1);
                }
            })
            .catch(()=>{
                this.blockedAccountData[index].isAwaitingUnmute = false;
            })
        },
        /**Clears the filter used on the lists of Muted and Blocked accounts. */
        clearFilterText(){
            this.mutedAccountFilter = '';
            this.blockedAccountFilter = '';
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
        filteredMutedAccounts():IUnmuteAccountItem[]{
            let result = this.mutedAccountData;
            if(this.mutedAccountFilter.trim() != ''){
                result = this.mutedAccountData.filter(x=>x.account.displayName?.toLowerCase().includes(this.mutedAccountFilter) ||
                x.account.handle.includes(this.mutedAccountFilter) || x.account.description?.toLowerCase().includes(this.mutedAccountFilter));
            }
            return result;
        },
        filteredBlockedAccounts():IUnmuteAccountItem[]{
            let result = this.blockedAccountData;
            if(this.blockedAccountFilter.trim() != ''){
                result = this.blockedAccountData.filter(x=>x.account.displayName?.toLowerCase().includes(this.blockedAccountFilter) ||
                x.account.handle.includes(this.blockedAccountFilter) || x.account.description?.toLowerCase().includes(this.blockedAccountFilter));
            }
            return result;
        }
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
                    case '0,1': //View Blocked Accounts
                        this.isViewingBlockedAccounts = true;
                        this.getBlockedUsers();
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