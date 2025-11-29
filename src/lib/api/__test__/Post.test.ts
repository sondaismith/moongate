import { describe, expect, it, test } from "vitest";
import { getBlueskyPostThread, InvalidPostDIDError } from "../Post.vue";

describe.skip('attempt to retrieve Post from API', ()  => {
    it('throw error given an invalid post DID reference', async() => {
        await expect(() => getBlueskyPostThread("fail_test")).rejects
        .toThrowError('Invalid Post DID');
    })
    it('return true, indicating sucessful Post get', async () => {
        await expect(getBlueskyPostThread(
            'did:plc:7kf37yk3wjqjv6zjlryjypn4/app.bsky.feed.post/3lgj4pe5uz22o'))
            .resolves
            .toBeTypeOf("object")
    })
    it('will throw Error if at-uri is invalid', async () => {
        await expect(getBlueskyPostThread(
            'did:plc:7kf37yk3wjqjv6zjlryjypn4/app.bsky.feed.post/3lgj4pe5uz22o:at://'))
            .rejects
            .toThrowError('at-uri');
    })
})