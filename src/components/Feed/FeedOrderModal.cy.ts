import { nextTick } from 'vue'
import FeedOrderModal from './FeedOrderModal.vue';
import App from '../../App.vue';
import Sidebar from '../../Sidebar.vue';
import { mount } from '@vue/test-utils'
import { GenerateCID } from '../../helpers/generators';
import { CreateFeed, CreateFeedViewPost, CreateIFeedDescription } from '../../fake-data/DataFactory';

//Creating collection of Feeds and Posts
let feedCID1 = 'testFeed1';
let feedCID2 = 'testFeed2';
// await GenerateCID('My First Feed').then(res => {
//     feedCID1 = res.toString()
// })
// await GenerateCID('Mr Repost').then(res => {
//     feedCID2 = res.toString()
// })
let post1 = CreateFeedViewPost('bob_the_poster','I love my car shop!',true);
let post2 = CreateFeedViewPost('cargo_haul', 'Delivery delivery delivery delivery');
let feedDesc1 = CreateIFeedDescription('My First Feed',feedCID1,2,2);
let feedDesc2 = CreateIFeedDescription('Mr Repost',feedCID2,3,3);
let feed1 = CreateFeed([post1,post2],feedDesc1);
let feed2 = CreateFeed([post2,post2,post1],feedDesc2);

describe('Test Suite for FeedOrderModal', () => {
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
    })
    it.skip('comfirms "Feed not found" message is shown if no FeedId has been provided', () => {
        cy.mount(FeedOrderModal,{
            global:{
                stubs:{transition:false, 'transition-group': false},
            },
        })
        cy.get('[data-testid="feedOrderModal-no-feedId"').should('exist');
    })
    it.skip('comfirms "No Feeds" message is shown if no Feed has been created', () => {
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
    it.skip('comfirms "No Feeds" message is shown if no Feed has been created', () => {
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
})