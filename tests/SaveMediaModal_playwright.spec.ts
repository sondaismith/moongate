import { test, expect } from '@playwright/test';
import { waitFor } from '@testing-library/vue';
import { CreateThreadViewPost, CreateUserProfile } from '../src/fake-data/DataFactory'
import { ThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { AppBskyFeedDefs, AppBskyFeedGetPostThread } from '@atproto/api/dist/client';
import { $Typed } from '@atproto/api/dist/client/util';

let handle1:string = 'tester.da.playwright';
let handle2:string = 'i.am.very.secretive';
let displayName1:string = 'I AM A TESTER';
let displayName2:string = `tester don't play that`;
let profile1 = await CreateUserProfile(handle1,displayName2);
let profile2 = await CreateUserProfile(handle2);
let post1:AppBskyFeedGetPostThread.OutputSchema;
let postText1 = "Lorem ipsum dipsum, dimsum, mmm I'm hungry";
await CreateThreadViewPost(handle1,postText1,{activate:true,type:'img'},false,{activate:true,images:true,type:'ext_gif'},'I AM A TESTER').then(res =>{
    post1 = {thread:res as $Typed<ThreadViewPost>}
})

test.beforeEach(async ({ context }) => {
    // Block any image requests for each test in this file.
    // await context.route(/(png|jpeg)$/, route => route.abort());
    await context.route(/app.bsky.feed.getPostThread/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(post1)
        });
    });
    await context.route(/app.bsky.feed.getAuthorFeed/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({feed:[]})
        });
    });
})

test('ensure SaveMediaModal displays correctly when interacting with Image displayed in PostFocusModal and FocusFeedPost', async ({page}, testInfo) => {
    await page.goto('/profile/sad-machines.bsky.social/post/3lzrqulh7ic2l',{waitUntil:'networkidle'});
    await expect(page.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    await expect(page.getByText(handle1)).toBeVisible();
    await expect(page.getByTestId('postFocusModal-media-container').getByRole('img')).toBeVisible();
    // const testScreen = await page.getByTestId('postFocusModal-focus-post-loaded').screenshot();
    // await testInfo.attach('image showing PostFocusModal post content', {
    //     body: testScreen,
    //     contentType: 'image/png',
    // });
    //interact with image to attempt to save it
    page.getByTestId('postFocusModal-media-container').getByRole('img').click({button:'right'});
    await expect(page.getByRole('menu')).toBeVisible();
    // const imgContextMenu = await page.getByRole('menu').screenshot();
    // await testInfo.attach('image showing Post image context menu', {
    //     body: imgContextMenu,
    //     contentType: 'image/png',
    // });
    page.getByRole('menu').getByText(/Save/).click();
    await expect(page.getByTestId('saveMediaModal')).toBeVisible();
    await expect(page.getByTestId('saveMediaModal').getByRole('img')).toBeVisible();
    await expect(page.getByTestId('saveMediaModal').getByRole('textbox')).toBeVisible();
    await expect(page.getByTestId('saveMediaModal').getByRole('textbox')).toHaveValue(/tester.*da.*playwright/);
    const saveMediaModalSnap = await page.getByTestId('saveMediaModal').screenshot();
    // await testInfo.attach('image showing SaveMediaModal component', {
    //     body: saveMediaModalSnap,
    //     contentType: 'image/png',
    // });
    //close SaveMediaModal
    await expect(page.getByTestId('saveMediaModal-close')).toBeVisible();
    page.getByTestId('saveMediaModal-close').click({position:{x:1,y:1}});
    await expect(page.getByTestId('saveMediaModal-close')).toBeHidden();
    //interact with reply image
    await expect(page.getByTestId('postThreadView')).toBeVisible();
    await expect(page.getByTestId('postThreadView').getByTestId('focusFeedPost')).toBeVisible();
    // await expect(page.getByTestId('imageContainer-focusFeedPost')).toBeVisible();
    // page.getByTestId('imageContainer-focusFeedPost').click({button:'right'});
    await expect(page.locator('div').filter({ hasText: /^GIF$/ }).nth(1)).toBeVisible();
    page.locator('div').filter({ hasText: /^GIF$/ }).nth(1).click({button:'right'});
    await expect(page.getByRole('menu')).toBeVisible();
    page.getByRole('menu').getByText(/Save/).click();
    await expect(page.getByTestId('saveMediaModal')).toBeVisible();
    await expect(page.getByTestId('saveMediaModal').locator('div').filter({ hasText: /.gif/ }).nth(1)).toBeVisible();
    await expect(page.getByTestId('saveMediaModal').getByRole('textbox')).toBeVisible();
    await expect(page.getByTestId('saveMediaModal').getByRole('textbox')).toHaveValue(/tenor.*test.*ok/);
    //close SaveMediaModal
    await expect(page.getByTestId('saveMediaModal-close')).toBeVisible();
    page.getByTestId('saveMediaModal-close').click({position:{x:1,y:1}});
    await expect(page.getByTestId('saveMediaModal-close')).toBeHidden();

})

test('visiting account with display name in PostFocusModal should update window title to include display name', async ({context, page}) => {
    await page.route(/app.bsky.actor.getProfile/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(profile1)
        });
    });
    await page.goto(`/profile/${handle1}`,{waitUntil:'networkidle'});
    await expect(page).toHaveTitle(`${displayName2}'s Account | moongate`);
})

test('visiting account without display name in UserFocusModal should update window title to include handle', async ({context, page}) => {
    await page.route(/app.bsky.actor.getProfile/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(profile2)
        });
    });
    await page.goto(`/profile/${handle2}`,{waitUntil:'networkidle'});
    await expect(page).toHaveTitle(`${handle2}'s Account | moongate`);
})

test('when viewing Post with text in PostFocusModal and User has a display name, window title should include post text and user display name', async ({page}, testInfo) => {
    await page.goto(`/profile/${handle1}/post/3lzrqulh7ic2l`);
    //we have to navigate to a different route and back in order for the `document.title` to be set correctly...
    page.getByTestId('postFocusModal-media-container').getByRole('img').click({button:'right'});
    await expect(page.getByRole('menu')).toBeVisible();
    page.getByRole('menu').getByText(/Save/).click();
    await expect(page.getByTestId('saveMediaModal')).toBeVisible();
    await expect(page.getByTestId('saveMediaModal-close')).toBeVisible();
    page.getByTestId('saveMediaModal-close').click({position:{x:1,y:1}});
    await expect(page.getByTestId('saveMediaModal-close')).toBeHidden();
    //Check window title
    await expect(page).toHaveTitle(`${postText1.slice(0,20)}... by ${displayName1} | moongate`);
})