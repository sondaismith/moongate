import { describe, expect, it } from "vitest";
import { addTestRecord, createQueryString } from "../local_db";

///Cannot test local database interactions - vitest cannot interface with the Rust
///side of the application.
// describe('interactions with local application database', () => {
//     // it('should fail when interacting with table that does not exist', async () =>{
//     //     await expect(() => addTestRecord()).rejects.toBe(0);
//     // })
// })

describe('generation of sql query strings', () => {
    it('should return correctly formatted result when only one variable is provided, with id', () =>{
        expect(createQueryString({darkModeOn: 1}, 2))
        .toBe('UPDATE dummy SET darkModeOn = 1 WHERE id = 2');
    })
    it('should return correctly formatted result when 3 variables are provided, without id', () =>{
        expect(createQueryString({darkModeOn:1, lastMonitor:1, currentUserId:2,lastWindowPosX:250,lastWindowPosY:500}))
        .toBe('UPDATE dummy SET darkModeOn = 1, lastMonitor = 1, currentUserId = 2, lastWindowPosX = 250, lastWindowPosY = 500');
    })
})