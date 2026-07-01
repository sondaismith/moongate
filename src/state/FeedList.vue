<script lang="ts">
import { reactive } from 'vue';
import {FeedEnums} from '../enums/FeedEnums';
import { IFeedColumnSettings, IFeedDescription, IFeedListing, IFeedDBData, IFeedReturnedPostResults, IFeedStackItem } from '../interfaces/FeedInterfaces';
import { AppBskyFeedDefs } from '@atproto/api';
import { getAuthorFeed, getTagPosts } from '../lib/api/Feed.vue';
import { HandleAPIError, IsError } from '../helpers/errors';
import { AppBskyActorDefs } from '@atproto/api';
import { getUserProfile } from '../lib/api/User.vue';
import { ToastEventBus } from 'primevue';
import { AppState } from './AppState.vue';
import { IUserSearchResult } from '../interfaces/UserInterfaces';
import { GetBrowsingAgent } from '../lib/api.vue';
import { AppBskyNotificationListNotifications } from '@atproto/api';
import { AppBskyUnspeccedDefs } from '@atproto/api';
import { isTauri } from '@tauri-apps/api/core';
import { stringifyFeedListData, updateSavedFeedsTable } from '../lib/db/local_db';
import { clearIndexedDBSavedFeeds, Feed, web_db } from '../lib/db/web_db';
import { BroadcastChannelTarget, BroadcastObject, toRawDeep } from '../types/BroadcastChannelTypes';

//Code from Mulan at https://stackoverflow.com/a/27747377
function dec2hex (dec: number) {
    return dec.toString(16).padStart(2, "0")
}
//Code from Mulan at https://stackoverflow.com/a/27747377
export function GenerateUniqueId(len: number) : string{
    const arr = new Uint8Array((len || 40) / 2)
    crypto.getRandomValues(arr);
    const newId : string = Array.from(arr,dec2hex).join('');
    //Was supposed to be check to prevent dupes, not needed since this
    //wont be used live
    // feedListing.feedList.forEach(feed => {

    // });
    if(FeedState.FeedList.find(f => f.description.feedId == newId) != undefined) return GenerateUniqueId(len);
    return newId;
}

const toast = {
    add: (message) => ToastEventBus.emit('add', message),
    removeGroup: (group) => ToastEventBus.emit('remove-group', group),
    removeAllGroups: () => ToastEventBus.emit('remove-all-groups'),
};

/**The default value of how many Posts to load when creating/restoring a Feed. */
export const defaultNumOfPostsToLoad = 10;

export default{
    name:"FeedState"
}

export const FeedState = reactive({
    FeedList : [] as IFeedListing[],
    selectedFeed: '',
    isFeedOptionMenuVisible: false,
    /**Value indicating if application is waiting for an API response related to Feed data.*/
    isAwaitingFeedData:false,
    /**The old index (position) of the FeedColumn that is being dragged. Is NOT zero-based - subtract 1 to get correct index.*/
    oldFeedColumnIndex:-100,
    /**The new index (position) the FeedColumn that is being dragged will be placed. Is NOT zero-based - subtract 1 to get correct index.*/
    newFeedColumnIndex:-100,
    /**Indicates that one of the `FeedColumn` components is being dragged. */
    isGrabbingColumn:false,
    /**
     * The `OffsetLeft` of the selected `FeedColumn` Used to correctly position `FeedColumn`
     * when it is being dragged.
     * */
    dragColumnStartingX:0,
    /**
     * Where the User has clicked to drag the `FeedColumn` Used to correctly position
     * `FeedColumn` when it is being dragged.
     */
    dragColumnClickXPos:0,
})

/**
 * Method used to create a Feed object in the FeedList State
 * based on data returned by the Bluesky API.
 * @param description Details about the Feed (type, DID source, etc.).
 * @param feed The Feed data returned by the Bluesky API.
 * @param cursor Cursor to use when attempting to paginate displayed Posts.
 * @param seenAt Value used to indicate when the displayed Notifications were seen. Only used for Notification-type feeds.
 * @param awaitingData Indicates if the Feed is waiting for data to display. Using
 * the default value of true usually means the Feed is being added from the "Saved Feed"
 * database.
 * @param saveChanges Should the FeedList be saved to disk after Feed was added. Can be
 * used to postpone save until bulk add has finished.
 * @param syncFeed Should a message be sent through `BroadcastChannel` to sync the FeedList
 * in all open instances of the app in any tabs/windows.
 */
