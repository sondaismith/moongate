import { toRaw } from "vue";
import { IFeedListing } from "../interfaces/FeedInterfaces";
import { IAppSettings } from "../interfaces/SettingsInterfaces";
import { AtpSessionData } from '../../node_modules/@atproto/api/dist/types';

/**Enum used to specify the target of a `BroadcastChannel` message. */
export enum BroadcastChannelTarget{
    AppSettings = "app_settings",
    FeedColumn = "feed_column",
    LoginState = "login_state",
}

/**Type used to describe the shape of data sent as part of the `BroadcastChannel` message. */
export type BroadcastObject = {
    target:BroadcastChannelTarget,
    // data:IAppSettings|IFeedListing,
    message?:string,
} & (BroadcastAppSettingData | BroadcastFeedColumnData | BroadcastAuthStateData)

/**Type used as part of discriminated union on {@link BroadcastObject} to describe the shape of "FeedColumn" data. */
export type BroadcastFeedColumnData = {
    target:BroadcastChannelTarget.FeedColumn,
    data:IFeedListing[]
}

/**Type used as part of discriminated union on {@link BroadcastObject} to describe the shape of "App Settings" data. */
export type BroadcastAppSettingData = {
    target:BroadcastChannelTarget.AppSettings,
    data:IAppSettings
}

/**Type used as part of discriminated union on {@link BroadcastObject} to describe the shape of "App Settings" data. */
export type BroadcastAuthStateData = {
    target:BroadcastChannelTarget.LoginState,
    data:AtpSessionData|undefined
}

/**
 * Type Predicate method used to narrow the type of an object passed through the `BroadcastChannel.postMessage()` method.
 * @param broadcastObject The object to type check.
 * @returns Boolean value indicating if the object is of the `IBroadcastObject` type or not.
 */
export function isBroadcastObject(broadcastObject: BroadcastObject|MessageEvent<any>): broadcastObject is BroadcastObject{
    return (broadcastObject as BroadcastObject).target !== undefined;
}

/**
 * Method used to prepare reactive proxy (from reactive state) to be turned into a `structuredClone`.
 * Thanks to Jonas Schade at https://stackoverflow.com/a/77022014.
 * @param observed The object to prepare.
 * @returns Raw object from Vue-created proxy.
 */
export function toRawDeep<T>(observed: T): T {
    const val = toRaw(observed);

    // add any classes, that you want to support:
    if (val instanceof Date) return val;

    if (Array.isArray(val)) {
        return val.map(toRawDeep) as T;
    }

    if (val === null) return null as T;

    if (typeof val === 'object') {
        const entries = Object.entries(val).map(([key, val]) => [key, toRawDeep(val)]);
        return Object.fromEntries(entries);
    }

    return val;
}