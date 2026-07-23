import test, { expect } from "@playwright/test";
import { CreateActorSearchResults, CreateFeedViewPost, CreateUserProfile, FindAuthorFeedResponse, FindUserProfile, IAuthorFeedStoreItem } from "../src/fake-data/DataFactory";
import { AppBskyFeedDefs, AppBskyFeedGetAuthorFeed } from "@atproto/api";

let actorSearchResults = CreateActorSearchResults();
let profile1 = CreateUserProfile(actorSearchResults.actors[0].handle,actorSearchResults.actors[0].displayName,actorSearchResults.actors[0].did,actorSearchResults.actors[0].avatar);
let profile2 = CreateUserProfile(actorSearchResults.actors[1].handle,actorSearchResults.actors[1].displayName,actorSearchResults.actors[1].did,actorSearchResults.actors[1].avatar,{statuses:["live"], isActive:true});
let profile3 = CreateUserProfile(actorSearchResults.actors[2].handle,actorSearchResults.actors[2].displayName,actorSearchResults.actors[2].did,actorSearchResults.actors[2].avatar);

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
let feedViewPost1:AppBskyFeedDefs.FeedViewPost = {post:emptyPostView};
let feedViewPost2:AppBskyFeedDefs.FeedViewPost = {post:emptyPostView};
let feedViewPost3:AppBskyFeedDefs.FeedViewPost = {post:emptyPostView};
let feedViewPost4:AppBskyFeedDefs.FeedViewPost = {post:emptyPostView};
let feedViewPost5:AppBskyFeedDefs.FeedViewPost = {post:emptyPostView};
/**List of Feeds that will be addded to main view after "Create Feeds" is clicked on `FeedEditModal`. Empty by default - values must be added (use `.beforeAll()`). */
let getAuthorFeedResponse1:AppBskyFeedGetAuthorFeed.OutputSchema = {feed:[]};
let getAuthorFeedResponse2:AppBskyFeedGetAuthorFeed.OutputSchema = {feed:[]};
/**List of User Profiles - acts as database and is searched to return results in `app.bsky.actor.getProfile` API mock.*/
let profileStore = [profile1,profile2,profile3];
/**Mini "database" array that is searched using `FindAuthorFeedResponse()` to find the posts to return for a User Feed. */
let authorFeedStore:IAuthorFeedStoreItem[] = [{did:profile1.did,response:{} as AppBskyFeedGetAuthorFeed.OutputSchema},{did:profile2.did,response:{} as AppBskyFeedGetAuthorFeed.OutputSchema}];

test.beforeAll(async ({browser}) => {
    await CreateFeedViewPost(profile1.handle,`I love my car shop!`,true,profile1.displayName,undefined,undefined,undefined,undefined,profile1.did,profile1.avatar).then(res => feedViewPost1 = res);
    await CreateFeedViewPost(profile1.handle, 'Delivery delivery delivery delivery',false,profile1.displayName,undefined,undefined,undefined,undefined,profile1.did,profile1.avatar).then(res => feedViewPost2 = res);
    await CreateFeedViewPost(profile2.handle, 'Mocking can get complicated',false,profile2.displayName,undefined,undefined,undefined,undefined,profile2.did,profile2.avatar,profile2).then(res => feedViewPost3 = res);
    await CreateFeedViewPost(profile2.handle, 'Fake data for a test',false,profile2.displayName,undefined,undefined,undefined,undefined,profile2.did,profile2.avatar,profile2).then(res => feedViewPost4 = res);
    await CreateFeedViewPost(profile2.handle, `This should be a repost but it's not - yet`,false,profile2.displayName,undefined,undefined,undefined,undefined,profile2.did,profile2.avatar).then(res => feedViewPost5 = res);
    getAuthorFeedResponse1 = {feed:[feedViewPost5,feedViewPost1,feedViewPost2]};
    getAuthorFeedResponse2 = {feed:[feedViewPost3,feedViewPost4]};
    authorFeedStore = [{did:profile1.did,response:getAuthorFeedResponse1},{did:profile2.did,response:getAuthorFeedResponse2}]
})