export async function AddFeedToList(description:IFeedDescription, feed:AppBskyFeedDefs.FeedViewPost[]|AppBskyNotificationListNotifications.Notification[]|AppBskyUnspeccedDefs.TrendView[], cursor:string='', seenAt:string='', awaitingData:boolean=true, saveChanges:boolean=true, syncFeed:boolean=false){
    /**Used to prevent duplicate Feeds from being created during a hot reload (or any other situation) */
    let isFeedDuplicate = FeedState.FeedList.find(feed => feed.description.feedId == description.feedId) != undefined;
    if(isFeedDuplicate){
        console.log(`${description.feedType.toString()} type Feed for ${description.feedName} with FeedId:${description.feedId} is already displayed in FeedList - probably from hotload-based Feed reload`);
        toast.add({summary:"Feed Duplication", detail:`${description.feedType.toString()} type Feed for ${description.feedName} with FeedId:${description.feedId} is already displayed in FeedList`, severity:'info', group:'tr', life:3000});
        return;
    }
    FeedState.FeedList.push({
        description:description,
        data:feed,
        cursor:cursor,
        seenAt:seenAt,
        isAwaitingFeedData:awaitingData,
    });
    //Save changes when requested
    if(saveChanges) await SaveFeedChanges();
    //Sync feeds between tabs/windows
    if(syncFeed){
        let feedSyncMessage:BroadcastObject = {target:BroadcastChannelTarget.FeedColumn, data:structuredClone(toRawDeep(FeedState.FeedList))};
        AppState.SendAppSyncMessage(feedSyncMessage);
    }
}

/**
 * Method used to prepare the data needed to add a Feed to `FeedList`. Creates the
 * description and post collection needed and returns it as an `IFeedListing`.
 * NOTE: Must toggle AppState.isCreatingFeed before calling method.
 * @param feedType The type of Feed to prepare data for.
 * @param feedData `IFeedStackItem` that holds all the data needed to create the Feed.
 * @param tags If this is to be a Tag-type Feed this parameter needs to be passed in - is a space
 * separated collection of hashtags.
 */
export async function PrepareFeedData(feedType:FeedEnums.Types,feedData:IFeedStackItem={id:'',did:'',name:'',handle:'',tags:[],type:FeedEnums.Types.User,icon:FeedEnums.Icons.User}):Promise<IFeedListing>{
    /**Object that will hold the returned Feed data. */
    var feedResult:IFeedReturnedPostResults = {data:[], cursor:''};
    //Handles getting DID when called by `Userlink` component
    if(feedData.did.trim() == '' && feedData.handle.trim() != ''){
        //get DID associated with handle
        await GetBrowsingAgent().getProfile({actor: feedData.handle})
        .then(res => feedData.did = res.data.did);
    }
    /**List of hashtags (without the #) separated by whitespace. */
    let tagString = typeof feedData.name != 'undefined' ? feedData.name : '';
    if(feedData.type == FeedEnums.Types.Tag && tagString.trim() == '') throw new Error("Tag list is empty string");
    await GetFeedDataForFeedType(feedData.type,feedData.did,tagString,'',defaultNumOfPostsToLoad)
    .then(res => {
        feedResult = res;
    })
    //Check if API call created Error
    // if(IsError(feedResult)){
    //     toast.add(HandleAPIError(feedResult as Error));
    //     //this.attemptingToCreateFeed = false;
    //     return; //Stop further actions
    // }
    console.log(feedResult);//DEBUG

    var defaultAppearance:IFeedColumnSettings = {
        width: FeedEnums.Widths.Small,
    }

    var usedFeedId:string = '';
    if(AppState.isUpdatingFeed) usedFeedId = FeedState.selectedFeed;
    else usedFeedId = GenerateUniqueId(10);
    /**Starting template for IFeedDescription used to create Feed. */
    var desc:IFeedDescription = {
        feedId: usedFeedId,
        userId:1,
        feedHandle:'loading_handle',
        feedName:'',
        feedAvatar:'',
        feedType:FeedEnums.Types.User,
        feedIcon:FeedEnums.Icons.Art,
        newPosts:0,totalPosts:0,
        feedColumnSettings:defaultAppearance,
        feedSourceDID:'',
        feedTags:'',
        latestPostDate:'',
        latestPostCID:''
    }
    await GenerateFeedDescription(usedFeedId,1,feedType,feedData.did,feedResult.data,
    undefined,tagString)
    .then(res => {
        desc = res;
    });

    return {description:desc, data:feedResult.data, cursor:feedResult.cursor, isAwaitingFeedData:false};
}

/**
 * Method used to return the latest (most recent) Post held in a Feed. Ignores
 * pinned Posts in Feed.
 * @param data The array of Feed posts. Assumes they are in order of Most Recent -> Oldest.
 */
