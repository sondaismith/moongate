<script lang="ts">
import { reactive } from 'vue'
import { INavigationHistory } from '../interfaces/UserInterfaces';
import { GetBrowsingAgent } from '../lib/api.vue';
import { getAuthorFeed } from '../lib/api/Feed.vue';
import { toast } from './AppState.vue';
import { FeedEnums } from '../enums/FeedEnums';

export default{
    name:"UserFocusModalState"
}

export const UserFocusModalState = reactive({
    /**
     * Object containing a collection of data relating to the User Accounts
     * the user has naviagted through.
     */
    // navigationHistory: {} = [{data:{}},{data:{}}] as IFeedReturnedPostResults[],
    // navigationHistory: {} = [{FeedData:{data:{}}}] as INavigationHistory[],
    /**A "cache" of all the User Profile data retrieved while interacting with `UserFocusModal`. */
    navigationHistory: {} = [] as INavigationHistory[],
    /**The User Profile data currently being displayed in `UserFocusModal`. Retrieved from {@link UserFocusModalState.navigationHistory}. */
    currentUserPageDetails: {} as INavigationHistory,
    /**
     * The index of the data relating to the User Account currently being
     * displayed in the `UserFocusModal` component.
     * */
    currentNavIndex: 0,
    /**Move to previous item in navigation history. */
    PrevNavHistory(){
        if(this.currentNavIndex-1 >= 0){
            this.currentNavIndex = this.currentNavIndex-1;
            this.currentUserAccountDID = this.navigationHistory[this.currentNavIndex].ProfileData.did;
        }
    },
    /**Move to next item in navigation history. */
    NextNavHistory(){
        if(this.currentNavIndex+1 < this.navigationHistory.length) {
            this.currentNavIndex++;
            this.currentUserAccountDID = this.navigationHistory[this.currentNavIndex].ProfileData.did;
        }
    },
    /**
     * Method used to retrieve a `INavigationHistory` matching a provided User handle
     * from the "User data cache" ({@link UserFocuModalState.navigationHistory}).
     * @param handle The handle associated with the "User profile/feed" data to find.
     */
    findCurrentUserPageDetails(handle:string):INavigationHistory|undefined{
        let result:INavigationHistory|undefined = undefined;
        for (let i = 0; i < this.navigationHistory.length; i++) {
            if(this.navigationHistory[i].ProfileData.handle == handle){
                result = this.navigationHistory[i];
                i = this.navigationHistory.length;
            }
        }
        return result;
    },
    /**
     * Method used to "update" the currently displayed User in `UserFocusModal`. If the User has
     * already been accessed, the data will be pulled from the "User data cache". Otherwise that
     * data will be requested via the API and then stored in the cache.
     * @param handle The handle associated with the "User profile/feed" data to get.
     */
    async updateCurrentUserPageDetails(handle:string):Promise<boolean>{
        let existingRecord:INavigationHistory|undefined = this.findCurrentUserPageDetails(handle);
        if(typeof existingRecord != 'undefined'){
            this.currentUserPageDetails = existingRecord;
            return true;
        }
        else{
            //add new record to naviagtionHistory and set currentUserPageDetails to that
            let isHandleValid:boolean = true;
            let newNavHistory:INavigationHistory = {FeedData:{data:[]}, ProfileData:{did:'',handle:''}, scrollPos:0, currentTab:FeedEnums.UserFeedTabs.Feed};
            await GetBrowsingAgent().getProfile({actor:handle})
            .then(res => {
                newNavHistory.ProfileData = res.data;
            })
            .catch(err => {
                console.log(err);
                isHandleValid = false;
            })
            if(isHandleValid){//If provided handle is valid
                await getAuthorFeed(newNavHistory.ProfileData.did)
                .then(res => {
                    newNavHistory.FeedData = {data:res.data.feed,cursor:res.data.cursor};
                    this.navigationHistory.push(newNavHistory);
                    this.currentUserPageDetails = newNavHistory;
                })
                .catch(err => {
                    if((err as string).includes('block')){
                        toast.add({summary:"Account Blocked", detail:`This account is currently blocked. You will be unable to view or interact with any of this account's content until it is unblocked.`, severity:'info', group:'tr', life:3000});
                    }
                    else toast.add({summary:"Error", detail:`${err}`, severity:'error', group:'tr', life:3000});
                    //Account is probably blocked - Display Profile, but no posts
                    this.currentUserPageDetails.FeedData = {data:[],cursor:undefined}
                })
            }
            return isHandleValid;
        }
    },
    /**
     * Method used to update the currently selected tab of a record stored in the
     * "User profile/feed" cache.
     * @param handle The handle associated with the "User profile/feed" data to update.
     * @param tab Value to set User Feed Tab to.
     */
    updateSelectedTabInNavHistory(handle:string, tab:FeedEnums.UserFeedTabs):boolean{
        let existingRecord:INavigationHistory|undefined = this.findCurrentUserPageDetails(handle);
        if(typeof existingRecord != 'undefined'){
            existingRecord.currentTab = tab;
            return true;
        }
        else return false;
    },
    /**
     * Method used to save the current scroll position in `UserFocusModal`. Expected to be
     * used before navigating to another record in the "User profile/feed" history.
     * @param handle The handle associated with the "User profile/feed" data to update.
     * @param scrollPos The scroll position to save.
     */
    updateScrollPosInNavHistory(handle:string, scrollPos:number):boolean{
        let existingRecord:INavigationHistory|undefined = this.findCurrentUserPageDetails(handle);
        if(typeof existingRecord != 'undefined'){
            existingRecord.scrollPos = scrollPos;
            return true;
        }
        else return false;
    },
    /**
     * Gets the navigation history data at a specified index.
     * @param i The index of the data you wish to retrieve.
     */
    GetHistoryDataAtIndex(i:number){
        return this.navigationHistory[i];
    },
    /**Gets the navigation history data that's currently selected.*/
    GetCurrentHistoryData(){
        return this.navigationHistory[this.currentNavIndex];
    },
    /**
     * DID of the user account details that are currently being shown in
     * the `UserFocusModal` component.
     */
    currentUserAccountDID:'',
})
</script>