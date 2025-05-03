import { describe, expect, it, test } from "vitest";
import { CheckForHashtags, CheckForUserLinks, GetHashtagPositions, GetUserlinkPositions, GenerateTagLinkText } from "../parsers";

describe('testing basic checks for hashtags or user links', () => {
    it('should successfully find a hashtag', () => {
        expect(CheckForHashtags('gonna run this marathon #yolo')).toBe(true);
    })
    it('should not find any hashtags', () => {
        expect(CheckForHashtags('wow that was great')).toBe(false);
    })
    it('should successfully find a user link', () => {
        expect(CheckForUserLinks('ay @sonic where you at?')).toBe(true);
    })
    it('should not find any user links', () => {
        expect(CheckForUserLinks('damn, no answer :( #sad')).toBe(false);
    })
})

describe('checks to find string indexes of hashtags or user links', () => {
    const hashtagTest3 = 'wow #新人Vtuber';
    const hashtagTest1Result = [{foundIndex:17, foundTag:'#testing'}];
    const hashtagTest2Result = [
        {foundIndex:12, foundTag:'#bass'},
        {foundIndex:18, foundTag:'#aliens'},
        {foundIndex:26, foundTag:'#beam_me_up'},
    ];
    const hashtagTest3Result = [{foundIndex:4, foundTag:'#新人Vtuber'}];
    const userlinkTest1 = "ay @sonic where you at?";
    const userlinkTest2 = "itching for some hoops @mario @sonic you game?";
    const userlinkTest1Result = [
        {foundIndex:3, foundUserlink:'@sonic'},
    ];
    const userlinkTest2Result = [
        {foundIndex:23, foundUserlink:'@mario'},
        {foundIndex:30, foundUserlink:'@sonic'},
    ];
    it('should successfully find a hashtag', () => {
        expect(GetHashtagPositions('is this thing on #testing')).toEqual(hashtagTest1Result);
    })
    it('should successfully find 3 hashtags', () => {
        expect(GetHashtagPositions('we out here #bass #aliens #beam_me_up')).toEqual(hashtagTest2Result);
    })
    it('should find no hashtags', () => {
        expect(GetHashtagPositions('the event has been cancelled')).toEqual([]);
    })
    it('should find a foreign character hashtag', () => {
        expect(GetHashtagPositions(hashtagTest3)).toEqual(hashtagTest3Result);
    })
    it('should successfully find a userlink', () => {
        expect(GetUserlinkPositions(userlinkTest1)).toEqual(userlinkTest1Result);
    })
    it('should successfully find 2 userlinks', () => {
        expect(GetUserlinkPositions(userlinkTest2)).toEqual(userlinkTest2Result);
    })
    it('should find no userlinks', () => {
        expect(GetUserlinkPositions('the event has been cancelled')).toEqual([]);
    })
})

describe('advanced testing of generated, In-DOM components', () => {
    const test1 = 'gonna run this marathon #yolo';
    const test2 = 'we out here #bass #aliens #beam_me_up';
    it('should generate expected output with 1 tag', () => {
        expect(GenerateTagLinkText(test1)).toEqual(`<div>gonna run this marathon <div class='font-bold'>#yolo</div></div>`);
    })
    it('should generate expected output with 3 tags', () => {
        expect(GenerateTagLinkText(test2)).toEqual(`<div>we out here <span class='font-bold'>#bass</span> <div class='font-bold'>#aliens</div> <div class='font-bold'>#beam_me_up</div></div>`);
    })
})