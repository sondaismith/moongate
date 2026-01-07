import { test, expect } from '@playwright/test';
import { waitFor } from '@testing-library/vue';
import { CreateThreadViewPost } from '../src/fake-data/DataFactory'
import { ThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { AppBskyFeedDefs, AppBskyFeedGetPostThread } from '@atproto/api/dist/client';
import { $Typed } from '@atproto/api/dist/client/util';


test.beforeEach(async ({ context }) => {
    // Block any image requests for each test in this file.
    // await context.route(/(png|jpeg)$/, route => route.abort());
    let post1:AppBskyFeedGetPostThread.OutputSchema;
    await CreateThreadViewPost('tester.da.playwright',"Lorem ipsum dipsum, dimsum, mmm I'm hungry",{activate:true,type:'img'},false,{activate:true,images:true,type:'ext_gif'},'I AM A TESTER').then(res =>{
        post1 = {thread:res as $Typed<ThreadViewPost>}
    })
    await context.route(/app.bsky.feed.getPostThread/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(post1)
        });
    });
})

test('ensure SaveMediaModal displays correctly when interacting with Image displayed in PostFocusModal and FocusFeedPost', async ({page}, testInfo) => {
    await page.goto('/profile/sad-machines.bsky.social/post/3lzrqulh7ic2l',{waitUntil:'networkidle'});
    await expect(page.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    await expect(page.getByText('tester.da.playwright')).toBeVisible();
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