import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { describe } from "vitest";
import { CreateFeedViewPost, CreateIFeedDescription, CreateNotification, CreateTrendView } from "../fake-data/DataFactory";
import { GetLatestNonPinnedPost } from "./FeedList.vue"
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
let post1 = CreateFeedViewPost('bob_the_poster','I love my car shop!',true,undefined,new Date(2025,8,16,13,30));
let post2 = CreateFeedViewPost('cargo_haul', 'Delivery delivery delivery delivery',false,undefined,new Date(2025,8,16,13,21));
let post3 = CreateFeedViewPost('cargo_haul', 'the box is in place',undefined,undefined,new Date(2025,8,16,13,10));
let pinPost1 = CreateFeedViewPost('bob_the_poster','Cars all day, every day!',true,undefined,new Date(2025,8,16,13,30),true);
let feedDesc1 = CreateIFeedDescription('My First Feed',feedCID1,2,2);
let feedDesc2 = CreateIFeedDescription('Mr Repost',feedCID2,3,3);

let notif1 = CreateNotification('post_liker',"like",undefined,new Date(2025,8,16,13,30));
let notif2 = CreateNotification('u_will_be_mentioned',"mention","the mentioner",new Date(2025,8,16,9,3));

let trend1 = CreateTrendView('Testing','Software Dev',undefined,3421,new Date(2025,2,27,15,41));
let trend2 = CreateTrendView('House Ownership','Lifestyle',undefined,79,new Date(2025,8,16,20,32));
let trend3 = CreateTrendView('Naps','Lifestyle',undefined,133200,new Date(2025,4,9,8,11));
let trend4 = CreateTrendView('F1','Sport',undefined,11766,new Date(2025,4,12,14,20));

describe("Test suite for GetLatestNonPinnedPost()", () => {
    it("returns expected Record from collections of FeedViewPost - no pinned", () => {
        //Records should be returned via API in newest to oldest order, 1st is latest
        let postFeed1:FeedViewPost[] = [post1,post2,post3];
        let latestPost1 = GetLatestNonPinnedPost(postFeed1);
        expect(latestPost1).to.equal(post1);
        let postFeed2:FeedViewPost[] = [post3,post1,post3];
        let latestPost2 = GetLatestNonPinnedPost(postFeed2);
        expect(latestPost2).to.equal(post3);
    })
    it("returns expected Record from collections of FeedViewPost - has pinned post", () => {
        //Records should be returned via API in newest to oldest order, pinned post is skipped
        let postFeed1:FeedViewPost[] = [pinPost1,post1,post2,post3];
        let latestPost1 = GetLatestNonPinnedPost(postFeed1);
        expect(latestPost1).to.equal(post1);
        let postFeed2:FeedViewPost[] = [pinPost1,post3,post1,post3];
        let latestPost2 = GetLatestNonPinnedPost(postFeed2);
        expect(latestPost2).to.equal(post3);
    })
    it("returns expected Record from collections of Notification", () => {
        //Records should be returned via API in newest to oldest order, 1st is latest
        let postFeed1:Notification[] = [notif1,notif2];
        let latestPost1 = GetLatestNonPinnedPost(postFeed1);
        expect(latestPost1).to.equal(notif1);
        let postFeed2:Notification[] = [notif2,notif1];
        let latestPost2 = GetLatestNonPinnedPost(postFeed2);
        expect(latestPost2).to.equal(notif2);
    })
    it("returns expected Record from collections of TrendView", () => {
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

})