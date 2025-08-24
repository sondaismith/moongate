import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { IFeedDescription, IFeedListing } from "../interfaces/FeedInterfaces";
import { FeedEnums } from "../enums/FeedEnums";
import { View } from "@atproto/api/dist/client/types/app/bsky/embed/external";
import { $Typed } from "@atproto/api/dist/client/util";

/**
 * Method used to create a dummy `FeedViewPost` object for testing purposes.
 * @param handle The handle of the User who made the Post.
 * @param postText The text content of the Post.
 * @param includeEmbedLink Should this post contain an external link embed?
 * @param displayName The display name of the User who made the Post. If none is provided, the handle will be used.
 * @returns The created `FeedViewPost` object.
 */
export function CreateFeedViewPost(handle:string, postText:string='', includeEmbedLink:boolean=false, displayName:string=''):FeedViewPost{
    let currentTime = new Date();
    currentTime.setTime(currentTime.getTime()-(1*60*1000));
    let postTime = currentTime.toISOString();
    let cid = `author_${handle}_${1}`;
    // await GenerateCID(`author${i+1}`).then(res => {
    //     cid = res.toString();
    // })
    let post:FeedViewPost = {
        post:{
            author:{
                did:`did_fake_${1}`,
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
                text: postText.trim() == '' ? `Hello World! My name ${handle}.` : postText
            },
            uri:'nowhere',
            embed:includeEmbedLink ? CreateEmbed() : undefined
        },
    }
    return post;
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
export function CreateIFeedDescription(feedName:string,feedId:string,newPosts:number,totalPosts:number,feedHandle:string=''){
    return{
        feedId:feedId,
        userId:1,
        feedSourceDID:`did:plc:${feedId}`,
        feedTags:'',
        feedName:feedName,
        feedHandle:feedHandle.trim() != '' ? feedHandle : feedName.toLowerCase().replace(/ /g,'_'),
        feedType:FeedEnums.Types.User,
        feedIcon:FeedEnums.Icons.Art,
        newPosts:newPosts,
        totalPosts:totalPosts,
        feedColumnSettings:{width:FeedEnums.Widths.Small}
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
            thumb: "src/assets/test-media/posts/image08.png"
        }
    }
    return emb;
}