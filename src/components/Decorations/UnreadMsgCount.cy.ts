import { CreateFeedViewPost, CreateIFeedDescription, CreateNotification, CreateTrendView } from "../../fake-data/DataFactory";


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

let post1 = CreateFeedViewPost('bob_the_poster','I love my car shop!',true,undefined,post1Timestamp);
let post2 = CreateFeedViewPost('cargo_haul', 'Delivery delivery delivery delivery',false,undefined,new Date(2025,8,16,13,21));
let post3 = CreateFeedViewPost('cargo_haul', 'the box is in place',undefined,undefined,new Date(2025,8,16,13,10));
let pinPost1 = CreateFeedViewPost('bob_the_poster','Cars all day, every day!',true,undefined,new Date(2025,8,16,13,30),true);
let feedDesc1 = CreateIFeedDescription('My First Feed',feedCID1,2,2);
let feedDesc2 = CreateIFeedDescription('Mr Repost',feedCID2,3,3);

let notif1 = CreateNotification('post_liker',"like",undefined,notif1Timestamp);
let notif2 = CreateNotification('u_will_be_mentioned',"mention","the mentioner",new Date(2025,8,16,9,3));

let trend1 = CreateTrendView('Testing','Software Dev',undefined,3421,trend1Timestamp);
let trend2 = CreateTrendView('House Ownership','Lifestyle',undefined,79,new Date(2025,8,16,20,32));
let trend3 = CreateTrendView('Naps','Lifestyle',undefined,133200,new Date(2025,4,9,8,11));
let trend4 = CreateTrendView('F1','Sport',undefined,11766,new Date(2025,4,12,14,20));

/**
 * Test Feed data. Used to define the starting Feed displayed
 * during testing.
 */
var testFeedData = {
    feed: [post1,post2],
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
            req.reply({
                body:testFeedData,
                statusCode: 200
            });
            console.log(req);
        }).as('getAuthorFeedTest');
    })

    it('comfirms "Feed not found" message is shown if no FeedId has been provided', () => {
        // cy.mount(FeedOrderModal,{
        //     global:{
        //         stubs:{transition:false, 'transition-group': false},
        //     },
        // })
        // cy.get('[data-testid="feedOrderModal-no-feedId"').should('exist');
    })
})