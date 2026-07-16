import test, { expect } from "@playwright/test";
import { CreateActorSearchResults, CreateFeedViewPost, CreateGetFeedGeneratorsResponse, CreateGetPopularFeedGeneratorsResponse, CreateLoginSessionResponse,
    CreateTrendView, CreateUserProfile, FindUserProfile } from "../src/fake-data/DataFactory";
import { AppBskyFeedDefs, AppBskyFeedGetAuthorFeed, AppBskyFeedGetFeedGenerator, AppBskyFeedGetFeedGenerators, AppBskyUnspeccedGetPopularFeedGenerators,
    AppBskyUnspeccedGetTrends, ComAtprotoIdentityResolveHandle } from "@atproto/api";


let handle1:string = 'tester.da.playwright';
let handle2:string = 'mock.ofthe.day';
let handle3:string = 'reply.on.parent';
let handle4:string = 'reply.on.reply2';
let displayName1:string = 'I AM A TESTER';
let displayName2:string = `tester don't play that`;
let displayName3:string = `REPLIER ONE`;

let actorSearchResults = CreateActorSearchResults();
let getFeedGeneratorsResponse:AppBskyFeedGetFeedGenerators.OutputSchema;
let getPopularFeedGeneratorsResponse:AppBskyUnspeccedGetPopularFeedGenerators.OutputSchema;
let profile1 = CreateUserProfile(actorSearchResults.actors[0].handle,actorSearchResults.actors[0].displayName,actorSearchResults.actors[0].did,undefined,{statuses:['live'],isActive:true});
let profile2 = CreateUserProfile(actorSearchResults.actors[1].handle,actorSearchResults.actors[1].displayName,actorSearchResults.actors[1].did);
let profile3 = CreateUserProfile(actorSearchResults.actors[2].handle,actorSearchResults.actors[2].displayName,actorSearchResults.actors[2].did);
let sessionResponse = CreateLoginSessionResponse(profile1.handle,profile1.did);

let emptyPostView = {
    author:{
        did:'error',
        handle:'not-real',
    },
    cid:'error',
    indexedAt:'never',
    record:{
        text:'[No Text]'
    },
    uri:'going.nowhere',
}
let post1:AppBskyFeedDefs.FeedViewPost = {post:emptyPostView};
let post2:AppBskyFeedDefs.FeedViewPost = {post:emptyPostView};
/**
 * List of Feeds that will be addded to main view after "Create Feeds" is clicked on `FeedEditModal`. Empty by default - values must be added (use `.beforeAll()`).
 * Used by `app.bsky.feed.getAuthorFeed` and `app.bsky.feed.getFeedGenerator` API calls.
 */
let feedResponse1:AppBskyFeedGetAuthorFeed.OutputSchema = {feed:[]};
/**List of User Profiles - acts as database and is searched to return results in `app.bsky.actor.getProfile` API mock.*/
let profileStore = [profile1,profile2,profile3];
/**Used to switch livestreaming status of User Profile between active and inactive on Feed refresh. */
function SwitchUserLivestreamingState(){
    if(typeof profile1.status != 'undefined'){
        profile1.status.isActive = !profile1.status.isActive;//for FeedButton
        if(typeof feedResponse1.feed[0].post.author.status != 'undefined') feedResponse1.feed[0].post.author.status.isActive = profile1.status.isActive;//for 1st post in returned Feed
    }
}

/**Response used when mocking `com.atproto.identity.resolveHandle` API call. */
let getResolveHandleResponse:ComAtprotoIdentityResolveHandle.OutputSchema = {did:'did:plc:amockedcreatordid'};

test.beforeAll(async ({browser}) => {
    await CreateFeedViewPost('bob.the.poster','I love my car shop!',true,'Bob the Poster',undefined,undefined,undefined,undefined,undefined,undefined,profile1).then(res => post1 = res);
    await CreateFeedViewPost('cargo.haul', 'Delivery delivery delivery delivery',false,'Cargo Haul').then(res => post2 = res);
    feedResponse1 = {feed:[post1,post2]};
})

test('Ensure "livestream state" for User account associated with User Feed is correctly reflected on `FeedButton` and `AvatarRound` components', async({context},testInfo) => {
    //set up tabs
    // const context = await browser.newContext();
    const instance1 = await context.newPage();
    //set API mocks
    await context.route(/com.atproto.server.createSession/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(sessionResponse)
        });
    });
    await context.route(/app.bsky.actor.searchActors/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(actorSearchResults)
        });
    });
    await context.route(/app.bsky.actor.getProfile/, route => {
        const requestUrl = route.request().url();
        let matchedProfile = FindUserProfile(profileStore,requestUrl);
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(matchedProfile)
        });
    });
    //The following is to allow for mocking the creation of User-type feeds
    await context.route(/app.bsky.feed.getAuthorFeed/, route => {
        route.fulfill({
            status: 200 ,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(feedResponse1)
        });
    });

    //go to app home page
    await instance1.goto(`/`,{waitUntil:'networkidle'});
    //browse as auth user
    await instance1.getByTestId('add-feed-button').click();
    await instance1.getByTestId('login-to-account-button').click();
    await instance1.getByTestId('login-username-input').getByRole('textbox').fill('username');
    await instance1.getByTestId('login-password-input').getByRole('textbox').fill('password');
    await instance1.getByTestId('login-button').click();
    //add new User Feed
    await instance1.getByTestId('add-feed-button').click();
    await instance1.getByTestId('feedEditModal-user-feed-button').click();
    await instance1.getByTestId('feedEditModal-user-search-bar').getByRole('textbox').fill('username');
    await instance1.getByTestId('feedEditModal-user-search-bar').getByRole('button').click();
    await expect(instance1.getByTestId('user-search-bar-result').nth(0)).toBeVisible();
    await instance1.getByTestId('user-search-bar-result').nth(0).click();
    await expect(instance1.getByTestId('feedEditModal-next-page-button')).toBeVisible();
    await instance1.getByTestId('feedEditModal-next-page-button').click();
    //Submit Feed to be created
    await expect(instance1.getByTestId('feedEditModal-summary-page-feed-list').getByTestId('feedStackButton-display-only-item')).toHaveCount(1);
    await instance1.getByTestId('feedEditModal-create-button').click();
    //Check that `FeedEditModal` has closed and 1 feed is displayed in the main view
    await expect(instance1.getByTestId('feed-edit-modal')).toBeHidden();
    await expect(instance1.getByTestId('feed-column')).toHaveCount(1);
    //Check that `FeedButton` and 1st Post in `FeedColumn` have "currently livestreaming" decorators around avatar
    await expect(instance1.getByTestId('feedButton-live-label')).toHaveCount(1);
    await expect(instance1.getByTestId('feed-column').nth(0).getByTestId('avatar-round-live-label')).toHaveCount(1);
    //Change "livestream state" to inactive
    SwitchUserLivestreamingState();
    //Refresh feed and check that "currently livestreaming" decorators have been removed
    await instance1.getByTestId('feed-column').nth(0).getByTestId('feedColumn-refresh-button').click();
    await expect(instance1.getByTestId('feedButton-live-label')).toHaveCount(0);
    await expect(instance1.getByTestId('feed-column').nth(0).getByTestId('avatar-round-live-label')).toHaveCount(0);
})