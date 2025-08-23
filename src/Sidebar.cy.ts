import Sidebar from './Sidebar.vue'
import App from './App.vue';
import { ThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { GenerateUniqueId } from './state/FeedList.vue';
import { GenerateCID } from './helpers/generators';
import { CreateFeed, CreateFeedViewPost, CreateIFeedDescription, CreateRandomFeedListCollection } from './fake-data/DataFactory';

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

interface IFakeThreadPost{
    /**URI to access Post. */
    uri: string,
    /**Unique ID for Post. */
    cid: string,
    /**Text content of Post. */
    text: string,
    /**Time Post was created. */
    created: string,
    /**URI to access the parent Post that this a child (reply) of. */
    parentUri?: string,
}

/**
 * Array that acts as the database that stores created
 * posts during intercepted API calls. Holds the dummy
 * URI and the post text content.
 */
const textContentToReturn:Array<IFakeThreadPost> = []

/**
 * Method used to add a new Post to the "database"
 * (the textContentToReturn array).
 * @param uri The URI of the new Post.
 * @param text The text content of the new Post.
 */
async function trackNewPost(uri:string, text:string, parentURI:string=''){
    let generatedCID = '';
    await GenerateCID(text).then(res =>{
        generatedCID = res.toString();
    })
    /**Time Post was made. */
    var curTime = new Date().toISOString();
    textContentToReturn.push({uri:uri,cid:generatedCID,text:text,created:curTime,parentUri:parentURI});
}

function findReplyParent(data:Array<IFakeThreadPost>|undefined, parentUri:string):IFakeThreadPost|undefined{
    for(const item of data){
        const result:IFakeThreadPost|undefined = (item.uri == parentUri ? item : findReplyParent(item.replies, parentUri));
        if(result) return result;
    }
}

function findFakePost(data:Array<IFakeThreadPost>|undefined, uri:string):IFakeThreadPost|undefined{
    for(const item of data){
        const result:IFakeThreadPost|undefined = (item.uri == uri ? item : findReplyParent(item.replies, uri));
        if(result) return result;
    }
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
    // return textContentToReturn.find(x=>x.uri == uri);
    return findFakePost(textContentToReturn,uri);
}

/**
 * Method used to generate a response for calling `getPostThread()`
 * during testing. Grabs Post data (URI and text content) from
 * `textContentToReturn` "database".
 * @param postUri The URI of the created Post to return.
 * @returns Object representing the `getPostThread()` API response.
 */
async function createGetPostThreadResponse(postUri:string){
    var savedPost = textContentToReturn.find(x => x.uri == postUri);
    var newPost = CreateNewPostObject(savedPost);
    return newPost;
}

/**
 * Method used to create a structured object representing API data that would be returned
 * when using `getPostThread()` via the Bluesky API. Created object will include replies
 * and/or Parent Post reference, if there are/is any.
 * @param savedFakePost Object from {@link textContentToReturn} representing the Post to make
 * a API Repsonse for.
 * @returns A `ThreadViewPost` object containing fake data for testing purposes. If there is
 * a Parent Post or any replies they will be included in the object.
 */
function CreateNewPostObject(savedFakePost:IFakeThreadPost|undefined):ThreadViewPost|undefined{
    if(!savedFakePost) return undefined; //Exit if passed-in object is empty

    var savedPostReplies = textContentToReturn.filter(x => x.parentUri == savedFakePost.uri);
    var replyObjects:ThreadViewPost[] = [];
    savedPostReplies.forEach(reply => {
        let newPostObject = CreateNewPostObject(reply)
        if(newPostObject) replyObjects.push(newPostObject); //Only add reply if found
    });

    var parentObject = savedFakePost.parentUri ? createNewPostObjectShallow(textContentToReturn.find(x => x.uri == savedFakePost.parentUri)) : undefined;

    var newPost:ThreadViewPost = {
        $type:"app.bsky.feed.defs#threadViewPost",
        post: {
            author:{
                did: "did:plc:6unmjnerkpiy3yh6x4auqpy3",
                handle: "dummyplug.bsky.social",
                displayName: "dummyplug",
                avatar: "https://cdn.bsky.app/img/avatar/plain/did:plc:6unmjnerkpiy3yh6x4auqpy3/bafkreidaesr327h5xfnc4zthmx2hbazbxhxzfd763mfaw7czjrdi3jtpyy@jpeg",
            },
            cid: savedFakePost ? savedFakePost.cid : 'error getting cid',
            indexedAt: savedFakePost.created,
            record:{
                $type: "app.bsky.feed.post",
                createdAt: savedFakePost.created,
                langs: [
                    "en-US"
                ],
                text: savedFakePost ? savedFakePost.text : 'error getting text'
            },
            replyCount: savedPostReplies.length,
            repostCount: 0,
            likeCount: 0,
            quoteCount: 0,
            uri:savedFakePost ? savedFakePost.uri : 'error getting uri'
        },
        parent:parentObject,
        replies:replyObjects
    }
    return newPost;
}

/**
 * Method used to create a "shallow" structured object representing API data that would be
 * returned when using `getPostThread()` via the Bluesky API. "Shallow" means that the
 * created object will not include replies or a Parent Post reference.
 * @param savedFakePost Object from {@link textContentToReturn} representing the Post to make
 * a API Repsonse for.
 * @returns A `ThreadViewPost` object containing fake data for testing purposes. No Parent Post
 * or any replies will be included in the object.
 */
function createNewPostObjectShallow(savedFakePost:IFakeThreadPost|undefined):ThreadViewPost|undefined{
    if(!savedFakePost) return undefined; //Exit if passed-in object is empty

    var newPost:ThreadViewPost = {
        $type:"app.bsky.feed.defs#threadViewPost",
        post: {
            author:{
                did: "did:plc:6unmjnerkpiy3yh6x4auqpy3",
                handle: "dummyplug.bsky.social",
                displayName: "dummyplug",
                avatar: "https://cdn.bsky.app/img/avatar/plain/did:plc:6unmjnerkpiy3yh6x4auqpy3/bafkreidaesr327h5xfnc4zthmx2hbazbxhxzfd763mfaw7czjrdi3jtpyy@jpeg",
            },
            cid: savedFakePost ? savedFakePost.cid : 'error getting cid',
            indexedAt: savedFakePost.created,
            record:{
                $type: "app.bsky.feed.post",
                createdAt: savedFakePost.created,
                langs: [
                    "en-US"
                ],
                text: savedFakePost ? savedFakePost.text : 'error getting text'
            },
            replyCount: 0,
            repostCount: 0,
            likeCount: 0,
            quoteCount: 0,
            uri:savedFakePost ? savedFakePost.uri : 'error getting uri'
        },
    }
    return newPost;
}

describe.skip('Creating a new Post updates relevant elements', () => {
    before(() => {
        //Simulate API call and return matching Post/Reply from test data (testPostThreadView)
        cy.intercept('POST','**/xrpc/com.atproto.repo.createRecord*', async (req) => {
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
            var parentUri = req.body.record.reply ? req.body.record.reply.parent.uri : undefined;//Check if this a reply
            await trackNewPost(newPostURI,req.body.record.text, parentUri);
            console.log(textContentToReturn);
        }).as('createRecordTest');
        //Intercept attempts to get a Post Thread
        cy.intercept('GET','**/app.bsky.feed.getPostThread?uri*', async (req) => {
            //DEBUG
            // console.log(req);
            let queryURI:string = req.query.uri.toString();
            createGetPostThreadResponse(queryURI).then(res => {
                req.reply({
                    body:{
                        thread: res
                    },
                    statusCode:200
                });
            })
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
                    accessJwt: "testAccessJwt",
                    refreshJwt: "testRefreshJwt",
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
            sidebarComponent.vm.$data.AppState.isCreatingNewPost = true; //Show "create post" modal
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

    it('creates new post, replies to post, and relevent elements update', () => {
        //---CREATE NEW POST---
        //Enter Post text
        cy.get('#post-textarea').type('hhhgreg!');
        //Click to create Post
        cy.get('[data-test="create-post-button"]').click();
        //Click login button after being prompted
        cy.get('[data-test="loginModal-login-button"]').click();
        //Wait for stubbed API login & getAuthorFeed() response to resolve
        cy.wait(['@createSessionTest','@getAuthorFeedTest']);
        //Click to create Post again
        cy.get('[data-test="create-post-button"]').click();
        //Wait for stubbed createRecord() & getPostThread() to resolve
        cy.wait(['@createRecordTest','@getPostThreadTest']);
        cy.wait(200);//FeedColumn is updated slighly after API call response is receieved
        //Check that Post was added to `FeedColumn`
        cy.get('[data-test="feedColumn-post"]').then($posts =>{
            const postCount = $posts.length;
            cy.get('[data-test="focusFeedPost-text"').then($postText => {
                const newPostText = $postText
                expect(postCount).to.eq(2);
                expect(newPostText[1].textContent).to.contain('hhhgreg!');
            })
        });

        //---REPLY TO NEW POST---
        //Click to add reply to new Post
        cy.get('[data-test="postInteraction-reply-button"]').eq(1).click()
        //Enter reply text
        cy.get('#post-textarea').type('$99');
        //Post reply
        cy.get('[data-test="create-post-button"]').click();
        //Wait for stubbed createRecord() & getPostThread() to resolve
        cy.wait(['@createRecordTest','@getPostThreadTest']);
        cy.wait(200);//Reply count is updated slighly after API call response is receieved
        //Check that the reply count for the 1st Post we created has increased
        cy.get('[data-test="postInteraction-reply-button"]').eq(1).then($item => {
            const replyCount = $item.text()
            console.log(replyCount)
            expect(replyCount).to.eq('1');
        })

        //---REPLY TO REPLY VIA POSTFOCUSMODAL---
        //View the Post Thread
        cy.get('[data-test="focusFeedPost-timestamp-button"]').eq(1).click();
        //Reply to latest reply
        cy.get('[data-test="post-focus-modal"]').within($focusModal => {
            cy.get('[data-test="postInteraction-reply-button"]').eq(1).click();
        })
        //Enter reply text
        cy.get('#post-textarea').type('dvd player');
        //Post reply
        cy.get('[data-test="create-post-button"]').click();
        //Wait for stubbed createRecord() & getPostThread() to resolve
        cy.wait(['@createRecordTest','@getPostThreadTest']);
        cy.wait(200);//Reply count is updated slighly after API call response is receieved
        //Check that reply count increased
        cy.get('[data-test="post-focus-modal"]').within($focusModal => {
            cy.get('[data-test="postInteraction-reply-button"]').eq(1).then($item => {
                const replyCount = $item.text()
                console.log(replyCount)
                expect(replyCount).to.eq('1');
            })
        });

        //---REPLY TO FIRST POST VIA POSTFOCUSMODAL---
        //Reply to parent Post
        cy.get('[data-test="post-focus-modal"]').within($focusModal => {
            cy.get('[data-test="postInteraction-reply-button"]').eq(0).click();
        });
        //Enter reply text
        cy.get('#post-textarea').type('...huh?');
        //Post reply
        cy.get('[data-test="create-post-button"]').click();
        //Wait for stubbed createRecord() & getPostThread() to resolve
        cy.wait(['@createRecordTest','@getPostThreadTest']);
        cy.wait(200);//Reply count is updated slighly after API call response is receieved
        //Check that reply count increased
        cy.get('[data-test="post-focus-modal"]').within($focusModal => {
            cy.get('[data-test="postInteraction-reply-button"]').eq(0).then($item => {
                const replyCount = $item.text()
                console.log(replyCount)
                expect(replyCount).to.eq('2');
            })
        });

        //---ENSURE POST COUNT IN FEEDCOLUMN HAS UPDATE CORRECTLY AS WELL---
        //Close PostFocusModal
        cy.get('[data-test="postFocusModal-close-button"]').click();
        //Check that reply count increased
        cy.get('[data-test="postInteraction-reply-button"]').eq(1).then($item => {
            const replyCount = $item.text()
            console.log(replyCount)
            expect(replyCount).to.eq('2');
        });
    })
})

describe('Tests that tabbing between controls moves as expected', () => {
    it('Tabs from FeedButton to EmbedExternal', () => {
        cy.mount(App,{
            global:{
                stubs:{transition:false, 'transition-group': false},
            }
        })
        .then(async ({ wrapper, component }) => {
            var sidebarComponent = wrapper.getComponent(Sidebar);
            // sidebarComponent.vm.$data.FeedState.FeedList = [
            //     {
            //         description: {
            //             "feedId": "0cf299da9c",
            //             "userId": 1,
            //             "feedHandle": "dummyplug.bsky.social",
            //             "feedName": "dummyplug",
            //             "feedType": "user",
            //             "feedIcon": "art",
            //             "newPosts": 10,
            //             "totalPosts": 30,
            //             "feedColumnSettings": {
            //                 "width": 288
            //             },
            //             "feedSourceDID": "did:plc:test-session",
            //             "feedTags": ""
            //         },
            //         data: testFeedData.feed,
            //         "cursor": "2025-04-29T14:50:22.837Z",
            //         "seenAt": "",
            //         "isAwaitingFeedData": false
            //     }
            // ]
            //Creating collection of Feeds and Posts
            let feedCID1 = '';
            let feedCID2 = '';
            GenerateCID('My First Feed').then(res => {
                feedCID1 = res.toString()
            })
            GenerateCID('Mr Repost').then(res => {
                feedCID2 = res.toString()
            })
            let post1 = CreateFeedViewPost('bob_the_poster','I love my car shop!',true);
            let post2 = CreateFeedViewPost('cargo_haul', 'Delivery delivery delivery delivery');
            let feedDesc1 = CreateIFeedDescription('My First Feed',feedCID1,2,2);
            let feedDesc2 = CreateIFeedDescription('Mr Repost',feedCID2,3,3);
            let feed1 = CreateFeed([post1,post2],feedDesc1);
            let feed2 = CreateFeed([post2,post2,post1],feedDesc2);

            sidebarComponent.vm.$data.FeedState.FeedList = [feed1,feed2];
            console.log(sidebarComponent.vm.$data);//Check after changes
        })
    })
})