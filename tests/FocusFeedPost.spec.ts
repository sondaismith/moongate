import test, { expect } from "@playwright/test";
import { CreateFeedViewPost, CreateThreadViewPost, CreateUserProfile } from "../src/fake-data/DataFactory";
import { $Typed, AppBskyFeedGetPostThread } from "@atproto/api";
import { FeedViewPost, ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";


let handle1:string = 'tester.da.playwright';
let handle2:string = 'i.am.very.secretive';
let displayName1:string = 'I AM A TESTER';
let displayName2:string = `tester don't play that`;
let profile1 = await CreateUserProfile(handle1,displayName2);
let profile2 = await CreateUserProfile(handle2);
let post1:AppBskyFeedGetPostThread.OutputSchema;
let postWithParentThatExists:FeedViewPost;
let postWithNotFoundPostParent:FeedViewPost;
let postText1 = "Lorem ipsum dipsum, dimsum, mmm I'm hungry";
let postText2 = 'I am replying to a post. My parent has not been deleted.';
let postText3 = 'I am replying to a post. My parent has been deleted.😢';
let currentDateTime = new Date();
await CreateThreadViewPost(handle1,postText1,{activate:true,type:'img'},false,{activate:true,images:true,type:'ext_gif'},'I AM A TESTER').then(res =>{
    post1 = {thread:res as $Typed<ThreadViewPost>}
})
await CreateFeedViewPost(handle1,postText2,undefined,displayName1,currentDateTime,undefined,"PostView").then(res => {
    postWithParentThatExists = res;
})
await CreateFeedViewPost(handle1,postText3,undefined,displayName1,currentDateTime,undefined,"NotFoundPost").then(res => {
    postWithNotFoundPostParent = res;
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

test('FocusFeedPost with valid reply parent should display "View Parent of Reply" button', async ({context, page}) => {
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
            body:JSON.stringify({feed:[postWithParentThatExists]})
        });
    });
    await page.goto(`/profile/${handle1}`,{waitUntil:'networkidle'});
    // await expect(page).toHaveTitle(`${displayName2}'s Account | moongate`);
    await page.getByText(postText2).scrollIntoViewIfNeeded();
    await expect(page.getByTestId('focusfeedpost-view-parent')).toBeVisible();
})

test('FocusFeedPost with NotFoundPost reply parent should not display "View Parent of Reply" button', async ({context, page}) => {
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
    await expect(page.getByTestId('focusfeedpost-view-parent')).toBeHidden();
})