test('Ensure "User" feed is successfully created when selecting "Create New User Feed" from the `AvatarRound` context menu', async({context},testInfo) => {
    const instance1 = await context.newPage();

    //set API mocks
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
        const requestUrl = route.request().url();
        let matchedAuthorFeed:AppBskyFeedGetAuthorFeed.OutputSchema|undefined;
        matchedAuthorFeed = FindAuthorFeedResponse(authorFeedStore,requestUrl);
        route.fulfill({
            status: 200 ,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(matchedAuthorFeed)
        });
    });

    //go to app home page
    await instance1.goto(`/`,{waitUntil:'networkidle'});

    //browse as guest user
    await instance1.getByTestId('add-feed-button').click();
    await instance1.getByTestId('browse-as-guest-button').click();
    //add new User Feed to Feed Stack
    await instance1.getByTestId('feedEditModal-user-feed-button').click();
    await instance1.getByTestId('feedEditModal-user-search-bar').getByRole('textbox').fill('username');
    await instance1.getByTestId('feedEditModal-user-search-bar').getByRole('button').click();
    await expect(instance1.getByTestId('user-search-bar-result').nth(0)).toBeVisible();
    await instance1.getByTestId('user-search-bar-result').nth(0).click();
    await expect(instance1.getByTestId('feedEditModal-next-page-button')).toBeVisible();
    //navigate to summary page
    await instance1.getByTestId('feedEditModal-next-page-button').click();
    await expect(instance1.getByTestId('feedEditModal-summary-page')).toBeVisible();
    await expect(instance1.getByTestId('feedEditModal-summary-page-feed-list').getByTestId('feedStackButton-display-only-item')).toHaveCount(1);
    //create User Feed
    await instance1.getByTestId('feedEditModal-create-button').click();
    //check that `FeedEditModal` has closed and 1 feed is displayed in the main view
    await expect(instance1.getByTestId('feed-edit-modal')).toBeHidden();
    await expect(instance1.getByTestId('feed-column')).toHaveCount(1);
    //click on 1st AvatarRound in User Feed
    await expect(instance1.getByTestId('feed-column').getByTestId(`avatar-round`)).toHaveCount(3);
    await instance1.getByTestId('feed-column').getByTestId(`avatar-round`).nth(0).click({button:'right'});
    await expect(instance1.getByTestId(`options-menu`)).toBeVisible();
    await instance1.getByTestId(`options-menu`).getByRole('button').getByText('user feed').click();
    //check that 2 feeds are displayed in the main view, and that the Feed details match the Profile associated with the clicked `AvatarRound` element
    await expect(instance1.getByTestId('feed-column')).toHaveCount(2);
    await expect(instance1.getByTestId('feed-column').nth(1).getByTestId('feedColumn-handle')).toHaveText(`@${profile2.handle}`);
})