export function GetLatestNonPinnedPost(data : AppBskyFeedDefs.FeedViewPost[] | AppBskyNotificationListNotifications.Notification[] | AppBskyUnspeccedDefs.TrendView[]):AppBskyFeedDefs.FeedViewPost|AppBskyNotificationListNotifications.Notification|AppBskyUnspeccedDefs.TrendView|undefined{
    let latestPost:AppBskyFeedDefs.FeedViewPost|AppBskyNotificationListNotifications.Notification|AppBskyUnspeccedDefs.TrendView|undefined = undefined;
    //Notification, 1st element is the latest.
    if(data.length>0 && (data[0] as AppBskyNotificationListNotifications.Notification).isRead){
        latestPost = data[0];
    }
    //Trending Topic, search for latest Trend
    else if(data.length>0 &&(data[0] as AppBskyUnspeccedDefs.TrendView).topic){
        let sortedTrends = (data as AppBskyUnspeccedDefs.TrendView[]).sort((a,b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
        latestPost = sortedTrends[0];
    }
    else{
        for (let i = 0; i < data.length; i++) {
            if(!AppBskyFeedDefs.isReasonPin((data[i] as AppBskyFeedDefs.FeedViewPost).reason)){
                latestPost = data[i]
                i = data.length;
            }
        }
    }
    return latestPost;
}

/**
 * Method that returns the "Feed" timestamp for a given Record. The "Feed" timestamp
 * being the time the Record would have been added to the Feed, not when it was
 * created (i.e. Reposts).
 * @param record The Record to get the "Feed" timestamp for.
 */
export function GetRecordsFeedTimestamp(record:AppBskyFeedDefs.FeedViewPost | AppBskyNotificationListNotifications.Notification | AppBskyUnspeccedDefs.TrendView):string{
    let ts = '';
    if((record as AppBskyFeedDefs.FeedViewPost).post){
        let fvPost = (record as AppBskyFeedDefs.FeedViewPost);
        ts = fvPost.post.indexedAt;
        if(AppBskyFeedDefs.isReasonRepost(fvPost.reason)) ts = fvPost.reason.indexedAt;
    }
    else if((record as AppBskyNotificationListNotifications.Notification).isRead){
        ts = (record as AppBskyNotificationListNotifications.Notification).indexedAt;
    }
    else if((record as AppBskyUnspeccedDefs.TrendView).topic){
        ts = (record as AppBskyUnspeccedDefs.TrendView).startedAt;
    }
    return ts;
}

/**
 * Returns the unique identifier carried by the passed in Record. Used to
 * identify newer Records when loading a Feed.
 * @param record The Record to search for its unique identifier.
 */
export function GetRecordsUniqueID(record:AppBskyFeedDefs.FeedViewPost | AppBskyNotificationListNotifications.Notification | AppBskyUnspeccedDefs.TrendView):string{
    let uniqueID = '';
    if((record as AppBskyFeedDefs.FeedViewPost).post){
        uniqueID = (record as AppBskyFeedDefs.FeedViewPost).post.cid;
    }
    else if((record as AppBskyNotificationListNotifications.Notification).isRead){
        uniqueID = (record as AppBskyNotificationListNotifications.Notification).cid;
    }
    else if((record as AppBskyUnspeccedDefs.TrendView).topic){
        uniqueID = (record as AppBskyUnspeccedDefs.TrendView).link;
    }
    return uniqueID;
}

/**
 * Method used to create a FeedDescription. Required when adding a Feed to the `FeedList`
 * state.
 * NOTE: Not really used anymore - the required `IFeedDescription` is just created before
 * being passed to the method that needs it.
 * @param userId The ID of the User stored in the `user_accounts` table this feed is associated with.
 * @param handle The Feed handle. If the Feed is for a user, this will just be their handle.
 * @param name The name/title of the Feed. The user can specify this to be whatever they want.
 * @param type The type of Feed this is. Used for categorization, changes icon used.
 * @param newPosts The number of unread posts.
 * @param totalPosts Total number of Posts in feed. Pretty sure this value is not needed.
 * @param feedColumnSettings Settings that determine the appearance of the `FeedColumn`.
 * @param sourceDid The "source" DID used to get Feed content. Used by User-type Feeds.
 */
export function OLDcreateFeedDescription(userId:number,handle:string,name:string,type:FeedEnums.Types,
    icon:FeedEnums.Icons,newPosts:number,totalPosts:number,feedColumnSettings:IFeedColumnSettings,
    sourceDid:string = '',feedTags:string = ''){
    var desc : IFeedDescription = {
        feedId: GenerateUniqueId(10),
        userId:userId,
        feedSourceDID: sourceDid,
        feedTags: feedTags,
        feedHandle: handle,
        feedName: name,
        feedAvatar:'',
        feedType: type,
        feedIcon: icon,
        newPosts: newPosts,
        totalPosts: totalPosts,
        feedColumnSettings: feedColumnSettings,
        latestPostDate:'',
        latestPostCID:'',
    }
    return desc;
}

/**
 * Interface intended to be used to add visibility to what variables are
 * being set/used when calling `GenerateFeedDescription()`. Not used at
 * the moment.
 */
interface IFeedDescriptionInput{
    feedId:string;
    userId:number;
    feedType:FeedEnums.Types;
    sourceDID:string;
    feedData:AppBskyFeedDefs.FeedViewPost[] | AppBskyNotificationListNotifications.Notification[] | AppBskyUnspeccedDefs.TrendView[];
    columnSettings?:IFeedColumnSettings;
    tags?:string;
    latestPostDate?:string;
    latestPostCID?:string;
}

/**
 * Method used to generate an IFeedDescription object that describes a Feed.
 * Intended to be used anywhere an object that is needed, during Feed creation
 * or updating (`PrepareFeedData`, `AddSavedFeed`, etc).
 * @param feedId The ID to use for this Feed.
 * @param userId The ID of the User stored in the `user_accounts` table this feed is associated with.
 * @param feedType The type of Feed this is. Used for categorization, changes icon used.
 * @param sourceDID The DID used to populate the Feed. Currently used by User and FeedGenerator type Feeds.
 * @param feedData The data associated with this Feed. Used to determine the most recent Post.
 * @param columnSettings The width setting that will be used by this Feed when added to column display.
 * @param tags Tags used to populate this Feed - ignored if not Tag-type Feed.
 */
export async function GenerateFeedDescription(feedId:string,userId:number,feedType:FeedEnums.Types,
sourceDID:string,feedData:AppBskyFeedDefs.FeedViewPost[] | AppBskyNotificationListNotifications.Notification[] | AppBskyUnspeccedDefs.TrendView[],
columnSettings:IFeedColumnSettings={width:FeedEnums.Widths.Small},tags:string='',
latestPostDate:string='',latestPostCID:string=''):Promise<IFeedDescription>{
    /**Latest post from returned Feed data. */
    let latestPost = GetLatestNonPinnedPost(feedData);
    /**Starting template for IFeedDescription used to create Feed. */
    var desc:IFeedDescription = {
        feedId:feedId,
        userId:userId,
        feedHandle:'loading_handle',
        feedName:tags.replace(' ',','),
        feedAvatar:'',
        feedType:FeedEnums.Types.User,
        feedIcon:FeedEnums.Icons.Art,
        newPosts:0,totalPosts:30,
        feedColumnSettings:columnSettings,
        feedSourceDID:'',
        feedTags:'',
        latestPostDate:latestPost ? GetRecordsFeedTimestamp(latestPost) : latestPostDate,
        latestPostCID:latestPost ? GetRecordsUniqueID(latestPost) : latestPostCID
    }

    //Update IFeedDescription Object values based on Feed Type
    switch(feedType) {
        case FeedEnums.Types.User:
            desc = {...desc,
                feedName:'[Fetching Displayname...]',
                feedSourceDID:sourceDID,
                feedIcon:FeedEnums.Icons.User
            }
            //Get profile name
            await GetBrowsingAgent().getProfile({actor:sourceDID})
            .then(res => {
                //Update required values of `IFeedDescription` template
                desc = {...desc,
                    feedName:res.data.displayName ? res.data.displayName : '[Empty Displayname]',
                    feedHandle:res.data.handle,
                    feedAvatar:res.data.avatar ? res.data.avatar : '',
                }
            });
            break;
        case FeedEnums.Types.Tag:
            //Update required values of `IFeedDescription` template
            desc = {...desc,
                feedType:FeedEnums.Types.Tag,
                feedIcon:FeedEnums.Icons.Hashtag,
                feedHandle:'hashtag',
                feedTags:tags
            }
            break;
        case FeedEnums.Types.Following:
            desc = {...desc,
                feedType:FeedEnums.Types.Following,
                feedIcon:FeedEnums.Icons.Following,
                feedHandle:'Following',
                feedName:'Following'
            }
            break;
        case FeedEnums.Types.Notifications:
            desc = {...desc,
                feedType:FeedEnums.Types.Notifications,
                feedIcon:FeedEnums.Icons.Notifications,
                feedHandle:'notifs',
                feedName:'Notifications'
            }
            break;
        case FeedEnums.Types.Trending:
            desc = {...desc,
                feedType:FeedEnums.Types.Trending,
                feedIcon:FeedEnums.Icons.Trending,
                feedHandle:'trending',
                feedName:'Trending'
            }
            break;
        case FeedEnums.Types.FeedGenerator:
            //Get profile name
            await GetBrowsingAgent().app.bsky.feed.getFeedGenerator({feed:sourceDID})
            .then(res => {
                desc = {...desc,
                    feedHandle: res.data.view.creator.handle,
                    feedName: res.data.view.displayName,
                    feedAvatar: res.data.view.avatar ? res.data.view.avatar : ''
                }
            })
            .finally(()=>{
                desc = {...desc,
                    feedType:FeedEnums.Types.FeedGenerator,
                    feedIcon:FeedEnums.Icons.FeedGenerator,
                    feedSourceDID:sourceDID
                }
            })
            break;
        default:
            break;
    }
    return desc;
}

/**
 * Method that finds a matching FeedList item and updates its `FeedColumn` settings.
 * @param feedToUpdate The Feed you wish to update the `FeedColumn` settings of.
 * @param newColumnSettings The new `FeedColumn` settings to update with.
 */
export async function updateFeedColumnSettings(feedToUpdate:IFeedListing, newColumnSettings:IFeedColumnSettings){
    var feed = FeedState.FeedList.find(element => element.description.feedId == feedToUpdate.description.feedId);
    //If existing Feed is found...
    if(feed){
        feed.description.feedColumnSettings = newColumnSettings;
        //Attempt to save Feed changes to disk
        await SaveFeedChanges();
    }
}

/**
 * DEBUG FUNCTION: Adds a dummy feed to the `FeedList` State
 * object.
 */
export function addDummyFeed(){
    const feedTypes = [FeedEnums.Icons.Art,FeedEnums.Icons.Friends,FeedEnums.Icons.News];
    var randomHandleNum = `${Math.floor((Math.random()*100))+1}_${Math.floor((Math.random()*100))+1}`;
    FeedState.FeedList.push({
        description:{
            feedId: GenerateUniqueId(10),
            feedHandle: `tester${randomHandleNum}`,
            feedName: 'CreatedByABtn',
            feedType: feedTypes[Math.floor(Math.random()*feedTypes.length)],
            newPosts: Math.floor(Math.random()*15),
            totalPosts: Math.floor(Math.random()*6),
            feedColumnSettings: {width:FeedEnums.Widths.Small}
        },
        data:[{
            post:{
                author:{
                    did:`test${GenerateUniqueId(10)}`,
                    handle: `tester${randomHandleNum}`,
                    displayName: `Tester${randomHandleNum}`
                },
                cid:`${GenerateUniqueId(10)}`,
                indexedAt: new Date().toISOString(),
                record:{
                    type: "app.bsky.feed.post",
                    text: "Test record. Hello World!"
                },
                uri: 'error',
                likeCount: Math.floor(Math.random()*55),
                replyCount: Math.floor(Math.random()*15),
                repostCount: Math.floor(Math.random()*15),
            }
        }]
    })
}

/**
 * DEBUG FUNCTION: Adds a dummy Post to a sepcific Feed.
 * @param feedId The `feedId` of the Feed you want to add the
 * dummy records to.
 */
export function addDummyPostToFeed(feedId:String){
    var feed = FeedState.FeedList.find(x => x.description.feedId == feedId);
    if(feed){//Ensure matching Feed was found
        var randomHandleNum = `${Math.floor((Math.random()*100))+1}_${Math.floor((Math.random()*100))+1}`;
        feed.data.splice(Math.floor(Math.random()*feed.data.length),0,{ //Place at random location
        // feed.data.push({ //Place at end
            post:{
                author:{
                    did:`test${GenerateUniqueId(10)}`,
                    handle: `tester${randomHandleNum}`,
                    displayName: `Tester${randomHandleNum}`
                },
                cid:`${GenerateUniqueId(10)}`,
                indexedAt: new Date().toISOString(),
                record:{
                    type: "app.bsky.feed.post",
                    text: "Test record. Hello World!"
                },
                uri: 'error',
                likeCount: Math.floor(Math.random()*55),
                replyCount: Math.floor(Math.random()*15),
                repostCount: Math.floor(Math.random()*15),
            }
        })
    }
}

/**
 * Adds Feed to current feed list. Used to restore saved feeds on
 * app startup. Does not populate Feed with Posts - use
 * `InitialLoadFeedPosts()`.
 * @param savedFeed Summary Feed info used to restore Feed in app.
 */
export async function AddSavedFeed(savedFeed:IFeedDBData){
    /**Starting template for IFeedDescription used to create Feed. */
    var desc:IFeedDescription = {
        feedId:savedFeed.id,
        userId:savedFeed.userId,
        feedHandle:'loading_handle',
        feedName:savedFeed.tags,
        feedAvatar:'',
        feedType:FeedEnums.Types.User,
        feedIcon:FeedEnums.Icons.Art,
        newPosts:0,totalPosts:30,
        feedColumnSettings:{width:savedFeed.settings.width},
        feedSourceDID:'',
        feedTags:'',
        latestPostDate:savedFeed.latestPostDate,
        latestPostCID:savedFeed.latestPostCID
    }

    //Not used atm, but intended to be a more readable way of
    //passing in the variables used by `GenerateFeedDescription()`.
    const feedDescInput:IFeedDescriptionInput = {
        feedId:savedFeed.id,
        userId:savedFeed.userId,
        feedType:savedFeed.type,
        sourceDID:savedFeed.did,
        feedData:[],
        columnSettings:savedFeed.settings,
        tags:savedFeed.tags,
        latestPostDate:savedFeed.latestPostDate,
        latestPostCID:savedFeed.latestPostCID
    }

    await GenerateFeedDescription(savedFeed.id,savedFeed.userId,savedFeed.type,savedFeed.did,[],
    savedFeed.settings,savedFeed.tags,savedFeed.latestPostDate,savedFeed.latestPostCID)
    .then(res => {
        desc = res;
    })
    AddFeedToList(desc,[],undefined,undefined,undefined,false);
}

export async function LoadFeedPostsAsync(feedDesc:IFeedDescription){
    var feed = FeedState.FeedList.find(x => x.description.feedId == feedDesc.feedId);
    if(feed){
        //If User Feed we need to get User Profile data
        if(feedDesc.feedType == FeedEnums.Types.User){
            let profile:AppBskyActorDefs.ProfileView = {did:'',handle:''};
            await getUserProfile(feedDesc.feedSourceDID)
            .then(res => profile = res.data)
            .catch((err) => {
                //error occured try to get User Profile
                toast.add(HandleAPIError(err, 'Error getting User profile while adding saved feeds'));
            });
            //Update required values of starting `IFeedDescription` template
            feed.description = {...feed.description,
                feedHandle:profile.handle,
                feedName:profile.displayName ? profile.displayName : '[Empty Displayname]',
                feedSourceDID:profile.did
            }
        }
        //Get data for Feed
        await GetFeedDataForFeedType(feedDesc.feedType,feedDesc.feedSourceDID,feedDesc.feedTags,'',defaultNumOfPostsToLoad)
        .then(res => {
            if(feed){
                console.log(res);//DEBUG
                feed.data = res.data.slice()
                feed.cursor = res.cursor
                feed.isAwaitingFeedData = false;
                //Update newPost value
                let newPosts = feedDesc.latestPostDate && feedDesc.latestPostDate.trim() != '' ?
                    res.data.filter(post => new Date(GetRecordsFeedTimestamp(post)) >= new Date(feedDesc.latestPostDate)
                    && GetRecordsUniqueID(post) != feedDesc.latestPostCID) : [];
                feed.description.newPosts = newPosts.length;
                /**Latest post from returned Feed data. */
                let latestPost = GetLatestNonPinnedPost(feed.data as AppBskyFeedDefs.FeedViewPost[]);
                //Update variables used to identify newer Records
                feed.description.latestPostDate = latestPost ? GetRecordsFeedTimestamp(latestPost) : '';
                feed.description.latestPostCID = latestPost ? GetRecordsUniqueID(latestPost) : '';
            }
        })
        .catch(err => toast.add(HandleAPIError(err, 'Error getting posts for Saved Feed')));
    }
}

/**
 * Method to be used to load the Feed data for all Feeds held in the
 * `FeedState.FeedList` collection.
 */
export async function LoadAllFeedPostsAsync(){
    for (let i = 0; i < FeedState.FeedList.length; i++) {
        await LoadFeedPostsAsync(FeedState.FeedList[i].description); //add await if you want these done sequentially
        // await new Promise((resolve) => setTimeout(resolve,200)) //use if you want to add a small delay between each API call
    }
    AppState.hasFeedDataBeenLoadedAfterInitiallization = true;
}

/**
 * Method used to get Feed data. It uses the Feed Type to choose the correct process needed
 * to return the correct data.
 * @param feedType The type of Feed this data is for. Of type `FeedEnums.Types`.
 * @param did The DID associated with the User Feed to retrieve.
 * @param tags The hashtags associated with the Tag Feed to retrieve.
 * @param cursor Used when requesting posts from a certain point (pagination).
 * @param postsToGet The number of Posts to return from the Author's Feed.
 */
export async function GetFeedDataForFeedType(feedType:FeedEnums.Types,did:string='',tags:string='',cursor:string='',postsToGet:number=30):Promise<IFeedReturnedPostResults>{
    /**Object that will hold the returned Feed data. */
    var feedResult:IFeedReturnedPostResults = {data:[], cursor:''};
    switch (feedType) {
        case FeedEnums.Types.User:
            await getAuthorFeed(did,cursor,postsToGet)
            .then(res => {
                feedResult.data = res.data.feed;
                if(res.data.cursor && res.data.cursor.trim()!='') feedResult.cursor = res.data.cursor;
            });
            break;
        case FeedEnums.Types.Tag:
            await getTagPosts(tags,cursor,25)
            .then(res => {
                if(res.data.cursor && res.data.cursor.trim()!='') feedResult.cursor = res.data.cursor;
                //Place Posts in a "Feed" shaped Object
                res.data.posts.forEach(p => {
                    (feedResult.data as AppBskyFeedDefs.FeedViewPost[]).push({post:p});
                })
            });
            break;
        case FeedEnums.Types.Following:
            if(AppState.isAuthBrowsing){
                await GetBrowsingAgent().getTimeline({limit:postsToGet,cursor:cursor})
                .then(res => {
                    feedResult.data = res.data.feed;
                    if(res.data.cursor && res.data.cursor.trim()!='') feedResult.cursor = res.data.cursor;
                });
            }
            else{
                toast.add({summary:"Info", detail:`Please log in to view Following Timeline.`, severity:'info', group:'tr', life:3000});
            }
            break;
        case FeedEnums.Types.Notifications:
            if(AppState.isAuthBrowsing){
                await GetBrowsingAgent().listNotifications()
                .then(res => {
                    console.log('From GetFeedDataForFeedType:');
                    console.log(res.data);
                    res.data.notifications.forEach(n => {
                        (feedResult.data as AppBskyNotificationListNotifications.Notification[]).push(n);
                    })
                    feedResult.seenAt = res.data.seenAt;
                })
                .catch(err => console.log(err));
            }
            else{
                toast.add({summary:"Info", detail:`Please log in to view Notifications.`, severity:'info', group:'tr', life:3000});
            }
            break;
        case FeedEnums.Types.Trending:
            await GetBrowsingAgent().app.bsky.unspecced.getTrends()
            .then(res => {
                console.log('Result from getTrends():');
                console.log(res.data);
                res.data.trends.forEach(tt => {
                    (feedResult.data as AppBskyUnspeccedDefs.TrendView[]).push(tt);
                })
            });
            break;
        case FeedEnums.Types.FeedGenerator:
            await GetBrowsingAgent().app.bsky.feed.getFeed({feed:did,cursor:cursor,limit:postsToGet})
            .then(res => {
                feedResult.data = res.data.feed;
                feedResult.cursor = (typeof res.data.cursor != 'undefined') ? res.data.cursor : '';
                console.log(res.data);
            })
            break;
        default:
            break;
    }
    return feedResult;
}

/**
 * Method that returns a specific Feed's IFeedListing object.
 * @param feedId Id of the Feed you wish get the IFeedListing object of.
 */
export function GetFeed(feedId:string){
    var feed = FeedState.FeedList.find(x => x.description.feedId == feedId);
    return feed;
}

/**
 *
 * @param feedId Id of the Feed you wish to update the specifications for.
 * @param description The updated IFeedDescription for the Feed.
 * @param feedData The new Feed content retrieved using the updated specifications.
 */
export async function UpdateFeedDetails(feedId:string, description:IFeedDescription, feedData:AppBskyFeedDefs.FeedViewPost[]|AppBskyNotificationListNotifications.Notification[]|AppBskyUnspeccedDefs.TrendView[], cursor:string=''){
    var feed = FeedState.FeedList.find(x => x.description.feedId == feedId);
    //If feed found
    if(feed){
        feed.description = description;
        feed.data = feedData;
        if(cursor.trim() != '') feed.cursor = cursor;
    }
    //Attempt to save FeedList to disk
    await SaveFeedChanges();
}

/**
 * Method that saves the application's updated saved Feed list to the relevant
 * database. Handles determining the method to used based on the current
 * platform.
 * @param silentSave Indicates whether or not the User will be informed that the save
 * is happening. Default value is false.
 */
export async function SaveFeedChanges(silentSave:boolean=false){
    if(isTauri()){
        await updateSavedFeedsTable({data:stringifyFeedListData(FeedState.FeedList)})
        .then(res => {if(!silentSave) toast.add({summary:'Saving Data',detail:`Feed List Updated`,severity:'success', group:'bc', life:3000})})
        .catch(err => toast.add({summary:'Error',detail:err,severity:'error', group:'bc', life:3000}))
    }
    //Add options for platforms other than Tauri desktop
    else{
        //Eventually should install the OS Information plugin to identify platform
        // toast.add({summary:"Using Platform other than Desktop", detail:`Will not be able to save feeds to disk`,severity:'info',group:'tr',life:2000});
        console.log(`Saving FeedList changes w/ Dexie.js...`);
        web_db.savedFeeds.put({id:1, data:stringifyFeedListData(FeedState.FeedList)})
        .then(res => {if(!silentSave)toast.add({summary:'Saving Data',detail:`Feed List Updated`,severity:'success', group:'bc', life:3000})})
        .catch(err => toast.add({summary:'Error',detail:err,severity:'error', group:'bc', life:3000}))
    }
}

/**
 * Removes specific Feed from FeedList.
 * @param feedId The `feedId` of the Feed you want to remove.
 */
export async function RemoveFeed(feedId:String){
    var feed = FeedState.FeedList.find(x => x.description.feedId == feedId);
    if(feed){//Ensure matching Feed was found
        var removeIndex = FeedState.FeedList.indexOf(feed);
        //Remove item
        FeedState.FeedList.splice(removeIndex,1);
    }
    //Attempt to save FeedList to disk
    await SaveFeedChanges();
}

/**
 * Removes Feed at a specific index from {@link FeedState.FeedList}.
 * @param index The array index of the Feed to remove.
 */
export async function RemoveFeedByIndex(index:number){
    if(index<FeedState.FeedList.length){//Ensure valid index value is used
        FeedState.FeedList.splice(index,1);
        //Attempt to save FeedList to disk
        await SaveFeedChanges();
    }
    else{
        toast.add({summary:'Error',detail:`Invalid Index`,severity:'error', group:'bc', life:3000})
    }

}

/**
 * Method used to refresh the data held in a currently displayed Feed.
 * @param feedId The ID of the loaded Feed that you want to refresh.
 */
export async function RefreshFeed(feedId:String, lastUpdate:Date, postsToGet:number=30){
    var feed = FeedState.FeedList.find(x => x.description.feedId == feedId);
    if(feed){//Ensure matching Feed was found
        //Code below was to cause the update to happen in a more smooth looking way
        feed.isAwaitingFeedData = true;
        feed.data = [];
        await new Promise(res => setTimeout(res,500));
        await GetFeedDataForFeedType(feed.description.feedType,feed.description.feedSourceDID,feed.description.feedTags,'',postsToGet)
        .then(res => {
            if(feed && (feed.description.feedType == FeedEnums.Types.User ||
                feed.description.feedType == FeedEnums.Types.Tag ||
                feed.description.feedType == FeedEnums.Types.FeedGenerator ||
                feed.description.feedType == FeedEnums.Types.Following)){
                //User and Tag Feed data should be in the shape of a AppBskyFeedDefs.FeedViewPost
                // let pinned = res.filter(post => post.reason && AppBskyFeedDefs.isReasonPin(post.reason));
                let latestDate = feed ? new Date(feed.description.latestPostDate) : lastUpdate;
                let newPosts = res.data.filter(post => new Date(GetRecordsFeedTimestamp(post)) >= latestDate && GetRecordsUniqueID(post) != feed?.description.latestPostCID);
                /**Latest post from returned Feed data. */
                let latestPost = GetLatestNonPinnedPost(res.data);
                //Update only if there are new posts
                // if(newPosts.length > 0) feed.data = [...pinned, ...newPosts, ...feed.data.slice(pinned.length)];
                feed.data = res.data.slice();
                feed.description.newPosts = newPosts.length;
                feed.description.latestPostDate = latestPost ? GetRecordsFeedTimestamp(latestPost) : '';
                feed.description.latestPostCID = latestPost ? GetRecordsUniqueID(latestPost) : '';
                feed.cursor = res.cursor;
                feed.isAwaitingFeedData = false;
            }
            else if(feed && feed.description.feedType == FeedEnums.Types.Notifications){
                //Notification Feed data should be in the shape of a Notification
                // let pinned = res.filter(post => post.reason && AppBskyFeedDefs.isReasonPin(post.reason));
                let newPosts = res.data.filter(post => new Date((post as AppBskyNotificationListNotifications.Notification).indexedAt) >= lastUpdate)
                //Update only if there are new posts
                // if(newPosts.length > 0) feed.data = [...pinned, ...newPosts, ...feed.data.slice(pinned.length)];
                feed.data = res.data.slice();
                feed.description.newPosts = newPosts.length;
                feed.isAwaitingFeedData = false;
            }
            else if(feed && feed.description.feedType == FeedEnums.Types.Trending){
                //Trending Topic Feed data should be in the shape of a Notification
                //Update only if there are new posts
                feed.data = res.data.slice();
                let latestDate = feed ? new Date(feed.description.latestPostDate) : lastUpdate;
                let newPosts = res.data.filter(post => new Date(GetRecordsFeedTimestamp(post)) >= latestDate && GetRecordsUniqueID(post) != feed?.description.latestPostCID);
                feed.description.newPosts = newPosts.length;
                feed.isAwaitingFeedData = false;
            }
            else{
                toast.add({summary:'Error', detail:`${feed?.description.feedType} type Feeds have not been added to supported "refresh list"`, severity:'error', group:'tr', life:3000});
                if(feed) feed.isAwaitingFeedData = false;
            }
        })
        .catch(err => {
            toast.add(HandleAPIError(err, 'Error refreshing feed'));
            if(feed) feed.isAwaitingFeedData = false;
        });
    }
}

/**
 * Method used to refresh all feeds displayed in the `FeedColumn` component. Intended
 * to be used when logging into or out of an authorized account. Used to get the displayed
 * elements to reflect the User Account's preferences/state (liked posts, blocked users, etc.).
 * @param postsToGet The number of Posts to initially retrieve for each Feed.
 */
export async function RefreshAllFeeds(postsToGet:number=10){
    FeedState.FeedList.forEach(feed => {
        RefreshFeed(feed.description.feedId,new Date(),postsToGet);
    });
    AppState.hasFeedDataBeenLoadedAfterInitiallization = true;
}

/**
 * Method used to refresh the data held in a currently displayed Feed.
 * @param feedId The ID of the loaded Feed that you want to refresh.
 */
 export async function LoadMoreFeedPosts(feedId:String,cursor:string|undefined){
    var feed = FeedState.FeedList.find(x => x.description.feedId == feedId);
    if(feed){//Ensure matching Feed was found
        //Code below was to cause the update to happen in a more smooth looking way
        // feed.data = [];
        // await new Promise(res => setTimeout(res,500));
        await GetFeedDataForFeedType(feed.description.feedType,feed.description.feedSourceDID,feed.description.feedTags,cursor)
        .then(res => {
            if(feed){
                res.data.forEach(post => {
                    feed.data.push(post);
                });
                feed.cursor = res.cursor;
            }
        })
        .catch(err => toast.add(HandleAPIError(err, 'Error loading older feed posts')));
    }
}

export function ClearFeed(feedId:String){
    var feed = FeedState.FeedList.find(x => x.description.feedId == feedId);
    if(feed){//Ensure matching Feed was found
        feed.data = [];
    }
}

/**
 * Method that toggles the visibility of the `FeedOptionsMenu`.
 */
export function ToggleFeedOptionsMenu(){
    FeedState.isFeedOptionMenuVisible = !FeedState.isFeedOptionMenuVisible;
}

/**
 * Method that updates the stored DID of the Feed that has just been
 * interacted with.
 * @param newVal The new value of the selected feed.
 */
export function UpdateSelectedFeed(newVal:string){
    FeedState.selectedFeed = newVal;
}
</script>