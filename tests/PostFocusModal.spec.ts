import test, { expect } from "@playwright/test";
import { CreateActorSearchResults, CreateFeedViewPost, CreateThreadViewPost, CreateThreadViewPostWithUnspeccedCID, CreateUserProfile, FindThreadViewPostReply } from "../src/fake-data/DataFactory";
import { $Typed, AppBskyFeedDefs, AppBskyFeedGetPostThread } from "@atproto/api";

let handle1:string = 'tester.da.playwright';
let handle2:string = 'mock.ofthe.day';
let handle3:string = 'reply.on.parent';
let handle4:string = 'reply.on.reply2';
let displayName1:string = 'I AM A TESTER';
let displayName2:string = `tester don't play that`;
let displayName3:string = `REPLIER ONE`;
let actorSearchResults = CreateActorSearchResults();
let profile1 = await CreateUserProfile(handle1,displayName2);
let post1:AppBskyFeedDefs.FeedViewPost;
let post2:AppBskyFeedDefs.FeedViewPost;
let threadViewPost1:AppBskyFeedGetPostThread.OutputSchema;
let threadViewPost2:$Typed<AppBskyFeedDefs.ThreadViewPost>;
let threadViewPost3:$Typed<AppBskyFeedDefs.ThreadViewPost>;
let threadViewPost4:$Typed<AppBskyFeedDefs.ThreadViewPost>;
let threadViewPost5:$Typed<AppBskyFeedDefs.ThreadViewPost>;
let threadViewPost6:$Typed<AppBskyFeedDefs.ThreadViewPost>;
let threadViewPost7:$Typed<AppBskyFeedDefs.ThreadViewPost>;
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
    threadViewPost5 = CreateThreadViewPostWithUnspeccedCID(handle4,'I am reply 1 on reply 2...',{activate:true,type:'img'},false,displayName3);
    threadViewPost6 = CreateThreadViewPostWithUnspeccedCID(handle4,'I am reply 2 on reply 2...',{activate:true,type:'img'},false,displayName3);
    threadViewPost7 = CreateThreadViewPostWithUnspeccedCID(handle4,'I am reply 3 on reply 2...',{activate:true,type:'img'},false,displayName3);
    await CreateThreadViewPost(handle1,postText1,{activate:true,type:'img'},false,{activate:true,images:true,type:'ext_gif'},displayName1).then(res =>{
        let threadParent = res;
        threadViewPost3.replies = [threadViewPost5,threadViewPost6,threadViewPost7]
        threadParent.replies = [threadViewPost2,threadViewPost3,threadViewPost4];
        // console.log(`Debug for setting up tests - post2.post.uri: ${post2.post.uri}`);
        threadParent.post.uri = post2.post.uri;
        // console.log(`Debug for setting up tests - threadParent.post.uri: ${threadParent.post.uri}`);
        threadViewPost1 = {thread:threadParent as $Typed<AppBskyFeedDefs.ThreadViewPost>}
        // console.log(`Debug for setting up tests - threadViewPost1.thread.post.uri: ${(threadViewPost1.thread as $Typed<AppBskyFeedDefs.ThreadViewPost>).post.uri}`);
    })
})

