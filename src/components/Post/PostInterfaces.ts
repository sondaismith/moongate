import { FunctionalComponent } from "vue";
import { PostEnums } from "../../enums/PostEnums";

interface DetailIcon{
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
interface OptionIcon{
    name: String,
    icon: FunctionalComponent
}

export type {DetailIcon, OptionIcon}