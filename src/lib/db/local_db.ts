import { Monitor, PhysicalPosition, PhysicalSize } from "@tauri-apps/api/window";
import { BaseDirectory, exists, remove } from "@tauri-apps/plugin-fs";
import Database, { QueryResult } from "@tauri-apps/plugin-sql";
import { IFeedDBData, IFeedListing } from "../../interfaces/FeedInterfaces";
import { isTauri } from "@tauri-apps/api/core";
import { web_db } from "./web_db";

export const APP_SETTINGS_FILENAME = 'moongate_settings.json';
export const LOCAL_DB_FILENAME = 'moongate_app.db';
const APPLICATION_DB = "sqlite:moongate_app.db";

enum FeedSizeSetting{
    Small,
    Medium,
    Large
}

export enum QueryAction{
    CREATE,
    SELECT,
    INSERT,
    UPDATE,
    DELETE
}

/**
 * Enum used as part of actions relating to moongate_app database.
 *
 * Holds details specifying table name (key) and number of columns (value).
 */
export enum DBTable{
    app_settings = 9,
    user_accounts = 4,
    saved_feeds = 1,
}

/**
 * Type that describes the shape of the data that can be
 * saved to the application preferences table.
 */
export type AppSettings = {
    currentUserId?: number,
    darkModeOn?: number,
    lastWindowWidth?: number,
    lastWindowHeight?: number,
    lastWindowPosX?: number,
    lastWindowPosY?: number,
    lastMonitor?: string,
    lastUpdatedAt?: string,
    collection?:string,
}

/**
 * Type that describes the shape of the data that can be saved to the user_accounts table.
 */
export type UserAccounts = {
    name: string,
    handle: string,
    did: string,
    pfp?: string,
}

/**
 * Type that describes the shape of data that defines what
 * data will be displayed and the way a user's feed will be displayed.
 */
export type SavedFeeds = {
    data:string,
    // did: string,
    // type:FeedEnums.Types,
    // icon:FeedEnums.Icons,
    // settings?: IFeedColumnSettings,
}

/**
 * Method that creates the SQL Query needed to update the application preferences.
 * @param newAppSettings Object containing the variables that need to be updated and their new values.
 * @param updateId The id of the record that needs to be updated.
 * @returns String value of the created SQL Query.
 */
export function createQueryString(queryType:QueryAction, newAppSettings:AppSettings|UserAccounts|SavedFeeds, tableToTarget:DBTable, updateId?:number){
    var query;

    var objectKeys = Object.keys(newAppSettings);

    switch (queryType) {
        case QueryAction.CREATE:
            //not implemented
            query = undefined;
            break;
        case QueryAction.INSERT:
            if(objectKeys.length < tableToTarget){
                //log and inform of error - too few values
                query = undefined;
            }
            else{
                //get target table name via key from DBTable enum
                query = `INSERT into ${Object.keys(DBTable)[Object.values(DBTable).indexOf(tableToTarget)]} `;
                var columns = "(";
                var values = "VALUES(";
                for (let i = 0; i < objectKeys.length; i++) {
                    columns += objectKeys[i];
                    values += "$"+(i+1);
                    if(i+1<objectKeys.length){
                        columns+=", "; //if not last element, add comma
                        values+=",";
                    }
                    else{
                        columns+=") "; //add closing bracket
                        values+=")";
                    }
                }
                query = query + columns + values;
            }
            break;
        case QueryAction.UPDATE:
            if(objectKeys.length<1){
                query = undefined;
                break;//no values specified - do not continue
            }
            //get target table name via key from DBTable enum
            query = `UPDATE ${Object.keys(DBTable)[Object.values(DBTable).indexOf(tableToTarget)]} SET `;
            for (let i = 0; i < objectKeys.length; i++) {
                var column = objectKeys[i]+" = "+"$"+(i+1);
                if(i+1<objectKeys.length) column+=", "; //if not last element, add comma
                query += column;
            }
            if(updateId){//if updateId has been specified and is not undefined
                //target record id
                query += " WHERE id = "+updateId;
            }
            break;
        default:
            query = undefined;
    }
    return query;
}