test('Ensure scroll position for reply container is remembered when navigating through reply tree - Desktop layout', async({browser},testInfo) => {
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
        let f:AppBskyFeedDefs.FeedViewPost[] = [];
        if(feedIndex<returnedFeeds.length) f = returnedFeeds[feedIndex];
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({feed:f})
        });
        // feedIndex++; //for some reason `getAuthorFeed()` is being called twice - one of which is completely unexpected - which is causing the expected behavior to fail...
    });
    await context.route(/app.bsky.feed.getPostThread/, route => {
        const postUrl = new URL(route.request().url());
        // console.log(`Debug for getPostThread() postUrl: ${postUrl}`);
        const postUri = postUrl.searchParams.get('uri');
        let postId = '';
        if(postUrl != null && postUri != null){
            let urlSections = postUri.split('/');
            if(urlSections.length>1) postId = urlSections[urlSections.length-1];
        }
        // console.log(`Debug for getPostThread() postId: ${postId}`);
        let result:$Typed<AppBskyFeedDefs.ThreadViewPost>|$Typed<AppBskyFeedDefs.NotFoundPost>|$Typed<AppBskyFeedDefs.BlockedPost>|{$type: string;}|boolean = {$type:"app.bsky.feed.defs#notFoundPost",uri:'at://not.found.post/sorry',notFound:true} as $Typed<AppBskyFeedDefs.NotFoundPost>;
        let searchResult = FindThreadViewPostReply(threadViewPost1.thread,postId);
        if(searchResult !== false) result = searchResult;
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            // body:JSON.stringify(threadViewPost1)
            body:JSON.stringify({thread:result} as AppBskyFeedGetPostThread.OutputSchema)
        });
    });
    //go to app home page
    await instance1.goto(`/`,{waitUntil:'networkidle'});

    //browse as guest
    await instance1.getByTestId('add-feed-button').click();
    await instance1.getByTestId('browse-as-guest-button').click();
    //add new feed
    await instance1.getByTestId('feedEditModal-user-feed-button').click();
    await instance1.getByTestId('feedEditModal-user-search-bar').getByRole('textbox').fill('username');
    await instance1.getByTestId('feedEditModal-user-search-bar').getByRole('textbox').press('Enter');
    await expect(instance1.getByTestId('user-search-bar-result').nth(0)).toBeVisible();
    await instance1.getByTestId('user-search-bar-result').nth(0).click();
    await expect(instance1.getByTestId('feedEditModal-next-page-button')).toBeVisible();
    await instance1.getByTestId('feedEditModal-next-page-button').click();
    await expect(instance1.getByTestId('feedEditModal-summary-page')).toBeVisible();
    await expect(instance1.getByTestId('feedEditModal-summary-page-feed-list').getByTestId('feedStackButton-display-only-item')).toHaveCount(1);
    await expect(instance1.getByText('create feed')).toBeVisible();
    await instance1.getByTestId('feedEditModal-create-button').click();
    await expect(instance1.getByTestId('feed-edit-modal')).toBeHidden();

    //CHECK THAT THREAD BRANCH HISTORY + SCROLL POSITION RESTORE WORKS AS EXPECTED
    //open Post in PostFocusModal
    await instance1.getByTestId('focusFeedPost-timestamp-button').nth(0).click();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    //Scroll down reply container 100px
    await instance1.getByTestId('post-focus-modal-side').evaluate(e => e.scrollTop += 100);
    const scrollPosBefore = await instance1.getByTestId('post-focus-modal-side').evaluate((e) => {return e.scrollTop});
    expect(scrollPosBefore).toEqual(100);
    //Click on 2nd reply timestamp to view (uses dispatch so that playwright does not scroll element into position)
    await instance1.getByTestId('post-focus-modal-main').getByTestId('focusFeedPost-timestamp-button').nth(1).dispatchEvent('click');
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    //Focused post should have changed, confirm
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded').getByTestId('postFocusModal-text')).toContainText('reply 2 on the parent');
    //scroll down to see last reply
    await instance1.getByTestId('post-focus-modal-side').evaluate(e => e.scrollTop += 1000);
    const replyScrollPosBefore = await instance1.getByTestId('post-focus-modal-side').evaluate((e) => {return e.scrollTop});
    //navigate back to parent post
    await instance1.goBack();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    const scrollPosAfter = await instance1.getByTestId('post-focus-modal-side').evaluate((e) => {return e.scrollTop});
    expect(scrollPosAfter).toEqual(100);
    //go forward to reply again
    await instance1.goForward();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    //Check that reply scroll was restored correctly
    const replyScrollPosAfter = await instance1.getByTestId('post-focus-modal-side').evaluate((e) => {return e.scrollTop});
    expect(replyScrollPosAfter).toEqual(replyScrollPosBefore);

    ///CHECK THREAD BRANCH HISTORY DOES NOT BREAK WHEN USING HISTORY API (back/forwards)
    //Close `PostFocusModal`
    await instance1.getByTestId('postFocusModal-control-bar-close-button').click();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeHidden();
    //Navigate back to reply in `PostFocusModal`
    await instance1.goBack();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    //Check that the reply container scroll position is 0px
    let returnScrollPos = await instance1.getByTestId('post-focus-modal-side').evaluate((e) => {return e.scrollTop});
    expect(returnScrollPos).toEqual(0);
    //Scroll down 111px
    await instance1.getByTestId('post-focus-modal-side').evaluate(e => e.scrollTop += 111);
    returnScrollPos = await instance1.getByTestId('post-focus-modal-side').evaluate((e) => {return e.scrollTop});
    expect(returnScrollPos).toEqual(111);
    //Navigate back again to thread root
    await instance1.goBack();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    //Check that the thread root reply container scroll position is 0px
    returnScrollPos = await instance1.getByTestId('post-focus-modal-side').evaluate((e) => {return e.scrollTop});
    expect(returnScrollPos).toEqual(0);
    //Scroll down 123px
    await instance1.getByTestId('post-focus-modal-side').evaluate(e => e.scrollTop += 123);
    returnScrollPos = await instance1.getByTestId('post-focus-modal-side').evaluate((e) => {return e.scrollTop});
    expect(returnScrollPos).toEqual(123);
    //Go forward through browser history to reply
    await instance1.goForward();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    //Check that the reply container scroll position is 0px
    returnScrollPos = await instance1.getByTestId('post-focus-modal-side').evaluate((e) => {return e.scrollTop});
    expect(returnScrollPos).toEqual(0);

    //CHECK THAT THREAD BRANCH HISTORY CAN BE CREATED CORRECTLY AFTER NAVIGATING WITH HISTORY API
    //Navigate back again to thread root
    await instance1.goBack();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    //Scroll down 72px
    await instance1.getByTestId('post-focus-modal-side').evaluate(e => e.scrollTop += 72);
    returnScrollPos = await instance1.getByTestId('post-focus-modal-side').evaluate((e) => {return e.scrollTop});
    expect(returnScrollPos).toEqual(72);
    //Click on 2nd reply timestamp to view (uses dispatch so that playwright does not scroll element into position)
    await instance1.getByTestId('post-focus-modal-main').getByTestId('focusFeedPost-timestamp-button').nth(1).dispatchEvent('click');
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    //Scroll down 98px
    await instance1.getByTestId('post-focus-modal-side').evaluate(e => e.scrollTop += 98);
    returnScrollPos = await instance1.getByTestId('post-focus-modal-side').evaluate((e) => {return e.scrollTop});
    expect(returnScrollPos).toEqual(98);
    //Navigate back again to thread root
    await instance1.goBack();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    //Check that the reply container scroll position is 72px
    returnScrollPos = await instance1.getByTestId('post-focus-modal-side').evaluate((e) => {return e.scrollTop});
    expect(returnScrollPos).toEqual(72);
    //Navigate forward to 2nd reply again
    await instance1.goForward();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    //Check that the reply container scroll position is 98px
    returnScrollPos = await instance1.getByTestId('post-focus-modal-side').evaluate((e) => {return e.scrollTop});
    expect(returnScrollPos).toEqual(98);
})

