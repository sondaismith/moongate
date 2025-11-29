import { describe, expect, it, test } from "vitest";
import { CheckForHashtags, CheckForUserLinks, GetHashtagPositions, GetUserlinkPositions, GenerateTagLinkText, IParseResults } from "../parsers";

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
    const hashtagTest1Result:IParseResults[] = [{foundIndex:17, foundValue:'#testing', type:'hashtag'}];
    const hashtagTest2Result:IParseResults[] = [
        {foundIndex:12, foundValue:'#bass', type:'hashtag'},
        {foundIndex:18, foundValue:'#aliens', type:'hashtag'},
        {foundIndex:26, foundValue:'#beam_me_up', type:'hashtag'},
    ];
    const hashtagTest3Result:IParseResults[] = [{foundIndex:4, foundValue:'#新人Vtuber', type:"hashtag"}];
    const userlinkTest1 = "ay @sonic where you at?";
    const userlinkTest2 = "itching for some hoops @mario @sonic you game?";
    const userlinkTest1Result:IParseResults[] = [
        {foundIndex:3, foundValue:'@sonic', type:"userlink"},
    ];
    const userlinkTest2Result:IParseResults[] = [
        {foundIndex:23, foundValue:'@mario', type:"userlink"},
        {foundIndex:30, foundValue:'@sonic', type:"userlink"},
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
        expect(GenerateTagLinkText(test1)).toEqual(`gonna run this marathon <component :is="Hashtag" :tagValue="'#yolo'" :class="''">#yolo</component>`);
    })
    it('should generate expected output with 3 tags', () => {
        expect(GenerateTagLinkText(test2)).toEqual(`we out here <component :is="Hashtag" :tagValue="'#bass'" :class="''">#bass</component> <component :is="Hashtag" :tagValue="'#aliens'" :class="''">#aliens</component> <component :is="Hashtag" :tagValue="'#beam_me_up'" :class="''">#beam_me_up</component>`);
    })
})