/**
 * Method that attempts to create the `app_settings` table.
 * @returns Result of trying to create the `app_settings` table. Will be
 * a string starting with "ERROR:" if something went wrong.
 */
export async function createAppSettingTable(){
    const db = await Database.load(APPLICATION_DB);
    var result;
    try{
        const newTableQuery = 'CREATE TABLE app_settings (id INTEGER PRIMARY KEY,currentUserId INTEGER DEFAULT 1,'
        +'darkModeOn INTEGER DEFAULT 0,lastWindowWidth INTEGER,lastWindowHeight INTEGER,lastWindowPosX INTEGER,'
        +'lastWindowPosY INTEGER,lastMonitor TEXT DEFAULT "\\\\.\\DISPLAY1",lastUpdatedAt datetime DEFAULT "now",'
        +'collection TEXT DEFAULT "")';
        result = await db.execute(newTableQuery);
    }
    catch(error){
        result = error;
    }
    await db.close(); //close connection
    return checkIfError(result);
}

/**
 * Method that attempts to create the `user_accounts` table. Will only
 * run on the Desktop version of the application.
 * @returns Result of trying to create the `user_accounts` table. Will be
 * a string starting with "ERROR:" if something went wrong.
 */
export async function createUserAccountsTable(){
    var result;
    if(isTauri()){//On Desktop
        const db = await Database.load(APPLICATION_DB);
        try{
            const newTableQuery = 'CREATE TABLE user_accounts (id INTEGER PRIMARY KEY,name TEXT NOT NULL,'
            +'handle TEXT NOT NULL,did TEXT NOT NULL,pfp TEXT)';
            result = await db.execute(newTableQuery);
        }
        catch(error){
            result = error;
        }
        await db.close(); //close connection
    }
    return checkIfError(result);
}

/**
 * Method that attempts to create the `saved_feeds` table. Will only
 * run on the Desktop version of the application.
 * @returns Result of trying to create the `saved_feeds` table. WIll be
 * a string starting with "ERROR:" if something went wrong.
 */
export async function createSavedFeedsTable() {
    var result;
    if(isTauri()){//On Desktop
        const db = await Database.load(APPLICATION_DB);
        try{
            const newTableQuery = 'CREATE TABLE saved_feeds (id INTEGER PRIMARY KEY,data TEXT NOT NULL)';
            result = await db.execute(newTableQuery);
        }
        catch(error){
            result = error;
        }
        try {
            const initialRecordQuery = 'INSERT INTO saved_feeds (data) VALUES("")';
            result = await db.execute(initialRecordQuery);
        }
        catch(error){
            result = error;
        }
        await db.close(); //close connection
    }
    return checkIfError(result);
}

/**
 * Method used to initialize the `app_settings` table with a record after it has been created.
 * @returns Result of trying to initialize the `app_settings` table. Will be
 * a string starting with "ERROR:" if something went wrong.
 */
export async function initializeAppSettingsTable(){
    const db = await Database.load(APPLICATION_DB);
    var result;
    var addInitialResult;
    try{
        //create variable with initial values
        var initialValues = {currentUserId: 1,darkModeOn:0,lastWindowWidth:800,lastWindowHeight:600,lastWindowPosX:560,
            lastWindowPosY:240,lastMonitor:"\\\\.\\DISPLAY1",lastUpdatedAt:new Date().toISOString(),collection:''} as AppSettings;
        //generate query
        var query = createQueryString(QueryAction.INSERT,initialValues,DBTable.app_settings);
        if(query == undefined) addInitialResult = "ERROR: Creation of initialize 'app_settings' table query failed";
        else
            addInitialResult = await db.execute(query,Object.values(initialValues));
        result = addInitialResult;
    }
    catch(error){
        result = error;
        await db.close();
    }
    await db.close(); //close connection
    return checkIfError(result);
}

/**
 * Method that allows the updating of the values held in the `app_settings` table.
 * @param newValues The values to update the `app_settings` table with.
 * @returns
 */
