import test, { expect } from "@playwright/test";
import { CreateActorSearchResults, CreateFeedViewPost, CreatePostView, CreateUserProfile, FindUserProfile } from "../src/fake-data/DataFactory";
import { AppBskyFeedDefs, AppBskyFeedGetAuthorFeed, AppBskyFeedSearchPosts } from "@atproto/api";

let actorSearchResults = CreateActorSearchResults();
let profile1 = CreateUserProfile(actorSearchResults.actors[0].handle,actorSearchResults.actors[0].displayName,actorSearchResults.actors[0].did);
let profile2 = CreateUserProfile(actorSearchResults.actors[1].handle,actorSearchResults.actors[1].displayName,actorSearchResults.actors[1].did);
let profile3 = CreateUserProfile(actorSearchResults.actors[2].handle,actorSearchResults.actors[2].displayName,actorSearchResults.actors[2].did);

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
const hashtagText = '#money';
let feedViewPost1:AppBskyFeedDefs.FeedViewPost = {post:emptyPostView};
let feedViewPost2:AppBskyFeedDefs.FeedViewPost = {post:emptyPostView};
let postView1:AppBskyFeedDefs.PostView = emptyPostView;
let postView2:AppBskyFeedDefs.PostView = emptyPostView;
/**List of Feeds that will be addded to main view after "Create Feeds" is clicked on `FeedEditModal`. Empty by default - values must be added (use `.beforeAll()`). */
let getAuthorFeedResponse:AppBskyFeedGetAuthorFeed.OutputSchema = {feed:[]};
let searchPostResponse:AppBskyFeedSearchPosts.OutputSchema = {posts:[]};
/**List of User Profiles - acts as database and is searched to return results in `app.bsky.actor.getProfile` API mock.*/
let profileStore = [profile1,profile2,profile3];

test.beforeAll(async ({browser}) => {
    await CreateFeedViewPost('bob.the.poster',`I love my car shop! ${hashtagText}`,true,'Bob the Poster').then(res => feedViewPost1 = res);
    await CreateFeedViewPost('cargo.haul', 'Delivery delivery delivery delivery',false,'Cargo Haul').then(res => feedViewPost2 = res);
    await CreatePostView('muffler.talk', 'Vroom vroom','Never exhausted about cars').then(res => postView1 = res);
    await CreatePostView('car.go.hull', 'I ship cars to guys','Steer and deliver').then(res => postView2 = res);
    getAuthorFeedResponse = {feed:[feedViewPost1,feedViewPost2]};
    searchPostResponse = {posts:[postView1,postView2]};
})

test('Ensure "Tag" feed is created successfully when clicking on a hashtag element', async({context},testInfo) => {
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
        route.fulfill({
            status: 200 ,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(getAuthorFeedResponse)
        });
    });
    //The following allows for mocking the creation of Tag-type feeds
    await context.route(/app.bsky.feed.searchPosts/, route => {
        route.fulfill({
            status: 200 ,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(searchPostResponse)
        });
    });

    //go to app home page
    await instance1.goto(`/`,{waitUntil:'networkidle'});

    //browse as guest user
    await instance1.getByTestId('add-feed-button').click();
    await instance1.getByTestId('browse-as-guest-button').click();
    //add new User Feed to Feed Stack
    await instance1.getByTestId('add-feed-button').click();
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
    //Check that `FeedEditModal` has closed and 1 feed is displayed in the main view
    await expect(instance1.getByTestId('feed-edit-modal')).toBeHidden();
    await expect(instance1.getByTestId('feed-column')).toHaveCount(1);
    //Click on hashtag displayed in User Feed
    await expect(instance1.getByTestId('hashtag')).toHaveCount(1);
    await instance1.getByTestId('hashtag').click();
    //check to see if tag feed was created
    await expect(instance1.getByTestId('feed-column')).toHaveCount(2);
    await expect(instance1.getByTestId('feed-column').getByTestId('feedColumn-feed-name').nth(1)).toHaveText(hashtagText);
})