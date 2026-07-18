import test, { expect } from "@playwright/test";
import { CreateActorSearchResults, CreateFeedViewPost, CreateUserProfile, FindAuthorFeedResponse, FindUserProfile, IAuthorFeedStoreItem } from "../src/fake-data/DataFactory";
import { AppBskyFeedDefs, AppBskyFeedGetAuthorFeed } from "@atproto/api";

let actorSearchResults = CreateActorSearchResults();
let profile1 = CreateUserProfile(actorSearchResults.actors[0].handle,actorSearchResults.actors[0].displayName,actorSearchResults.actors[0].did,actorSearchResults.actors[0].avatar);
let profile2 = CreateUserProfile(actorSearchResults.actors[1].handle,actorSearchResults.actors[1].displayName,actorSearchResults.actors[1].did,actorSearchResults.actors[1].avatar);
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
let authorFeedStore:IAuthorFeedStoreItem[] = [{did:profile1.did,response:{} as AppBskyFeedGetAuthorFeed.OutputSchema},{did:profile2.did,response:{} as AppBskyFeedGetAuthorFeed.OutputSchema}];

test.beforeAll(async ({browser}) => {
    await CreateFeedViewPost(profile1.handle,`I love my car shop!`,true,profile1.displayName,undefined,undefined,undefined,undefined,profile1.did,profile1.avatar).then(res => feedViewPost1 = res);
    await CreateFeedViewPost(profile1.handle, 'Delivery delivery delivery delivery',false,profile1.displayName,undefined,undefined,undefined,undefined,profile1.did,profile1.avatar).then(res => feedViewPost2 = res);
    await CreateFeedViewPost(profile2.handle, 'Mocking can get complicated',false,profile2.displayName,undefined,undefined,undefined,undefined,profile2.did,profile2.avatar).then(res => feedViewPost3 = res);
    await CreateFeedViewPost(profile2.handle, 'Fake data for a test',false,profile2.displayName,undefined,undefined,undefined,undefined,profile2.did,profile2.avatar).then(res => feedViewPost4 = res);
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