export async function updateAppSettings(newValues:AppSettings|Object):Promise<QueryResult> {
    const db = await Database.load(APPLICATION_DB);
    let result:QueryResult = {rowsAffected:0};

    var query = createQueryString(QueryAction.UPDATE, newValues, DBTable.app_settings);
    if(query == undefined) throw new Error("ERROR: Creation of 'update' query failed");
    await db.execute(query,Object.values(newValues))
    .then(res => result = res)
    .finally(() => db.close());
    return result;
}

/**
 * Method that is used to reset app settings to their default by
 * deleting the table and recreating it.
 * @returns Result of trying to delete the app_settings table.
 */
export async function clearAppSettings() {
    const db = await Database.load(APPLICATION_DB);
    var result;
    try{
        result = await db.execute('DELETE FROM app_settings');//Effectively a TRUNCATE
    }
    catch(error){
        result = error;
    }
    await db.close();
    return checkIfError(result);
}

/**
 * Method that checks if the `moongate_app.db` database file exists in the
 * AppData folder (AppData/Roaming/).
 * @returns True if database exists, False if not.
 */
export async function checkIfAppSettingsDatabaseExists() {
    var result;
    try{
        const dbExists = await exists('moongate_app.db', {
            baseDir: BaseDirectory.AppData,
        });
        console.log("does `moongate_app` db exist: "+dbExists);
        result = dbExists;
    }
    catch(error){
        result = error; //Make sure to handle returned error object wherever
    }
    return checkIfError(result);
}

/**
 * Method that attempts to delete the `moongate_app.db` app_settings
 * database file.
 * @returns Nothing.
 */
export async function deleteAppSettingsDBFile(){
    var result;
    try{
        const dbFileDelete = await remove('moongate_app.db', {
            baseDir: BaseDirectory.AppData,
        });
        console.log("app_settings db file deleted: "+dbFileDelete);
        result = dbFileDelete;
    }
    catch(error){
        result = error;
    }
    return checkIfError(result);
}

/**
 * Method that checks if the `app_settings` table exists, and if there's
 * at least one record row in it.
 * @returns True (1) if table exists, False (0) if not.
 */
export async function checkIfAppSettingsTableExists(){
    var result;
    try{
        const db = await Database.load(APPLICATION_DB);
        var tableExists = await db.select("SELECT EXISTS (SELECT * FROM sqlite_master WHERE type='table' AND name='app_settings')");
        //returned object key is query text and result is value, the array indexes below extract the values
        var tableResult = Boolean(Object.values(tableExists[0])[0]);
        var rowResult = false;
        //if table exists, need to check for row
        if(tableResult){
            var rowExists = await db.select("SELECT EXISTS (SELECT 1 FROM app_settings LIMIT 1)");
            rowResult = Boolean(Object.values(rowExists[0])[0]);
        }
        result = (tableResult && rowResult); //both must be true for all to be A-OK
        await db.close();
        console.log("does `app_settings` table exist: "+result);
    }
    catch(error){
        result = error; //Make sure to handle returned error object wherever
    }
    return checkIfError(result);
}

/**
 * Method that checks if the `user_accounts` table exists, and if there's
 * at least one record row in it. Will only run on the Desktop version of
 * the application.
 * @returns True (1) if table exists, False (0) if not.
 */
export async function checkIfUserAccountsTableExists(){
    var result;
    if(isTauri()){
        try{
            const db = await Database.load(APPLICATION_DB);
            var tableExists = await db.select("SELECT EXISTS (SELECT * FROM sqlite_master WHERE type='table' AND name='user_accounts')");
            //returned object key is query text and result is value, the array indexes below extract the values
            var tableResult = Boolean(Object.values(tableExists[0])[0]);
            result = tableResult;
            await db.close();
            console.log("does `user_accounts` table exist: "+result);
        }
        catch(error){
            result = error; //Make sure to handle returned error object wherever
        }
    }
    return checkIfError(result);
}

