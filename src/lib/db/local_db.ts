import { BaseDirectory, exists } from "@tauri-apps/plugin-fs";
import Database from "@tauri-apps/plugin-sql";

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
    lastMonitor?: number,
    lastUpdatedAt?: string,
}

/**
 * Type that describes the shape of data that defines the
 * way a user's feed will be displayed.
 */
type FeedDetails = {
    id?: number,
    did?: string,
    feedColumnSize?: FeedSizeSetting,
    icon?: string,
}

/**
 * Method that creates the SQL Query needed to update the application preferences.
 * @param newAppSettings Object containing the variables that need to be updated and their new values.
 * @param updateId The id of the record that needs to be updated.
 * @returns String value of the created SQL Query.
 */
export function createQueryString(queryType:QueryAction, newAppSettings:AppSettings, updateId?:number){
    var query;

    var objectKeys = Object.keys(newAppSettings);

    switch (queryType) {
        case QueryAction.CREATE:
            //not implemented
            break;
        case QueryAction.INSERT:
            if(objectKeys.length < 8){
                //log and inform of error - too few values
                query = undefined;
            }
            else{
                query = "INSERT into app_settings ";
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
            query = "UPDATE app_settings SET ";
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
 * Method that tries to create a test table.
 * @returns Result of attempting to create test table in database.
 */
export async function createTestTable(){
    const db = await Database.load(APPLICATION_DB);
    var result;
    try{
        result = await db.execute('CREATE TABLE debug (id INTEGER PRIMARY KEY, title TEXT,created_at datetime DEFAULT "now")');
    }
    catch(error){
        result = error;
    }
    checkIfError(result);
    await db.close(); //close connection
    return result;
}

export async function createAppSettingTable(){
    const db = await Database.load(APPLICATION_DB);
    var result;
    try{
        const newTableQuery = 'CREATE TABLE app_settings (id INTEGER PRIMARY KEY,currentUserId INTEGER DEFAULT 1,'
        +'darkModeOn INTEGER DEFAULT 0,lastWindowWidth INTEGER,lastWindowHeight INTEGER,lastWindowPosX INTEGER,'
        +'lastWindowPosY INTEGER,lastMonitor INTEGER DEFAULT 0,lastUpdatedAt datetime DEFAULT "now")';
        result = await db.execute(newTableQuery);
    }
    catch(error){
        result = error;
    }
    checkIfError(result);
    await db.close(); //close connection
    return result;
}

/**
 * Method used to initialize the `app_settings` table after it has been created.
 * @returns Result of trying to initialize the `app_settings` table. Will be
 * a string starting with "ERROR:" if something went wrong.
 */
export async function initializeAppSettingsTable(){
    const db = await Database.load(APPLICATION_DB);
    var result;
    var addInitialResult;
    try{
        //create variable with initial values
        var initialValues = {currentUserId: 1,darkModeOn:0,lastWindowWidth:800,lastWindowHeight:600,lastWindowPosX:445,
            lastWindowPosY:565,lastMonitor:0,lastUpdatedAt:new Date().toISOString()} as AppSettings;
        //generate query
        var query = createQueryString(QueryAction.INSERT,initialValues);
        if(query == undefined) addInitialResult = "ERROR: Creation of initialize 'app_settings' table query failed";
        else
            addInitialResult = await db.execute(query,Object.values(initialValues));
        result = addInitialResult;
    }
    catch(error){
        result = error;
        await db.close();
    }
    checkIfError(result);
    await db.close(); //close connection
    return result;
}

/**
 * Method that allows the updating of the values held in the `app_settings` table.
 * @param newValues The values to update the `app_settings` table with.
 * @returns
 */
export async function updateAppSettings(newValues:AppSettings|Object) {
    const db = await Database.load(APPLICATION_DB);
    var result;
    var updateQueryResult;

    try{
        var query = createQueryString(QueryAction.UPDATE, newValues);
        if(query == undefined) updateQueryResult = "ERROR: Creation of 'update' query failed";
        else
            updateQueryResult = await db.execute(query,Object.values(newValues));
        result = updateQueryResult;
    }
    catch (error){
        result = error;
    }
    checkIfError(result);
    await db.close(); //close connection
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
    checkIfError(result);
    return result;
}

/**
 * Method that tries to add a record to the test table.
 * @returns Result of attempting to add a record to the test table.
 */
export async function addTestRecord(){
    var result;
    try{
        const db = await Database.load(APPLICATION_DB);
        result = await db.execute('INSERT into debug (title, created_at) VALUES ($1,$2)',
            ['test', new Date().toISOString()]
        )
    }
    catch(error){
        result = error; //Make sure to handle returned error object wherever
    }
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
        console.log("does app settings db exist: "+dbExists);
        result = dbExists;
    }
    catch(error){
        result = error; //Make sure to handle returned error object wherever
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
        var rowExists = await db.select("SELECT EXISTS (SELECT 1 FROM app_settings LIMIT 1)");
        //returned object key is query text and result is value, the array indexes below extract the values
        var tableResult = Boolean(Object.values(tableExists[0])[0]);
        var rowResult = Boolean(Object.values(rowExists[0])[0]);
        result = (tableResult && rowResult); //both must be true for all to be A-OK
        console.log("does `app_settings` table exist: "+result);
    }
    catch(error){
        result = error; //Make sure to handle returned error object wherever
    }
    return checkIfError(result);
}

/**
 * Method that deletes record from the database. Not used atm,
 * probably will eventually be used when the cache gets set up.
 * @param id The id of the record to delete.
 * @returns The returned result from the deletion attempt.
 */
export async function deleteRecord(id:number) {
    var result;
    try{
        const db = await Database.load(APPLICATION_DB);
        result = await db.execute('DELETE from debug WHERE (id) = ($1)',
            [id]
        )
    }
    catch(error){
        result = error; //Make sure to handle returned error object wherever
    }
    return checkIfError(result);
}

/**
 * Method the returns all the records currently held in the `app_settings` table.
 * @returns Result of trying to grab all the records held in the `app_settings` table.
 */
export async function loadRecords(){
    var result;
    try{
        const db = await Database.load(APPLICATION_DB);
        result = await db.select('SELECT * FROM app_settings') as AppSettings;
    }
    catch(error){
        result = error;
    }
    return checkIfError(result);
}

/**
 * Method the returns all the records currently held in the test table.
 * @returns Result of trying to grab all the records held in the test table.
 */
export async function loadTestRecords(){
    var result;
    try{
        const db = await Database.load(APPLICATION_DB);
        result = await db.select('SELECT * FROM debug');
    }
    catch(error){
        result = error;
    }
    return checkIfError(result);
}

/**
 * Method used to determine if the result of a database action was a success or an
 * Error. To be used for logging and feedback to the user (maybe).
 * @param result Results of the performed database action to check. Successful
 * actions should return a Promise<>.
 */
function checkIfError(result:Object|undefined|unknown){
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