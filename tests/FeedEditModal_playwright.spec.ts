import test, { expect } from "@playwright/test";
import { CreateActorSearchResults, CreateGetFeedGeneratorsResponse, CreateGetPopularFeedGeneratorsResponse, CreateUserProfile } from "../src/fake-data/DataFactory";
import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { OutputSchema as getFeedGeneratorsOutputSchema } from "@atproto/api/dist/client/types/app/bsky/feed/getFeedGenerators";
import { OutputSchema as getPopularFeedGeneratorsOutputSchema } from "@atproto/api/dist/client/types/app/bsky/unspecced/getPopularFeedGenerators";
import { Response as getFeedGeneratorsResponse} from "@atproto/api/dist/client/types/app/bsky/feed/getFeedGenerators";
import { Response as getPopularFeedGeneratorsResponse} from "@atproto/api/dist/client/types/app/bsky/unspecced/getPopularFeedGenerators";

let handle1:string = 'tester.da.playwright';
let handle2:string = 'mock.ofthe.day';
let handle3:string = 'reply.on.parent';
let handle4:string = 'reply.on.reply2';
let displayName1:string = 'I AM A TESTER';
let displayName2:string = `tester don't play that`;
let displayName3:string = `REPLIER ONE`;
let actorSearchResults = CreateActorSearchResults();
let getFeedGeneratorResponse:getFeedGeneratorsOutputSchema;
let getPopularFeedGeneratorResponse:getPopularFeedGeneratorsOutputSchema;
let profile1 = await CreateUserProfile(handle1,displayName2);

test.beforeAll(async ({browser}) => {
    await CreateGetFeedGeneratorsResponse().then(res => {
        getFeedGeneratorResponse = res;
    })
    await CreateGetPopularFeedGeneratorsResponse().then(res => {
        getPopularFeedGeneratorResponse = res;
    })
})

test('Ensure Feeds of each type can be added and removed "out of order"', async({context},testInfo) => {
    //set up tabs
    // const context = await browser.newContext();
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
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(profile1)
        });
    });
    await context.route(/app.bsky.feed.getFeedGenerators/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(getFeedGeneratorResponse)
        });
    });
    await context.route(/app.bsky.unspecced.getPopularFeedGenerators/, route => {
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(getPopularFeedGeneratorResponse)
        });
    });

    //go to app home page
    await instance1.goto(`/`,{waitUntil:'networkidle'});

    //browse as guest
    await instance1.getByTestId('add-feed-button').click();
    await instance1.getByTestId('browse-as-guest-button').click();
    //add new User Feed
    await instance1.getByTestId('add-feed-button').click();
    await instance1.getByTestId('feedEditModal-user-feed-button').click();
    await instance1.getByTestId('feedEditModal-user-search-bar').getByRole('textbox').fill('username');
    await instance1.getByTestId('feedEditModal-user-search-bar').getByRole('button').click();
    await expect(instance1.getByTestId('user-search-bar-result').nth(0)).toBeVisible();
    await instance1.getByTestId('user-search-bar-result').nth(0).click();
    await expect(instance1.getByTestId('feedEditModal-next-page-button')).toBeVisible();
    //add trending Feed
    await instance1.getByTestId('feedEditModal-trending-feed-button').click();
    await instance1.getByTestId('feedEditModal-add-trending-feed-button').click();
    await expect(instance1.getByText('# of Feeds:2')).toBeVisible();
    //add 2 tag Feeds
    await instance1.getByTestId('feedEditModal-tag-feed-button').click();
    await instance1.getByTestId('feedEditModal-tag-input').getByRole('textbox').fill('test');
    await instance1.getByTestId('feedEditModal-tag-input').getByRole('textbox').press('Enter');
    await instance1.getByTestId('tag-entry-submit-tags').click();
    await instance1.getByTestId('feedEditModal-tag-input').getByRole('textbox').fill('dev');
    await instance1.getByTestId('feedEditModal-tag-input').getByRole('textbox').press('Enter');
    await instance1.getByTestId('tag-entry-submit-tags').click();
    await expect(instance1.getByTestId('feedEditModal-tag-feed-list').getByRole('button')).toHaveCount(2);//2 feed summaries should be displayed
    await expect(instance1.getByText('# of Feeds:4')).toBeVisible();
    //add Custom Feed
    await instance1.getByTestId('feedEditModal-custom-feed-button').click();
    await expect(instance1.getByTestId('feedEditModal-custom-feed-list').getByRole('button')).toHaveCount(5);//5 custom feeds should be displayed
    await instance1.getByTestId('feedEditModal-custom-feed-list').getByRole('button').nth(1).click();
    await expect(instance1.getByText('# of Feeds:5')).toBeVisible();

    //Navigate to summary page
    // await instance1.getByTestId('feedEditModal-next-page-button').click();
    // await expect(instance1.getByTestId('feedEditModal-summary-page')).toBeVisible();
})