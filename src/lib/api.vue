<script lang="ts">
// src/lib/api.ts
import { Agent, AtpAgentLoginOpts, CredentialSession } from "@atproto/api";
import { AppState } from '../state/AppState.vue';

// export const agent = new AtpAgent({
//   // App View URL
//   service: "https://api.bsky.app",
//   // If you were making an authenticated client, you would
//   // use the PDS URL here instead - the main one is bsky.social
//   // service: "https://bsky.social",
// });

const authSession = new CredentialSession(
  // new URL("", 'https://api.bsky.app'),
  new URL("", 'https://bsky.social'),
);

const guestSession = new CredentialSession(
  new URL("", 'https://api.bsky.app'),
);

export const guestAgent:Agent = new Agent(guestSession)

export const authAgent:Agent = new Agent(authSession);

/**
 * Returns the `Agent` to access the Bluesky API with based on
 * the current browsing mode the app is in.
 */
export function GetBrowsingAgent():Agent{
  if(AppState.isAuthBrowsing){
    return authAgent;
  }
  else{
    return guestAgent;
  }
}

/**
 * Method that attempts to get the Bluesky Agent to use a specific
 * user account.
 * @param handle The handle of the account to use.
 * @param password The password of the account to use.
 * @returns
 */
export async function LoginAgent(handle:string, password:string){
  var result;
  try{
    result = await authSession.login({identifier:handle,password:password} as AtpAgentLoginOpts)
  }
  catch(error){
    result = error;
  }
  return result;
}

/**
 * Method that attempts to get the Bluesky Agent to log out of the
 * authenticated account it is using.
 * @returns The result of trying to logout of the user account.
 */
export async function LogoutAgent(){
  var result;
  // try{
    result = await authSession.logout();
  // }
  // catch(error){
  //   result = error;
  // }
  return result;
}
</script>