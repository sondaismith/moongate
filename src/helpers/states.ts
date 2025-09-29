import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

/**
 * Checks to see if app is currently being run on a mobile device with
 * touch controls. Used to decide what technique to use when giving the User
 * the means to reorder `FeedButton` and `FeedColumn` components.
 */
export function isOnMobileTouchscreen(){
    // console.log('debug');
    return (('ontouchstart' in window) &&
    (navigator.maxTouchPoints > 0));
}

/**
 * Method used to see if the viewed User is verified.
 */
export function isUserVerified(profile:ProfileView){
    if(profile != undefined && profile.verification && profile.verification.verifiedStatus == 'valid')
        return true;
    return false;
}