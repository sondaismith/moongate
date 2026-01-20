import test, { expect } from "@playwright/test";
import { CreateBookmarkView, CreateFeedViewPost, CreateThreadViewPost, CreateUserProfile } from "../src/fake-data/DataFactory";
import { $Typed, AppBskyFeedGetPostThread } from "@atproto/api";
import { FeedViewPost, ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { BookmarkView } from "@atproto/api/dist/client/types/app/bsky/bookmark/defs";


let handle1:string = 'tester.da.playwright';
let handle2:string = 'i.am.very.secretive';
let displayName1:string = 'I AM A TESTER';
let displayName2:string = `tester don't play that`;
let profile1 = await CreateUserProfile(handle1,displayName2);
let profile2 = await CreateUserProfile(handle2);
let post1:AppBskyFeedGetPostThread.OutputSchema;
let postWithParentThatExists:FeedViewPost;
let postWithNotFoundPostParent:FeedViewPost;
let bookmarkWithParentThatExist:BookmarkView;
let postText1 = "Lorem ipsum dipsum, dimsum, mmm I'm hungry";
let postText2 = 'I am replying to a post. My parent has not been deleted.';
let postText3 = 'I am replying to a post. My parent has been deleted.😢';
let bookmarkText1 = 'You bookmarked me!🔖';
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
await CreateBookmarkView(handle1,bookmarkText1,displayName1,currentDateTime).then(res => {
    bookmarkWithParentThatExist = res;
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
    //Intercept any attempt to log in and return dummy session data
    await context.route(/com.atproto.server.createSession/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(
                {
                    did: "did:plc:test-session",
                    didDoc: {
                        "@context": [
                            "https://www.w3.org/ns/did/v1",
                            "https://w3id.org/security/multikey/v1",
                            "https://w3id.org/security/suites/secp256k1-2019/v1"
                        ],
                        id: "did:plc:test-session",
                        alsoKnownAs: [
                            "at://test-session.bsky.social"
                        ],
                        verificationMethod: [
                            {
                                id: "did:plc:test-session#atproto",
                                type: "Multikey",
                                controller: "did:plc:test-session",
                                publicKeyMultibase: "zQ3shkYUSJxz7PmCaGznbNR5oMCLKsjC7foCUVLVhxhioa5fa"
                            }
                        ],
                        service: [
                            {
                                id: "#atproto_pds",
                                type: "AtprotoPersonalDataServer",
                                serviceEndpoint: "https://hollowfoot.us-west.host.bsky.network"
                            }
                        ]
                    },
                    handle: "test-session.bsky.social",
                    email: "testSession@mail.com",
                    emailConfirmed: true,
                    emailAuthFactor: false,
                    accessJwt: "testAccessJwt",
                    refreshJwt: "testRefreshJwt",
                    active: true
                }
            )
        });
    });
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

test('Bookmark FocusFeedPost with PostView reply parent should display "View Parent of Reply" button', async ({context, page}) => {
    // console.log(JSON.stringify(bookmarkWithParentThatExist));
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
            body:JSON.stringify({feed:[bookmarkWithParentThatExist]})
        });
    });
    //Log in
    await page.goto(`/login`,{waitUntil:'networkidle'});
    await page.getByTestId('login-to-account-button').click();
    await page.getByTestId('login-username-input').getByRole('textbox').fill('username');
    await page.getByTestId('login-password-input').getByRole('textbox').fill('password');
    // await page.getByRole('button').filter({visible:true}).getByText('Login',{exact:true}).click();
    await page.getByTestId('login-button').click();
    await page.goto(`/profile/${handle1}`,{waitUntil:'networkidle'});
    // await page.getByText(bookmarkText1).scrollIntoViewIfNeeded();
    await expect(page.getByTestId('focusfeedpost-view-parent')).toBeVisible();
})