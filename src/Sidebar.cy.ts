import Sidebar from './Sidebar.vue'
import App from './App.vue';
import { ThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { GenerateUniqueId } from './state/FeedList.vue';
import { GenerateCID } from './helpers/generators';

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
                    "text": "Hello World!"
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

interface fakeThreadPost{
    uri: string,
    text: string,
    replies: fakeThreadPost[]
}

/**
 * Array that acts as the database that stores created
 * posts during intercepted API calls. Holds the dummy
 * URI and the post text content.
 */
const textContentToReturn:Array<{uri:string,text:string}> = []

/**
 * Method used to add a new Post to the "database"
 * (the textContentToReturn array).
 * @param uri The URI of the new Post.
 * @param text The text content of the new Post.
 */
function trackNewPost(uri:string, text:string){
    textContentToReturn.push({uri,text});
}

/**
 * Method used to delete/remove a Post from the "database"
 * (the textContentToReturn array).
 * @param uri The URI of the Post to delete.
 */
function untrackPost(uri:string){
    var index = textContentToReturn.findIndex(x=>x.uri == uri);
    if(index>=0) textContentToReturn.splice(index);
}

/**
 * Retreives saved Feeds from "database" (textContentToReturn).
 * @param uri The URI of the Post content to return.
 * @returns The URI and text content of the "Post".
 */
function getPostTextContent(uri:string){
    return textContentToReturn.find(x=>x.uri == uri);
}

/**
 * Dummy data used to confirm that duplicate CIDs were causing new Posts to not be
 * added during testing.
 */
var testCIDs = ['bafyreibiv5xfp7ium6ekcgz7flmwpfcjmroflez5ydjosfzoan2i6g2uza','bafyreidhzzxks2dl6ns3ijv3jlcjbt5mck47gydfqjaoo4ucr674xbqwn4']

/**
 * Method used to generate a response for calling `getPostThread()`
 * during testing. Grabs Post data (URI and text content) from
 * `textContentToReturn` "database".
 * @param postUri The URI of the created Post.
 * @returns Object representing the `getPostThread()` API response.
 */
async function createNewPostObject(postUri:string){
    var savedPost = getPostTextContent(postUri);
    var curTime = new Date().toISOString();
    var generatedCID = '';
    await GenerateCID('bazinga').then(res =>{
        generatedCID = res.toString();
    })
    var newPost = {
        body:{
            thread:{
                $type:"app.bsky.feed.defs#threadViewPost",
                post: {
                    author:{
                        did: "did:plc:6unmjnerkpiy3yh6x4auqpy3",
                        handle: "dummyplug.bsky.social",
                        displayName: "dummyplug",
                        avatar: "https://cdn.bsky.app/img/avatar/plain/did:plc:6unmjnerkpiy3yh6x4auqpy3/bafkreidaesr327h5xfnc4zthmx2hbazbxhxzfd763mfaw7czjrdi3jtpyy@jpeg",
                    },
                    cid:generatedCID, //testCIDs[Math.round(Math.random()*1)],//cid:'bafyreibiv5xfp7ium6ekcgz7flmwpfcjmroflez5ydjosfzoan2i6g2uza',
                    indexedAt: curTime,
                    record:{
                        $type: "app.bsky.feed.post",
                        createdAt: curTime,
                        langs: [
                            "en-US"
                        ],
                        text: savedPost ? savedPost.text : 'error getting text'
                    },
                    replyCount: 0,
                    repostCount: 0,
                    likeCount: 0,
                    quoteCount: 0,
                    uri:savedPost ? savedPost.uri : 'error getting uri'//uri:'at://did:plc:new-test-post'
                },
                replies:[]
            }
        },
        statusCode: 200
    }
    return newPost;
}

describe('Creating a new Post updates relevant elements', () => {
    it('renders Sidebar', () => {
        //Simulate API call and return matching Post/Reply from test data (testPostThreadView)
        cy.intercept('POST','**/xrpc/com.atproto.repo.createRecord*', (req) => {
            //DEBUG
            console.log(req);
            // console.log(findTestReply(testPostThreadView,req.query.uri.toString()));
            var newPostURI = `at://did:plc:new-test-post-${GenerateUniqueId(10)}`;
            req.reply({
                body: {
                    uri: newPostURI,
                    cid: "bafyreibiv5xfp7ium6ekcgz7flmwpfcjmroflez5ydjosfzoan2i6g2uza",
                    commit: {
                        cid: "bafyreidhzzxks2dl6ns3ijv3jlcjbt5mck47gydfqjaoo4ucr674xbqwn4",
                        rev: "3lupsmp32sq2d"
                    },
                    validationStatus: "valid"
                },
                statusCode: 200
            });
            trackNewPost(newPostURI,req.body.record.text);
            console.log(textContentToReturn);
        }).as('createRecordTest');
        //Intercept attempts to get a Post Thread
        // cy.intercept('GET','**/app.bsky.feed.getPostThread?uri=at%3A%2F%2Fdid%3Aplc%3Anew-test-post', (req) => {
        cy.intercept('GET','**/app.bsky.feed.getPostThread?uri*', async (req) => {
            //DEBUG
            console.log(req);
            let queryURI:string = req.query.uri.toString();
            // console.log(req.query.uri);
            // console.log(findTestReply(testPostThreadView,req.query.uri.toString()));
            // var savedPost = getPostTextContent(req.query.uri.toString());
            // req.reply({
            //     body:{
            //         thread:{
            //             $type:"app.bsky.feed.defs#threadViewPost",
            //             post: {
            //                 author:{
            //                     did: "did:plc:6unmjnerkpiy3yh6x4auqpy3",
            //                     handle: "dummyplug.bsky.social",
            //                     displayName: "dummyplug",
            //                     avatar: "https://cdn.bsky.app/img/avatar/plain/did:plc:6unmjnerkpiy3yh6x4auqpy3/bafkreidaesr327h5xfnc4zthmx2hbazbxhxzfd763mfaw7czjrdi3jtpyy@jpeg",
            //                 },
            //                 cid:'bafyreibiv5xfp7ium6ekcgz7flmwpfcjmroflez5ydjosfzoan2i6g2uza',
            //                 indexedAt: new Date().toISOString(),
            //                 record:{
            //                     type: "app.bsky.feed.post",
            //                     text: savedPost ? savedPost.text : 'error getting text'
            //                 },
            //                 uri:savedPost ? savedPost.uri : 'error getting uri'//uri:'at://did:plc:new-test-post'
            //             },
            //             replies:[]
            //         }
            //     },
            //     statusCode: 200
            // });
            let test = await createNewPostObject(queryURI);
            req.reply(test);
        }).as('getPostThreadTest');
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
        //Intercept any attempt to log in and return dummy session data
        cy.intercept('POST','**/com.atproto.server.createSession*', (req) => {
            //DEBUG
            // console.log(req);
            req.reply({
                body:{
                    did: "did:plc:test-session",
                    didDoc: {
                        "@context": [
                            "https://www.w3.org/ns/did/v1",
                            "https://w3id.org/security/multikey/v1",
                            "https://w3id.org/security/suites/secp256k1-2019/v1"
                        ],
                        id: "did:plc:test-session",
                        alsoKnownAs: [
                            "at://test-session.bsky.social"
                        ],
                        verificationMethod: [
                            {
                                id: "did:plc:test-session#atproto",
                                type: "Multikey",
                                controller: "did:plc:test-session",
                                publicKeyMultibase: "zQ3shkYUSJxz7PmCaGznbNR5oMCLKsjC7foCUVLVhxhioa5fa"
                            }
                        ],
                        service: [
                            {
                                id: "#atproto_pds",
                                type: "AtprotoPersonalDataServer",
                                serviceEndpoint: "https://hollowfoot.us-west.host.bsky.network"
                            }
                        ]
                    },
                    handle: "test-session.bsky.social",
                    email: "testSession@mail.com",
                    emailConfirmed: true,
                    emailAuthFactor: false,
                    accessJwt: "eyJ0eXAiOiJhdCtqd3QiLCJhbGciOiJFUzI1NksifQ.eyJzY29wZSI6ImNvbS5hdHByb3RvLmFjY2VzcyIsInN1YiI6ImRpZDpwbGM6NnVubWpuZXJrcGl5M3loNng0YXVxcHkzIiwiaWF0IjoxNzUzNDQ5MTI2LCJleHAiOjE3NTM0NTYzMjYsImF1ZCI6ImRpZDp3ZWI6aG9sbG93Zm9vdC51cy13ZXN0Lmhvc3QuYnNreS5uZXR3b3JrIn0.FcEW0zsCxyFwCpUoucWZ16IlZMwCjNvrD1l2nBx9Sn8_WvtV6bDlJmzUzHcjlEGwoUYTVWm1jlT5NnriB_0rPA",
                    refreshJwt: "eyJ0eXAiOiJyZWZyZXNoK2p3dCIsImFsZyI6IkVTMjU2SyJ9.eyJzY29wZSI6ImNvbS5hdHByb3RvLnJlZnJlc2giLCJzdWIiOiJkaWQ6cGxjOjZ1bm1qbmVya3BpeTN5aDZ4NGF1cXB5MyIsImF1ZCI6ImRpZDp3ZWI6YnNreS5zb2NpYWwiLCJqdGkiOiJGdHJOT0lrK29VMmtER0VHbnhKajltaFg1QzFKRThOa01LckhnN1lrUUk0IiwiaWF0IjoxNzUzNDQ5MTI2LCJleHAiOjE3NjEyMjUxMjZ9.wjj6Sw1ZBIBaHx1VkUSMFJLrUfeW07clYYhPyvY9PhtAQbWlMS-DgqUnMobr3YFcewR8pIqb57PdOdrloVkEXw",
                    active: true
                },
                statusCode: 200
            });
            console.log(req);
        }).as('createSessionTest');
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
        cy.mount(App,{
            global:{
                stubs:{transition:false, 'transition-group': false},
            }
        })
        .then(async ({ wrapper, component }) => {
            var sidebarComponent = wrapper.getComponent(Sidebar);
            // console.log(sidebarComponent.vm.$data);
            // await sidebarComponent.setData({
            //     AppState:{
            //         isCreatingNewPost:true,
            //     }
            // })
            sidebarComponent.vm.$data.AppState.isCreatingNewPost = true; //Show "create post" modal
            // sidebarComponent.vm.$data.AppState.isAuthBrowsing = true; //Mark User as logged in so Post can be made
            // sidebarComponent.vm.$data.AppState.canBrowse = true;
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
})