import test, { expect } from "@playwright/test";
import { CreateActorSearchResults, CreateFeedViewPost, CreateUserProfile, FindAuthorFeedResponse, FindUserProfile, IAuthorFeedStoreItem } from "../src/fake-data/DataFactory";
import { AppBskyFeedDefs, AppBskyFeedGetAuthorFeed } from "@atproto/api";

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
const userlinkText = `@${actorSearchResults.actors[1].handle}`;
let feedViewPost1:AppBskyFeedDefs.FeedViewPost = {post:emptyPostView};
let feedViewPost2:AppBskyFeedDefs.FeedViewPost = {post:emptyPostView};
let feedViewPost3:AppBskyFeedDefs.FeedViewPost = {post:emptyPostView};
/**List of Feeds that will be addded to main view after "Create Feeds" is clicked on `FeedEditModal`. Empty by default - values must be added (use `.beforeAll()`). */
let getAuthorFeedResponse1:AppBskyFeedGetAuthorFeed.OutputSchema = {feed:[]};
let getAuthorFeedResponse2:AppBskyFeedGetAuthorFeed.OutputSchema = {feed:[]};
/**List of User Profiles - acts as database and is searched to return results in `app.bsky.actor.getProfile` API mock.*/
let profileStore = [profile1,profile2,profile3];
let authorFeedStore:IAuthorFeedStoreItem[] = [{did:profile1.did,response:{} as AppBskyFeedGetAuthorFeed.OutputSchema},{did:profile2.did,response:{} as AppBskyFeedGetAuthorFeed.OutputSchema}];

let nonFocusButtonFocusClasses = 'border-2 group-focus-visible:border-focusBorder';
let focusButtonFocusClasses = 'outline-2 focus-visible:outline-focusBorder'

test.beforeAll(async ({browser}) => {
    await CreateFeedViewPost('bob.the.poster',`I love my car shop! Thanks ${userlinkText} !`,{type:'link',numImage:1},'Bob the Poster',undefined,undefined,undefined,
        {did:profile1.did,type:'mention',value:userlinkText}).then(res => feedViewPost1 = res);
    await CreateFeedViewPost('cargo.haul', 'Delivery delivery delivery delivery amazong.com',{type:'image',numImage:3},'Cargo Haul',undefined,undefined,undefined,{type:'link',value:'amazong.com',did:undefined})
    .then(res => feedViewPost2 = res);
    await CreateFeedViewPost('user.link', 'Mocking can get complicated',undefined,'Mock Test Result').then(res => feedViewPost3 = res);
    getAuthorFeedResponse1 = {feed:[feedViewPost1,feedViewPost2]};
    getAuthorFeedResponse2 = {feed:[feedViewPost3,feedViewPost2]};
    authorFeedStore = [{did:profile1.did,response:getAuthorFeedResponse1},{did:profile2.did,response:getAuthorFeedResponse2}]
})

