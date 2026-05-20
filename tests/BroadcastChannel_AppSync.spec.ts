import test, { expect } from "@playwright/test";
import { CreateActorSearchResults, CreateBookmarkView, CreateFeedViewPost, CreateLoginSessionResponse, CreateThreadViewPost, CreateUserProfile } from "../src/fake-data/DataFactory";
import { $Typed, AppBskyFeedGetPostThread } from "@atproto/api";
import { FeedViewPost, ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

let handle1:string = 'tester.da.playwright';
let handle2:string = 'mock.ofthe.day';
let displayName1:string = 'I AM A TESTER';
let displayName2:string = `tester don't play that`;
let actorSearchResults = CreateActorSearchResults();
let profile1 = await CreateUserProfile(handle1,displayName2);
let post1:FeedViewPost;
let post2:FeedViewPost;
let postText1 = "Lorem ipsum dipsum, dimsum, mmm I'm hungry";
let postText2 = "This is the 2nd time I have posted. Yipee!";
let currentDateTime = new Date();
await CreateFeedViewPost(handle1,postText1,undefined,displayName2,currentDateTime,undefined,"None").then(res => {
    post1 = res;
});
await CreateFeedViewPost(handle2,postText2,undefined,displayName1,currentDateTime,undefined,"None").then(res => {
    post2 = res;
});

// test.beforeEach(async ({ context }) => {
// })

test('Ensure changes to Feed (creating, re-ordering) in one app instance is reflected in all other instances', async({browser},testInfo) => {
    //mock feed results
    let returnedFeeds = [[post2,post1],[post1,post2]]; //allows "different" Feeds to be returned when querying `getAuthorFeed`
    let feedIndex = 0; //tracks how many `getAuthorFeed` requests have been made, used to return content from array above
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
        let f:FeedViewPost[] = [];
        if(feedIndex<returnedFeeds.length) f = returnedFeeds[feedIndex];
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({feed:f})
        });
        feedIndex++;
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
    await instance1.getByTestId('feedEditModal-user-search-bar').getByRole('textbox').fill('username');
    await instance1.getByTestId('feedEditModal-user-search-bar').getByRole('button').click();
    await expect(instance1.getByTestId('user-search-bar-result').nth(0)).toBeVisible();
    // //screenshot
    // const actorResults = await instance1.screenshot();
    // await testInfo.attach('image showing mocked actor search results', {
    //     body: actorResults,
    //     contentType: 'image/png',
    // });
    await instance1.getByTestId('user-search-bar-result').nth(0).click();
    // //screenshot
    // const secondTabBefore = await instance2.screenshot();
    await expect(instance1.getByTestId('feedEditModal-next-page-button')).toBeVisible();
    await instance1.getByTestId('feedEditModal-next-page-button').click();
    await expect(instance1.getByTestId('feedEditModal-summary-page')).toBeVisible();
    await expect(instance1.getByTestId('feedEditModal-summary-page-feed-list').getByTestId('feedStackButton-display-only-item')).toHaveCount(1);
    await expect(instance1.getByText('create feed')).toBeVisible();
    await instance1.getByTestId('feedEditModal-create-button').click();
    await expect(instance1.getByTestId('feed-edit-modal')).toBeHidden();
    // //screenshot
    // const feedCreated = await instance1.screenshot();
    // await testInfo.attach('image showing created user feed in main view', {
    //     body: feedCreated,
    //     contentType: 'image/png',
    // });
    // await testInfo.attach('image showing tab 2 before Feed sync', {
    //     body: secondTabBefore,
    //     contentType: 'image/png',
    // });
    // const secondTabAfterSync = await instance2.screenshot();
    // //screenshot
    // await testInfo.attach('image showing status in tab 2 after user feed was created', {
    //     body: secondTabAfterSync,
    //     contentType: 'image/png',
    // });
    //assert that new Feed is visible in second app instance
    await expect(instance2.getByText(postText1)).toBeVisible();
    //add another new feed
    await instance1.getByTestId('add-feed-button').click();
    await instance1.getByTestId('feedEditModal-user-feed-button').click();
    await instance1.getByTestId('feedEditModal-user-search-bar').getByRole('textbox').fill('username');
    await instance1.getByTestId('feedEditModal-user-search-bar').getByRole('button').click();
    await expect(instance1.getByTestId('user-search-bar-result').nth(0)).toBeVisible();
    await instance1.getByTestId('user-search-bar-result').nth(0).click();
    await expect(instance1.getByTestId('feedEditModal-next-page-button')).toBeVisible();
    await instance1.getByTestId('feedEditModal-next-page-button').click();
    await expect(instance1.getByTestId('feedEditModal-summary-page')).toBeVisible();
    await expect(instance1.getByTestId('feedEditModal-summary-page-feed-list').getByTestId('feedStackButton-display-only-item')).toHaveCount(1);
    await expect(instance1.getByText('create feed')).toBeVisible();
    await instance1.getByTestId('feedEditModal-create-button').click();
    await expect(instance1.getByTestId('feed-edit-modal')).toBeHidden();
    //screenshot
    // const secondTabBeforeReorder = await instance2.screenshot();
    // await testInfo.attach('image showing status in tab 2 before feeds are reordered', {
    //     body: secondTabBeforeReorder,
    //     contentType: 'image/png',
    // });
    //drag the 1st Feed's "reorder" button and drop it on the 2nd Feed
    await instance1.getByTestId('feedcolumn-reorder-handle').first().dragTo(instance1.getByTestId('feed-column').nth(1));
    //check that Feed order has changed on 2nd tab
    await expect(instance2.getByTestId('feed-column').nth(1).getByTestId('focusFeedPost').first()).toContainText(postText2);
    //wait for toast message(s) to disappear (for screenshots)
    // await expect(instance1.getByText('Feed List Updated')).toHaveCount(0);
    //screenshot
    // const secondTabAfterReorder = await instance2.screenshot();
    // await testInfo.attach('image showing status in tab 2 after feeds are reordered', {
    //     body: secondTabAfterReorder,
    //     contentType: 'image/png',
    // });
})

