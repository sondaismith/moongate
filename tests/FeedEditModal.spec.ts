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
let profile1 = CreateUserProfile(actorSearchResults.actors[0].handle,actorSearchResults.actors[0].displayName,actorSearchResults.actors[0].did);
let profile2 = CreateUserProfile(actorSearchResults.actors[1].handle,actorSearchResults.actors[1].displayName,actorSearchResults.actors[1].did);
let profile3 = CreateUserProfile(actorSearchResults.actors[2].handle,actorSearchResults.actors[2].displayName,actorSearchResults.actors[2].did);
let sessionResponse = CreateLoginSessionResponse(profile1.handle,profile1.did);

let trend1 = CreateTrendView('unit test','software','Unit Tests',1337);
let trend2 = CreateTrendView('softwaredev','software','Software Devlopment',512);
let trend3 = CreateTrendView('house ownership','Lifestyle',"Buying a House",79,new Date(2026,8,16,20,32));
let trend4 = CreateTrendView('naps','Lifestyle',"Power Naps",133200,new Date(2026,4,9,8,11));
let trend5 = CreateTrendView('f1','Sport',"2026 Canadian GP",11766,new Date(2026,4,19,14,20));
let getTrendsResponse:AppBskyUnspeccedGetTrends.OutputSchema = {trends:[trend1,trend2,trend3,trend4,trend5]};

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

/**Response used when mocking `com.atproto.identity.resolveHandle` API call. */
let getResolveHandleResponse:ComAtprotoIdentityResolveHandle.OutputSchema = {did:'did:plc:amockedcreatordid'};
/**Response used when mocking `app.bsky.feed.getFeedGenerator` API call. */
let getFeedGeneratorResponse:AppBskyFeedGetFeedGenerator.OutputSchema = {
    isOnline:true,
    isValid:true,
    view:{
        cid:'bafyreic4kw6relrbjveebuitjxodlwpfgunfga4z4ktvx34q4j2ukhazfe',
        creator:{
            did:'did:plc:amockedcreatordid',
            handle:'mocked.creator.app',
            displayName:'Test Generator Creator',
            avatar:'http://localhost:1420/src/assets/test-media/posts/image01.png'
        },
        did:'did:plc:amockedviewdid',
        displayName:'Mocked Trend',
        indexedAt: new Date().toISOString(),
        uri:`at://did:plc:amockedcreatordid/app.bsky.feed.generator/12345678`
    }
};

test.beforeAll(async ({browser}) => {
    await CreateGetFeedGeneratorsResponse().then(res => {
        getFeedGeneratorsResponse = res;
    })
    await CreateGetPopularFeedGeneratorsResponse().then(res => {
        getPopularFeedGeneratorsResponse = res;
    })
    await CreateFeedViewPost('bob.the.poster','I love my car shop!',true,'Bob the Poster').then(res => post1 = res);
    await CreateFeedViewPost('cargo.haul', 'Delivery delivery delivery delivery',false,'Cargo Haul').then(res => post2 = res);
    feedResponse1 = {feed:[post1,post2]};
})

