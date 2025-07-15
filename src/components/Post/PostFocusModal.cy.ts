import PostFocusModal from './PostFocusModal.vue';
import PostThreadView from './PostThreadView.vue';
import postDetails from '../../state/PostDetails.vue'

const today = new Date();
const testPostThreadView = [{
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
                uri:'this-is-reply02-URI'
            },
        }
    ]
}];

describe('Clicking timestamp requests data', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-vue
    cy.mount(PostFocusModal,{
        data() {
            return{
                postDetails:{
                    postThread: testPostThreadView[0],
                    threadNavHistory: testPostThreadView,
                    currentThreadView: testPostThreadView[0],
                    whoCanReply: () => {return 'Everybody can reply'}
                }
            }
        },
    }).then(async ({ wrapper, component }) => {
      // `wrapper` is the Vue Test Utils wrapper
      // `component` is the component instance itself
    //   await wrapper.setData({postDetails:{
    //       postThread: testPostThreadView[0],
    //       threadNavHistory: testPostThreadView,
    //       currentThreadView: testPostThreadView[0],
    //   }});
      //PostDetails state is not set globally, need to update manually
    //   let threadWrapper = wrapper.findComponent(PostThreadView);
    //   await threadWrapper.setData({postDetails:{
    //       postThread: testPostThreadView[0],
    //       threadNavHistory: testPostThreadView,
    //       currentThreadView: testPostThreadView[0],
    //   }});
    })
  })
})