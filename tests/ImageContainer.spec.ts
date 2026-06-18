import { test, expect } from '@playwright/test';
import { waitFor } from '@testing-library/vue';
import { CreateThreadViewPost, CreateUserProfile } from '../src/fake-data/DataFactory'
import { $Typed, AppBskyFeedDefs, AppBskyFeedGetPostThread } from '@atproto/api';

let handle1:string = 'tester.da.playwright';
let handle2:string = 'i.am.very.secretive';
let displayName1:string = 'I AM A TESTER';
let displayName2:string = `tester don't play that`;
let profile1 = await CreateUserProfile(handle1,displayName2);
let profile2 = await CreateUserProfile(handle2);
let post1:AppBskyFeedGetPostThread.OutputSchema;
let postText1 = "Lorem ipsum dipsum, dimsum, mmm I'm hungry";
await CreateThreadViewPost(handle1,postText1,{activate:true,type:'img'},false,{activate:true,images:true,type:'ext_gif'},'I AM A TESTER').then(res =>{
    post1 = {thread:res as $Typed<AppBskyFeedDefs.ThreadViewPost>}
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

test('ensure SaveMediaModal displays image in `<img>` element when passed a static image (jpeg)', async ({page}, testInfo) => {
    await page.goto(`/profile/${handle1}/post/3lzrqulh7ic2l`,{waitUntil:'networkidle'});
    await expect(page.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    await expect(page.getByText(handle1)).toBeVisible();
    await expect(page.getByTestId('postFocusModal-media-container').getByRole('img')).toBeVisible();
    //interact with image to attempt to save it
    page.getByTestId('postFocusModal-media-container').getByRole('img').click({button:'right'});
    await expect(page.getByRole('menu')).toBeVisible();
    page.getByRole('menu').getByText(/Save/).click();
    await expect(page.getByTestId('saveMediaModal')).toBeVisible();
    await expect(page.getByTestId('saveMediaModal').getByRole('img')).toBeVisible();
    await expect(page.getByTestId('saveMediaModal-filename-input').getByRole('button')).toBeVisible();
    await expect(page.getByTestId('saveMediaModal-filename-input').getByRole('button')).toHaveText(RegExp(`${handle1.replaceAll('.','_')}`));
})

test('ensure SaveMediaModal displays image in `<video>` element when passed a "GIF" (webm), and clicking on it will pause and then unpause the "GIF"', async ({page}, testInfo) => {
    await page.goto(`/profile/${handle1}/post/3lzrqulh7ic2l`,{waitUntil:'networkidle'});
    await expect(page.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    await expect(page.getByText(handle1)).toBeVisible();
    await expect(page.getByTestId('postThreadView').locator('video')).toBeVisible();
    //interact with image to attempt to save it
    page.getByTestId('postThreadView').locator('video').click({button:'right'});
    await expect(page.getByRole('menu')).toBeVisible();
    page.getByRole('menu').getByText(/Save/).click();
    await expect(page.getByTestId('saveMediaModal')).toBeVisible();
    await expect(page.getByTestId('saveMediaModal').locator('video')).toBeVisible();
    await expect(page.getByTestId('saveMediaModal-filename-input').getByRole('button')).toBeVisible();
    //just checking that filename text is displaying, even though normally the extension would not be included
    //the reason it isn't is because the test url IS a .webm, when on Bluesky we get a link pointing to a .gif
    //that we modify and remove the .gif file extension
    await expect(page.getByTestId('saveMediaModal-filename-input').getByRole('button')).toHaveText(/.webm/);
    await expect(page.getByTestId('saveMediaModal-filename-input').getByRole('button')).not.toHaveText(/.gif/);
    //pause and unpause "GIF"
    await page.getByTestId('saveMediaModal').getByTestId('externalGIF-container').click();
    await expect(page.getByTestId('saveMediaModal').locator('video')).toHaveJSProperty('paused',true);
    await page.getByTestId('saveMediaModal').getByTestId('externalGIF-container').click();
    await expect(page.getByTestId('saveMediaModal').locator('video')).toHaveJSProperty('paused',false);
    //close SaveMediaModal
    await expect(page.getByTestId('saveMediaModal-close')).toBeVisible();
    await page.getByTestId('saveMediaModal-close').click({position:{x:1,y:1}});
    await expect(page.getByTestId('saveMediaModal-close')).toBeHidden();
    //pause "GIF" held in replies
    await page.getByTestId('postThreadView').getByTestId('imageContainer-externalGIF').click();
    await expect(page.getByTestId('postThreadView').locator('video')).toHaveJSProperty('paused', true);
})