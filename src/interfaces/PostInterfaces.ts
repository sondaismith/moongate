import { FunctionalComponent } from "vue";
import * as PostEnums from "../enums/PostEnums";
import { ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

interface IPostDetails{
    userName: String,
    userHandle: String,
    totalComments: Number, //not going to actually be in final version, just use .length
    totalReposts: Number,
    totalLikes: Number,
    postText: String,
    postType: PostEnums.PostTypes
    postMedia?: String[],
    comments: IPostDetails[],
    // timestamp?: Date
}

interface IPostDetailsList{
    isVisible: Boolean,
    isFocusVisible: Boolean,
    clickedMediaIndex: number,
    getClickedMediaIndex():number,
    setClickedMediaIndex(newVal:number):void,
    postData : IPostDetails,
    postThread: ThreadViewPost,
    createPostData(data:ThreadViewPost):void,
    showModal(): void,
    showModalPost(postToShow:IPostDetails): void,
    hideModal(): void,
    showFocusModal(postToShow:IPostDetails,mediaIndex:number): void,
    hideFocusModal(): void,
    isPostOptionsMenuVisible: Boolean,
    showPostOptionsMenu(event:PointerEvent): void,
    hidePostOptionsMenu(event:PointerEvent): void,
    menuClickPos: number[],
    /**
     * Holds reference to last clicked button. Used for "Post Options"
     * menu button only at the moment.
     */
    clickedElement: HTMLElement,
    postDetailIconValues: IDetailIcon[],
    updatePostDetailIconValues(omments:string, reposts:string, likes:string): void,
}

interface IDetailIcon{
    label: String,
    type: PostEnums.IconTypes,
    icon: FunctionalComponent,
    color: String
}

/**
 * Interface used to specify the data needed by
 * a `PostOptionsMenuItem` component to display its
 * label and icon.
 */
interface IOptionIcon{
    name: String,
    icon: FunctionalComponent
}

export type {IPostDetails, IPostDetailsList, IDetailIcon, IOptionIcon}