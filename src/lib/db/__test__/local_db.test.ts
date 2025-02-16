import { describe, expect, it } from "vitest";
import { addTestRecord, createQueryString, AppSettings, QueryAction, validateWindowPosition } from "../local_db";
import { PhysicalPosition, PhysicalSize } from "@tauri-apps/api/dpi";
import { Monitor } from "@tauri-apps/api/window";

///Cannot test local database interactions - vitest cannot interface with the Rust
///side of the application.
// describe('interactions with local application database', () => {
//     // it('should fail when interacting with table that does not exist', async () =>{
//     //     await expect(() => addTestRecord()).rejects.toBe(0);
//     // })
// })

describe('generation of sql query strings', () => {
    it('should return correctly formatted UPDATE result when only one variable is provided, with id', () =>{
        expect(createQueryString(QueryAction.UPDATE, {darkModeOn: 1}, 2))
        .toBe('UPDATE app_settings SET darkModeOn = $1 WHERE id = 2');
    })
    it('should return correctly formatted UPDATE result when 3 variables are provided, without id', () =>{
        expect(createQueryString(QueryAction.UPDATE, {darkModeOn:1, lastMonitor:"\\\\.\\DISPLAY1", currentUserId:2,lastWindowPosX:250,lastWindowPosY:500}))
        .toBe('UPDATE app_settings SET darkModeOn = $1, lastMonitor = $2, currentUserId = $3, lastWindowPosX = $4, lastWindowPosY = $5');
    })
    it('should return correctly formatted INSERT result when all required values are provided', () => {
        var currentTime = new Date().toISOString();
        var values = {currentUserId:1,darkModeOn:1,lastWindowWidth:800,lastWindowHeight:600,lastWindowPosX:460,lastWindowPosY:352,lastMonitor:"\\\\.\\DISPLAY1",lastUpdatedAt:currentTime} as AppSettings
        expect(createQueryString(QueryAction.INSERT, values))
        //old test below, before using parametrized query
        // .toBe('INSERT into app_settings (currentUserId, darkModeOn, lastWindowWidth, lastWindowHeight, lastWindowPosX, lastWindowPosY, lastMonitor, lastUpdatedAt) VALUES(1,1,800,600,460,352,0,'+currentTime+')')
        .toBe('INSERT into app_settings (currentUserId, darkModeOn, lastWindowWidth, lastWindowHeight, lastWindowPosX, lastWindowPosY, lastMonitor, lastUpdatedAt) VALUES($1,$2,$3,$4,$5,$6,$7,$8)')
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