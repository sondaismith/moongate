import { describe, expect, it } from "vitest";
import { addTestRecord, createQueryString, AppSettings, QueryAction, validateWindowPosition, DBTable, UserAccounts, SavedFeeds, stringifyFeedListData } from "../local_db";
import { PhysicalPosition, PhysicalSize } from "@tauri-apps/api/dpi";
import { Monitor } from "@tauri-apps/api/window";
import { IFeedDBData, IFeedListing } from "../../../interfaces/FeedInterfaces";
import { FeedEnums } from "../../../enums/FeedEnums";

///Cannot test local database interactions - vitest cannot interface with the Rust
///side of the application.
// describe('interactions with local application database', () => {
//     // it('should fail when interacting with table that does not exist', async () =>{
//     //     await expect(() => addTestRecord()).rejects.toBe(0);
//     // })
// })

describe('generation of sql query strings', () => {
    it('app_settings - should return correctly formatted UPDATE result when only one variable is provided, with id', () =>{
        expect(createQueryString(QueryAction.UPDATE, {darkModeOn: 1}, DBTable.app_settings, 2))
        .toBe('UPDATE app_settings SET darkModeOn = $1 WHERE id = 2');
    })
    it('app_settings - should return correctly formatted UPDATE result when 3 variables are provided, without id', () =>{
        expect(createQueryString(QueryAction.UPDATE, {darkModeOn:1, lastMonitor:"\\\\.\\DISPLAY1", currentUserId:2,lastWindowPosX:250,lastWindowPosY:500},DBTable.app_settings))
        .toBe('UPDATE app_settings SET darkModeOn = $1, lastMonitor = $2, currentUserId = $3, lastWindowPosX = $4, lastWindowPosY = $5');
    })
    it('user_accounts - should returned correctly formatted UPDATE when values are provided', () => {
        var values = {name:"bobby",handle:"bob-the-app-builder",did:"hdh3ijd33jddjd93j9",pfp:"temp_assets/bobpfp.png"} as UserAccounts;
        expect(createQueryString(QueryAction.UPDATE, values, DBTable.user_accounts))
        .toBe('UPDATE user_accounts SET name = $1, handle = $2, did = $3, pfp = $4');
    })
    it('app_settings - should return correctly formatted INSERT result when all required values are provided', () => {
        var currentTime = new Date().toISOString();
        var values = {currentUserId:1,darkModeOn:1,lastWindowWidth:800,lastWindowHeight:600,lastWindowPosX:460,lastWindowPosY:352,lastMonitor:"\\\\.\\DISPLAY1",lastUpdatedAt:currentTime,collection:''} as AppSettings
        expect(createQueryString(QueryAction.INSERT, values, DBTable.app_settings))
        //old test below, before using parametrized query
        // .toBe('INSERT into app_settings (currentUserId, darkModeOn, lastWindowWidth, lastWindowHeight, lastWindowPosX, lastWindowPosY, lastMonitor, lastUpdatedAt) VALUES(1,1,800,600,460,352,0,'+currentTime+')')
        .toBe('INSERT into app_settings (currentUserId, darkModeOn, lastWindowWidth, lastWindowHeight, lastWindowPosX, lastWindowPosY, lastMonitor, lastUpdatedAt, collection) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)')
    })
    it('user_accounts - should return correctly formatted INSERT result when all required values are provided', () => {
        var values = {name:"bobby",handle:"bob-the-app-builder",did:"hdh3ijd33jddjd93j9",pfp:"temp_assets/bobpfp.png"} as UserAccounts;
        expect(createQueryString(QueryAction.INSERT, values, DBTable.user_accounts))
        .toBe('INSERT into user_accounts (name, handle, did, pfp) VALUES($1,$2,$3,$4)')
    })
    it('saved_feeds - should return correctly formatted UPDATE when values are provided', () => {
        var values = {data:"sas"} as SavedFeeds;
        expect(createQueryString(QueryAction.UPDATE, values, DBTable.saved_feeds))
        .toBe('UPDATE saved_feeds SET data = $1')
    })
})