/**
 * Method that checks if the `saved_feeds` table exists, and if there's
 * at least one record row in it.
 * @returns True (1) if table exists, False (0) if not.
 */
export async function checkIfSavedFeedsTableExists(){
    var result;
    try{
        const db = await Database.load(APPLICATION_DB);
        var tableExists = await db.select("SELECT EXISTS (SELECT * FROM sqlite_master WHERE type='table' AND name='saved_feeds')");
        //returned object key is query text and result is value, the array indexes below extract the values
        var tableResult = Boolean(Object.values(tableExists[0])[0]);
        result = tableResult;
        await db.close();
        console.log("does `saved_feeds` table exist: "+result);
    }
    catch(error){
        result = error; //Make sure to handle returned error object wherever
    }
    return checkIfError(result);
}

/**
 * Method that allows the updating of the values held in the `saved_feeds` SQLite table.
 * @param newValues The values to update the `saved_feeds` table with.
 * @returns Promise<{@link QueryResult}> with action result.
 */
export async function updateSavedFeedsTable(newValues:SavedFeeds):Promise<QueryResult>{
    const db = await Database.load(APPLICATION_DB);
    var result:QueryResult;
    return new Promise<QueryResult>(async (resolve, reject) => {
        var query = createQueryString(QueryAction.UPDATE, newValues, DBTable.saved_feeds);
        await db.execute(query ? query : '',Object.values(newValues))
        .then(res => {
            result = res;
        })
        .catch(async (err) => {
            await db.close();
            reject(new Error(err));
        })
        await db.close(); //close connection
        resolve(result);
    });
}

/**
 * Method the returns all the records currently held in the "Saved Feeds" table.
 * The table is stored in a different medium depending on the current app platform -
 * this method automatically loads from the correct one.
 * @returns Result of trying to grab all the records held in the `saved_feeds` table.
 */
export async function loadSavedFeedsRecords():Promise<SavedFeeds[]|Error>{
    var result:SavedFeeds[]|Error;
    return new Promise<SavedFeeds[]|Error>(async (resolve, reject) => {
        if(isTauri()){//If on Desktop
            const db = await Database.load(APPLICATION_DB);
            await db.select('SELECT * FROM saved_feeds')
            .then(res => {
                result = res as SavedFeeds[];
            })
            .catch(async (err) => {
                await db.close();
                reject(new Error(err));
            })
            await db.close();
        }
        else{//On web-based platform - use Dexie.js to load SavedFeeds
            await web_db.savedFeeds.toArray()
            .then(res =>{
                if(res.length>0){
                    result = res as SavedFeeds[];
                }
            })
            .catch(err => {
                reject(new Error(err));
            })
        }
        resolve(result as SavedFeeds[]);
    });
}

/**
 * Method that clears the `savedFeeds` table held in the `web_db` IndexedDB
 * database.
 */
export async function DeleteIndexedDBSavedFeeds(){
    console.log('Clearing savedFeed in IndexedDB - current value:');
    await web_db.savedFeeds.toArray().then(res => {
        console.log(res);
    })
    await web_db.savedFeeds.clear();
    console.log('Cleared savedFeed in IndexedDB - current value:');
    await web_db.savedFeeds.toArray().then(res => {
        console.log(res);
    })
}

/**
 * DO NOT USE - use {@link AppSettingsState.loadSettingsFromStore()}.
 * Method the returns all the records currently held in the `app_settings` table.
 * @returns Result of trying to grab all the records held in the `app_settings` table.
 */
export async function loadAppSettingsRecords(){
    var result;
    try{
        const db = await Database.load(APPLICATION_DB);
        result = await db.select('SELECT * FROM app_settings') as AppSettings;
        await db.close();
    }
    catch(error){
        result = error;
    }
    return checkIfError(result);
}

/**
 * Method that stringifies current list of Feeds so that their configurations can be
 * saved to the `saved_feeds` table.
 * @param data List of Feeds to stringify.
 */
