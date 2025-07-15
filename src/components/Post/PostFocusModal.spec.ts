import { mount } from "@vue/test-utils";
import { afterAll, afterEach, describe, expect, it, test } from "vitest";
import PostFocusModal from "./PostFocusModal.vue";
import PostThreadView from "./PostThreadView.vue";
import FocusFeedPost from "../Feed/FocusFeedPost.vue"
import { ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

/**Date variable used for testing. Value will be starting time of tests. */
const today = new Date();

/**
 * ThreadViewPost Post thread object used for testing.
 */
const testPostThreadView:ThreadViewPost[] = [{
    $type:"app.bsky.feed.defs#threadViewPost",
    post: {
        author:{
            did:'this-is-a-test-DID',
            handle:'liltesty',
            displayName:'test dude'
        },
        cid:'this-is-a-test-CID',
        indexedAt: new Date().toISOString(),
        record:{
            type: "app.bsky.feed.post",
            text: "Test record. Hello World!"
        },
        uri:'this-is-a-test-URI'
    },
    replies:[
        {
            $type:"app.bsky.feed.defs#threadViewPost",
            post:{
                author:{
                    did:'reply01-test-DID',
                    handle:'reply01',
                    displayName:'reply one'
                },
                cid:'this-is-reply01-CID',
                indexedAt: new Date(today.getTime()-52*60000).toISOString(),
                record:{
                    type: "app.bsky.feed.post",
                    text: "Test reply 1. Hello World!",
                    createdAt: new Date(today.getTime()-52*60000).toISOString(),
                },
                replyCount:1,
                repostCount:10,
                likeCount:2,
                uri:'this-is-reply01-URI'
            },
            replies:[
                {
                    $type:"app.bsky.feed.defs#threadViewPost",
                    post:{
                        author:{
                            did:'reply01-reply01-test-DID',
                            handle:'reply01-of-reply01',
                            displayName:'reply one of reply one'
                        },
                        cid:'this-is-reply01-reply01-CID',
                        indexedAt: new Date(today.getTime()-44*60000).toISOString(),
                        record:{
                            type: "app.bsky.feed.post",
                            text: "Test reply 1 to reply 1. Hello World!",
                            createdAt: new Date(today.getTime()-44*60000).toISOString()
                        },
                        replyCount:2,
                        repostCount:0,
                        likeCount:1337,
                        uri:'this-is-reply01-reply01-URI'
                    },
                }
            ]
        },
        {
            $type:"app.bsky.feed.defs#threadViewPost",
            post:{
                author:{
                    did:'reply02-test-DID',
                    handle:'reply02',
                    displayName:'reply two'
                },
                cid:'this-is-reply02-CID',
                indexedAt: new Date(today.getTime()-50*60000).toISOString(),
                record:{
                    type: "app.bsky.feed.post",
                    text: "Test reply 2. Hello World!",
                    createdAt: new Date(today.getTime()-50*60000).toISOString()
                },
                replyCount:0,
                repostCount:765,
                likeCount:22,
                uri:'this-is-reply02-URI',
            },
        }
    ]
}];

describe("test", () => {
    const wrapper = mount(PostFocusModal);
    test("threadNavHistory content is displayed in component", async () => {
        await wrapper.setData({postDetails:{
            // isAwaitingFocusData: true,
            postThread: testPostThreadView[0],
            threadNavHistory: testPostThreadView,
            currentThreadView: testPostThreadView[0],
        }});
        // await wrapper.setData({postDetails:{
        //     isAwaitingFocusData: false,
        // }});
        console.log(wrapper.vm.$data.postDetails.currentThreadView.replies);
        console.log(wrapper.html());
        //Check handle
        expect(wrapper.find('[data-testid="PostFocusModal-handle"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="PostFocusModal-handle"]').text()).toContain('@'+testPostThreadView[0].post.author.handle);
        //Check display name
        expect(wrapper.find('[data-testid="PostFocusModal-displayName"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="PostFocusModal-displayName"]').text()).toContain(testPostThreadView[0].post.author.displayName);
        //Check that expected replies are displayed
    })

    test.skip("clicking reply timestamp updates PostThreadView via API request", async () => {
        // const wrapper = mount(PostFocusModal);
        const wrapper = mount(PostThreadView, {
            data() {
                return{
                    postDetails:{
                        postThread: testPostThreadView[0],
                        threadNavHistory: testPostThreadView,
                        currentThreadView: testPostThreadView[0],
                    }
                }
            },
        });

        // await wrapper.setData({postDetails:{
        //     threadNavHistory: testPostThreadView,
        //     currentThreadView: testPostThreadView[0],
        // }});

        // let threadWrapper = wrapper.findComponent(PostThreadView);
        // await threadWrapper.setData({postDetails:{
        //     threadNavHistory: testPostThreadView,
        //     currentThreadView: testPostThreadView[0],
        // }});

        // console.log(wrapper.vm.$data.postDetails.currentThreadView);
        // console.log(wrapper.html());
        // console.log(testPostThreadView);
        //Testing that FocusFeedPost postToShow is getting indexedAt date value
        let focusPostWrapper = wrapper.findComponent(FocusFeedPost);
        console.log(focusPostWrapper.vm.$data);
    })
    afterEach(() => {
        wrapper.unmount();
    })
})