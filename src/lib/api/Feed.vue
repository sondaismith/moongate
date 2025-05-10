<script lang="ts">
import { AppBskyActorSearchActors, AppBskyFeedGetAuthorFeed, AppBskyFeedGetTimeline, AppBskyFeedSearchPosts } from "@atproto/api/dist/client";
import { GetBrowsingAgent } from "../api.vue";
import { AppSettingsState } from "../../state/AppSettingsState.vue";
import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

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
 * @param cursor Used when requesting posts from a certain point (pagination).
 * @param postsToGet The number of Posts to return from the Author's Feed.
 * @returns Collection of posts from the User's feed if successful, an error if not.
 */
export async function getAuthorFeed(did:string, cursor:string='', postsToGet:number=30):Promise<AppBskyFeedGetAuthorFeed.Response>{
    let result = await GetBrowsingAgent().getAuthorFeed(
        {
            actor:did,
            filter:"posts_no_replies",
            limit:postsToGet,
            includePins:true,
            cursor:cursor
        }
    )
    return result;
}

/**
 * Method used to get a collection of Posts from a User's feed that is made
 * up of only Posts by them.
 * @param did The DID of the User to get Posts for.
 * @param cursor Used when requesting posts from a certain point (pagination).
 */
export async function getAuthorPostsOnly(did:string,cursor:string=''):Promise<AppBskyFeedGetAuthorFeed.Response>{
    /**Have enough Posts (30) been retrieved through the API. */
    let retrievedEnough = false;
    /**Total number of API calls for Posts made. */
    let calls = 0;
    /**Holds the filtered Posts from the API call. */
    let filteredResults:FeedViewPost[] = []
    let result = await GetBrowsingAgent().getAuthorFeed(
        {
            actor:did,
            filter:"posts_no_replies",
            limit:30,
            includePins:true,
            cursor:cursor
        }
    )
    filteredResults = result.data.feed.filter(x=>x.post.author.did == did);
    result.data.feed = filteredResults;
    calls++;
    console.log(`Made ${calls} attempt(s) in order to retrieve 30 Posts made by this User`);

    //The code below is a little unsafe and a bit messy - the returned number of Posts
    //is not consistent.

    //If there are no more Posts to retrieve or we have 30 or more posts to display,
    //prevent additional API calls.
    // if(result.data.cursor == '' || result.data.feed.length>=30) retrievedEnough = true;
    // //Retrieve more Posts until we have enough, with a max of 3 attempts
    // while(!retrievedEnough && calls<3){
    //     await GetBrowsingAgent().getAuthorFeed(
    //     {
    //         actor:did,
    //         filter:"posts_no_replies",
    //         limit:30,
    //         includePins:true,
    //         cursor:result.data.cursor
    //     })
    //     .then(res => {
    //         filteredResults = res.data.feed.filter(x=>x.post.author.did == did);
    //         filteredResults.forEach(post=>{
    //             result.data.feed.push(post);
    //         })
    //         result.data.cursor = res.data.cursor; //Update cursor
    //         // result.data.feed = filteredResults;
    //         calls++;
    //     })
    //     console.log(`Made ${calls} attempt(s) in order to retrieve 30 Posts made by this User`);
    //     if(result.data.cursor == '' || result.data.feed.length>30) retrievedEnough = true;
    // }
    console.log(`Returning ${result.data.feed.length} post(s) made by this User`);
    return result;
}

/**
 * Method used to get a collection of Posts from a User's feed that is made
 * up of only Replies by them.
 * @param did The DID of the User to get Posts for.
 * @param cursor Used when requesting posts from a certain point (pagination).
 */
 export async function getAuthorRepliesOnly(did:string,cursor:string=''):Promise<AppBskyFeedGetAuthorFeed.Response>{
    /**Have enough Posts (30) been retrieved through the API. */
    let retrievedEnough = false;
    /**Total number of API calls for Posts made. */
    let calls = 0;
    /**Holds the filtered Posts from the API call. */
    let filteredResults:FeedViewPost[] = []
    let result = await GetBrowsingAgent().getAuthorFeed(
        {
            actor:did,
            limit:30,
            includePins:true,
            cursor:cursor
        }
    )
    filteredResults = result.data.feed.filter(x=>x.reply && x.post.author.did == did);
    result.data.feed = filteredResults;
    calls++;
    console.log(`Made ${calls} attempt(s) in order to retrieve 30 replies made by this User`);

    //The code below is a little unsafe and a bit messy - the returned number of Posts
    //is not consistent.

    //If there are no more Posts to retrieve or we have 30 or more posts to display,
    //prevent additional API calls.
    // if(result.data.cursor == '' || result.data.feed.length>=30) retrievedEnough = true;
    // //Retrieve more Posts until we have enough, with a max of 3 attempts
    // while(!retrievedEnough && calls<3){
    //     await GetBrowsingAgent().getAuthorFeed(
    //     {
    //         actor:did,
    //         filter:"posts_no_replies",
    //         limit:30,
    //         includePins:true,
    //         cursor:result.data.cursor
    //     })
    //     .then(res => {
    //         filteredResults = res.data.feed.filter(x=>x.reply);
    //         filteredResults.forEach(post=>{
    //             result.data.feed.push(post);
    //         })
    //         result.data.cursor = res.data.cursor; //Update cursor
    //         // result.data.feed = filteredResults;
    //         calls++;
    //     })
    //     console.log(`Made ${calls} attempt(s) in order to retrieve 30 Posts made by this User`);
    //     if(result.data.cursor == '' || result.data.feed.length>30) retrievedEnough = true;
    // }
    console.log(`Returning ${result.data.feed.length} repl(y/ies) made by this User`);
    return result;
}

/**
 * Method that gets Posts containing specific hashtags.
 * @param tags String of hashtags, space-separated.
 * @param cursor Used when requesting posts from a certain point (pagination).
 * @param postsToGet The number of Posts to return containing the submitted tags.
 * @returns Search results returned from the Bluesky API.
 */
export async function getTagPosts(tags:string,cursor:string='',postsToGet:number=30):Promise<AppBskyFeedSearchPosts.Response>{
    if(!AppSettingsState.Settings.isAcceptingAllLanguages && AppSettingsState.Settings.selectedLanguages.length>0){
        console.log(`Here's a list of the currently selected languages:`);
        console.log(AppSettingsState.prepareSelectedLanguages());
    }
    let langs = ''
    if(!AppSettingsState.Settings.isAcceptingAllLanguages && AppSettingsState.Settings.selectedLanguages.length>0){
        //Only one language can be passed through. Will have to create
        //custom solution to work with multiple.
        langs = AppSettingsState.prepareSelectedLanguages();
    }
    //Commented out below because tag feeds/search seems to be broken atm - 04/26/25
    let result = await GetBrowsingAgent().app.bsky.feed.searchPosts(
        {
            q:`${tags}`,
            limit:postsToGet,
            lang:langs,
            // cursor:cursor //as of April 3rd 2025 there's some sort of issue with `searchPosts` - disabling for now
        }
    )
    //Code below was used because tag feeds/search was broken - 04/26/25
    // let result = {} as Promise<AppBskyFeedSearchPosts.Response>;
    return result;
}
</script>