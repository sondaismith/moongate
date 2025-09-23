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
