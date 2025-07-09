import { mount } from "@vue/test-utils";
import { afterAll, describe, expect, it, test } from "vitest";
import PostFocusModal from "./PostFocusModal.vue";

const testPostThreadView = [{
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
                indexedAt: new Date().toISOString(),
                record:{
                    type: "app.bsky.feed.post",
                    text: "Test reply 1. Hello World!"
                },
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
                        indexedAt: new Date().toISOString(),
                        record:{
                            type: "app.bsky.feed.post",
                            text: "Test reply 1 to reply 1. Hello World!"
                        },
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
                indexedAt: new Date().toISOString(),
                record:{
                    type: "app.bsky.feed.post",
                    text: "Test reply 2. Hello World!"
                },
                uri:'this-is-reply02-URI'
            },
        }
    ]
}];

describe("test", () => {
    const wrapper = mount(PostFocusModal);
    test("threadNavHistory content is displayed in component", async () => {
        // wrapper.vm.$data.postDetails.currentThreadView = {
        //     post: {
        //         author:{
        //             did:'this-is-a-test-DID',
        //             handle:'liltesty',
        //             displayName:'test dude'
        //         },
        //         cid:'this-is-a-test-CID',
        //         indexedAt: new Date().toISOString(),
        //         record:{
        //             type: "app.bsky.feed.post",
        //             text: "Test record. Hello World!"
        //         },
        //         uri:'this-is-a-test-URI'
        //     },
        //     replies:[
        //         {
        //             $type:"app.bsky.feed.defs#threadViewPost",
        //             post:{
        //                 author:{
        //                     did:'reply01-test-DID',
        //                     handle:'reply01',
        //                     displayName:'reply one'
        //                 },
        //                 cid:'this-is-reply01-CID',
        //                 indexedAt: new Date().toISOString(),
        //                 record:{
        //                     type: "app.bsky.feed.post",
        //                     text: "Test reply 1. Hello World!"
        //                 },
        //                 uri:'this-is-reply01-URI'
        //             },
        //             replies:[
        //                 {
        //                     $type:"app.bsky.feed.defs#threadViewPost",
        //                     post:{
        //                         author:{
        //                             did:'reply01-reply01-test-DID',
        //                             handle:'reply01-of-reply01',
        //                             displayName:'reply one of reply one'
        //                         },
        //                         cid:'this-is-reply01-reply01-CID',
        //                         indexedAt: new Date().toISOString(),
        //                         record:{
        //                             type: "app.bsky.feed.post",
        //                             text: "Test reply 1 to reply 1. Hello World!"
        //                         },
        //                         uri:'this-is-reply01-reply01-URI'
        //                     },
        //                 }
        //             ]
        //         },
        //         {
        //             $type:"app.bsky.feed.defs#threadViewPost",
        //             post:{
        //                 author:{
        //                     did:'reply02-test-DID',
        //                     handle:'reply02',
        //                     displayName:'reply two'
        //                 },
        //                 cid:'this-is-reply02-CID',
        //                 indexedAt: new Date().toISOString(),
        //                 record:{
        //                     type: "app.bsky.feed.post",
        //                     text: "Test reply 2. Hello World!"
        //                 },
        //                 uri:'this-is-reply02-URI'
        //             },
        //         }
        //     ]
        // };
        await wrapper.setData({postDetails:{
            threadNavHistory: testPostThreadView,
            currentThreadView: testPostThreadView[0],
        }});
        console.log(wrapper.vm.$data.postDetails.currentThreadView.replies);
        console.log(wrapper.html());
        //Check handle
        expect(wrapper.find('[data-testid="PostFocusModal-handle"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="PostFocusModal-handle"]').text()).toContain('@'+testPostThreadView[0].post.author.handle);
        //Check display name
        expect(wrapper.find('[data-testid="PostFocusModal-displayName"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="PostFocusModal-displayName"]').text()).toContain(testPostThreadView[0].post.author.displayName);
    })

    test.skip("clicking reply timestamp updates PostThreadView via API request", async () => {
        const wrapper = mount(PostFocusModal);

        await wrapper.setData({postDetails:{
            threadNavHistory: testPostThreadView,
            currentThreadView: testPostThreadView[0],
        }});

        // console.log(wrapper.vm.$data.postDetails.currentThreadView);
        // console.log(wrapper.html());
    })
    afterAll(() => {
        wrapper.unmount();
    })
})