test('Ensure Feeds of each type can be added and removed "out of order"', async({context},testInfo) => {
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
    await context.route(/app.bsky.feed.getFeedGenerators/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(getFeedGeneratorsResponse)
        });
    });
    await context.route(/app.bsky.unspecced.getPopularFeedGenerators/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(getPopularFeedGeneratorsResponse)
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
    await instance1.getByTestId('feedEditModal-user-feed-button').click();
    await instance1.getByTestId('feedEditModal-user-search-bar').getByRole('textbox').fill('username');
    await instance1.getByTestId('feedEditModal-user-search-bar').getByRole('button').click();
    await expect(instance1.getByTestId('user-search-bar-result').nth(0)).toBeVisible();
    await instance1.getByTestId('user-search-bar-result').nth(0).click();
    await expect(instance1.getByTestId('feedEditModal-next-page-button')).toBeVisible();
    //add trending Feed
    await instance1.getByTestId('feedEditModal-trending-feed-button').click();
    await instance1.getByTestId('feedEditModal-toggle-trending-feed-button').click();
    await expect(instance1.getByText('# of Feeds:2')).toBeVisible();
    //add 3 tag Feeds, then remove 1st one
    await instance1.getByTestId('feedEditModal-tag-feed-button').click();
    await instance1.getByTestId('feedEditModal-tag-input').getByRole('textbox').fill('junk');
    await instance1.getByTestId('feedEditModal-tag-input').getByRole('textbox').press('Enter');
    await instance1.getByTestId('tag-entry-submit-tags').click();
    await instance1.getByTestId('feedEditModal-tag-input').getByRole('textbox').fill('test');
    await instance1.getByTestId('feedEditModal-tag-input').getByRole('textbox').press('Enter');
    await instance1.getByTestId('tag-entry-submit-tags').click();
    await instance1.getByTestId('feedEditModal-tag-input').getByRole('textbox').fill('dev');
    await instance1.getByTestId('feedEditModal-tag-input').getByRole('textbox').press('Enter');
    await instance1.getByTestId('tag-entry-submit-tags').click();
    await expect(instance1.getByTestId('feedEditModal-tag-feed-list').getByRole('button')).toHaveCount(3);//2 feed summaries should be displayed
    await expect(instance1.getByText('# of Feeds:5')).toBeVisible();
    await instance1.getByTestId('feedEditModal-tag-feed-list').getByRole('button').nth(0).click();
    await expect(instance1.getByText('# of Feeds:4')).toBeVisible();
    //add Custom Feed
    await instance1.getByTestId('feedEditModal-custom-feed-button').click();
    await expect(instance1.getByTestId('feedEditModal-custom-feed-list').getByRole('button')).toHaveCount(5);//5 custom feeds should be displayed
    await instance1.getByTestId('feedEditModal-custom-feed-list').getByRole('button').nth(1).click();
    await expect(instance1.getByText('# of Feeds:5')).toBeVisible();
    //remove trending feed
    await instance1.getByTestId('feedEditModal-trending-feed-button').click();
    await instance1.getByTestId('feedEditModal-toggle-trending-feed-button').click();
    await expect(instance1.getByText('# of Feeds:4')).toBeVisible();
    //add following feed
    await instance1.getByTestId('feedEditModal-following-feed-button').click();
    await instance1.getByTestId('feedEditModal-toggle-following-feed-button').click();
    await expect(instance1.getByText('# of Feeds:5')).toBeVisible();
    //add notification feed
    await instance1.getByTestId('feedEditModal-notifications-feed-button').click();
    await instance1.getByTestId('feedEditModal-toggle-notifications-feed-button').click();
    await expect(instance1.getByText('# of Feeds:6')).toBeVisible();
    //check that 1 of the returned custom feeds is selected
    await instance1.getByTestId('feedEditModal-custom-feed-button').click();
    await expect(instance1.getByTestId('feedEditModal-custom-feed-list').getByTestId('customFeedButton-selected')).toHaveCount(1);
    //select another custom feed
    await instance1.getByTestId('feedEditModal-custom-feed-list').getByRole('button').nth(2).click();
    await expect(instance1.getByText('# of Feeds:7')).toBeVisible();
    await expect(instance1.getByTestId('feedEditModal-custom-feed-list').getByTestId('customFeedButton-selected')).toHaveCount(2);
    //navigate to summary page
    await instance1.getByTestId('feedEditModal-next-page-button').click();
    await expect(instance1.getByTestId('feedEditModal-summary-page')).toBeVisible();
    await expect(instance1.getByTestId('feedEditModal-summary-page-feed-list').getByTestId('feedStackButton-display-only-item')).toHaveCount(7);
    //remove 1st out of the 2 custom feed using button on summary page
    await expect(instance1.getByTestId('feedEditModal-summary-page-feed-list').getByRole('button')).toHaveCount(7);
    await instance1.getByTestId('feedEditModal-summary-page-feed-list').getByRole('button').nth(3).click();
    await expect(instance1.getByText('# of Feeds:6')).toBeVisible();
    //remove 1st out of the 2 tag feed using button on summary page
    await instance1.getByTestId('feedEditModal-summary-page-feed-list').getByRole('button').nth(1).click();
    await expect(instance1.getByText('# of Feeds:5')).toBeVisible();
    //go back to User feed tab and deselect/remove the currently selected User Feed
    await instance1.getByTestId('feedEditModal-back-button').click();
    await instance1.getByTestId('feedEditModal-user-feed-button').click();
    await instance1.getByTestId('feedEditModal-user-search-bar').getByRole('textbox').fill('username');
    await instance1.getByTestId('feedEditModal-user-search-bar').getByRole('textbox').press('Enter');
    await expect(instance1.getByTestId('user-search-bar-result').nth(0)).toBeVisible();
    await instance1.getByTestId('user-search-bar-result').nth(0).click();
    await expect(instance1.getByText('# of Feeds:4')).toBeVisible();
    //select 2nd and 3rd User results
    await expect(instance1.getByTestId('user-search-bar-result').nth(1)).toBeVisible();
    await expect(instance1.getByTestId('user-search-bar-result').nth(2)).toBeVisible();
    await instance1.getByTestId('user-search-bar-result').nth(1).click();
    await instance1.getByTestId('user-search-bar-result').nth(2).click();
    await expect(instance1.getByText('# of Feeds:6')).toBeVisible();
    //navigate to summary page and remove all Feeds except the 2 User Feeds
    await instance1.getByTestId('feedEditModal-next-page-button').click();
    await expect(instance1.getByTestId('feedEditModal-summary-page-feed-list').getByTestId('feedStackButton-display-only-item')).toHaveCount(6);
    await instance1.getByTestId('feedEditModal-summary-page-feed-list').getByTestId('feedStackButton-display-only-item').nth(0).getByRole("button").click();
    await instance1.getByTestId('feedEditModal-summary-page-feed-list').getByTestId('feedStackButton-display-only-item').nth(0).getByRole("button").click();
    await instance1.getByTestId('feedEditModal-summary-page-feed-list').getByTestId('feedStackButton-display-only-item').nth(0).getByRole("button").click();
    await instance1.getByTestId('feedEditModal-summary-page-feed-list').getByTestId('feedStackButton-display-only-item').nth(0).getByRole("button").click();
    await expect(instance1.getByTestId('feedEditModal-summary-page-feed-list').getByTestId('feedStackButton-display-only-item')).toHaveCount(2);
    //Submit Feeds to be created
    await instance1.getByTestId('feedEditModal-create-button').click();
    //Check that `FeedEditModal` has closed and 2 feeds are displayed in the main view
    await expect(instance1.getByTestId('feed-edit-modal')).toBeHidden();
    await expect(instance1.getByTestId('feed-column')).toHaveCount(2);
})

