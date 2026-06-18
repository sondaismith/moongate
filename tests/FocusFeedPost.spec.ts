import test, { expect } from "@playwright/test";
import { CreateBookmarkView, CreateFeedViewPost, CreateLoginSessionResponse, CreateThreadViewPost, CreateUserProfile } from "../src/fake-data/DataFactory";
import { $Typed, AppBskyFeedGetPostThread } from "@atproto/api";
import { AppBskyFeedDefs, AppBskyBookmarkDefs } from "@atproto/api";


let handle1:string = 'tester.da.playwright';
let handle2:string = 'i.am.very.secretive';
let handle3:string = 'handle.seeker';
let displayName1:string = 'I AM A TESTER';
let displayName2:string = `tester don't play that`;
let displayName3:string = `Book Mark`;
let profile1 = await CreateUserProfile(handle1,displayName2);
let profile2 = await CreateUserProfile(handle2);
let post1:AppBskyFeedGetPostThread.OutputSchema;
let postWithoutParent:AppBskyFeedDefs.FeedViewPost;
let postWithPostViewParent:AppBskyFeedDefs.FeedViewPost;
let postWithNotFoundPostParent:AppBskyFeedDefs.FeedViewPost;
let bookmarkWithPostViewParent:AppBskyBookmarkDefs.BookmarkView;
let bookmarkWithNotFoundPostParent:AppBskyBookmarkDefs.BookmarkView;
let postText1 = "Lorem ipsum dipsum, dimsum, mmm I'm hungry";
let postText2 = 'I am replying to a post. My parent has not been deleted.';
let postText3 = 'I am replying to a post. My parent has been deleted.😢';
let postText4 = 'I have no parent!!';
let bookmarkText1 = 'You bookmarked me!🔖';
let bookmarkText2 = 'Request the User Profile of my Parent!🔖';
let currentDateTime = new Date();
await CreateThreadViewPost(handle1,postText1,{activate:true,type:'img'},false,{activate:true,images:true,type:'ext_gif'},'I AM A TESTER').then(res =>{
    post1 = {thread:res as $Typed<AppBskyFeedDefs.ThreadViewPost>}
})
await CreateFeedViewPost(handle1,postText4,undefined,displayName1,currentDateTime,undefined,"None").then(res => {
    postWithoutParent = res;
})
await CreateFeedViewPost(handle1,postText2,undefined,displayName1,currentDateTime,undefined,"PostView").then(res => {
    postWithPostViewParent = res;
})
await CreateFeedViewPost(handle1,postText3,undefined,displayName1,currentDateTime,undefined,"NotFoundPost").then(res => {
    postWithNotFoundPostParent = res;
})
await CreateBookmarkView(handle1,bookmarkText1,displayName1,currentDateTime,"PostView").then(res => {
    bookmarkWithPostViewParent = res;
})
await CreateBookmarkView(handle3,bookmarkText2,displayName3,currentDateTime,"NotFoundPost").then(res => {
    bookmarkWithNotFoundPostParent = res;
})

test.beforeEach(async ({ context }) => {
    await context.route(/app.bsky.feed.getPostThread/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(post1)
        });
    });
    // await context.route(/app.bsky.feed.getAuthorFeed/, route => {
    //     route.fulfill({
    //         status: 200,
    //         headers: { 'Content-Type': 'application/json' },
    //         body:JSON.stringify({feed:[post2]})
    //     });
    // });
})

test('FocusFeedPost WITHOUT a parent Post SHOULD NOT display "View Parent of Reply" button', async ({context, page}) => {
    await page.route(/app.bsky.actor.getProfile/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(profile1)
        });
    });
    await page.route(/app.bsky.feed.getAuthorFeed/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({feed:[postWithoutParent]})
        });
    });
    await page.goto(`/profile/${handle1}`,{waitUntil:'networkidle'});
    // await expect(page).toHaveTitle(`${displayName2}'s Account | moongate`);
    await page.getByText(postText4).scrollIntoViewIfNeeded();
    await expect(page.getByTestId('focusfeedpost-view-parent')).toBeHidden();
})

test('FocusFeedPost WITH `PostView` parent Post SHOULD display "View Parent of Reply" button', async ({context, page}) => {
    await page.route(/app.bsky.actor.getProfile/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(profile1)
        });
    });
    await page.route(/app.bsky.feed.getAuthorFeed/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({feed:[postWithPostViewParent]})
        });
    });
    await page.goto(`/profile/${handle1}`,{waitUntil:'networkidle'});
    // await expect(page).toHaveTitle(`${displayName2}'s Account | moongate`);
    await page.getByText(postText2).scrollIntoViewIfNeeded();
    await expect(page.getByTestId('focusfeedpost-view-parent')).toBeVisible();
})

test('FocusFeedPost WITH `NotFoundPost` parent Post SHOULD display "View Parent of Reply" button AND result in a call to the `app.bsky.actor.getProfile` API endpoint when clicked', async ({context, page}) => {
    await page.route(/app.bsky.actor.getProfile/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(profile1)
        });
    });
    await page.route(/app.bsky.feed.getAuthorFeed/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({feed:[postWithNotFoundPostParent]})
        });
    });
    await page.goto(`/profile/${handle1}`,{waitUntil:'networkidle'});
    // await expect(page).toHaveTitle(`${displayName2}'s Account | moongate`);
    await page.getByText(postText3).scrollIntoViewIfNeeded();
    await expect(page.getByTestId('focusfeedpost-view-parent')).toBeVisible();
    //Check that network call to get User Profile of reply creator is made
    const responsePromise = page.waitForResponse(/app.bsky.actor.getProfile/);
    await page.getByTestId('focusfeedpost-view-parent').click()
    const response = await responsePromise;
    expect(response.status()).toEqual(200);
    expect(await response.json()).toEqual(profile1);
})

