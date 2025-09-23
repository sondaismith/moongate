// import "fake-indexeddb/auto";
import FeedOrderModal from './FeedOrderModal.vue';
import App from '../../App.vue';
import Sidebar from '../../Sidebar.vue';
import { mount } from '@vue/test-utils'
import { GenerateCID } from '../../helpers/generators';
import { CreateFeed, CreateFeedViewPost, CreateIFeedDescription } from '../../fake-data/DataFactory';
import { DeleteIndexedDBSavedFeeds } from '../../lib/db/local_db';
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { emptyPostView } from '../../fake-data/dumPostData';

//Creating collection of Feeds and Posts
let feedCID1 = 'testFeed1';
let feedCID2 = 'testFeed2';
// await GenerateCID('My First Feed').then(res => {
//     feedCID1 = res.toString()
// })
// await GenerateCID('Mr Repost').then(res => {
//     feedCID2 = res.toString()
// })
let post1:FeedViewPost = {post:emptyPostView};
let post2:FeedViewPost = {post:emptyPostView};
await CreateFeedViewPost('bob_the_poster','I love my car shop!',true).then(res => post1 = res);
await CreateFeedViewPost('cargo_haul', 'Delivery delivery delivery delivery').then(res => post2 = res);
let feedDesc1 = CreateIFeedDescription('My First Feed',feedCID1,2,2,post1.post.cid,post1.post.indexedAt);
let feedDesc2 = CreateIFeedDescription('Mr Repost',feedCID2,3,3,post2.post.cid,post2.post.indexedAt);
let feed1 = CreateFeed([post1,post2],feedDesc1);
let feed2 = CreateFeed([post2,post2,post1],feedDesc2);

/**
 * Test Feed data. Used to define the starting Feed displayed
 * during testing.
 */
var testFeedData = {
    feed: [post1,post2],
}