test('Ensure "User" feed is created successfully when clicking on a Userlink element', async({context},testInfo) => {
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
        const requestUrl = route.request().url();
        let matchedAuthorFeed:AppBskyFeedGetAuthorFeed.OutputSchema|undefined;
        matchedAuthorFeed = FindAuthorFeedResponse(authorFeedStore,requestUrl);
        route.fulfill({
            status: 200 ,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(matchedAuthorFeed)
        });
    });

    //go to app home page
    await instance1.goto(`/`,{waitUntil:'networkidle'});

    //hit tab key, the app logo should be the first item focused/selected
    await instance1.keyboard.press('Tab');
    await expect(instance1.getByTestId('app-logo')).toBeFocused();
    await expect(instance1.getByTestId('app-logo')).toContainClass(focusButtonFocusClasses);
    //tab to add new feed, select to browse as guest user
    await instance1.keyboard.press('Tab');
    await expect(instance1.getByTestId('add-feed-button')).toBeFocused();
    await instance1.keyboard.press('Enter');
    await instance1.keyboard.press('Tab');
    await expect(instance1.getByTestId('browse-as-guest-button')).toBeFocused();
    await instance1.keyboard.press('Enter');
    //add new User Feed to Feed Stack
    await instance1.keyboard.press('Tab');
    await expect(instance1.getByTestId('feedEditModal-user-feed-button')).toBeFocused();
    await instance1.keyboard.press('Enter');
    await instance1.keyboard.press('Tab');
    await instance1.keyboard.press('Tab');
    await instance1.keyboard.press('Tab');
    await instance1.keyboard.press('Tab');
    await instance1.keyboard.press('Tab');
    await instance1.keyboard.press('Tab');
    await instance1.keyboard.type('username');
    await expect(instance1.getByTestId('filterbar-submit-button')).toBeEnabled();
    await instance1.keyboard.press('Tab');
    await expect(instance1.getByTestId('filterbar-submit-button')).toBeFocused();
    await instance1.keyboard.press('Enter');
    await expect(instance1.getByTestId('user-search-bar-result').nth(0)).toBeVisible();
    await instance1.keyboard.press('Tab');
    // const focusedElementText = await instance1.evaluate(() => document.activeElement?.textContent);
    // console.log(focusedElementText);
    ///expected to have to tab to the search results, but it seems like during the chromium test the focus
    ///stays on the "Submit" button...
    // await instance1.keyboard.press('Tab');
    // await instance1.keyboard.press('Tab');
    await expect(instance1.getByTestId('user-search-bar-result').nth(0)).toBeFocused();
    await instance1.keyboard.press('Enter');
    await expect(instance1.getByTestId('feedEditModal-next-page-button')).toBeVisible();
    await instance1.keyboard.press('Tab');
    await instance1.keyboard.press('Tab');
    await instance1.keyboard.press('Tab');
    await instance1.keyboard.press('Tab');
    await expect(instance1.getByTestId('feedEditModal-next-page-button')).toBeFocused();
    await expect(instance1.getByTestId('feedEditModal-next-page-button').locator('div')).toContainClass(nonFocusButtonFocusClasses);
    //navigate to summary page
    await instance1.keyboard.press('Enter');
    await expect(instance1.getByTestId('feedEditModal-summary-page')).toBeVisible();
    await expect(instance1.getByTestId('feedEditModal-summary-page-feed-list').getByTestId('feedStackButton-display-only-item')).toHaveCount(1);
    //create User Feed
    await expect(instance1.getByTestId('feedEditModal-create-button')).toBeVisible();
    await instance1.getByTestId('feedEditModal-create-button').focus();
    await expect(instance1.getByTestId('feedEditModal-create-button')).toBeFocused();
    await instance1.keyboard.press('Enter');
    // await instance1.getByTestId('feedEditModal-create-button').click();
    //Check that `FeedEditModal` has closed and 1 feed is displayed in the main view
    await expect(instance1.getByTestId('feed-edit-modal')).toBeHidden();
    await expect(instance1.getByTestId('feed-column')).toHaveCount(1);
    //focus on userlink displayed in User Feed
    await expect(instance1.getByTestId('userlink')).toHaveCount(1);
    await instance1.getByTestId('userlink').focus();
    await expect(instance1.getByTestId('userlink').locator('div')).toContainClass(nonFocusButtonFocusClasses);
    //focus `EmbedExternal` in User Feed
    await expect(instance1.getByTestId('embed-external')).toHaveCount(1);
    await instance1.getByTestId('embed-external').focus();
    await expect(instance1.getByTestId('embed-external').locator('a')).toContainClass(focusButtonFocusClasses);
    //focus each `PostInteractionIcons` element
    await expect(instance1.getByTestId('focusFeedPost').nth(0).getByTestId('postInteraction-reply-button')).toBeVisible();
    await instance1.getByTestId('focusFeedPost').nth(0).getByTestId('postInteraction-reply-button').focus();
    await expect(instance1.getByTestId('focusFeedPost').nth(0).getByTestId('postInteraction-reply-button')).toContainClass(focusButtonFocusClasses);
    await instance1.getByTestId('focusFeedPost').nth(0).getByTestId('postInteraction-repost-button').focus();
    await expect(instance1.getByTestId('focusFeedPost').nth(0).getByTestId('postInteraction-repost-button')).toContainClass(focusButtonFocusClasses);
    await instance1.getByTestId('focusFeedPost').nth(0).getByTestId('postInteraction-like-button').focus();
    await expect(instance1.getByTestId('focusFeedPost').nth(0).getByTestId('postInteraction-like-button')).toContainClass(focusButtonFocusClasses);
    await instance1.getByTestId('focusFeedPost').nth(0).getByTestId('postInteraction-more-options-button').focus();
    await expect(instance1.getByTestId('focusFeedPost').nth(0).getByTestId('postInteraction-more-options-button')).toContainClass(focusButtonFocusClasses);
    //open `UserFocusModal`
    await expect(instance1.getByTestId(/feedButton-/)).toHaveCount(1);
    await instance1.getByTestId(/feedButton-/).click({button:"right"});
    await expect(instance1.getByRole('menu')).toBeVisible();
    instance1.getByRole('menu').getByText(/View Profile/).click();
    await expect(instance1.getByTestId('user-focus-modal')).toBeVisible();
    //Check various elements on `UserFocusModal`
    await instance1.getByTestId('userFocusModal-refresh-button').focus();
    await expect(instance1.getByTestId('userFocusModal-refresh-button').locator('div')).toContainClass(nonFocusButtonFocusClasses);
    await instance1.getByTestId('userFocusModal-close-button').focus();
    await expect(instance1.getByTestId('userFocusModal-close-button').locator('div')).toContainClass(nonFocusButtonFocusClasses);
    await instance1.getByTestId('userFocusModal-banner').focus();
    await expect(instance1.getByTestId('userFocusModal-banner')).toContainClass(focusButtonFocusClasses);
    await instance1.getByTestId('userFocusModal-avatar').focus();
    await expect(instance1.getByTestId('userFocusModal-avatar').locator('button')).toContainClass(focusButtonFocusClasses);
    await instance1.getByTestId('userFocusModal-account-options').focus();
    await expect(instance1.getByTestId('userFocusModal-account-options')).toContainClass(focusButtonFocusClasses);
    await instance1.getByTestId('userFocusModal-post-tabs').locator('button').nth(0).focus();
    await expect(instance1.getByTestId('userFocusModal-post-tabs').locator('button').nth(0)).toContainClass(focusButtonFocusClasses);
    await instance1.getByTestId('userFocusModal-post-tabs').locator('button').nth(1).focus();
    await expect(instance1.getByTestId('userFocusModal-post-tabs').locator('button').nth(1)).toContainClass(focusButtonFocusClasses);
    await instance1.getByTestId('userFocusModal-post-tabs').locator('button').nth(2).focus();
    await expect(instance1.getByTestId('userFocusModal-post-tabs').locator('button').nth(2)).toContainClass(focusButtonFocusClasses);
    await instance1.getByTestId('userFocusModal-post-tabs').locator('button').nth(3).focus();
    await expect(instance1.getByTestId('userFocusModal-post-tabs').locator('button').nth(3)).toContainClass(focusButtonFocusClasses);
    await instance1.getByTestId('user-focus-modal').getByTestId('focusFeedPost-avatarRound').nth(0).focus();
    await expect(instance1.getByTestId('user-focus-modal').getByTestId('focusFeedPost-avatarRound').nth(0).locator('button')).toContainClass(focusButtonFocusClasses);
    await instance1.getByTestId('user-focus-modal').getByTestId('focusFeedPost-timestamp-button').nth(0).focus();
    //REMOVE - Need to update author Feed to include post with image (and hyperlink facet if possible)
    await expect(instance1.getByTestId('user-focus-modal').getByTestId('focusFeedPost-timestamp-button').nth(0)).toContainClass(focusButtonFocusClasses);
    await expect(instance1.getByTestId('user-focus-modal').getByTestId('imageContainer-focusFeedPost')).toBeVisible();
    await instance1.getByTestId('user-focus-modal').getByTestId('imageContainer-focusFeedPost').nth(0).getByTestId('imageContainer-focusFeedPost-image').nth(0).focus();
    await expect(instance1.getByTestId('user-focus-modal').getByTestId('imageContainer-focusFeedPost').nth(0).getByTestId('imageContainer-focusFeedPost-image').nth(0)).toContainClass(focusButtonFocusClasses);
    await instance1.keyboard.press('Tab');
    await expect(instance1.getByTestId('user-focus-modal').getByTestId('imageContainer-focusFeedPost').nth(0).getByTestId('imageContainer-focusFeedPost-image').nth(1)).toBeFocused();
    await expect(instance1.getByTestId('user-focus-modal').getByTestId('imageContainer-focusFeedPost').nth(0).getByTestId('imageContainer-focusFeedPost-image').nth(1)).toContainClass(focusButtonFocusClasses);
    await instance1.keyboard.press('Tab');
    await expect(instance1.getByTestId('user-focus-modal').getByTestId('imageContainer-focusFeedPost').nth(0).getByTestId('imageContainer-focusFeedPost-image').nth(2)).toBeFocused();
    await expect(instance1.getByTestId('user-focus-modal').getByTestId('imageContainer-focusFeedPost').nth(0).getByTestId('imageContainer-focusFeedPost-image').nth(2)).toContainClass(focusButtonFocusClasses);
    await instance1.getByTestId('user-focus-modal').getByTestId('focusFeedPost-text').nth(1).locator('a').nth(0).focus();
    await expect(instance1.getByTestId('user-focus-modal').getByTestId('focusFeedPost-text').nth(1).locator('a')).toContainClass(focusButtonFocusClasses);
})