test('Ensure changes to Login state (browsing as guest, authorized browsing, logging out) in one app instance is reflected in all other instances', async({browser},testInfo) => {
    //set up tabs
    const context = await browser.newContext();
    const instance1 = await context.newPage();
    const instance2 = await context.newPage();
    //set API mocks
    let sessionResponse = CreateLoginSessionResponse(profile1.handle,profile1.did);
    await context.route(/com.atproto.server.createSession/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(sessionResponse)
        });
    });
    await context.route(/app.bsky.actor.getProfile/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(profile1)
        });
    });

    //make sure both tabs are on app page
    await instance1.goto(`/`,{waitUntil:'networkidle'});
    await instance2.goto(`/`,{waitUntil:'networkidle'});

    //test browsing as guest is synced between instances
    await instance1.getByTestId('userbutton').click();
    await expect(instance2.getByTestId('userbutton-browse-mode-unset')).toBeVisible();
    await instance1.getByTestId('browse-as-guest-button').click();
    await expect(instance2.getByTestId('userbutton-browse-mode-unset')).toBeHidden();
    await expect(instance2.getByTestId('userbutton-browse-mode-guest')).toBeVisible();
    //ensure browse as guest state has correctly been passed to 2nd tab by trying to create a new Feed - login prompt should not show
    await instance2.getByTestId('add-feed-button').click();
    await expect(instance2.getByTestId('feed-edit-modal')).toBeVisible();
    await instance2.getByTestId('feedEditModal-back-button').click();
    await expect(instance2.getByTestId('feed-edit-modal')).toBeHidden();
    //login to authorized account
    await instance1.getByTestId('userbutton').click();
    await instance1.getByTestId('login-to-account-button').click();
    await instance1.getByTestId('login-username-input').getByRole('textbox').fill('username');
    await instance1.getByTestId('login-password-input').getByRole('textbox').fill('password');
    await instance1.getByTestId('login-button').click();
    //check that authorized login state has been synced to 2nd tab
    await expect(instance2.getByTestId('userbutton-user-avatar')).toBeVisible();
    //log out of account
    await instance1.getByTestId('userbutton').click();
    await instance1.getByRole('button').getByText('Log Out').first().click();
    await instance1.getByRole('button').getByText('Yes').first().click();
    //check that logged out state has been synced to 2nd tab
    await expect(instance2.getByTestId('userbutton-browse-mode-unset')).toBeVisible();
    await expect(instance2.getByTestId('userbutton-user-avatar')).toBeHidden();
    await instance2.getByTestId('add-feed-button').click();
    await expect(instance2.getByTestId('login-modal')).toBeVisible();
})

test('Ensure changes to App Settings state (hiding intro message, changing color theme, etc.) in one app instance is reflected in all other instances', async({browser},testInfo) => {
    //set up tabs
    const context = await browser.newContext();
    const instance1 = await context.newPage();
    const instance2 = await context.newPage();

    //make sure both tabs are on app page
    await instance1.goto(`/`,{waitUntil:'networkidle'});
    await instance2.goto(`/`,{waitUntil:'networkidle'});

    //remove intro message on tab 1
    await instance1.getByText('Dismiss message').click();
    //check that intro message has also been removed on tab 2
    await expect(instance2.getByText('Dismiss message')).toBeHidden();
    //open settings and change color theme
    await instance1.getByTestId('app-settings-button').click();
    await instance1.getByText('Dark mode').click();
    await instance1.goBack();
    //check that color theme has been changed on tab 2
    await instance2.getByTestId('app-settings-button').click();
    await expect(instance2.getByText('Dark mode').locator('svg')).toBeVisible();
    //screenshot tab 2 "Dark mode" selected control
    // const secondTabDarkModeCheckbox = await instance2.getByText('Dark mode').locator('svg').screenshot();
    // await testInfo.attach('image showing "Dark mode" checkbox control selected in tab 2', {
    //     body: secondTabDarkModeCheckbox,
    //     contentType: 'image/png',
    // });
})