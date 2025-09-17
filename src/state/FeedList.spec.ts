import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { describe } from "vitest";
import { CreateFeedViewPost, CreateIFeedDescription, CreateNotification, CreateTrendView } from "../fake-data/DataFactory";
import { GetLatestNonPinnedPost, GetRecordsFeedTimestamp } from "./FeedList.vue"
import { Notification } from "@atproto/api/dist/client/types/app/bsky/notification/listNotifications";
import { TrendView } from "@atproto/api/dist/client/types/app/bsky/unspecced/defs";

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

describe("Test suite for GetLatestNonPinnedPost()", () => {
    it("should return 1st item in each FeedViewPost collection - no pinned", () => {
        //Records should be returned via API in newest to oldest order, 1st is latest
        let postFeed1:FeedViewPost[] = [post1,post2,post3];
        let latestPost1 = GetLatestNonPinnedPost(postFeed1);
        expect(latestPost1).to.equal(post1);
        let postFeed2:FeedViewPost[] = [post3,post1,post3];
        let latestPost2 = GetLatestNonPinnedPost(postFeed2);
        expect(latestPost2).to.equal(post3);
    })
    it("should skip pinned post and return 1st item after that in each FeedViewPost collection - has pinned post", () => {
        //Records should be returned via API in newest to oldest order, pinned post is skipped
        let postFeed1:FeedViewPost[] = [pinPost1,post1,post2,post3];
        let latestPost1 = GetLatestNonPinnedPost(postFeed1);
        expect(latestPost1).to.equal(post1);
        let postFeed2:FeedViewPost[] = [pinPost1,post3,post1,post3];
        let latestPost2 = GetLatestNonPinnedPost(postFeed2);
        expect(latestPost2).to.equal(post3);
    })
    it("should return 1st item in each Notification collection", () => {
        //Records should be returned via API in newest to oldest order, 1st is latest
        let postFeed1:Notification[] = [notif1,notif2];
        let latestPost1 = GetLatestNonPinnedPost(postFeed1);
        expect(latestPost1).to.equal(notif1);
        let postFeed2:Notification[] = [notif2,notif1];
        let latestPost2 = GetLatestNonPinnedPost(postFeed2);
        expect(latestPost2).to.equal(notif2);
    })
    it("should return 1st item in each TrendView collection", () => {
        //Records are returned via API out of chronological order, must search list for most reccent
        let feedRecord1:TrendView[] = [trend1,trend2,trend3];
        let latestPost1 = GetLatestNonPinnedPost(feedRecord1);
        expect(latestPost1).to.equal(trend2);
        let feedRecord2:TrendView[] = [trend1,trend3,trend4];
        let latestPost2 = GetLatestNonPinnedPost(feedRecord2);
        expect(latestPost2).to.equal(trend4);
    })
})

describe("Test suite for GetRecordsFeedTimestamp()", () => {
    it("should return correct time from FeedViewPost.post.indexedAt", () => {
        let time = '2025-07-26T16:30:00.000Z';
        let post:FeedViewPost = {
            post:{
                author:{
                    did:`did_fake_${1}`,
                    handle:'',
                    displayName:''
                },
                cid:'',
                indexedAt:time,
                record: {
                    $type: "app.bsky.feed.post",
                    createdAt: '',
                    langs: [
                        "en-US"
                    ],
                    text: 'dummy text'
                },
                uri:'nowhere',
            },
        }
        let ts = GetRecordsFeedTimestamp(post);
        expect(ts).to.equal(time);
    })
    it("should return correct time from FeedViewPost.reason.indexedAt", () => {
        let indexTime = '2025-07-26T16:30:00.000Z';
        let reasonTime = '2025-10-02T06:32:00.000Z';
        let post:FeedViewPost = {
            post:{
                author:{
                    did:`did_fake_${1}`,
                    handle:'',
                    displayName:''
                },
                cid:'',
                indexedAt:indexTime,
                record: {
                    $type: "app.bsky.feed.post",
                    createdAt: '',
                    langs: [
                        "en-US"
                    ],
                    text: 'dummy text'
                },
                uri:'nowhere',
            },
            reason:{
                $type:'app.bsky.feed.defs#reasonRepost',
                indexedAt:reasonTime
            }
        }
        let ts = GetRecordsFeedTimestamp(post);
        expect(ts).to.not.equal(indexTime);
        expect(ts).to.equal(reasonTime);
    })
    it("should return correct time from Notification.indexedAt", () => {
        let time = '2025-03-16T17:23:00.000Z';
        let post:Notification = {
            uri: "nowhere",
            cid: '',
            author: {
                did: `did_fake${1}`,
                handle: '',
                displayName: '',
                createdAt: "2025-02-04T13:02:19.244Z",
                description: "I'm a generated notification author!",
                indexedAt: "2025-09-01T12:45:32.297Z"
            },
            reason: 'like',
            reasonSubject: "at://did:plc:link_to_subject",
            record: {
                $type: "app.bsky.feed.like",
                createdAt: "2025-07-09T03:02:23.589054+00:00",
                subject: {
                    $type: "com.atproto.repo.strongRef",
                    cid: '',
                    uri: "at://did:plc:link_to_subject"
                }
            },
            isRead: true,
            indexedAt: time,
        }
        let ts = GetRecordsFeedTimestamp(post);
        expect(ts).to.equal(time);
    })
    it("should return correct time from TrendView.startedAt", () => {
        let startedTime = '2025-03-16T17:23:00.000Z';
        let record:TrendView = {
            topic: 'fake trend',
            displayName: 'Not a Real Trend',
            link: "/profile/trending.bsky.app/feed/not_real",
            startedAt: startedTime,
            postCount: 1234,
            category: 'test',
            actors: [
                {
                    did: "did:plc:trend_actor1",
                    handle: "post_treend",
                    displayName: "Trend Actor 1",
                    avatar: "src/assets/test-media/posts/image02.png",
                    labels: [],
                    createdAt: "2025-08-18T16:20:06.768Z"
                },
                {
                    did: "did:plc:trend_actor2",
                    handle: "trendy_questionmark",
                    displayName: "Trend Actor 2",
                    avatar: "src/assets/test-media/posts/image08.png",
                    labels: [],
                    createdAt: "2025-06-08T13:37:28.361Z"
                },
            ]
        }
        let ts = GetRecordsFeedTimestamp(record);
        expect(ts).to.equal(startedTime);
    })
})