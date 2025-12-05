<script lang="ts">
import { reactive } from 'vue'
import { INavigationHistory } from '../interfaces/UserInterfaces';

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
    navigationHistory: {} = [] as INavigationHistory[],
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