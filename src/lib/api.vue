<script lang="ts">
// src/lib/api.ts
import { Agent, AtpAgentLoginOpts, AtpSessionData, ComAtprotoServerCreateSession, CredentialSession } from "@atproto/api";
import { AppState } from '../state/AppState.vue';

export default{
    name:"API Agent Setup"
}

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
 * Method used to access `CredentialSession` object used for authorized
 * access to Bluesky's API. Should only be used to sync the "login state"
 * between app instances open in multiple tabs/windows.
 */
export function GetAuthSession():AtpSessionData|undefined{
  return authSession.session;
}

/**
 * Method used to resume an already authorized API session. Should on be used to sync
 * the "login state" between app instances open in multiple tabs/windows.
 */
export function ResumeAuthSession(sessionData:AtpSessionData){
  authSession.resumeSession(sessionData);
}

/**
 * Method that attempts to get the Bluesky Agent to use a specific
 * user account.
 * @param handle The handle of the account to use.
 * @param password The password of the account to use.
 * @returns
 */
export async function LoginAgent(handle:string, password:string):Promise<ComAtprotoServerCreateSession.Response>{
  var result = await authSession.login({identifier:handle,password:password} as AtpAgentLoginOpts);
  return result;
}

/**
 * Method that attempts to get the Bluesky Agent to log out of the
 * authenticated account it is using.
 * @returns The result of trying to logout of the user account.
 */
export async function LogoutAgent():Promise<void>{
  var result;
  // Errors from authSession.logout will NOT get caught by the code below - as of 03/27/25
  //it will always throw a "400 - Bad Request" error, but the account will be logged out of
  await authSession.logout()
  .then(res => {
    console.log('Logout Success:');
    console.log(res);
    result = res;
  })
  .catch(err => {
    console.log('Error:');
    console.log(err);
  })
  return result;
}
</script>