import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { CreateFeed, CreateFeedViewPost, CreateIFeedDescription, CreateNotification, CreateTrendView } from "../../fake-data/DataFactory";
import { Notification } from "@atproto/api/dist/client/types/app/bsky/notification/listNotifications";
import { TrendView } from "@atproto/api/dist/client/types/app/bsky/unspecced/defs";
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

let post1:FeedViewPost = {post:emptyPostView};
let post2:FeedViewPost = {post:emptyPostView};
await CreateFeedViewPost('bobtheposter.social','I love my car shop!',true,undefined,post1Timestamp).then(res => post1 = res);
await CreateFeedViewPost('cargo.haul', 'Delivery delivery delivery delivery',false,undefined,new Date(2025,8,16,13,21)).then(res => post2 = res);
// let post3 = CreateFeedViewPost('cargo.haul', 'the box is in place',undefined,undefined,new Date(2025,8,16,13,10));
let pinPost1 = CreateFeedViewPost('bobtheposter.social','Cars all day, every day!',true,undefined,new Date(2025,8,16,13,30),true);
let feedDesc1 = CreateIFeedDescription('My First Feed',feedCID1,0,2,post1.post.cid,post1.post.indexedAt);
let feedDesc2 = CreateIFeedDescription('Mr Repost',feedCID2,0,3,post2.post.cid,post2.post.indexedAt);

let notif1 = CreateNotification('post_liker',"like",undefined,notif1Timestamp);
let notif2 = CreateNotification('u_will_be_mentioned',"mention","the mentioner",new Date(2025,8,16,9,3));

let trend1 = CreateTrendView('Testing','Software Dev',undefined,3421,trend1Timestamp);
let trend2 = CreateTrendView('House Ownership','Lifestyle',undefined,79,new Date(2025,8,16,20,32));
let trend3 = CreateTrendView('Naps','Lifestyle',undefined,133200,new Date(2025,4,9,8,11));
let trend4 = CreateTrendView('F1','Sport',undefined,11766,new Date(2025,4,12,14,20));

let feed1 = CreateFeed([post1,post2],feedDesc1);
let feed2 = CreateFeed([post2,post2,post1],feedDesc2);

/**
 * Test Feed data. Used to define the starting Feed displayed
 * during testing.
 */
// var testFeedData = {
//     feed: [post1,post2],
// }

interface IFakeBackend{
    feed:FeedViewPost[]|Notification[]|TrendView[],
    feedDesciption:IFeedDescription
}

var fakeBackend:IFakeBackend[] = [
    {
        feed:feed1.data,
        feedDesciption:feed1.description
    },
    {
        feed:feed2.data,
        feedDesciption:feed2.description
    },
]

function getFakeAuthorFeed(feedID:string):FeedViewPost[]|Notification[]|TrendView[]{
    let result:FeedViewPost[]|Notification[]|TrendView[] = [];
    let fakeAPIResult = fakeBackend.find(f => f.feedDesciption.feedId == feedID);
    if(fakeAPIResult) result = fakeAPIResult.feed;
    return result;
}

describe("Test Suite for `UnreadMsgCount`", () => {
    before(() => {
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
                delay:1000,
            });
            console.log(req);
        }).as('getAuthorFeedTest');
    })

    it('loads 2 saved Feeds from IndexedDB, `UnreadMsgCount` displays on both `FeedButton` elements', () => {
        cy.mount(Sidebar,{
            global:{
                stubs:{transition:false, 'transition-group': false},
            },
        })
        .then(({wrapper}) => {
            console.log(wrapper.vm.$data);
            // wrapper.vm.$data.FeedState.FeedList = [feed1,feed2];
            // wrapper.vm.$data.AppState.isUpdatingFeedPosition = false; //modal seems to stay open from prev test, this makes sure it's closed
            // wrapper.vm.$data.AppState.isAppOnMobileTouchscreenDevice = true; //spoof that this is a mobile touchscreen device
            // web_db.savedFeeds.put({id:1, data:stringifyFeedListData(wrapper.vm.$data.FeedState.FeedList)})
            web_db.savedFeeds.put({id:1, data:stringifyFeedListData([feed1,feed2])})
            .then(res => console.log(res))
            .catch(err => console.log(err));
        })
        // DeleteIndexedDBSavedFeeds();
        cy.get('[data-testid^="unreadMsgCount"').should('have.length',2);
        cy.get('[data-testid^="unreadMsgCount"').eq(0).should('exist');
        cy.get('[data-testid^="unreadMsgCount"').eq(1).should('exist');
    })
})