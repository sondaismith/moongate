import App from '../../App.vue';
import Sidebar from '../../Sidebar.vue'

/**
 * Test Feed data. Used to define the starting Feed displayed
 * during testing.
 */
var testFeedData = {
    feed: [
        {
            "post": {
                "uri": "at://did:plc:6unmjnerkpiy3yh6x4auqpy3/app.bsky.feed.post/3lla4vyoe2r2c",
                "cid": "bafyreibiv5xfp7ium6ekcgz7flmwpfcjmroflez5ydjosfzoan2i6g2uza",
                "author": {
                    "did": "did:plc:6unmjnerkpiy3yh6x4auqpy3",
                    "handle": "dummyplug.bsky.social",
                    "displayName": "dummyplug",
                    "avatar": "https://cdn.bsky.app/img/avatar/plain/did:plc:6unmjnerkpiy3yh6x4auqpy3/bafkreidaesr327h5xfnc4zthmx2hbazbxhxzfd763mfaw7czjrdi3jtpyy@jpeg",
                    "associated": {
                        "activitySubscription": {
                            "allowSubscriptions": "followers"
                        }
                    },
                    "labels": [],
                    "createdAt": "2025-02-23T13:31:10.344Z"
                },
                "record": {
                    "$type": "app.bsky.feed.post",
                    "createdAt": "2025-03-25T20:39:32.695Z",
                    "langs": [
                        "en-US"
                    ],
                    "text": "Hello World! www.test.com"
                },
                "replyCount": 0,
                "repostCount": 0,
                "likeCount": 2,
                "quoteCount": 0,
                "indexedAt": "2025-03-25T20:39:34.186Z",
                "labels": []
            },
            "reason": {
                "$type": "app.bsky.feed.defs#reasonPin"
            }
        },
    ],
}

describe('Opening FeedEditModal and tabbing between controls selects expected elements', () => {
    before(() => {
        //Intercept calls to get User Profile data
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
        cy.mount(App,{
            global:{
                stubs:{transition:false, 'transition-group': false},
            }
        })
        .then(async ({ wrapper, component }) => {
            var sidebarComponent = wrapper.getComponent(Sidebar);
            sidebarComponent.vm.$data.AppState.isCreatingFeed = true; //Show "create feed" modal
            sidebarComponent.vm.$data.FeedState.FeedList = [
                {
                    description: {
                        "feedId": "0cf299da9c",
                        "userId": 1,
                        "feedHandle": "dummyplug.bsky.social",
                        "feedName": "dummyplug",
                        "feedType": "user",
                        "feedIcon": "art",
                        "newPosts": 10,
                        "totalPosts": 30,
                        "feedColumnSettings": {
                            "width": 288
                        },
                        "feedSourceDID": "did:plc:test-session",
                        "feedTags": ""
                    },
                    data: testFeedData.feed,
                    "cursor": "2025-04-29T14:50:22.837Z",
                    "seenAt": "",
                    "isAwaitingFeedData": false
                }
            ]
            console.log(sidebarComponent.vm.$data);//Check after changes
        })
    })
    it('comfirms focus remains inside FeedEditModal in multiple situations', () => {
        // comfirms "Trending" button is focused after tabbing 3 times
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.get('[data-testid="feedEditModal-trending-feed-button"').should('have.focus');
        //comfirms "User" button is focused after tabbing 3 more times
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.get('[data-testid="feedEditModal-user-feed-button"').should('have.focus');
        //move to user search page
        cy.get('[data-testid="feedEditModal-user-feed-button"').type('{enter}');
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.get('[data-testid="feedEditModal-next-page-button"').type('{enter}');
        //search for bernews account, then cancel
        cy.wait(200);//page changing
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.get('[data-testid="inlainput-input"').should('have.focus').type('bernews{enter}');
        cy.wait(1000);//api responding
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.get('[data-testid="feedEditModal-back-button"').should('have.focus').type('{enter}');//back to feed type selection
        cy.wait(200);//page changing
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.get('[data-testid="feedEditModal-trending-feed-button"').should('have.focus').type('{enter}');//select trending
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.get('[data-testid="feedEditModal-next-page-button"').should('have.focus').type('{enter}');//go to trending "options" page
        cy.wait(200);//page changing
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.get('[data-testid="feedEditModal-back-button"').should('have.focus').type('{enter}')//back to feed type selection
        cy.wait(200);//page changing
        cy.get('[data-testid="feedEditModal-back-button"').should('have.focus').type('{enter}')//close FeedEditModal
        cy.wait(200);//modal closing
        cy.get('[data-testid="feed-edit-modal"').should('not.exist');
    })
})