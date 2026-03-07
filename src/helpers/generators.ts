import { CID } from 'multiformats/cid'
import * as json from 'multiformats/codecs/json'
import { sha256 } from 'multiformats/hashes/sha2'

export async function GenerateCID(encodeWord:string){
    //The line below follows the example given on the official repo (https://github.com/multiformats/js-multiformats)
    //but it would always fail with "Error: Unknown type, must be binary type" when this method was called during a
    //Vitest test.
    // const bytes:Uint8Array = json.encode({ text: encodeWord, created:new Date().toISOString() });
    //The code below the only way the following `sha256.digest()` will run no matter the environment (Cypress, Vitest)
    const bytes = Uint8Array.from(JSON.stringify({ text: encodeWord, created:new Date().toISOString()}));
    const hash = await sha256.digest(bytes);
    const cid = CID.create(1, json.code, hash);
    return cid;
}

/**
 * Method use to generate a value that can be used as a TID (Timestamp Identifier).
 * Does not meet the specifications defined here (https://atproto.com/specs/tid),
 * but it should work fine in Tests.
 * @returns Simulated TID value.
 */
export function GenerateFakeTID(){
    let tid = "";
    var lexicographicBase32 = "234567abcdefghijklmnopqrstuvwxyz"
    const charsLen = lexicographicBase32.length;
    for (let i = 0; i < 14; i++) {
        const idx = Math.floor(Math.random()*charsLen);
        tid += lexicographicBase32.charAt(idx);
    }
    return tid;
}

//Code from Mulan at https://stackoverflow.com/a/27747377
function dec2hex (dec: number) {
    return dec.toString(16).padStart(2, "0")
}
//Code from Mulan at https://stackoverflow.com/a/27747377
export function GenerateUniqueID(len:number):string{
    const arr = new Uint8Array((len || 40) / 2)
    crypto.getRandomValues(arr);
    const newId : string = Array.from(arr,dec2hex).join('');
    return newId;
}