import test, { expect } from "@playwright/test";
import { CreateActorSearchResults, CreateBookmarkView, CreateFeedViewPost, CreateLoginSessionResponse, CreateThreadViewPost, CreateUserProfile } from "../src/fake-data/DataFactory";
import { $Typed, AppBskyFeedGetPostThread } from "@atproto/api";
import { FeedViewPost, ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

let handle1:string = 'tester.da.playwright';
let displayName1:string = 'I AM A TESTER';
let displayName2:string = `tester don't play that`;
let actorSearchResults = CreateActorSearchResults();
let profile1 = await CreateUserProfile(handle1,displayName2);
let post1:FeedViewPost;
let postText1 = "Lorem ipsum dipsum, dimsum, mmm I'm hungry";
let currentDateTime = new Date();
await CreateFeedViewPost(handle1,postText1,undefined,displayName2,currentDateTime,undefined,"None").then(res => {
    post1 = res;
})

test.beforeEach(async ({ context }) => {
    await context.route(/app.bsky.feed.getPostThread/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(post1)
        });
    });
})

test('Ensure adding Feed in one app instance is reflected in all other instances', async({browser},testInfo) => {
    //set up tabs
    const context = await browser.newContext();
    const instance1 = await context.newPage();
    const instance2 = await context.newPage();
    //set API mocks
    await context.route(/app.bsky.actor.searchActors/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(actorSearchResults)
        });
    });
    await context.route(/app.bsky.actor.getProfile/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(profile1)
        });
    });
    await context.route(/app.bsky.feed.getAuthorFeed/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({feed:[post1]})
        });
    });

    //make sure both tabs are on app page
    await instance1.goto(`/`,{waitUntil:'networkidle'});
    await instance2.goto(`/`,{waitUntil:'networkidle'});

    //browse as guest
    await instance1.getByTestId('add-feed-button').click();
    await instance1.getByTestId('browse-as-guest-button').click();
    //add new feed
    await instance1.getByTestId('add-feed-button').click();
    await instance1.getByTestId('feedEditModal-user-feed-button').click();
    await instance1.getByTestId('feedEditModal-next-page-button').click();
    await instance1.getByTestId('inlainput-input').fill('username');
    await instance1.getByTestId('inlainput-input').press('Enter');
    await expect(instance1.getByTestId('user-search-bar-result').nth(0)).toBeVisible();
    //screenshot
    const actorResults = await instance1.screenshot();
    await testInfo.attach('image showing mocked actor search results', {
        body: actorResults,
        contentType: 'image/png',
    });
    //screenshot
    const secondTabBefore = await instance2.screenshot();
    await instance1.getByTestId('user-search-bar-result').nth(0).click();
    await expect(instance1.getByText('submit')).toBeVisible();
    await instance1.getByTestId('feedEditModal-create-button').click();
    await expect(instance1.getByTestId('feed-edit-modal')).toBeHidden();
    //screenshot
    const feedCreated = await instance1.screenshot();
    await testInfo.attach('image showing created user feed in main view', {
        body: feedCreated,
        contentType: 'image/png',
    });
    await testInfo.attach('image showing tab 2 before Feed sync', {
        body: secondTabBefore,
        contentType: 'image/png',
    });
    const secondTabAfterSync = await instance2.screenshot();
    //screenshot
    await testInfo.attach('image showing status in tab 2 after user feed was created', {
        body: secondTabAfterSync,
        contentType: 'image/png',
    });
    //assert that new Feed is visible in second app instance
    await expect(instance2.getByText(postText1)).toBeVisible();
})