describe('confirming that valid app window positions are returned', () =>{
    var pos1 = new PhysicalPosition(244, 432);
    var pos2 = new PhysicalPosition(-2000, 200);
    var monitor1 = {name:"Test1",position:{x:0,y:0},size:{width:1920,height:1080}} as Monitor
    var monitor2 = {name:"Test2",position:{x:-1920,y:0},size:{width:1920,height:1080}} as Monitor
    var monitor3 = {name:"Test3",position:{x:0,y:1080},size:{width:1920,height:1080}} as Monitor
    var appSize1 = new PhysicalSize(800,600);

    describe('tests with standard single monitor', () => {
        it('should return unchanged position when desired position is in bounds', () => {
            expect(validateWindowPosition(monitor1,pos1,appSize1)).toBe(pos1);
        })
        it('should return changed position when desired position is out of bounds', () => {
            expect(validateWindowPosition(monitor1,pos2,appSize1)).toEqual(new PhysicalPosition(0,200));
        })
        it('should return unchanged position even though window is slightly off left of monitor', () => {
            expect(validateWindowPosition(monitor1,
                new PhysicalPosition(-300,200), new PhysicalSize(800,600)))
                .toEqual(new PhysicalPosition(-300,200));
        })
        it('should return changed position because window is too far off left of monitor', () => {
            expect(validateWindowPosition(monitor1,
                new PhysicalPosition(-500,200), new PhysicalSize(800,600)))
                .toEqual(new PhysicalPosition(0,200));
        })
        it('should return changed position because window is above top of monitor', () => {
            expect(validateWindowPosition(monitor1,
                new PhysicalPosition(200,-200), new PhysicalSize(800,600)))
                .toEqual(new PhysicalPosition(200,0));
        })
        it('should return changed position because window is too far off right of monitor', () => {
            expect(validateWindowPosition(monitor1,
                new PhysicalPosition(2200,200), new PhysicalSize(800,600)))
                .toEqual(new PhysicalPosition(1120,200));
        })
        it('should return changed position because window is below bottom of monitor', () => {
            expect(validateWindowPosition(monitor1,
                new PhysicalPosition(200,2200), new PhysicalSize(800,600)))
                .toEqual(new PhysicalPosition(200,480));
        })
    })

    describe('tests with bottom monitor in vertical 2 stack', () => {
        it('should return unchanged position', () => {
            expect(validateWindowPosition(monitor3,
                new PhysicalPosition(200,1500), new PhysicalSize(800,600)))
                .toEqual(new PhysicalPosition(200,1500));
        })
        it('should return changed position because window is above top of monitor', () => {
            expect(validateWindowPosition(monitor3,
                new PhysicalPosition(200,900), new PhysicalSize(800,600)))
                .toEqual(new PhysicalPosition(200,1080));
        })
        it('should return changed position because window is too far of left of monitor', () => {
            expect(validateWindowPosition(monitor3,
                new PhysicalPosition(-410,1900), new PhysicalSize(800,600)))
                .toEqual(new PhysicalPosition(0,1900));
        })
    })
})

describe('stringify passed in Feed list objects', () => {
    var testFeedList:IFeedListing[]= [{
        data:[
            {
                post:
                {
                    author:{did:'',handle:'test'},
                    cid:'cid_test',
                    indexedAt:'00000',
                    record:{},
                    uri:'uri-fake'
                },
            }
        ],
        description:{
            feedId:'exceed13_37lam',
            feedSourceDID:'DID_1',
            feedName:'Tester1',feedHandle:'tester1',feedIcon:FeedEnums.Icons.Art,feedType:FeedEnums.Types.User,
            newPosts:2,totalPosts:10,
            feedColumnSettings:{width:444}
        }
    }];
    var expectedResult:string = JSON.stringify([{id:'exceed13_37lam',did:'DID_1',type:FeedEnums.Types.User,icon:FeedEnums.Icons.Art,settings:{width:444}}]);

    describe('it should succeed stringifying a single feed', () => {
        it('should created the expected object shape', () =>{
            expect(stringifyFeedListData(testFeedList)).toEqual(expectedResult);
        })
    })
})