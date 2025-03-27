<script lang="ts">
import { AppBskyActorSearchActors, AppBskyFeedGetAuthorFeed, AppBskyFeedGetTimeline, AppBskyFeedSearchPosts } from "@atproto/api/dist/client";
import { GetBrowsingAgent } from "../api.vue";

export async function getUserHomeFeed():Promise<AppBskyFeedGetTimeline.Response>{
    let result = await GetBrowsingAgent().getTimeline();
    return result;
}

/**
 * Method the uses the Bluesky API to return a list of User/Author
 * accounts that match the entered term(s). NOTE: The search function
 * provided by the API is very basic ATM - no advanced searches can be
 * done (as of Mar 6th 2025).
 * @param searchTerm String the user has entered to find User Accounts.
 * @returns Collection of User Accounts that match the search term entered
 * if successful, an Error if not.
 */
export async function SearchForAccounts(searchTerm : string):Promise<AppBskyActorSearchActors.Response>{
    let result = await GetBrowsingAgent().searchActors({q: `${searchTerm}`,limit:10})
    return result;
}

/**
 * Method that gets posts created by a specifc User.
 * @param did The unique DID identifier of the User you want to return Posts from.
 * @returns Collection of posts from the User's feed if successful, an error if not.
 */
export async function getAuthorFeed(did:string):Promise<AppBskyFeedGetAuthorFeed.Response>{
    let result = await GetBrowsingAgent().getAuthorFeed(
        {
            actor:did,
            filter:"posts_no_replies",
            limit:30,
        }
    )
    return result;
}

/**
 * Method that gets Posts containing specific hashtags.
 * @param tags String of hashtags, space-separated.
 * @returns Search results returned from the Bluesky API.
 */
export async function getTagPosts(tags:string):Promise<AppBskyFeedSearchPosts.Response>{
    let result = await GetBrowsingAgent().app.bsky.feed.searchPosts(
        {
            q:`${tags}`,
        }
    )
    return result;
}
</script>