export function stringifyFeedListData(data:IFeedListing[]|IFeedDBData[]):string{
    var t:IFeedDBData[]= [];
    // FeedState.FeedList.forEach(e => {
    if(data.length>0 && (data as IFeedListing[])[0].description != undefined){
        (data as IFeedListing[]).forEach(e => {
            t.push({id:e.description.feedId,userId:e.description.userId,did:e.description.feedSourceDID,
                tags:e.description.feedTags,type:e.description.feedType,icon:e.description.feedIcon,settings:e.description.feedColumnSettings,
                latestPostDate:e.description.latestPostDate,latestPostCID:e.description.latestPostCID});
        });
    }
    else{
        (data as IFeedDBData[]).forEach(e => {
            t.push({id:e.id,userId:e.userId,did:e.did,
                tags:e.tags,type:e.type,icon:e.icon,settings:e.settings,
                latestPostDate:e.latestPostDate,latestPostCID:e.latestPostCID});
        });
    }
    // console.log(JSON.stringify(t));
    return JSON.stringify(t);
}

/**
 * Method that turns a JSON string saved in the `saved_feeds` table into a IFeedDBData
 * object that can be used to restore the list of Feeds that were last open in app.
 * @param feedListString The saved Feed configs string saved to the `saved_feeds` table.
 * @returns IFeedDBData[] array containing configuration data for each saved Feed.
 */
export function stringToJSON(feedListString:string):IFeedDBData[]{
    var result = null;
    //Check that empty text hasn't been passed in
    if(feedListString.trim().length>0){
        try{
            var jsonFromString = JSON.parse(feedListString);
            result = jsonFromString;
        }
        catch(error){
            result = error;
        }
    }
    else{console.log('string passed to turn into JSON is empty');} //DEBUG
    return result;
}

/**
 * Method used to determine if the result of a database action was a success or an
 * Error. To be used for logging and feedback to the user (maybe).
 * @param result Results of the performed database action to check. Successful
 * actions should return a Promise<>.
 */
function checkIfError(result:Object|Boolean|undefined|unknown){
    //Checks if result value has been receievd/set - if so no Error
    //code from Erisan Olasheni: https://stackoverflow.com/a/51458052
    if(result != null && result.constructor.name != "Object" && result.constructor.name != "Array"
        && result.constructor.name != "Boolean"
    ){
        console.log('An error has occurred - returned type is: '+typeof result);
        console.log('Most likely an error - returned value is: '+result);
        //Handle error in some way - i.e send toast to message system so the user can know what
        //went wrong.
        return false; //action failed
    }
    else{
        //Do nothing - for DEBUG only
        // console.log('DB action completed - returned type is: '+typeof result);
        return result; //action success
    }
}

/**
 * Method that takes a desired PhysicalPosition for an app window and returns a
 * value that is "valid" - a position where the user can still move and interact
 * with the window titlebar.
 * @param monitor The `Monitor` the app window is currently on.
 * @param position The current `PhysicalPosition` of the app window.
 * @param windowSize The current `PhysicalSize` of the app window.
 * @returns A valid (user interactable) `PhysicalPosition` for the app window.
 */
export function validateWindowPosition(monitor:Monitor|null,position:PhysicalPosition,windowSize:PhysicalSize):PhysicalPosition{
    var validPosition = position;
    if(monitor){
        var minX = monitor.position.x;
        var maxX = minX+monitor.size.width;
        var minY = monitor.position.y;
        var maxY = minY+monitor.size.height;

        //if off left of monitor by more than half window width
        if((position.x+(windowSize.width/2))<minX) validPosition.x = minX;
        //if off right of monitor - reposition so right of window is along monitor right
        if(position.x>maxX) validPosition.x = maxX - windowSize.width;
        //if off top of monitor - place at top of monitor
        if(position.y<minY) validPosition.y = minY;
        //if below bottom of monitor - reposition so bottom of window is along monitor bottom
        if(position.y>maxY) validPosition.y = maxY - windowSize.height;
    }
    else{
        validPosition = new PhysicalPosition(0,0);
    }
    return validPosition;
}