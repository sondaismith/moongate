import { FunctionalComponent } from "vue";
import * as PostEnums from "../enums/PostEnums";
import { FeedViewPost, ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

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
    postData : FeedViewPost,
    postThread: ThreadViewPost,
    currentThreadView: ThreadViewPost,
    setCurrentThreadView(cid:string):void,
    returnToThreadOrigin():void,
    currentBreadcrumb: [ReplyBreadcrumb],
    updateCurrentBreadcrumbs():void,
    createPostData(data:ThreadViewPost):void,
    showModal(): void,
    hideModal(): void,
    showFocusModalIndex(mediaIndex:number): void,
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
    updatePostDetailIconValues(comments:string, reposts:string, likes:string): void,
    /**
     * DID of the user account that is currently being shown in
     * the `UserFocusModal` component.
     */
    currentUserAccountDID:string,
}

type ReplyBreadcrumb = {
    userName: string,
    postCID: string
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

interface IUploadedFile{
    blobURI:string,
    fileName:string,
    alt:string,
    type:string
}

export type {IPostDetails, IPostDetailsList, IDetailIcon, IOptionIcon, IUploadedFile}