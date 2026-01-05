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
    await CreateThreadViewPost('tester.da.playwright',"Lorem ipsum dipsum, dimsum, mmm I'm hungry",false,'I AM A TESTER').then(res =>{
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

test('mock response when displaying PostFocusModal', async ({page}, testInfo) => {
    await page.goto('/profile/sad-machines.bsky.social/post/3lzrqulh7ic2l',{waitUntil:'networkidle'});
    expect(page.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    expect(page.getByText('tester.da.playwright')).toBeVisible();
    const testScreen = await page.getByTestId('postFocusModal-focus-post-loaded').screenshot();
    await testInfo.attach('image showing PostFocusModal post content', {
        body: testScreen,
        contentType: 'image/png',
    });
})