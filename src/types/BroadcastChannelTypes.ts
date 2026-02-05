import { IFeedListing } from "../interfaces/FeedInterfaces";
import { IAppSettings } from "../interfaces/SettingsInterfaces";

/**Enum used to specify the target of a `BroadcastChannel` message. */
export enum BroadcastChannelTarget{
    AppSettings = "app_settings",
    FeedColumn = "feed_column",
}

/**Type used to describe the shape of data sent as part of the `BroadcastChannel` message. */
export type BroadcastObject = {
    target:BroadcastChannelTarget,
    // data:IAppSettings|IFeedListing,
    message?:string,
} & (BroadcastAppSettingData | BroadcastFeedColumnData)

/**Type used as part of discriminated union on {@link BroadcastObject} to describe the shape of "FeedColumn" data. */
export type BroadcastFeedColumnData = {
    target:BroadcastChannelTarget.FeedColumn,
    data:IFeedListing
}

/**Type used as part of discriminated union on {@link BroadcastObject} to describe the shape of "App Settings" data. */
export type BroadcastAppSettingData = {
    target:BroadcastChannelTarget.AppSettings,
    data:IAppSettings
}

/**
 * Type Predicate method used to narrow the type of an object passed through the `BroadcastChannel.postMessage()` method.
 * @param broadcastObject The object to type check.
 * @returns Boolean value indicating if the object is of the `IBroadcastObject` type or not.
 */
export function isBroadcastObject(broadcastObject: BroadcastObject|MessageEvent<any>): broadcastObject is BroadcastObject{
    return (broadcastObject as BroadcastObject).target !== undefined;
}