test('Ensure scroll position for reply container is remembered when navigating through reply tree - Mobile layout', async({browser},testInfo) => {
    //mock feed results
    let returnedFeeds = [[post2,post1],[post1,post2]]; //allows "different" Feeds to be returned when querying `getAuthorFeed`
    let feedIndex = 0; //tracks how many `getAuthorFeed` requests have been made, used to return content from array above
    //set up tabs
    const context = await browser.newContext({viewport:{height:700,width:600}});
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
        let f:AppBskyFeedDefs.FeedViewPost[] = [];
        if(feedIndex<returnedFeeds.length) f = returnedFeeds[feedIndex];
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({feed:f})
        });
        // feedIndex++;
    });
    await context.route(/app.bsky.feed.getPostThread/, route => {
        const postUrl = new URL(route.request().url());
        const postUri = postUrl.searchParams.get('uri');
        let postId = '';
        if(postUrl != null && postUri != null){
            let urlSections = postUri.split('/');
            if(urlSections.length>1) postId = urlSections[urlSections.length-1];
        }
        let result:$Typed<AppBskyFeedDefs.ThreadViewPost>|$Typed<AppBskyFeedDefs.NotFoundPost>|$Typed<AppBskyFeedDefs.BlockedPost>|{$type: string;}|boolean = {$type:"app.bsky.feed.defs#notFoundPost",uri:'at://not.found.post/sorry',notFound:true} as $Typed<AppBskyFeedDefs.NotFoundPost>;
        let searchResult = FindThreadViewPostReply(threadViewPost1.thread,postId);
        if(searchResult !== false) result = searchResult;
        route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            // body:JSON.stringify(threadViewPost1)
            body:JSON.stringify({thread:result} as AppBskyFeedGetPostThread.OutputSchema)
        });
    });
    //go to app home page
    await instance1.goto(`/`,{waitUntil:'networkidle'});

    //browse as guest
    await instance1.getByTestId('add-feed-button').click();
    await instance1.getByTestId('browse-as-guest-button').click();
    //add new feed
    await instance1.getByTestId('feedEditModal-user-feed-button').click();
    await instance1.getByTestId('feedEditModal-user-search-bar').getByRole('textbox').fill('username');
    await instance1.getByTestId('feedEditModal-user-search-bar').getByRole('textbox').press('Enter');
    await expect(instance1.getByTestId('user-search-bar-result').nth(0)).toBeVisible();
    await instance1.getByTestId('user-search-bar-result').nth(0).click();
    await expect(instance1.getByTestId('feedEditModal-next-page-button')).toBeVisible();
    await instance1.getByTestId('feedEditModal-next-page-button').click();
    await expect(instance1.getByTestId('feedEditModal-summary-page')).toBeVisible();
    await expect(instance1.getByTestId('feedEditModal-summary-page-feed-list').getByTestId('feedStackButton-display-only-item')).toHaveCount(1);
    await expect(instance1.getByText('create feed')).toBeVisible();
    await instance1.getByTestId('feedEditModal-create-button').click();
    await expect(instance1.getByTestId('feed-edit-modal')).toBeHidden();

    //CHECK THAT THREAD BRANCH HISTORY + SCROLL POSITION RESTORE WORKS AS EXPECTED
    //open Post in PostFocusModal
    await instance1.getByTestId('focusFeedPost-timestamp-button').nth(0).click();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    //Scroll down reply container 100px
    await instance1.getByTestId('post-focus-modal-main').evaluate(e => e.scrollTop += 100);
    const scrollPosBefore = await instance1.getByTestId('post-focus-modal-main').evaluate((e) => {return e.scrollTop});
    expect(scrollPosBefore).toEqual(100);
    //Click on 2nd reply timestamp to view (uses dispatch so that playwright does not scroll element into position)
    await instance1.getByTestId('post-focus-modal-main').getByTestId('focusFeedPost-timestamp-button').nth(1).dispatchEvent('click');
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    //Focused post should have changed, confirm
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded').getByTestId('postFocusModal-text')).toContainText('reply 2 on the parent');
    //scroll down to see last reply
    await instance1.getByTestId('post-focus-modal-main').evaluate(e => e.scrollTop += 1000);
    const replyScrollPosBefore = await instance1.getByTestId('post-focus-modal-main').evaluate((e) => {return e.scrollTop});
    //navigate back to parent post
    await instance1.goBack();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    const scrollPosAfter = await instance1.getByTestId('post-focus-modal-main').evaluate((e) => {return e.scrollTop});
    expect(scrollPosAfter).toEqual(100);
    //go forward to reply again
    await instance1.goForward();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    //Check that reply scroll was restored correctly
    const replyScrollPosAfter = await instance1.getByTestId('post-focus-modal-main').evaluate((e) => {return e.scrollTop});
    expect(replyScrollPosAfter).toEqual(replyScrollPosBefore);

    ///CHECK THREAD BRANCH HISTORY DOES NOT BREAK WHEN USING HISTORY API (back/forwards)
    //Close `PostFocusModal`
    await instance1.getByTestId('postFocusModal-control-bar-close-button').click();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeHidden();
    //Navigate back to reply in `PostFocusModal`
    await instance1.goBack();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    //Check that the reply container scroll position is 0px
    let returnScrollPos = await instance1.getByTestId('post-focus-modal-main').evaluate((e) => {return e.scrollTop});
    expect(returnScrollPos).toEqual(0);
    //Scroll down 111px
    await instance1.getByTestId('post-focus-modal-main').evaluate(e => e.scrollTop += 111);
    returnScrollPos = await instance1.getByTestId('post-focus-modal-main').evaluate((e) => {return e.scrollTop});
    expect(returnScrollPos).toEqual(111);
    //Navigate back again to thread root
    await instance1.goBack();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    //Check that the thread root reply container scroll position is 0px
    returnScrollPos = await instance1.getByTestId('post-focus-modal-main').evaluate((e) => {return e.scrollTop});
    expect(returnScrollPos).toEqual(0);
    //Scroll down 123px
    await instance1.getByTestId('post-focus-modal-main').evaluate(e => e.scrollTop += 123);
    returnScrollPos = await instance1.getByTestId('post-focus-modal-main').evaluate((e) => {return e.scrollTop});
    expect(returnScrollPos).toEqual(123);
    //Go forward through browser history to reply
    await instance1.goForward();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    //Check that the reply container scroll position is 0px
    returnScrollPos = await instance1.getByTestId('post-focus-modal-main').evaluate((e) => {return e.scrollTop});
    expect(returnScrollPos).toEqual(0);

    //CHECK THAT THREAD BRANCH HISTORY CAN BE CREATED CORRECTLY AFTER NAVIGATING WITH HISTORY API
    //Navigate back again to thread root
    await instance1.goBack();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    //Scroll down 72px
    await instance1.getByTestId('post-focus-modal-main').evaluate(e => e.scrollTop += 72);
    returnScrollPos = await instance1.getByTestId('post-focus-modal-main').evaluate((e) => {return e.scrollTop});
    expect(returnScrollPos).toEqual(72);
    //Click on 2nd reply timestamp to view (uses dispatch so that playwright does not scroll element into position)
    await instance1.getByTestId('post-focus-modal-main').getByTestId('focusFeedPost-timestamp-button').nth(1).dispatchEvent('click');
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    //Scroll down 98px
    await instance1.getByTestId('post-focus-modal-main').evaluate(e => e.scrollTop += 98);
    returnScrollPos = await instance1.getByTestId('post-focus-modal-main').evaluate((e) => {return e.scrollTop});
    expect(returnScrollPos).toEqual(98);
    //Navigate back again to thread root
    await instance1.goBack();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    //Check that the reply container scroll position is 72px
    returnScrollPos = await instance1.getByTestId('post-focus-modal-main').evaluate((e) => {return e.scrollTop});
    expect(returnScrollPos).toEqual(72);
    //Navigate forward to 2nd reply again
    await instance1.goForward();
    await expect(instance1.getByTestId('postFocusModal-focus-post-loaded')).toBeVisible();
    //Check that the reply container scroll position is 98px
    returnScrollPos = await instance1.getByTestId('post-focus-modal-main').evaluate((e) => {return e.scrollTop});
    expect(returnScrollPos).toEqual(98);
})