describe('Test Suite for FeedOrderModal', () => {
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
            req.reply({
                body:[],//testFeedData,
                statusCode: 200
            });
            console.log(req);
        }).as('getAuthorFeedTest');
    })
    it('comfirms "Feed not found" message is shown if no FeedId has been provided', () => {
        cy.mount(FeedOrderModal,{
            global:{
                stubs:{transition:false, 'transition-group': false},
            },
        })
        cy.get('[data-testid="feedOrderModal-no-feedId"').should('exist');
    })
    it('comfirms "No Feeds" message is shown if no Feed has been created', () => {
        // var sidebarComponent = wrapper.getComponent(FeedOrderModal);

        // sidebarComponent.vm.$data.FeedState.FeedList = [feed1,feed2];
        cy.mount(FeedOrderModal,{
            global:{
                stubs:{transition:false, 'transition-group': false},
            },
            props:{
                // feedIdToUpdate: '0cf299da9c',
                feedIdToUpdate: feed1.description.feedId,
            },
            // data(){
            //     return{
            //         FeedState:{
            //             FeedList:[feed1,feed2],
            //         }
            //     }
            // }
        })
        // .then( async({ wrapper }) => {
        //     // var sidebarComponent = wrapper.getComponent(Sidebar);
        //     var sidebarComponent = wrapper.getComponent(FeedOrderModal);
        // })
        cy.get('[data-testid="feedOrderModal-no-feeds"').should('exist');
    })
    it('comfirms "No Matching Feed found" message is shown if no Feed with a matching FeedId can be found', () => {
        cy.mount(FeedOrderModal,{
            global:{
                stubs:{transition:false, 'transition-group': false},
            },
            props:{
                feedIdToUpdate: 'this-feedId-does-not-exist',
            },
            data(){
                return{
                    FeedState:{
                        FeedList:[feed1,feed2],
                    }
                }
            }
        })
        cy.get('[data-testid="feedOrderModal-feed-not-found"').should('exist');
        DeleteIndexedDBSavedFeeds();
    })
    it('selects the 2nd feed, makes no change, ensures submit cannot be clicked', () => {
        cy.mount(Sidebar,{
            global:{
                stubs:{transition:false, 'transition-group': false},
            },
        })
        .then(({wrapper}) => {
            console.log(wrapper.vm.$data);
            wrapper.vm.$data.FeedState.FeedList = [feed1,feed2];
            wrapper.vm.$data.AppState.isAppOnMobileTouchscreenDevice = true; //spoof that this is a mobile touchscreen device
        })
        cy.get('[data-testid="feedcolumn-reorder-button"').eq(1).click();
        cy.get('[data-testid="feedOrderModal-original-position-label"').should('contain',2);
        cy.get('[data-testid="feedOrderModal-update-button"').should('be.disabled');
        DeleteIndexedDBSavedFeeds();
    })
    it('selects the 2nd feed, moves it to 1st position', () => {
        cy.mount(Sidebar,{
            global:{
                stubs:{transition:false, 'transition-group': false},
            },
        })
        .then(({wrapper}) => {
            console.log(wrapper.vm.$data);
            wrapper.vm.$data.FeedState.FeedList = [feed1,feed2];
            wrapper.vm.$data.AppState.isUpdatingFeedPosition = false; //modal seems to stay open from prev test, this makes sure it's closed
            wrapper.vm.$data.AppState.isAppOnMobileTouchscreenDevice = true; //spoof that this is a mobile touchscreen device
        })
        cy.get('[data-testid="feedcolumn-reorder-button"').eq(1).click();
        cy.wait(200);
        cy.get('[data-testid="feedOrderModal-original-position-label"').should('contain',2);
        cy.get('[data-testid="feedOrderModal-order-position-range"').should('exist').invoke('val',1).trigger('input');
        // cy.get('[data-testid="feedOrderModal-new-position-input"').should('exist').invoke('val',1).trigger('input');
        cy.get('[data-testid="feedOrderModal-update-button"').trigger('click');
        cy.get('[data-testid="feed-column"').eq(0).should('have.id', feed2.description.feedId);
        DeleteIndexedDBSavedFeeds();
    })
    it('selects the 2nd feed, attempts to put high and negative invalid position into input, input validation sets value back to valid value both times', () => {
        cy.mount(Sidebar,{
            global:{
                stubs:{transition:false, 'transition-group': false},
            },
        })
        .then(({wrapper}) => {
            console.log(wrapper.vm.$data);
            wrapper.vm.$data.FeedState.FeedList = [feed1,feed2];
            wrapper.vm.$data.AppState.isUpdatingFeedPosition = false; //modal seems to stay open from prev test, this makes sure it's closed
            wrapper.vm.$data.AppState.isAppOnMobileTouchscreenDevice = true; //spoof that this is a mobile touchscreen device
        })
        DeleteIndexedDBSavedFeeds();
        cy.get('[data-testid="feedcolumn-reorder-button"').eq(1).click();
        cy.wait(200);
        cy.get('[data-testid="feedOrderModal-original-position-label"').should('contain',2);
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.get('[data-testid="feedOrderModal-new-position-input"').should('exist').click().type('{backspace}11');//type positive invalid value
        cy.get('[data-testid="feedOrderModal-new-position-input"').should('have.value',11);
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.get('[data-testid="feedOrderModal-new-position-input"').should('have.value',2);//input losing focus triggers validation
        cy.get('[data-testid="feedOrderModal-update-button"').should('be.disabled');
        cy.get('[data-testid="feedOrderModal-new-position-input"').should('exist').click().type('{backspace}-1');//type negative invalid value
        cy.get('[data-testid="feedOrderModal-new-position-input"').should('have.value',-1);
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.get('[data-testid="feedOrderModal-new-position-input"').should('have.value',1);//input losing focus triggers validation
        cy.get('[data-testid="feedOrderModal-update-button"').should('be.enabled');
    })
})