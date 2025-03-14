<script lang="ts">
import { GetBrowsingAgent } from '../api.vue';


/**
 * Method that gets the profile of a specifc User, based on their DID.
 * @param did The unique DID identifier of the User you want to get the profile of.
 * @returns Object containing User's profile details if successful, otherwise an Error.
 */
 export async function getUserProfile(did:string):Promise<Response|unknown>{
    var result;
    try{
        result = await GetBrowsingAgent().getProfile(
            {
                actor:did,
            }
        )
    }
    catch(error){
        result = error;
    }
    return result;
}

/**
 * Method that gets the DID of a specifc User, based on their handle.
 * @param handle The handle of the User you want to get the DID of.
 * @returns Object containing User's DID if successful, otherwise an Error.
 */
 export async function getUserDIDViaHandle(handle:string){
    var result;
    try{
        result = await GetBrowsingAgent().resolveHandle(
            {
                handle: handle
            }
        )
    }
    catch(error){
        result = error;
    }
    return result;
}
</script>
