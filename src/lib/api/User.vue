<script lang="ts">
import { AppBskyActorGetProfile, ComAtprotoIdentityResolveHandle } from '@atproto/api/dist/client';
import { GetBrowsingAgent } from '../api.vue';


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
</script>
