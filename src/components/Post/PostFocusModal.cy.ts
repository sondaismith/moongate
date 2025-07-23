import PostFocusModal from './PostFocusModal.vue';

const today = new Date();
const testPostThreadView = [{
    $type:"app.bsky.feed.defs#threadViewPost",
    post: {
        author:{
            did:'did:plc:this-is-a-test-DID',
            handle:'liltesty.test',
            displayName:'test dude'
        },
        cid:'this-is-a-test-CID',
        indexedAt: new Date().toISOString(),
        record:{
            type: "app.bsky.feed.post",
            text: "Test record. Hello World!"
        },
        uri:'at://did:plc:this-is-a-test-URI'
    },
    replies:[
        {
            $type:"app.bsky.feed.defs#threadViewPost",
            post:{
                author:{
                    did:'did:plc:reply01-test-DID',
                    handle:'reply01.test',
                    displayName:'reply one'
                },
                cid:'bafyreihecnca4as334ixhhfdltmigdlzelxiixdnj2uj4yylgmckfbua54',
                indexedAt: new Date(today.getTime()-52*60000).toISOString(),
                record:{
                    type: "app.bsky.feed.post",
                    text: "Test reply 1. Hello World!",
                    createdAt: new Date(today.getTime()-52*60000).toISOString(),
                },
                replyCount:1,
                repostCount:10,
                likeCount:2,
                uri:'at://did:plc:this-is-reply01-URI'
            },
            replies:[
                {
                    $type:"app.bsky.feed.defs#threadViewPost",
                    post:{
                        author:{
                            did:'did:plc:reply01-reply01-test-DID',
                            handle:'reply01-of-reply01.test',
                            displayName:'reply one of reply one'
                        },
                        cid:'bafyreihecnca4as334ixhhfdltmigdlzelxiixdnj2uj4yylgmckfbua54',//cid:'this-is-reply01-reply01-cid',
                        indexedAt: new Date(today.getTime()-44*60000).toISOString(),
                        record:{
                            type: "app.bsky.feed.post",
                            text: "Test reply 1 to reply 1. Hello World!",
                            createdAt: new Date(today.getTime()-44*60000).toISOString()
                        },
                        replyCount:0,
                        repostCount:0,
                        likeCount:1337,
                        uri:'at://did:plc:this-is-reply01-reply01-URI'
                    },
                    replies:[]
                }
            ]
        },
        {
            $type:"app.bsky.feed.defs#threadViewPost",
            post:{
                author:{
                    did:'did:plc:reply02-test-DID',
                    handle:'reply02.test',
                    displayName:'reply two'
                },
                cid:'bafyreihecnca4as334ixhhfdltmigdlzelxiixdnj2uj4yylgmckfbua54',//cid:'this-is-reply02-CID',
                indexedAt: new Date(today.getTime()-50*60000).toISOString(),
                record:{
                    type: "app.bsky.feed.post",
                    text: "Test reply 2. Hello World!",
                    createdAt: new Date(today.getTime()-50*60000).toISOString()
                },
                replyCount:0,
                repostCount:765,
                likeCount:22,
                uri:'at://did:plc:this-is-reply02-URI'
            },
            replies:[]
        }
    ]
}];

/**Helper method used to simulate Bluesky API call. Used to search
 * testPostThreadView test object to return relevant Post/Reply.
 */
function findTestReply(data:Array<any>, postUri:string){
    for(const item of data){
        const result = item.post.uri == postUri ? item : findTestReply(item.replies, postUri);
        if(result) return result;
    }
}

describe('Clicking timestamp requests data', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-vue
    //Simulate API call and return matching Post/Reply from test data (testPostThreadView)
    cy.intercept('GET','https://api.bsky.app/xrpc/app.bsky.feed.getPostThread*', (req) => {
        //DEBUG
        // console.log(req);
        // console.log(req.query.uri);
        // console.log(findTestReply(testPostThreadView,req.query.uri.toString()));
        req.reply({
            body: {thread:findTestReply(testPostThreadView,req.query.uri.toString())},
            statusCode: 200
        });
        console.log(req);
    }).as('getPostThreadTest');
    cy.mount(PostFocusModal,{
        data() {
            return{
                postThread: testPostThreadView[0],
                threadNavHistory: testPostThreadView,
                currentThreadView: testPostThreadView[0],
                whoCanReply: () => {return 'Everybody can reply'},
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