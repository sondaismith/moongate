import { BlockedPost, FeedViewPost, isThreadViewPost, NotFoundPost, PostView, ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs.js";
import { IFeedDescription, IFeedListing } from "../interfaces/FeedInterfaces";
import { FeedEnums } from "../enums/FeedEnums";
import { View } from "@atproto/api/dist/client/types/app/bsky/embed/external";
import { $Typed } from "@atproto/api/dist/client/util";
import { Notification } from "@atproto/api/dist/client/types/app/bsky/notification/listNotifications";
import { TrendView } from "@atproto/api/dist/client/types/app/bsky/unspecced/defs";
import { GenerateCID, GenerateFakeTID } from "../helpers/generators";
import { ProfileView, ProfileViewBasic, ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { AppBskyEmbedExternal, AppBskyEmbedImages } from "@atproto/api/dist/client";
import { BookmarkView } from "@atproto/api/dist/client/types/app/bsky/bookmark/defs";
import { OutputSchema } from "@atproto/api/dist/client/types/com/atproto/server/createSession";
import { OutputSchema as searchActorsOutputSchema } from "@atproto/api/dist/client/types/app/bsky/actor/searchActors";
import { OutputSchema as getFeedGeneratorsOutputSchema } from "@atproto/api/dist/client/types/app/bsky/feed/getFeedGenerators";
import { OutputSchema as getPopularFeedGeneratorsOutputSchema } from "@atproto/api/dist/client/types/app/bsky/unspecced/getPopularFeedGenerators";
import { Main } from '@atproto/api/dist/client/types/app/bsky/feed/post';
import { GeneratorView } from "@atproto/api/src/client/types/app/bsky/feed/defs";

/**
 * Type indicating the state of a Parent Post - is it a `PostView` (standard), Not Found (i.e. deleted), Blocked,
 * or does it not exist at all.
 */
type ParentState = 'PostView'|'NotFoundPost'|'BlockedPost'|'None';

/**
 * Method used to create a dummy `PostView` object for testing purposes.
 * @param handle The handle of the User who made the Post.
 * @param postText The text content of the Post.
 * @param displayName The display name of the User who made the Post. If none is provided, the handle will be used.
 * @param postTime The time that the Post was created.
 * @returns The created `PostView` object.
 */
export async function CreatePostView(handle:string,postText:string='',displayName:string='',postTime:Date=new Date()):Promise<$Typed<PostView>>{
    let indexTime = postTime.toISOString();
    let cid = `author_${handle}_${1}`;
    await GenerateCID(`author_${handle}_${1}`).then(res => {
        cid = res.toString();
    })
    let post:$Typed<PostView> = {
        $type:"app.bsky.feed.defs#postView",
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
        uri:'at://did:plc:nowhere'
    }
    return post;
}

/**
 * Method used to create a dummy `NotFoundPost` object for testing purposes.
 * @returns A `$Typed<NotFoundPost>` object.
 */
export function CreateNotFoundPost():$Typed<NotFoundPost>{
    let nfpost:$Typed<NotFoundPost> = {
        $type:"app.bsky.feed.defs#notFoundPost",
        notFound:true,
        uri:'at://did:plc:notFoundPost'
    }
    return nfpost;
}

/**
 * Method used to create a dummy `FeedViewPost` object for testing purposes.
 * MUST AWAIT IN ORDER FOR CID TO BE GENERATED.
 * @param handle The handle of the User who made the Post.
 * @param postText The text content of the Post.
 * @param includeEmbedLink Should this post contain an external link embed?
 * @param displayName The display name of the User who made the Post. If none is provided, the handle will be used.
 * @param postTime The time that the Post was created.
 * @param isPinned Should the created Post be a pinned post?
 * @param parentState The "state" of the Parent post of the Post being created. Options are No Parent,
 * Standard Parent Post (value currently hardcoded), `NotFoundPost` Parent or `BlockedPost` Parent.
 * @returns The created `FeedViewPost` object.
 */
export async function CreateFeedViewPost(handle:string, postText:string='', includeEmbedLink:boolean=false,
    displayName:string='',postTime:Date=new Date(),isPinned:boolean=false,parentState:ParentState='None'):Promise<FeedViewPost>{
    // let currentTime = new Date();
    // currentTime.setTime(currentTime.getTime()-(1*60*1000));
    // postTime.setTime(postTime.getTime()-(1*60*1000));
    // let indexTime = currentTime.toISOString();
    let indexTime = postTime.toISOString();
    let cid = `author_${handle}_${1}`;
    await GenerateCID(`author_${handle}_${1}`).then(res => {
        cid = res.toString();
    })
    let tid = GenerateFakeTID();
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
            // uri:'at://did:plc:nowhere',
            uri:`at://${handle}/app.bsky.feed.post/${tid}`,
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
    switch (parentState) {
        case "PostView":
            let parentPost:$Typed<PostView>;
            await CreatePostView('parent.to.reply',"I'm the parent!",'Parent Post').then(res =>{
                parentPost = res;
                post.reply = {
                    parent:parentPost,
                    root:parentPost
                }
                post.post.record = {
                    reply:{
                        parent:{
                            cid:parentPost.cid,
                            uri:parentPost.uri
                        },
                    },
                    //root not implemented
                    ...post.post.record
                }
            })
            break;
        case "NotFoundPost":
            let nfPost = CreateNotFoundPost();
            let nfCID:string;
            await GenerateCID(`author_${handle}_nf`).then(res => {
                nfCID = res.toString();
                post.reply = {
                    parent:nfPost,
                    root:nfPost
                }
                post.post.record = {
                    reply:{
                        parent:{
                            cid:nfCID,
                            uri:nfPost.uri
                        },
                    },
                    //root not implemented
                    ...post.post.record
                }
            })
            break;
        default:
            break;
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
 * @param includeReply Should this post have a reply attached?
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
    let tid = GenerateFakeTID();
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
            // uri:'at://did:plc:nowherezonefake/app.bsky.feed.post/eenymeannuim0',
            uri:`at://${handle}/app.bsky.feed.post/${tid}`,
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
 * Method used to create a dummy `ThreadViewPost` object for testing purposes that does not
 * generate a unique CID. Currently used to create many `ThreadViewPost` objects that are
 * used to create a large Post Thread reply tree.
 * @param handle The handle of the User who made the Post.
 * @param postText The text content of the Post.
 * @param includeEmbedLink Should this post contain an external link embed?
 * @param includeImage Should this post have an image attached?
 * @param displayName The display name of the User who made the Post. If none is provided, the handle will be used.
 * @param postTime The time this Post was created.
 * @returns The created `ThreadViewPost` object.
 */
export function CreateThreadViewPostWithUnspeccedCID(handle:string, postText:string='', includeImage:{activate:boolean,type:'img'|'ext_gif'}={activate:false,type:"img"},
    includeEmbedLink:boolean=false, displayName:string='', postTime:Date=new Date()):$Typed<ThreadViewPost>{
    let cid = `bafyreibmiiqbxwrna3p5uwy3j2ymgwozaymgdgnzumz6g5akqp4tamcwie`;
    let tid = GenerateFakeTID();
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
            uri:`at://${handle}/app.bsky.feed.post/${tid}`,
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
            // (post.post.record as AppBskyFeedPost.Record).embed = extGif;
            post.post.embed = extGif;
        }
    }
    // if(includeReply.activate){
    //     let reply = await CreateThreadViewPost('mr.reply.guy', "Just replin'",{activate:true,type:includeReply.type});
    //     let replies:$Typed<ThreadViewPost>[] = [reply as $Typed<ThreadViewPost>]
    //     post.replies = replies;
    // }
    return (post as $Typed<ThreadViewPost>);
}

/**
 * Recursive method used to find a Post/Reply contained in a `ThreadViewPost` object. Traverses the thread tree
 * to find a match. Intended to be used to return the correct object when navigating a thread during the testing
 * of the `PostFocusModal` component.
 * @param post The `ThreadViewPost` to check for a Post/Reply that matches the URI being navigated to.
 * @param replyPostTid The TID (Timecode Identifier) associated with the Post/Reply to retrieve.
 * @returns A `ThreadViewPost` object if a match is found - otherwise `false`.
 */
export function FindThreadViewPostReply(post:$Typed<ThreadViewPost>|$Typed<NotFoundPost>|$Typed<BlockedPost>|{$type: string;}, replyPostTid:string):
$Typed<ThreadViewPost>|$Typed<NotFoundPost>|$Typed<BlockedPost>|{$type: string;}|boolean{
    // let notFound:NotFoundPost = {$type:"app.bsky.feed.defs#notFoundPost",uri:'at://reply-not-found',notFound:true};
    // let result:ThreadViewPost|NotFoundPost = notFound;
    let result;

    if(isThreadViewPost(post)){
        let postId = '';
        let urlSections = post.post.uri.split('/');
        if(urlSections.length>1) postId = urlSections[urlSections.length-1];
        let replyCount = typeof post.replies != 'undefined' ? post.replies.length : 0;

        if(postId == replyPostTid) return post;//Passed post is match - return post
        else{
            for (let i = 0; typeof post.replies != 'undefined' && i < replyCount; i++) {
                let currentReply = post.replies[i]
                result = FindThreadViewPostReply(currentReply,replyPostTid)
                if(result !== false) return result;//one of the replies is a match - return reply
            }
            return false;//no match in replies
        }
    }
    else return false;//no match in entire tree
}

/**
 * Method used to create a dummy `ProfileViewDetailed` object for testing purposes.
 * @param handle The handle of the User.
 * @param displayName The display name of the User. (Optional)
 * @returns The created `ProfileViewDetailed` object.
 */
export function CreateUserProfile(handle:string,displayName:string|undefined=undefined,didToUse='did:plc:6unmjnerkpiy3yh6x4auqpy3'):ProfileViewDetailed{
    let i = Math.floor(Math.random()*7);
    let j = Math.floor(Math.random()*7);
    let indexDate = new Date().toISOString();
    let profile:ProfileViewDetailed = {
        did:didToUse,
        handle:handle,
        avatar:`http://localhost:1420/src/assets/test-media/posts/image0${i+1}.png`,
        banner:`http://localhost:1420/src/assets/test-media/posts/image0${j+1}.png`,
        followersCount: Math.floor(Math.random()*50000),
        followsCount: Math.floor(Math.random()*1000),
        postsCount: Math.floor(Math.random()*3600),
        indexedAt:indexDate,
        createdAt:indexDate,
    }
    profile.description = `Hello! I am a User Profile created for testing this app.\nDID:${profile.did}\nHandle:${profile.handle}`
    if(typeof displayName != 'undefined') profile.displayName = displayName;
    return profile;
}

/**
 * Method used to create a `BookmarkView` object representing a bookmarked Post.
 * @param handle The handle of the User who made the bookmarked Post.
 * @param postText The text content of the bookmarked Post.
 * @param displayName The display name of the User who made the bookmarked Post. If none is provided, the handle will be used.
 * @param postTime The time that the bookmarked Post was created.
 * @param parentState The "state" of the Parent post of the bookmarked Post being created. Options are No Parent,
 * Standard Parent Post (value currently hardcoded), `NotFoundPost` Parent or `BlockedPost` Parent.
 * @returns The created `BookmarkView` object.
 */
export async function CreateBookmarkView(handle:string,postText:string='',displayName:string='',postTime:Date=new Date(),
parentState:ParentState='None'):Promise<BookmarkView>{
    let indexTime = postTime.toISOString();
    let cid = `bookmark${handle}_${1}`;
    await GenerateCID(cid).then(res => {
        cid = res.toString();
    })
    let bItem:$Typed<PostView>;
    await CreatePostView(handle,postText,displayName,postTime).then(res => bItem = res);
    let bookmark:BookmarkView = {
        item:bItem!,
        subject:{//These values are expected to be unused in testing for now
            cid:cid,
            uri:'at://did:plc:nowhere'
        },
        createdAt:indexTime
    }
    switch (parentState) {
        case "PostView":
            let parentPost:$Typed<PostView>;
            await CreatePostView('parent.to.reply',"I'm the parent!",'Parent Post').then(res =>{
                parentPost = res;
                (bItem.record as Main).reply = {
                    parent:{
                        cid:parentPost.cid,
                        uri:parentPost.uri
                    },
                    root:{
                        cid:parentPost.cid,
                        uri:parentPost.uri
                    }
                }
            })
            break;
        case "NotFoundPost":
            let nfPost = CreateNotFoundPost();
            let nfCID:string;
            await GenerateCID(`author_${handle}_nf`).then(res => {
                nfCID = res.toString();
                (bItem.record as Main).reply = {
                    // parent:nfPost,
                    // root:nfPost
                    parent:{
                        cid:nfCID,
                        uri:nfPost.uri
                    },
                    root:{
                        cid:nfCID,
                        uri:nfPost.uri
                    }
                }
            })
            break;
        default:
            break;
    }
    return bookmark;
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

/**
 * Method used to create a dummy session response. Currently used to mock logging into Bluesky.
 * @param handle The handle to use in the session response.
 * @param did The DID to use in the session response. NOTE: If trying access features that require an
 * account match (i.e. Bookmarks) the DID of the User Profile and Session Response must match.
 * @returns The created session response object.
 */
export function CreateLoginSessionResponse(handle:string="test-session.bsky.social",did:string="did:plc:test-session"):OutputSchema{
    let response:OutputSchema = {
        did: did,
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
        handle: handle,
        email: "testSession@mail.com",
        emailConfirmed: true,
        emailAuthFactor: false,
        accessJwt: "testAccessJwt",
        refreshJwt: "testRefreshJwt",
        active: true
    }
    return response;
}

/**
 * Method used to mock the a response for calling the `searchActors` Bluesky API method.
 * @param numActors The number of mocked Actor Search Results to return.
 * @returns Object representing the Bluesky API response for a `searchActors` call.
 */
export function CreateActorSearchResults(numActors:number=3):searchActorsOutputSchema{
    let results:ProfileView[] = [];
    let postTime = new Date().toISOString();
    for (let i = 0; i < numActors; i++) {
        let j = Math.floor(Math.random()*7);
        results.push({
            did:`did:plc:abcdefgmockactor${i}`,
            displayName:`Mocked Account ${i}`,
            handle:`user.account${i}.test`,
            avatar:`http://localhost:1420/src/assets/test-media/posts/image0${j+1}.png`,
            description:`I am a mocked account for testing purposes. My number is ${i}. ${j}!`,
            createdAt:postTime,
            indexedAt:postTime
        })
    }
    return {actors:results};
}

/**
 * Method used to mock the a response for calling the `getFeedGenerators` Bluesky API method.
 * @param numReturnedGenerators The number of mocked Feed Generators to return.
 * @returns Object representing the Bluesky API response for a `getFeedGenerators` call.
 */
export async function CreateGetFeedGeneratorsResponse(numReturnedGenerators:number=1):Promise<getFeedGeneratorsOutputSchema>{
    let results:GeneratorView[] = [];
    let postTime = new Date().toISOString();
    for (let i = 0; i < numReturnedGenerators; i++) {
        let j = Math.floor(Math.random()*7);
        let handle = `creator${i}.test`
        let cid = `author_${handle}_${1}`;
        await GenerateCID(`author_${handle}_${1}`).then(res => {
            cid = res.toString();
        })
        let did = `did:web:abcdefgmockfeedgenerator${i}`;
        let likesCount = Math.floor(Math.random()*3200);
        results.push({
            did:did,
            cid:cid,
            creator:{
                did:`did:plc:abcdefgmockfeedgeneratorcreator${i}`,
                handle:handle,
                displayName:`Mocked Feed Generator Creator ${i}`,
                indexedAt:postTime,
            },
            displayName:`Mocked Feed Generator ${i}`,
            avatar:`http://localhost:1420/src/assets/test-media/posts/image0${j+1}.png`,
            description:`I am a mocked feed generator for testing purposes. My number is ${i}. ${j}!`,
            likeCount:likesCount,
            indexedAt:postTime,
            uri:`at://${did}/app.bsky.feed.generator/feed-gen${i}`
        })
    }
    return {feeds:results};
}

export async function CreateGetPopularFeedGeneratorsResponse(numReturnedGenerators:number=5):Promise<getPopularFeedGeneratorsOutputSchema>{
    let results:GeneratorView[] = [];
    let postTime = new Date().toISOString();
    for (let i = 0; i < numReturnedGenerators; i++) {
        let j = Math.floor(Math.random()*7);
        let handle = `popular-creator${i}.test`
        let cid = `author_${handle}_${1}`;
        await GenerateCID(`author_${handle}_${1}`).then(res => {
            cid = res.toString();
        })
        let did = `did:web:abcdefgmockpopularfeedgenerator${i}.app`;
        let likesCount = Math.floor(Math.random()*3200);
        results.push({
            did:did,
            cid:cid,
            creator:{
                did:`did:plc:abcdefgmockpopularfeedgeneratorcreator${i}`,
                handle:handle,
                displayName:`Mocked Popular Feed Generator Creator ${i}`,
                indexedAt:postTime,
                createdAt:postTime
            },
            displayName:`Mocked Popular Feed Generator ${i}`,
            avatar:`http://localhost:1420/src/assets/test-media/posts/image0${j+1}.png`,
            description:`I am a mocked popular feed generator for testing purposes. My number is ${i}. ${j}!`,
            likeCount:likesCount,
            indexedAt:postTime,
            uri:`at://${did}/app.bsky.feed.generator/pop-feed-gen${i}`

        })
    }
    return {feeds:results};
}