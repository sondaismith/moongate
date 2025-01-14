import { FunctionalComponent } from "vue";
import { PostEnums } from "../enums/PostEnums";

interface IPostDetails{
    userName: String,
    userHandle: String,
    totalComments: Number, //not going to actually be in final version, just use .length
    totalReposts: Number,
    totalLikes: Number,
    postText: String,
    postMedia?: String,
    comments: IPostDetails[],
    // timestamp?: Date
}

interface IPostDetailsList{
    isVisible: Boolean,
    postDetailsList : IPostDetails[],
    showModal(): void,
    hideModal(): void,
    isPostOptionsMenuVisible: Boolean,
    showPostOptionsMenu(event:PointerEvent): void,
    hidePostOptionsMenu(event:PointerEvent): void,
    menuClickPos: number[],
    /**
     * Holds reference to last clicked button. Used for "Post Options"
     * menu button only at the moment.
     */
    clickedElement: HTMLElement
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

export type {IPostDetailsList, IDetailIcon, IOptionIcon}