test('Ensure livestream details of a User that is "live" is displayed with expected values, the associated User profile can be navigated to by clicking the "open profile" button, and navigating away from livestream modal just hides it without changing the current route', async({context},testInfo) => {
    const instance1 = await context.newPage();

    //set API mocks
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
        const requestUrl = route.request().url();
        let matchedAuthorFeed:AppBskyFeedGetAuthorFeed.OutputSchema|undefined;
        matchedAuthorFeed = FindAuthorFeedResponse(authorFeedStore,requestUrl);
        route.fulfill({
            status: 200 ,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(matchedAuthorFeed)
        });
    });

    //go to app home page
    await instance1.goto(`/`,{waitUntil:'networkidle'});

    //browse as guest user
    await instance1.getByTestId('add-feed-button').click();
    await instance1.getByTestId('browse-as-guest-button').click();
    //add new User Feed to Feed Stack
    await instance1.getByTestId('feedEditModal-user-feed-button').click();
    await instance1.getByTestId('feedEditModal-user-search-bar').getByRole('textbox').fill('username');
    await instance1.getByTestId('feedEditModal-user-search-bar').getByRole('button').click();
    await expect(instance1.getByTestId('user-search-bar-result').nth(1)).toBeVisible();
    await instance1.getByTestId('user-search-bar-result').nth(1).click();
    await expect(instance1.getByTestId('feedEditModal-next-page-button')).toBeVisible();
    //navigate to summary page
    await instance1.getByTestId('feedEditModal-next-page-button').click();
    await expect(instance1.getByTestId('feedEditModal-summary-page')).toBeVisible();
    await expect(instance1.getByTestId('feedEditModal-summary-page-feed-list').getByTestId('feedStackButton-display-only-item')).toHaveCount(1);
    //create User Feed
    await instance1.getByTestId('feedEditModal-create-button').click();
    //check that `FeedEditModal` has closed and 1 feed is displayed in the main view
    await expect(instance1.getByTestId('feed-edit-modal')).toBeHidden();
    await expect(instance1.getByTestId('feed-column')).toHaveCount(1);
    //click on 1st AvatarRound in User Feed
    await expect(instance1.getByTestId('feed-column').getByTestId(`avatar-round`)).toHaveCount(2);
    await instance1.getByTestId('feed-column').getByTestId(`avatar-round`).nth(0).click({button:'right'});
    await expect(instance1.getByTestId(`options-menu`)).toBeVisible();
    await instance1.getByTestId(`options-menu`).getByRole('button').getByText('stream info').click();
    //check that UserLivestreamDetails is visible and the expected values are showing
    await expect(instance1.getByTestId('userLivestreamDetails')).toBeVisible();
    await expect(instance1.getByTestId('userLivestreamDetails-stream-title').getByText(/Main Page/)).toBeVisible();
    await expect(instance1.getByTestId('userLivestreamDetails-displayName').getByText(typeof profile2.displayName != 'undefined' ? profile2.displayName : '')).toBeVisible();
    await expect(instance1.getByTestId('userLivestreamDetails-handle').getByText(profile2.handle)).toBeVisible();
    await expect(instance1.getByTestId('userLivestreamDetails-stream-duration').getByText('2hr')).toBeVisible();
    //check that clicking "Open Profile" opens UserFocusModal and displays expected info
    await instance1.getByTestId(`userLivestreamDetails`).getByRole('button').getByText('open profile').click();
    await expect(instance1.getByTestId('user-focus-modal')).toBeVisible();
    await expect(instance1.getByTestId('userFocusModal-handle').getByText(profile2.handle)).toBeVisible();
    await expect(instance1.getByTestId('userFocusModal-displayName').getByText(typeof profile2.displayName != 'undefined' ? profile2.displayName : '')).toBeVisible();
    //open UserLivestreamDetails modal again - this time by interacting with avatar at top of UserFocusModal
    await instance1.getByTestId('userFocusModal-avatar').click({button:'right'});
    await expect(instance1.getByTestId(`options-menu`)).toBeVisible();
    await instance1.getByTestId(`options-menu`).getByRole('button').getByText('stream info').click();
    await expect(instance1.getByTestId('userLivestreamDetails')).toBeVisible();
    await expect(instance1.getByTestId('userLivestreamDetails-handle').getByText(profile2.handle)).toBeVisible();
    //navigate back - UserLivestreamDetails should close and the UserFocusModal should still be displayed
    await instance1.goBack();
    await expect(instance1.getByTestId('user-focus-modal')).toBeVisible();
    await expect(instance1.getByTestId('userFocusModal-handle').getByText(profile2.handle)).toBeVisible();
    //close UserFocusModal
    await instance1.getByTestId('userFocusModal-close-button').click();
    await expect(instance1.getByTestId('user-focus-modal')).toBeHidden();
})