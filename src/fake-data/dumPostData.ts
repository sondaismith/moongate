import { IDetailIcon, IOptionIcon, IPostDetails } from "../interfaces/PostInterfaces";
import * as PostEnums from "../enums/PostEnums";

//DetailIcon Icons
import SolarChatDotsOutline from '~icons/solar/chat-dots-outline';
import MingcuteRepeatLine from '~icons/mingcute/repeat-line';
import MingcuteHeartFill from '~icons/mingcute/heart-fill';
import SolarShareBold from '~icons/solar/share-bold';
import MdiDotsHorizontal from '~icons/mdi/dots-horizontal';

/**In a real situation, the label values should be set when the modal is created
 * using the post data returned from the server.
 */
var DetailIconList : IDetailIcon[] = [
    { label: '6', type:PostEnums.IconTypes.Comment, icon: SolarChatDotsOutline, color: 'group-hover:text-yellow-500' },
    { label: '2', type:PostEnums.IconTypes.Reposts, icon: MingcuteRepeatLine, color: 'group-hover:text-blue-500' },
    { label: '3', type:PostEnums.IconTypes.Likes, icon: MingcuteHeartFill, color: 'group-hover:text-red-500' },
    { label: '', type:PostEnums.IconTypes.Share, icon: SolarShareBold, color: 'group-hover:text-blue-500' },
    { label: '', type:PostEnums.IconTypes.Options, icon: MdiDotsHorizontal, color: 'group-hover:text-white-500' },
]

//PostOptionMenu Icons
import MdiTranslateVariant from '~icons/mdi/translate-variant';
import MdiClipboard from '~icons/mdi/clipboard';
import MdiCode from '~icons/mdi/code';
import MingcuteVolumeMuteFill from '~icons/mingcute/volume-mute-fill';
import MdiHideOutline from '~icons/mdi/hide-outline';
import MdiBlock from '~icons/mdi/block';
import { PostTypes } from "../enums/PostEnums";
import { AppBskyFeedDefs } from "@atproto/api";

/**
 * Collection of all the options to display on the
 * `PostOptionsMenu` component.
 */
const OptionIconList : IOptionIcon[][] = [
    [
        { name:'Translate', icon:MdiTranslateVariant },
        { name:'Copy link', icon:MdiClipboard },
        { name:'Embed', icon:MdiCode },
    ],
    [
        { name:'Mute', icon: MingcuteVolumeMuteFill }
    ],
    [
        { name:'Hide', icon: MdiHideOutline }
    ],
    [
        { name:'Block', icon: MdiBlock }
    ]
]

var firstPostObject:IPostDetails[] = [
    {userName:'Modal', userHandle:'modalTest.moon.social', totalComments:6, totalReposts: 12, totalLikes: 42, postType:PostTypes.Text, postText:'Test',
        comments:[
            {userName:'angry-man', userHandle:'angryangry', totalComments:6, totalReposts: 0, totalLikes: 4, postType:PostTypes.Text, postText:'Hello. I am an angry robot!',
                comments:[
                    {userName:'robot', userHandle:'happyhappy', totalComments:0, totalReposts: 12, totalLikes: 42, postType:PostTypes.Text, postText:'Why are you angry?', comments:[]},
                ]},
            {userName:'user1', userHandle:'user1', totalComments:0, totalReposts: 12, totalLikes: 22, postType:PostTypes.Text, postText:'Hi?', comments:[]},
            {userName:'user2', userHandle:'user2', totalComments:0, totalReposts: 2, totalLikes: 1, postType:PostTypes.Text, postText:'Hello?', comments:[]},
        ]
    }
]

// var emptyPostModalData:FeedViewPost = {
//     post:{
//         author:{
//             did:'error',
//             handle:'not-real',
//         },
//         cid:'error',
//         indexedAt:'never',
//         record:{
//             text:'[No Text]'
//         },
//         uri:'going.nowhere',
//     }
// }
var emptyPostView:AppBskyFeedDefs.PostView = {
    author:{
        did:'error',
        handle:'not-real',
    },
    cid:'error',
    indexedAt:'never',
    record:{
        text:'[No Text]'
    },
    uri:'going.nowhere',
}
var emptyPostThread:AppBskyFeedDefs.ThreadViewPost = {
    post:{
        author:{
            did:"",
            handle:""
        },
        cid:"",
        uri:"",
        indexedAt: "",
        record:{}
    }
}

export { DetailIconList, OptionIconList, firstPostObject, emptyPostView, emptyPostThread }