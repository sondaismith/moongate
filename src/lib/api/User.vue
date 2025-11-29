<script lang="ts">
import { AppBskyActorGetProfile, ComAtprotoIdentityResolveHandle } from '@atproto/api/dist/client';
import { GetBrowsingAgent } from '../api.vue';
import { AppState, toast } from '../../state/AppState.vue';
import { ProfileView, ProfileViewBasic, ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { AtUri } from '@atproto/api';

export default{
    name:"User API Methods"
}

/**
 * Method that gets the profile of a specifc User, based on their DID.
 * Calls to this method should append `.then()` to the call in order to handle errors in
 * the returned `Promise`.
 * @param did The unique DID identifier of the User you want to get the profile of.
 * @returns Object containing User's profile details if successful, otherwise an Error.
 */
 export async function getUserProfile(did:string):Promise<AppBskyActorGetProfile.Response>{
    let result:AppBskyActorGetProfile.Response = await GetBrowsingAgent().getProfile(
        {
            actor:did,
        }
    )
    return result;
}

/**
 * Method that gets the DID of a specifc User, based on their handle.
 * @param handle The handle of the User you want to get the DID of.
 * @returns Object containing User's DID if successful, otherwise an Error.
 */
export async function getUserDIDViaHandle(handle:string):Promise<ComAtprotoIdentityResolveHandle.Response>{
    let result = await GetBrowsingAgent().resolveHandle(
        {
            handle: handle
        }
    )
    return result;
}

/**
 * Follow the realated User with the currently logged in account.
 * @param userDid The User DID of the User to follow.
 */
export async function FollowUser(userDid:string):Promise<{uri: string,cid: string}>{
    let result = await GetBrowsingAgent().follow(userDid);
    return result;
}

/**
 * Unfollow the realated User with the currently logged in account.
 * @param userDid The User DID of the User to unfollow.
 */
 export async function UnfollowUser(userDid:string):Promise<void>{
    let result;
    //Get account details of User to unfollow
    await GetBrowsingAgent().getProfile({actor:userDid})
    .then(async res => {
        let followUri = '';
        if(res.data.viewer && res.data.viewer.following) followUri = res.data.viewer.following;
        //DEBUG
        // console.log(followUri);
        // throw Error('testing unfollow - still WIP');
        result = await GetBrowsingAgent().deleteFollow(followUri);
    })
    return result;
}

/**
 * Mute the selected User, removing their Posts from the logged in User's Feeds.
 * @param userDid The DID of the User to Mute.
 */
async function MuteUser(userDid:string){
    await GetBrowsingAgent().mute(userDid);
}

/**
 * Unmute the selected User.
 * @param userDid The DID of the User to Unmute.
 */
async function UnmuteUser(userDid:string){
    await GetBrowsingAgent().unmute(userDid);
}

/**
 * Mutes/unmutes a specific account. Can only be used when logged in. When used, scans entire
 * FeedList to sync account "mute/unmute" state.
 * @param authorData The current state of the ProfileView associated with the account that needs to be muted/unmuted.
 * @param throwOnError Optional. Determines if a promise will be rejected (error "thrown") if an error is caught
 * during the mute/unmute process. Default value is false.
 */
export async function toggleMute(authorData:ProfileView|ProfileViewBasic|ProfileViewDetailed, throwOnError:boolean=false){
    if(!AppState.checkIfLoggedIn('mute an Account')) return;
    if(typeof authorData.viewer != 'undefined' && typeof authorData.viewer.muted != 'undefined' && !authorData.viewer.muted){
        await MuteUser(authorData.did)
        .then(() => {
            if(typeof authorData.viewer != 'undefined'){
                authorData.viewer.muted = true;
                AppState.UpdateAccountsInFeedList(authorData);
                AppState.UpdateAccountsInUserFocusModalState(authorData);
            }
            toast.add({summary:"Account Muted", detail:`Muted account - ${authorData.handle}`, severity:'info', group:'tr', life:3000});
        })
        .catch(err => {
            toast.add({summary:"Error", detail:`${err} Issue muting account - ${authorData.handle}`, severity:'error', group:'tr', life:3000});
            if(throwOnError) return Promise.reject(`${err} Issue muting account - ${authorData.handle}`);
        });
    }
    else{
        await UnmuteUser(authorData.did)
        .then(() => {
            if(typeof authorData.viewer != 'undefined'){
                authorData.viewer.muted = false;
                AppState.UpdateAccountsInFeedList(authorData);
                AppState.UpdateAccountsInUserFocusModalState(authorData);
            }
            toast.add({summary:"Account Unuted", detail:`Unmuted account - ${authorData.handle}`, severity:'info', group:'tr', life:3000});
        })
        .catch(err => {
            toast.add({summary:"Error", detail:`${err} Issue unmuting account - ${authorData.handle}`, severity:'error', group:'tr', life:3000});
            if(throwOnError) return Promise.reject(`${err} Issue unmuting account - ${authorData.handle}`);
        });
    }
}

/**
 * Block the selected User, preventing any interaction going forward and removing their
 * content from the logged in User's client experience (posts, replies, account in search,
 * etc).
 * @param currentAcc The DID of the currently logged in User.
 * @param userToBlockDid The DID of the User to Block.
 */
async function BlockUser(currentAcc:string,userToBlockDid:string):Promise<{uri: string;cid: string;}>{
    let result;
    result = await GetBrowsingAgent().app.bsky.graph.block.create(
        {repo:currentAcc},
        {
            subject:userToBlockDid,
            createdAt: new Date().toISOString()
        }
    )
    .then(res => result = res);
    return result;
}

/**
 * Unblock the selected User.
 * @param blockRkey The Record Key of the block record.
 */
async function UnblockUser(blockRkey:string){
    let currentAcc = GetBrowsingAgent().did;
    if(typeof currentAcc != 'undefined'){
        await GetBrowsingAgent().app.bsky.graph.block.delete(
            {
                repo:currentAcc,
                rkey:blockRkey
            }
        );
    }
}

/**
 * Blocks/unblocks a specific account. Can only be used when logged in. When used, scans entire
 * FeedList to sync account "block/unblock" state.
 * @param authorData The current state of the ProfileView associated with the account that needs to be blocked/unblocked.
 * @param throwOnError Optional. Determines if a promise will be rejected (error "thrown") if an error is caught
 * during the block/unblock process. Default value is false.
 */
export async function toggleBlock(authorData:ProfileView|ProfileViewBasic|ProfileViewDetailed, throwOnError:boolean=false){
    if(!AppState.checkIfLoggedIn('block an Account')) return;
    if(typeof authorData.viewer != 'undefined' && typeof authorData.viewer.blocking == 'undefined'){
        let currentAccDid = GetBrowsingAgent().did;
        if(typeof currentAccDid == 'undefined') currentAccDid = ''; //allows block method to be called but will fail
        await BlockUser(currentAccDid,authorData.did)
        .then(res => {
            if(typeof authorData.viewer != 'undefined'){
                authorData.viewer.blocking = res.uri;
                AppState.UpdateAccountsInFeedList(authorData);
                AppState.UpdateAccountsInUserFocusModalState(authorData);
            }
            toast.add({summary:"Account Blocked", detail:`Blocked account - ${authorData.handle}`, severity:'info', group:'tr', life:3000});
        })
        .catch(err => {
            toast.add({summary:"Error", detail:`${err} Issue blocking account - ${authorData.handle}`, severity:'error', group:'tr', life:3000});
            if(throwOnError) return Promise.reject(`${err} Issue blocking account - ${authorData.handle}`);
        });
    }
    else{
        let blockRecord = authorData.viewer?.blocking;
        if(typeof blockRecord == 'undefined') blockRecord = '';//allows block method to be called but will fail
        else blockRecord = new AtUri(blockRecord).rkey;
        await UnblockUser(blockRecord)
        .then(() => {
            if(typeof authorData.viewer != 'undefined'){
                authorData.viewer.blocking = undefined;
                AppState.UpdateAccountsInFeedList(authorData);
                AppState.UpdateAccountsInUserFocusModalState(authorData);
            }
            toast.add({summary:"Account Unblocked", detail:`Unblocked account - ${authorData.handle}`, severity:'info', group:'tr', life:3000});
        })
        .catch(err => {
            toast.add({summary:"Error", detail:`${err} Issue unblocking account - ${authorData.handle}`, severity:'error', group:'tr', life:3000});
            if(throwOnError) return Promise.reject(`${err} Issue unblocking account - ${authorData.handle}`);
        });
    }
}
</script>
