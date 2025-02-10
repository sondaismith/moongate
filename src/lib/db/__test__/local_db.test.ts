import { describe, expect, it } from "vitest";
import { addTestRecord, createQueryString, AppSettings, QueryAction } from "../local_db";

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
        expect(createQueryString(QueryAction.UPDATE, {darkModeOn:1, lastMonitor:1, currentUserId:2,lastWindowPosX:250,lastWindowPosY:500}))
        .toBe('UPDATE app_settings SET darkModeOn = $1, lastMonitor = $2, currentUserId = $3, lastWindowPosX = $4, lastWindowPosY = $5');
    })
    it('should return correctly formatted INSERT result when all required values are provided', () => {
        var currentTime = new Date().toISOString();
        var values = {currentUserId:1,darkModeOn:1,lastWindowWidth:800,lastWindowHeight:600,lastWindowPosX:460,lastWindowPosY:352,lastMonitor:0,lastUpdatedAt:currentTime} as AppSettings
        expect(createQueryString(QueryAction.INSERT, values))
        //old test below, before using parametrized query
        // .toBe('INSERT into app_settings (currentUserId, darkModeOn, lastWindowWidth, lastWindowHeight, lastWindowPosX, lastWindowPosY, lastMonitor, lastUpdatedAt) VALUES(1,1,800,600,460,352,0,'+currentTime+')')
        .toBe('INSERT into app_settings (currentUserId, darkModeOn, lastWindowWidth, lastWindowHeight, lastWindowPosX, lastWindowPosY, lastMonitor, lastUpdatedAt) VALUES($1,$2,$3,$4,$5,$6,$7,$8)')
    })
})