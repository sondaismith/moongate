import test, { expect } from "@playwright/test";
import { CreateActorSearchResults, CreateFeedViewPost, CreateThreadViewPost, CreateThreadViewPostWithUnspeccedCID, CreateUserProfile, FindThreadViewPostReply } from "../src/fake-data/DataFactory";
import { FeedViewPost, ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { $Typed, AppBskyFeedGetPostThread } from "@atproto/api";

let handle1:string = 'tester.da.playwright';
let handle2:string = 'mock.ofthe.day';
let handle3:string = 'reply.on.parent';
let displayName1:string = 'I AM A TESTER';
let displayName2:string = `tester don't play that`;
let displayName3:string = `REPLIER ONE`;
let actorSearchResults = CreateActorSearchResults();
let profile1 = await CreateUserProfile(handle1,displayName2);
let post1:FeedViewPost;
let post2:FeedViewPost;
let threadViewPost1:AppBskyFeedGetPostThread.OutputSchema;
let threadViewPost2:$Typed<ThreadViewPost>;
let threadViewPost3:$Typed<ThreadViewPost>;
let threadViewPost4:$Typed<ThreadViewPost>;
let threadViewPost5:$Typed<ThreadViewPost>;
let threadViewPost6:$Typed<ThreadViewPost>;
let postText1 = "Lorem ipsum dipsum, dimsum, mmm I'm hungry";
let postText2 = "This is the 2nd time I have posted. Yipee!";
let currentDateTime = new Date();

test.beforeAll(async ({browser}) => {
    await CreateFeedViewPost(handle1,postText1,undefined,displayName2,currentDateTime,undefined,"None").then(res => {
        post1 = res;
    });
    await CreateFeedViewPost(handle2,postText2,undefined,displayName1,currentDateTime,undefined,"None").then(res => {
        post2 = res;
    });
    threadViewPost2 = CreateThreadViewPostWithUnspeccedCID(handle3,'I am reply 1 on the parent post...',{activate:true,type:'img'},false,displayName3);
    threadViewPost3 = CreateThreadViewPostWithUnspeccedCID(handle3,'I am reply 2 on the parent post...',{activate:true,type:'img'},false,displayName3);
    threadViewPost4 = CreateThreadViewPostWithUnspeccedCID(handle3,'I am reply 3 on the parent post...',{activate:true,type:'img'},false,displayName3);
    await CreateThreadViewPost(handle1,postText1,{activate:true,type:'img'},false,{activate:true,images:true,type:'ext_gif'},displayName1).then(res =>{
        let threadParent = res;
        threadParent.replies = [threadViewPost2,threadViewPost3,threadViewPost4];
        threadParent.post.uri = post2.post.uri;
        threadViewPost1 = {thread:threadParent as $Typed<ThreadViewPost>}
    })
})

test('Ensure scroll position for reply container is remembered when navigating through reply tree', async({browser},testInfo) => {
    //mock feed results
    let returnedFeeds = [[post2,post1],[post1,post2]]; //allows "different" Feeds to be returned when querying `getAuthorFeed`
    let feedIndex = 0; //tracks how many `getAuthorFeed` requests have been made, used to return content from array above
    //set up tabs
    const context = await browser.newContext();
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
    await context.route(/app.bsky.feed.getPostThread/, route => {
        const postUrl = new URL(route.request().url());
        const postUri = postUrl.searchParams.get('uri');
        let postId = '';
        if(postUrl != null && postUri != null){
            console.log('playwright getPostThread route handling')
            console.log(postUrl.searchParams.get('uri'));
            let urlSections = postUri.split('/');
            if(urlSections.length>1) postId = urlSections[urlSections.length-1];
        }
        console.log(`Post id for selected post is: ${postId}`);//DEBUG
        console.log('Parent ThreadViewPost:');//DEBUG
        console.log(threadViewPost1.thread);//DEBUG
        console.log('Looking for matched object...result:');//DEBUG
        console.log(FindThreadViewPostReply(threadViewPost1.thread,postId));//DEBUG
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(threadViewPost1)
        });
    });
    //go to app home page
    await instance1.goto(`/`,{waitUntil:'networkidle'});

    //browse as guest
    await instance1.getByTestId('add-feed-button').click();
    await instance1.getByTestId('browse-as-guest-button').click();
    //add new feed
    await instance1.getByTestId('add-feed-button').click();
    await instance1.getByTestId('feedEditModal-user-feed-button').click();
    await instance1.getByTestId('feedEditModal-next-page-button').click();
    await instance1.getByTestId('inlainput-input').fill('username');
    await instance1.getByTestId('inlainput-input').press('Enter');
    await expect(instance1.getByTestId('user-search-bar-result').nth(0)).toBeVisible();
    // //screenshot
    // const actorResults = await instance1.screenshot();
    // await testInfo.attach('image showing mocked actor search results', {
    //     body: actorResults,
    //     contentType: 'image/png',
    // });
    // //screenshot
    // const secondTabBefore = await instance2.screenshot();
    await instance1.getByTestId('user-search-bar-result').nth(0).click();
    await expect(instance1.getByText('submit')).toBeVisible();
    await instance1.getByTestId('feedEditModal-create-button').click();
    await expect(instance1.getByTestId('feed-edit-modal')).toBeHidden();
    //open Post in PostFocusModal
    await instance1.getByTestId('focusFeedPost-timestamp-button').nth(0).click();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    // //screenshot
    const postFocusModalInitial = await instance1.screenshot();
    await testInfo.attach('image showing postfocusmodal', {
        body: postFocusModalInitial,
        contentType: 'image/png',
    });
    //Click on first reply timestamp to view
    await instance1.getByTestId('post-focus-modal').getByTestId('focusFeedPost-timestamp-button').nth(0).click();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
})