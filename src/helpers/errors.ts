import { AppState } from "../state/AppState.vue";

/**
 * Method that checks if a variable is an Error.
 * @param e Variable to check.
 * @returns True if the variable is an Error, false otherwise.
 */
export function IsError(e : any){
    if(e && e.stack && e.message &&
        typeof e.stack == 'string' && typeof e.message == 'string'){
        //This is a duck-type check - we are assuming this is an Error
        //if conditions are met
            return true;
    }
    return false;
}

/**
 * Method that handles various types of Error returned when trying to
 * use an API `agent` method. Performs different actions based on the
 * "type" of Error it receieves. NOTE: "Type" is determined by Error
 * message content.
 * @param e The Error to handle.
 * @param toastPos The Toast position you want the created Toast to use.
 * @returns Object that can be used to create a Toast message.
 */
export function HandleAPIError(e : Error, toastPos = 'tr'){
    var eType = '';
    //Check Error "type"
    if(e.message.toLowerCase().includes('authentication')){
        eType = 'Account';
        AppState.ToggleCreateFeedModal();
        AppState.ToggleLoginModal();
    }
    return {summary:`${eType} Error`,detail:`Error: ${e.message}`,severity:'error', life:5000, group:toastPos};
}