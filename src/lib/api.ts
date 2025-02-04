// src/lib/api.ts
import { Agent, AtpAgent, CredentialSession } from "@atproto/api";

// export const agent = new AtpAgent({
//   // App View URL
//   service: "https://api.bsky.app",
//   // If you were making an authenticated client, you would
//   // use the PDS URL here instead - the main one is bsky.social
//   // service: "https://bsky.social",
// });

const session = new CredentialSession(
  new URL("", 'https://api.bsky.app'),
)

export const agent = new Agent(session)