import { isTauri } from "@tauri-apps/api/core";

/**
 * Checks to see if app is currently being run on a mobile device with
 * touch controls. Used to what technique to use when giving the User
 * the means to reorder `FeedButton` and `FeedColumn` components.
 */
export function isOnMobileTouchscreen(){
    if(!isTauri() && navigator.maxTouchPoints>0) return true;
    else return false;
}