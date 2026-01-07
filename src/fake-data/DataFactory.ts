import { FeedViewPost, ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { IFeedDescription, IFeedListing } from "../interfaces/FeedInterfaces";
import { FeedEnums } from "../enums/FeedEnums";
import { View } from "@atproto/api/dist/client/types/app/bsky/embed/external";
import { $Typed } from "@atproto/api/dist/client/util";
import { Notification } from "@atproto/api/dist/client/types/app/bsky/notification/listNotifications";
import { TrendView } from "@atproto/api/dist/client/types/app/bsky/unspecced/defs";
import { GenerateCID } from "../helpers/generators";
import { ProfileViewBasic } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { AppBskyEmbedExternal, AppBskyEmbedImages } from "@atproto/api/dist/client";

/**
 * Method used to create a dummy `FeedViewPost` object for testing purposes.
 * MUST AWAIT IN ORDER FOR CID TO BE GENERATED.
 * @param handle The handle of the User who made the Post.
 * @param postText The text content of the Post.
 * @param includeEmbedLink Should this post contain an external link embed?
 * @param displayName The display name of the User who made the Post. If none is provided, the handle will be used.
 * @returns The created `FeedViewPost` object.
 */
export async function CreateFeedViewPost(handle:string, postText:string='', includeEmbedLink:boolean=false,
    displayName:string='',postTime:Date=new Date(),isPinned:boolean=false):Promise<FeedViewPost>{
    // let currentTime = new Date();
    // currentTime.setTime(currentTime.getTime()-(1*60*1000));
    // postTime.setTime(postTime.getTime()-(1*60*1000));
    // let indexTime = currentTime.toISOString();
    let indexTime = postTime.toISOString();
    let cid = `author_${handle}_${1}`;
    // cid = "bafyreifzelycxgfy7niauhzchi34z6avvb6fczinbcyj3y6465szpf5f7a";
    await GenerateCID(`author_${handle}_${1}`).then(res => {
        cid = res.toString();
    })
    let post:FeedViewPost = {
        post:{
            author:{
                did:`did:plc:fake_${1}`,
                handle:handle,
                displayName:displayName.trim() != '' ? displayName : (handle[0].toUpperCase()+handle.slice(1)).replace(/_/g,' ')
            },
            cid:cid,
            indexedAt:indexTime,
            record: {
                $type: "app.bsky.feed.post",
                createdAt: indexTime,
                langs: [
                    "en-US"
                ],
                text: postText.trim() == '' ? `Hello World! My name ${handle}.` : postText
            },
            uri:'at://did:plc:nowhere',
            embed:includeEmbedLink ? CreateEmbed() : undefined
        },
    }
    if(isPinned){
        post = {...post,
            reason: {
                $type: "app.bsky.feed.defs#reasonPin"
            }
        }
    }
    return post;
}

/**
 * Method used to create a dummy `ThreadViewPost` object for testing purposes.
 * MUST AWAIT IN ORDER FOR CID TO BE GENERATED.
 * @example
 * let post1:AppBskyFeedGetPostThread.OutputSchema;
 * await CreateThreadViewPost('tester.da.playwright',"Lorem ipsum dipsum, dimsum, mmm I'm hungry",true,'I AM A TESTER').then(res =>{
 *   post1 = {thread:res as $Typed<ThreadViewPost>}
 * })
 * @param handle The handle of the User who made the Post.
 * @param postText The text content of the Post.
 * @param includeEmbedLink Should this post contain an external link embed?
 * @param includeImage Should this post have an image attached?
 * @param includeReply Should this image have a reply attached?
 * @param displayName The display name of the User who made the Post. If none is provided, the handle will be used.
 * @param postTime The time this Post was created.
 * @returns The created `ThreadViewPost` object.
 */
export async function CreateThreadViewPost(handle:string, postText:string='', includeImage:{activate:boolean,type:'img'|'ext_gif'}={activate:false,type:"img"},
    includeEmbedLink:boolean=false, includeReply:{activate:boolean,images:boolean,type:'img'|'ext_gif'}={activate:false,images:false,type:"img"},
    displayName:string='', postTime:Date=new Date()):Promise<ThreadViewPost>{
    let cid = `author_${handle}_${1}`;
    await GenerateCID(`author_${handle}_${1}`).then(res => {
        cid = res.toString();
    })
    let profile:ProfileViewBasic={
        did:`did:plc:fake_${1}`,
        handle:handle,
        displayName: displayName.trim() != '' ? displayName : (handle[0].toUpperCase()+handle.slice(1)).replace(/_/g,' ')
    }
    let post:ThreadViewPost = {
        $type:"app.bsky.feed.defs#threadViewPost",
        post:{
            author:profile,
            cid:cid,
            indexedAt:postTime.toISOString(),
            record: {
                $type: "app.bsky.feed.post",
                createdAt: postTime.toISOString(),
                langs: [
                    "en-US"
                ],
                text: postText.trim() == '' ? `Hello World! My name ${handle}.` : postText
            },
            uri:'at://did:plc:nowherezonefake/app.bsky.feed.post/eenymeannuim0',
            embed:includeEmbedLink ? CreateEmbed() : undefined
        },
    }
    if(includeImage.activate){
        if(includeImage.type == "img"){
            let image:$Typed<AppBskyEmbedImages.View> = {
                $type:"app.bsky.embed.images#view",
                images:[
                    {
                        thumb: "http://localhost:1420/src/assets/test-media/posts/image08.png",
                        fullsize: "http://localhost:1420/src/assets/test-media/posts/image08.png",
                        alt: "",
                        aspectRatio: {
                            height: 350,
                            width: 700
                        }
                    }
                ]
            }
            post.post.embed = image;
        }
        else if(includeImage.type == "ext_gif"){
            let extGif:$Typed<AppBskyEmbedExternal.View> = CreateEmbedGIF();
            console.log('created embed GIF');
            console.log(extGif);
            // (post.post.record as AppBskyFeedPost.Record).embed = extGif;
            post.post.embed = extGif;
        }
    }
    if(includeReply.activate){
        let reply = await CreateThreadViewPost('mr.reply.guy', "Just replin'",{activate:true,type:includeReply.type});
        let replies:$Typed<ThreadViewPost>[] = [reply as $Typed<ThreadViewPost>]
        post.replies = replies;
    }
    return post;
}

/**
 * Method used to create a dummy `Notification` object for testing purposes.
 * @param handle The handle of the User who made the Post.
 * @param reason The reason for the Notification.
 * @param displayName The display name of the User who made the Post.
 * @param postTime The time at which the Notification was made.
 * @returns The created `Notification` object.
 */
export function CreateNotification(handle:string, reason:'like'
    | 'repost'
    | 'follow'
    | 'mention'
    | 'reply'
    | 'quote'
    | 'starterpack-joined'
    | 'verified'
    | 'unverified', displayName:string='',postTime:Date=new Date()):Notification{
    let indexTime = postTime.toISOString();
    let cid = `author_${handle}_${1}`;
    let subjectCID = `subject_${handle}_${1}`;
    // await GenerateCID(`author${i+1}`).then(res => {
    //     cid = res.toString();
    // })
    let post:Notification = {
        uri: "nowhere",
        cid: cid,
        author: {
            did: `did_fake${1}`,
            handle: handle,
            displayName: displayName,
            createdAt: "2025-02-04T13:02:19.244Z",
            description: "I'm a generated notification author!",
            indexedAt: "2025-09-01T12:45:32.297Z"
        },
        reason: reason,
        reasonSubject: "at://did:plc:link_to_subject",
        record: {
            $type: "app.bsky.feed.like",
            createdAt: "2025-07-09T03:02:23.589054+00:00",
            subject: {
                $type: "com.atproto.repo.strongRef",
                cid: subjectCID,
                uri: "at://did:plc:link_to_subject"
            }
        },
        isRead: true,
        indexedAt: indexTime,
    }

    switch (reason) {
        case "like":
            //code above handles this
            break;
        case "repost":
            post = {...post,
                record: {
                    $type: "app.bsky.feed.repost",
                    createdAt: "2025-07-09T03:02:23.589054+00:00",
                    subject: {
                        $type: "com.atproto.repo.strongRef",
                        cid: subjectCID,
                        uri: "at://did:plc:link_to_subject"
                    }
                },
            }
            break;
        case "mention":
            post = {...post,
                record: {
                    $type: "app.bsky.feed.mention",
                    createdAt: "2025-07-09T03:02:23.589054+00:00",
                    subject: {
                        $type: "com.atproto.repo.strongRef",
                        cid: subjectCID,
                        uri: "at://did:plc:link_to_subject"
                    }
                },
            }
            break;
        default:
            break;
    }
    return post;
}

/**
 * Method used to create a dummy `TrendView` object for testing purposes.
 * @param topic The "Topic" of the Trending Topic. DO NOT USE NON URL-SAFE CHARACTERS
 * @param category The category of the Trending Topic.
 * @param displayName The displayed name used for the Trending Topic. Usually the same/similar to the topic.
 * @param postCount The number of Posts related to the Trending Topic.
 * @param trendCreated When the Trending Topic started/was created.
 * @returns The created `TrendView` object.
 */
export function CreateTrendView(topic:string,category:string,displayName:string="",postCount:number=1337,trendCreated:Date=new Date()):TrendView{
    let startedTime = trendCreated.toISOString();
    let cid = `author_${topic.replace(' ','_')}_${1}`;
    let subjectCID = `subject_${topic.replace(' ','_')}_${1}`;
    let record:TrendView = {
        topic: topic,
        displayName: displayName.trim() != "" ? displayName : (topic[0].toUpperCase()+topic.slice(1)).replace(/_/g,' '),
        link: `/profile/trending.bsky.app/feed/${topic.replace(/ /g,'_')}`,
        startedAt: startedTime,
        postCount: postCount,
        category: category,
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
    return record;
}

/**
 * Method used to create an array of dummy `FeedViewPost` objects for testing purposes.
 * Not prefered to use over {@link CreateFeedViewPost} which allows for more control over
 * the content.
 * @param numOfPosts The number of Posts to include in the array.
 * @param handle The handle of the user who made each Post.
 * @param includeEmbedLink Should each post contain an external link embed?
 * @param displayName The display name of the User who made each Post. If none is provided, the handle will be used.
 * @returns The created `FeedViewPost` object array.
 */
export function CreateFeedViewPostArray(numOfPosts:number, handle:string, includeEmbedLink:boolean=false, displayName:string=''):FeedViewPost[]{
    let posts:FeedViewPost[] = [];
    let currentTime = new Date();
    for (let i = 0; i < numOfPosts; i++) {
        currentTime.setTime(currentTime.getTime()-(1*60*1000));
        let postTime = currentTime.toISOString();
        let cid = `author_${handle}_${i+1}`;
        // await GenerateCID(`author${i+1}`).then(res => {
        //     cid = res.toString();
        // })
        posts.push({
            post:{
                author:{
                    did:`did_fake_${i+1}`,
                    handle:handle,
                    displayName:displayName.trim() != '' ? displayName : (handle[0].toUpperCase()+handle.slice(1)).replace(/_/g,' ')
                },
                cid:cid,
                indexedAt:postTime,
                record: {
                    $type: "app.bsky.feed.post",
                    createdAt: postTime,
                    langs: [
                        "en-US"
                    ],
                    text: `Hello World! I am Post${i+1}`
                },
                uri:'nowhere',
                embed:includeEmbedLink ? CreateEmbed() : undefined
            },
        })
    }
    return posts;
}

/**
 * Method used to create an IFeedDescription object that describes a Feed. Expected to
 * be used to provide data for {@link CreateFeed} along with {@link CreateFeedViewPost}.
 * @param feedName The display name of the Feed being created.
 * @param feedId The unique Id of the Feed being created.
 * @param newPosts Number of new posts the associated Feed contains.
 * @param totalPosts The total number of posts the Feed contains.
 * @param feedHandle The handle of the Feed being created. If none is provided, the display name will be used.
 * @returns The created IFeedDescription object.
 */
export function CreateIFeedDescription(feedName:string,feedId:string,newPosts:number,totalPosts:number,latestPostCID:string,latestPostDate:string,feedHandle:string=''):IFeedDescription{
    return{
        feedId:`did:plc:${feedId}`,
        userId:1,
        feedSourceDID:`did:plc:${feedId}`,
        feedTags:'',
        feedName:feedName,
        feedHandle:feedHandle.trim() != '' ? feedHandle : feedName.toLowerCase().replace(/ /g,'_'),
        feedType:FeedEnums.Types.User,
        feedIcon:FeedEnums.Icons.Art,
        newPosts:newPosts,
        totalPosts:totalPosts,
        feedColumnSettings:{width:FeedEnums.Widths.Small},
        latestPostCID:latestPostCID,
        latestPostDate:latestPostDate
    }
}

/**
 * Method used to create an IFeedListing object that defines a Feed.
 * @param posts The array of Posts to display in the Feed.
 * @param desc The description of the Feed.
 * @returns The completed `IFeedListing` object.
 */
export function CreateFeed(posts:FeedViewPost[], desc:IFeedDescription):IFeedListing{
    let feed:IFeedListing;
    feed = {
        data:posts,
        description:desc,
        isAwaitingFeedData:false,
        cursor:'',
        seenAt:'',
    }
    return feed;
}

/**
 * Method that creates a quick and messy Feed collection. Works fine,
 * but not really reccommended to use.
 * @param numOfFeeds Number of Feeds to create.
 * @param numPostPerFeed Number of posts each Feed will contain.
 * @returns A `IFeedListing` array of the created Feeds.
 */
export function CreateRandomFeedListCollection(numOfFeeds:number, numPostPerFeed:number):IFeedListing[]{
    let list:IFeedListing[] = [];

    for (let i = 0; i < numOfFeeds; i++) {
        let numPosts = numPostPerFeed;
        let feedPosts = CreateFeedViewPostArray(numPosts,`test${i+1}`);
        list.push({
            data:feedPosts,
            description:{
                feedId:`id${i+1}`,
                userId:1,
                feedSourceDID:`testSourceDID_${i+1}`,
                feedTags:'',
                feedName:`Test${i+1}`,
                feedHandle:`test${i+1}`,
                feedType:FeedEnums.Types.User,
                feedIcon:FeedEnums.Icons.Art,
                newPosts:feedPosts.length,
                totalPosts:numPosts,
                feedColumnSettings:{width:FeedEnums.Widths.Small}
            },
            seenAt:"",
            isAwaitingFeedData:false
        })
    }
    console.log(list)
    return list;
}

/**
 * Method used to return a hard-coded object that can be used to attach
 * an "external link" embed object to a Post.
 * @returns A `$Typed<View>` External Embed object.
 */
export function CreateEmbed():$Typed<View>{
    let emb:$Typed<View> = {
        $type: "app.bsky.embed.external#view",
        external:{
            uri: "https://www.google.com/",
            title: "Component Test shows link to nowhere",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
            thumb: `http://localhost:1420${import.meta.env.BASE_URL.replace('src','iframes/src')}assets/test-media/posts/image08.png`
            //above URI will only work when testing with Cypress...not sure how to check for the testing environment
            //"src/assets/test-media/posts/image08.png"
            // "http://localhost:1420/src/assets/test-media/posts/image08.png"
            //above URI works with Playwright
            //'https://cdn.bsky.app/img/avatar/plain/did:plc:6unmjnerkpiy3yh6x4auqpy3/bafkreidaesr327h5xfnc4zthmx2hbazbxhxzfd763mfaw7czjrdi3jtpyy@jpeg'
        }
    }
    return emb;
}

/**
 * Method used to return a hard-coded object that can be used to attach
 * an "external GIF" embed object to a Post.
 * @returns A `$Typed<View>` External Embed GIF object.
 */
export function CreateEmbedGIF():$Typed<AppBskyEmbedExternal.View>{
    let emb:$Typed<AppBskyEmbedExternal.View> = {
        $type: "app.bsky.embed.external#view",
        external:{
            uri: "http://localhost:1420/src/assets/test-media/posts/tenor.com_test_ok.gif",
            title: "Placeholder for External GIF Testing",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
            // thumb: `http://localhost:1420${import.meta.env.BASE_URL.replace('src','iframes/src')}assets/test-media/posts/image08.png`
            //above URI will only work when testing with Cypress...not sure how to check for the testing environment
            //"src/assets/test-media/posts/image08.png"
            // "http://localhost:1420/src/assets/test-media/posts/image08.png"
            //above URI works with Playwright
            //'https://cdn.bsky.app/img/avatar/plain/did:plc:6unmjnerkpiy3yh6x4auqpy3/bafkreidaesr327h5xfnc4zthmx2hbazbxhxzfd763mfaw7czjrdi3jtpyy@jpeg'
        }
    }
    return emb;
}