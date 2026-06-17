import { AppBskyFeedDefs, AppBskyNotificationListNotifications, AppBskyUnspeccedDefs, AppBskyActorSearchActors, AppBskyActorDefs } from "@atproto/api";
import { CreateFeed, CreateFeedViewPost, CreateIFeedDescription, CreateNotification, CreateTrendView } from "../../fake-data/DataFactory";
import { IFeedDescription } from "../../interfaces/FeedInterfaces";
import Sidebar from '../../Sidebar.vue';
import { DeleteIndexedDBSavedFeeds, stringifyFeedListData } from "../../lib/db/local_db";
import { emptyPostView } from "../../fake-data/dumPostData";
import { web_db } from "../../lib/db/web_db";


//Creating collection of Feeds and Posts
let feedCID1 = 'testFeed1';
let feedCID2 = 'testFeed2';
// await GenerateCID('My First Feed').then(res => {
//     feedCID1 = res.toString()
// })
// await GenerateCID('Mr Repost').then(res => {
//     feedCID2 = res.toString()
// })
let post1Timestamp = new Date(2025,8,16,13,30);
let notif1Timestamp = new Date(2025,8,16,13,30);
let trend1Timestamp = new Date(2025,2,27,15,41);

let post1:AppBskyFeedDefs.FeedViewPost = {post:emptyPostView};
let post2:AppBskyFeedDefs.FeedViewPost = {post:emptyPostView};
let post3:AppBskyFeedDefs.FeedViewPost = {post:emptyPostView};
await CreateFeedViewPost('bobtheposter.social','I love my car shop!',true,undefined,post1Timestamp).then(res => post1 = res);
await CreateFeedViewPost('cargo.haul', 'Delivery delivery delivery delivery',false,undefined,new Date(2025,8,12,13,21)).then(res => post2 = res);
await CreateFeedViewPost('cargo.haul', 'Who put the box there? Me!',true,undefined,new Date(2025,7,25,17,11)).then(res => post3 = res);
// let post3 = CreateFeedViewPost('cargo.haul', 'the box is in place',undefined,undefined,new Date(2025,8,16,13,10));
let pinPost1 = CreateFeedViewPost('bobtheposter.social','Cars all day, every day!',true,undefined,new Date(2025,8,16,13,30),true);
//Take not of the Post CID and indexedAt used - determines how many "new" Posts will be displayed when refreshing
let feedDesc1 = CreateIFeedDescription('My First Feed',feedCID1,0,2,post2.post.cid,post2.post.indexedAt);
let feedDesc2 = CreateIFeedDescription('Mr Repost',feedCID2,0,3,post3.post.cid,post3.post.indexedAt);

let notif1 = CreateNotification('post_liker',"like",undefined,notif1Timestamp);
let notif2 = CreateNotification('u_will_be_mentioned',"mention","the mentioner",new Date(2025,8,16,9,3));

let trend1 = CreateTrendView('Testing','Software Dev',undefined,3421,trend1Timestamp);
let trend2 = CreateTrendView('House Ownership','Lifestyle',undefined,79,new Date(2025,8,16,20,32));
let trend3 = CreateTrendView('Naps','Lifestyle',undefined,133200,new Date(2025,4,9,8,11));
let trend4 = CreateTrendView('F1','Sport',undefined,11766,new Date(2025,4,12,14,20));

let feed1 = CreateFeed([post1,post2],feedDesc1);
let feed2 = CreateFeed([post1,post2,post3],feedDesc2);

/**
 * Test Feed data. Used to define the starting Feed displayed
 * during testing.
 */
// var testFeedData = {
//     feed: [post1,post2],
// }

interface IFakeBackend{
    feed:AppBskyFeedDefs.FeedViewPost[]|AppBskyNotificationListNotifications.Notification[]|AppBskyUnspeccedDefs.TrendView[],
    feedDesciption:IFeedDescription,
    /**The User details of the owner of the "User Feed". */
    user:AppBskyActorDefs.ProfileView,
}

var fakeBackend:IFakeBackend[] = [
    {
        feed:feed1.data,
        feedDesciption:feed1.description,
        user:{
            did:feed1.description.feedSourceDID,
            handle:'bobtheposter.social',
            displayName:'Bob the Poster',
            avatar:`http://localhost:1420${import.meta.env.BASE_URL.replace('src','iframes/src')}assets/test-media/posts/image08.png`
        }
    },
    {
        feed:feed2.data,
        feedDesciption:feed2.description,
        user:{
            did:feed1.description.feedSourceDID,
            handle:'cargo.haul',
            displayName:'cargo.haul',
            avatar:`http://localhost:1420${import.meta.env.BASE_URL.replace('src','iframes/src')}assets/test-media/posts/image02.png`
        }
    },
]

