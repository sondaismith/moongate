// src/lib/api.ts
import { Agent, AtpAgent, AtpAgentLoginOpts, CredentialSession } from "@atproto/api";

// export const agent = new AtpAgent({
//   // App View URL
//   service: "https://api.bsky.app",
//   // If you were making an authenticated client, you would
//   // use the PDS URL here instead - the main one is bsky.social
//   // service: "https://bsky.social",
// });

const session = new CredentialSession(
  // new URL("", 'https://api.bsky.app'),
  new URL("", 'https://bsky.social'),
);

export const agent:Agent = new Agent(session);

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
    result = await session.login({identifier:handle,password:password} as AtpAgentLoginOpts)
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
    result = await session.logout();
  // }
  // catch(error){
  //   result = error;
  // }
  return result;
}