test('Ensure Topic Feed is created when selected from Trending Topic List', async({context},testInfo) => {
    //set up tabs
    // const context = await browser.newContext();
    const instance1 = await context.newPage();
    //set API mocks
    await context.route(/app.bsky.unspecced.getTrends/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(getTrendsResponse)
        });
    });
    await context.route(/com.atproto.identity.resolveHandle/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(getResolveHandleResponse)
        });
    });
    await context.route(/app.bsky.feed.getFeed/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(feedResponse1)
        });
    });
    await context.route(/app.bsky.feed.getFeedGenerator/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(getFeedGeneratorResponse)
        });
    });

    //go to app home page
    await instance1.goto(`/`,{waitUntil:'networkidle'});
    //browse as guest user
    await instance1.getByTestId('add-feed-button').click();
    await instance1.getByTestId('browse-as-guest-button').click();
    //add new Trending Feed to Feed Stack
    await instance1.getByTestId('feedEditModal-trending-feed-button').click();
    await instance1.getByTestId('feedEditModal-toggle-trending-feed-button').click();
    await expect(instance1.getByTestId('feedEditModal-next-page-button')).toBeVisible();
    //navigate to summary page
    await instance1.getByTestId('feedEditModal-next-page-button').click();
    await expect(instance1.getByTestId('feedEditModal-summary-page')).toBeVisible();
    await expect(instance1.getByTestId('feedEditModal-summary-page-feed-list').getByTestId('feedStackButton-display-only-item')).toHaveCount(1);
    //create Trending Feed
    await instance1.getByTestId('feedEditModal-create-button').click();
    //Check that `FeedEditModal` has closed and 1 feed is displayed in the main view
    await expect(instance1.getByTestId('feed-edit-modal')).toBeHidden();
    await expect(instance1.getByTestId('feed-column')).toHaveCount(1);
    //click on 1st Topic in Trending Topic list and check that another Feed has been created with posts
    await expect(instance1.getByTestId('trending-topic')).toHaveCount(5);
    await instance1.getByTestId('trending-topic').nth(1).click();
    await expect(instance1.getByTestId('feed-column').nth(1).getByTestId('feedColumn-post')).toHaveCount(2);
})