function getFakeAuthorFeed(feedID:string):AppBskyFeedDefs.FeedViewPost[]|AppBskyNotificationListNotifications.Notification[]|AppBskyUnspeccedDefs.TrendView[]{
    let result:AppBskyFeedDefs.FeedViewPost[]|AppBskyNotificationListNotifications.Notification[]|AppBskyUnspeccedDefs.TrendView[] = [];
    let fakeAPIResult = fakeBackend.find(f => f.feedDesciption.feedId == feedID);
    if(fakeAPIResult) result = fakeAPIResult.feed;
    return result;
}

/**
 * Mock method used to simulate the act of calling `searchActors` on Bluesky's API.
 * Used during testing.
 * @param searchName The name of the User being searched.
 * @returns A collection of Users matching the searched name.
 */
function getFakeSearchActors(searchName:string):AppBskyActorSearchActors.Response{
    let response:AppBskyActorSearchActors.Response = {data:{actors:[]},headers:{status:'200'},success:true};
    let fakeAPIResult = fakeBackend.filter(f => f.user.handle.includes(searchName));
    if(fakeAPIResult){
        response = {
            data:{
                actors:fakeAPIResult.map(f => f.user)
            },
            headers:{status:'200'},
            success:true
        }
    }
    return response;
}

describe("Test Suite for `UnreadMsgCount`", () => {
    beforeEach(() => {
        cy.intercept('GET','**/app.bsky.actor.getProfile*', (req) => {
            //DEBUG
            // console.log(req);
            req.reply({
                body:{
                    did: "did:plc:6unmjnerkpiy3yh6x4auqpy3",
                    handle: "dummyplug.bsky.social",
                    displayName: "dummyplug",
                    avatar: "https://cdn.bsky.app/img/avatar/plain/did:plc:6unmjnerkpiy3yh6x4auqpy3/bafkreidaesr327h5xfnc4zthmx2hbazbxhxzfd763mfaw7czjrdi3jtpyy@jpeg",
                    // avatar: "",
                    associated: {
                        lists: 1,
                        feedgens: 0,
                        starterPacks: 0,
                        labeler: false,
                        activitySubscription: {
                            allowSubscriptions: "followers"
                        }
                    },
                    labels: [],
                    createdAt: "2025-02-23T13:31:10.344Z",
                    description: "Test test, is this thing on?\n@dummyplug\n#test",
                    indexedAt: "2025-04-01T13:57:23.595Z",
                    banner: "https://cdn.bsky.app/img/banner/plain/did:plc:6unmjnerkpiy3yh6x4auqpy3/bafkreigrzfaig25chcqyhryhowmujmqezdwycfpp2n6ukxj2ghxmmyztsq@jpeg",
                    // banner: "",
                    followersCount: 2,
                    followsCount: 4,
                    postsCount: 45,
                    pinnedPost: {
                        cid: "bafyreibiv5xfp7ium6ekcgz7flmwpfcjmroflez5ydjosfzoan2i6g2uza",
                        uri: "at://did:plc:6unmjnerkpiy3yh6x4auqpy3/app.bsky.feed.post/3lla4vyoe2r2c"
                    }
                },
                statusCode: 200
            });
            console.log(req);
        }).as('getProfileTest');
        //Intercept getAuthorFeed request and return test data
        cy.intercept('GET','**/app.bsky.feed.getAuthorFeed*', (req) => {
            //DEBUG
            // console.log(req);
            let apiResult = getFakeAuthorFeed(req.query.actor);
            req.reply({
                body:{feed:apiResult},
                statusCode: 200,
                delay:500,
            });
            console.log(req);
        }).as('getAuthorFeedTest');
        //Intercept searchActors request and return test data
        cy.intercept('GET','**/app.bsky.actor.searchActors*', (req) => {
            //DEBUG
            let apiResult = getFakeSearchActors(req.query.q).data;
            req.reply({
                body:apiResult,
                statusCode: 200,
                delay:200,
            });
            console.log(req);
        }).as('searchActorsTest');
    })

    it('starts with no saved Feeds, adds 1 new User Feed, no unreadMsgCount should display, refresh Feed, loading spinner should display', () => {
        cy.mount(Sidebar,{
            global:{
                stubs:{transition:false, 'transition-group': false},
            },
        })
        .then(({wrapper}) => {
            console.log(wrapper.vm.$data);
            // wrapper.vm.$data.FeedState.FeedList = [feed1,feed2];
            // wrapper.vm.$data.AppState.isUpdatingFeedPosition = false; //modal seems to stay open from prev test, this makes sure it's closed
            // wrapper.vm.$data.AppState.isUpdatingFeedPosition = false; //modal seems to stay open from prev test, this makes sure it's closed
            wrapper.vm.$data.AppState.canBrowse = true; //Setting User to guest browsing
            wrapper.vm.$data.AppState.isGuestBrowsing = true;
            web_db.savedFeeds.put({id:1, data:stringifyFeedListData([])})//make sure saved Feeds are empty
            .then(res => console.log(res))
            .catch(err => console.log(err));
        })
        // DeleteIndexedDBSavedFeeds();
        cy.get('[data-testid^="feedButton-"').should('have.length',0); //No FeedButtons should display
        cy.get('[data-testid^="add-feed-button"').click(); //Move to create new User Feed
        cy.get('[data-testid="feedEditModal-user-feed-button"').click();
        cy.get('[data-testid="feedEditModal-next-page-button"').click();
        cy.get('[data-testid="inlainput-input"').type('bob{enter}'); //Search for User
        cy.get('[data-testid="user-search-bar-result"').should('have.length',1);
        cy.get('[data-testid="user-search-bar-result"').eq(0).click(); //Select User
        cy.get('[data-testid="feedEditModal-create-button"').click(); //Finalize Feed creation
        cy.get('[data-testid^="unreadMsgCount"').should('have.length',0); //No UnreadMsgCount should display
        cy.get('[data-testid^="feedColumn-refresh-button"').click(); //Refresh Feed
        cy.get('[data-testid^="unreadMsgCount"').eq(0).children('svg').should('exist'); //Loading spinner should display
    })

    it('loads 2 saved Feeds from IndexedDB, `UnreadMsgCount` displays on both `FeedButton` elements, correct "new posts" value should be shown for both', () => {
        cy.mount(Sidebar,{
            global:{
                stubs:{transition:false, 'transition-group': false},
            },
        })
        .then(({wrapper}) => {
            console.log(wrapper.vm.$data);
            wrapper.vm.$data.AppState.canBrowse = true; //Setting User to guest browsing
            wrapper.vm.$data.AppState.isGuestBrowsing = true;
            wrapper.vm.$data.FeedState.FeedList = []; //Make sure any Feeds added in an earlier test are cleared
            web_db.savedFeeds.put({id:1, data:stringifyFeedListData([feed1,feed2])})
            .then(res => console.log(res))
            .catch(err => console.log(err));
        })
        // DeleteIndexedDBSavedFeeds();
        cy.get('[data-testid^="unreadMsgCount"').should('have.length',2);
        //Loading spinner should be displayed
        cy.get('[data-testid^="unreadMsgCount"').eq(0).children('svg').should('exist');
        cy.get('[data-testid^="unreadMsgCount"').eq(1).children('svg').should('exist');
        //Correct number of new posts should be displayed
        cy.get('[data-testid^="unreadMsgCount"').eq(0).should('contain', 1);
        cy.get('[data-testid^="unreadMsgCount"').eq(1).should('contain', 2);
    })

    it('has 1 Feed loaded (not from IndexedDB), that Feed is refreshed, loading spinner should show, correct "new posts" value should be shown, feed is refreshed a 2nd time, loading spinner should display again', () => {
        cy.mount(Sidebar,{
            global:{
                stubs:{transition:false, 'transition-group': false},
            },
        })
        .then(({wrapper}) => {
            console.log(wrapper.vm.$data);
            wrapper.vm.$data.AppState.canBrowse = true; //Setting User to guest browsing
            wrapper.vm.$data.AppState.isGuestBrowsing = true;
            web_db.savedFeeds.put({id:1, data:'{}'})
            .then(res => console.log('Emptied IndexedDB as part of testing'))
            .catch(err => console.log('Error: Was unable to empty IndexedDB during test'));
            // wrapper.vm.$data.FeedState.FeedList = []; //Make sure any Feeds added in an earlier test are cleared
            wrapper.vm.$data.FeedState.FeedList = [feed1];
        })
        cy.get('[data-testid^="feedButton-"').should('have.length',1);
        cy.wait(400);
        cy.get('[data-testid^="feedColumn-refresh-button"').click(); //Refresh Feed
        cy.get('[data-testid^="unreadMsgCount"').eq(0).children('svg').should('exist'); //Loading spinner should be displayed
        cy.get('[data-testid^="unreadMsgCount"').eq(0).should('contain', 1); //Correct number of new posts should be displayed
        cy.get('[data-testid^="feedColumn-refresh-button"').should('be.enabled'); //wait till refresh can be clicked again
        cy.get('[data-testid^="feedColumn-refresh-button"').click(); //Refresh Feed again
        cy.get('[data-testid^="unreadMsgCount"').eq(0).children('svg').should('exist'); //Loading spinner should be displayed
        cy.get('[data-testid^="feedColumn-refresh-button"').should('be.enabled'); //wait till refresh can be clicked again
        cy.get('[data-testid^="feedColumn-refresh-button"').click(); //Refresh Feed one more time
        cy.get('[data-testid^="unreadMsgCount"').eq(0).children('svg').should('exist'); //Loading spinner should be displayed
    })
})