import Database from "@tauri-apps/plugin-sql";

const APPLICATION_DB = "sqlite:moongate_app.db";

enum FeedSizeSetting{
    Small,
    Medium,
    Large
}

/**
 * Type that describes the shape of the data that can be
 * saved to the application preferences table.
 */
type AppSettings = {
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
export function createQueryString(newAppSettings:AppSettings, updateId?:number){
    var query = "UPDATE dummy SET ";

    var objectKeys = Object.keys(newAppSettings);
    var objectValues = Object.values(newAppSettings);
    for (let i = 0; i < objectKeys.length; i++) {
        var column = objectKeys[i]+" = "+objectValues[i];
        if(i+1<objectKeys.length) column+=", ";
        query += column;
    }
    if(updateId){//if updateId has been specified and is not undefined
        //target record id
        query += " WHERE id = "+updateId;
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

export async function initializeAppSettingsTable(){
    const db = await Database.load(APPLICATION_DB);
    var result;
    try{
        const initialTableValuesQuery = 'INSERT into app_settings (currentUserId,darkModeOn,'
        +'lastWindowWidth,lastWindowHeight,lastWindowPosX,lastWindowPosY,lastMonitor,'
        +'lastUpdatedAt) VALUES($1,$2,$3,$4,$5,$6,$7,$8)';
        var addInitialResult = await db.execute(initialTableValuesQuery,
            [1,0,800,600,900,200,0,(new Date()).toISOString()]
        )
        // [{currentUserId:1,darkModeOn:0,lastWindowWidth:800,lastWindowHeight:600,
        //     lastWindowPosX:900,lastWindowPosY:200,lastMonitor:0,
        //     lastUpdatedAt:(new Date()).toISOString()}] as AppSettings[]
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
        result = await db.select('SELECT * FROM app_settings');
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
    if(result != null && result.constructor.name != "Object" && result.constructor.name != "Array"){
        console.log('An error has occurred - returned type is: '+typeof result);
        console.log('Most likely an error - returned value is: '+result);
        //Handle error in some way - i.e send toast to message system so the user can know what
        //went wrong.
        return false; //action failed
    }
    else{
        //Do nothing - for DEBUG only
        console.log('DB action completed - returned type is: '+typeof result);
        return result; //action success
    }
}