test('Bookmarked FocusFeedPost WITH `PostView` parent Post SHOULD display "View Parent of Reply" button AND result in a call to the `app.bsky.actor.getProfile` API endpoint when clicked', async ({context, page},testInfo) => {
    let sessionResponse = CreateLoginSessionResponse(profile1.handle,profile1.did);
    await page.route(/com.atproto.server.createSession/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(sessionResponse)
        });
    });
    await page.route(/app.bsky.actor.getProfile/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(profile1)
        });
    });
    await page.route(/app.bsky.feed.getAuthorFeed/, route => { //Author's main feed should return nothing...
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify({feed:[]})
        });
    });
    await page.route(/app.bsky.bookmark.getBookmarks/, route => { //..only the Saved/Bookmark feed should return content
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({bookmarks:[bookmarkWithPostViewParent]})
        });
    });
    //Log in
    await page.goto(`/login`,{waitUntil:'networkidle'});
    await page.getByTestId('login-to-account-button').click();
    await page.getByTestId('login-username-input').getByRole('textbox').fill('username');
    await page.getByTestId('login-password-input').getByRole('textbox').fill('password');
    // await page.getByRole('button').filter({visible:true}).getByText('Login',{exact:true}).click();
    await page.getByTestId('login-button').click();
    //View logged in User's Profile via interacting with the `UserButton`
    await expect(page.getByTestId('userbutton-user-avatar')).toBeVisible();
    // const userbuttonLoggedInAvatar = await page.getByTestId('userbutton-user-avatar').screenshot();
    // await testInfo.attach('image showing UserButton with logged in User avatar', {
    //     body: userbuttonLoggedInAvatar,
    //     contentType: 'image/png',
    // });
    await page.getByTestId('userbutton').click();
    await page.getByText('View Profile').click();
    //Switch to the "Saved/Bookmark" tab
    await expect(page.getByText('Saved')).toBeVisible();
    // const savedTab = await page.getByText('Saved').screenshot();
    // await testInfo.attach('image showing Saved tab on UserFocusModal', {
    //     body: savedTab,
    //     contentType: 'image/png',
    // });
    await page.getByText('Saved').click();
    //Check that the displayed bookmark has the "View Parent of Reply" button visible
    await page.getByText(bookmarkText1).scrollIntoViewIfNeeded();
    await expect(page.getByTestId('focusfeedpost-view-parent')).toBeVisible();
    //Check that network call to get User Profile of reply creator is made
    const responsePromise = page.waitForResponse(/app.bsky.actor.getProfile/);
    await page.getByTestId('focusfeedpost-view-parent').click()
    const response = await responsePromise;
    expect(response.status()).toEqual(200);
    expect(await response.json()).toEqual(profile1);
})

test('Bookmarked FocusFeedPost WITH `NotFoundPost` parent Post SHOULD display "View Parent of Reply" button AND result in a call to the `app.bsky.actor.getProfile` API endpoint when clicked', async ({context, page},testInfo) => {
    let sessionResponse = CreateLoginSessionResponse(profile1.handle,profile1.did);
    await page.route(/com.atproto.server.createSession/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(sessionResponse)
        });
    });
    await page.route(/app.bsky.actor.getProfile/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(profile2)
        });
    });
    await page.route(/app.bsky.feed.getAuthorFeed/, route => { //Author's main feed should return nothing...
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify({feed:[]})
        });
    });
    await page.route(/app.bsky.bookmark.getBookmarks/, route => { //..only the Saved/Bookmark feed should return content
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({bookmarks:[bookmarkWithNotFoundPostParent]})
        });
    });
    //Log in
    await page.goto(`/login`,{waitUntil:'networkidle'});
    await page.getByTestId('login-to-account-button').click();
    await page.getByTestId('login-username-input').getByRole('textbox').fill('username');
    await page.getByTestId('login-password-input').getByRole('textbox').fill('password');
    await page.getByTestId('login-button').click();
    //View logged in User's Profile via interacting with the `UserButton`
    await expect(page.getByTestId('userbutton-user-avatar')).toBeVisible();
    await page.getByTestId('userbutton').click();
    await page.getByText('View Profile').click();
    //Switch to the "Saved/Bookmark" tab
    await expect(page.getByText('Saved')).toBeVisible();
    await page.getByText('Saved').click();
    //Check that the displayed bookmark has the "View Parent of Reply" button visible
    await page.getByText(bookmarkText2).scrollIntoViewIfNeeded();
    await expect(page.getByTestId('focusfeedpost-view-parent')).toBeVisible();
    //Check that network call to get User Profile of reply creator is made
    const responsePromise = page.waitForResponse(/app.bsky.actor.getProfile/);
    await page.getByTestId('focusfeedpost-view-parent').click()
    const response = await responsePromise;
    expect(response.status()).toEqual(200);
    expect(await response.json()).toEqual(profile2);
})