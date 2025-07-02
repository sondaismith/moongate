import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, should, vi } from "vitest";
import { convertToLongTimestamp, convertToShortTimestamp, CreateBskyMediaDownloadURL } from "../converters";

describe('attempt convert timestamp into long readable date', () => {
    it('should fail when given invalid date format', () =>{
        expect(convertToLongTimestamp("this is not a valid date")).toBe('invalid');
    })
    it('should return valid long timestamp', () => {
        expect(convertToLongTimestamp('2025-01-16T13:37:00')).toBe('January 16, 2025 at 1:37 PM');
    })
    it('should return valid long timestamp - minute padding', () => {
        expect(convertToLongTimestamp('2025-01-16T08:08:00')).toBe('January 16, 2025 at 8:08 AM');
    })
    it('should return valid long timestamp - 12PM', () => {
        expect(convertToLongTimestamp('2025-01-16T12:08:00')).toBe('January 16, 2025 at 12:08 PM');
    })
    it('should return valid long timestamp - 12AM', () => {
        expect(convertToLongTimestamp('2025-01-29T00:21:00')).toBe('January 29, 2025 at 12:21 AM');
    })
})

describe('attempt to convert into short readable date', () => {
    beforeAll(() => {
        vi.useFakeTimers();
    })
    afterAll(() => {
        vi.useRealTimers();
    })

    it('should fail when given invalid date format', () => {
        expect(convertToShortTimestamp('this is not a valid date')).toBe('invalid');
    })
    it('should return valid short timestamp - posted under 1 minute ago', () => {
        const fakeDate = new Date(2025,5,27,16,5);
        vi.setSystemTime(fakeDate);
        expect(convertToShortTimestamp('2025-06-27T16:04:30')).toBe('30sec');
    })
    it('should return valid short timestamp - posted under 1 minute in the future', () => {
        const fakeDate = new Date(2025,5,27,16,5);
        vi.setSystemTime(fakeDate);
        expect(convertToShortTimestamp('2025-06-27T16:05:30')).toBe('-30sec');
    })
    it('should return valid short timestamp - posted under 1 hour ago', () => {
        const fakeDate = new Date(2025,5,27,16,5);
        vi.setSystemTime(fakeDate);
        expect(convertToShortTimestamp('2025-06-27T15:23:00')).toBe('42m');
    })
    it('should return valid short timestamp - posted under 1 hour in the future', () => {
        const fakeDate = new Date(2025,5,27,16,5);
        vi.setSystemTime(fakeDate);
        expect(convertToShortTimestamp('2025-06-27T16:23:00')).toBe('-18m');
    })
    it('should return valid short timestamp - posted under 24 hours ago, same day, hour rounded up', () => {
        const fakeDate = new Date(2025,5,27,16);
        vi.setSystemTime(fakeDate);
        expect(convertToShortTimestamp('2025-06-27T02:22:00')).toBe('14h');
    })
    it('should return valid short timestamp - posted under 24 hours ago, same day, hour rounded down', () => {
        const fakeDate = new Date(2025,5,27,16);
        vi.setSystemTime(fakeDate);
        expect(convertToShortTimestamp('2025-06-27T02:42:00')).toBe('13h');
    })
    it('should return valid short timestamp - posted under 24 hours ago, prev day, hour rounded up', () => {
        const fakeDate = new Date(2025,5,27,2,42);
        vi.setSystemTime(fakeDate);
        expect(convertToShortTimestamp('2025-06-26T20:00:00')).toBe('7h');
    })
    it('should return valid short timestamp - posted under 24 hours ago, prev day, hour rounded down', () => {
        const fakeDate = new Date(2025,5,27,0,49);
        vi.setSystemTime(fakeDate);
        expect(convertToShortTimestamp('2025-06-26T23:25:00')).toBe('1h');
    })
    it('should return valid short timestamp - posted in 24 hours range +/-, future/next day, hour rounded up', () => {
        const fakeDate = new Date(2025,5,26,20);
        vi.setSystemTime(fakeDate);
        expect(convertToShortTimestamp('2025-06-27T02:42:00')).toBe('-7h');
    })
    it('should return valid short timestamp - posted under 24 hours ago, prev day + prev year, hour rounded up', () => {
        const fakeDate = new Date(2025,0,1,4,42);
        vi.setSystemTime(fakeDate);
        expect(convertToShortTimestamp('2024-12-31T20:52:00')).toBe('8h');
    })
    it('should return valid short timestamp - posted under 24 hours ago, prev day + prev year, hour rounded down', () => {
        const fakeDate = new Date(2025,0,1,4,52);
        vi.setSystemTime(fakeDate);
        expect(convertToShortTimestamp('2024-12-31T19:32:00')).toBe('9h');
    })
    it('should return valid short timestamp - posted in 24 hours range +/-, future day + future year, hour rounded up', () => {
        const fakeDate = new Date(2024,11,31,22,12);
        vi.setSystemTime(fakeDate);
        expect(convertToShortTimestamp('2025-01-01T08:44:00')).toBe('-11h');
    })
    it('should return valid short timestamp - posted over 24 hours ago, same month + same year', () => {
        const fakeDate = new Date(2025,5,27,17,7);
        vi.setSystemTime(fakeDate);
        expect(convertToShortTimestamp('2025-06-24T08:44:00')).toBe('Jun 24');
    })
    it('should return valid short timestamp - posted over 24 hours ago, ealier month + same year', () => {
        const fakeDate = new Date(2025,5,27,17,7);
        vi.setSystemTime(fakeDate);
        expect(convertToShortTimestamp('2025-05-24T08:44:00')).toBe('May 24');
    })
    it('should return valid short timestamp - posted over 24 hours in the future, future month + same year', () => {
        const fakeDate = new Date(2025,5,27,17,7);
        vi.setSystemTime(fakeDate);
        expect(convertToShortTimestamp('2025-11-11T09:30:00')).toBe('(Future) Nov 11');
    })
    it('should return valid short timestamp - posted over 24 hours ago, earlier month + prev year', () => {
        const fakeDate = new Date(2025,5,27,17,7);
        vi.setSystemTime(fakeDate);
        expect(convertToShortTimestamp('2024-06-24T08:44:00')).toBe('Jun 24 2024');
    })
    it('should return valid short timestamp - posted over 24 hours ago, earlier month + earlier year', () => {
        const fakeDate = new Date(2025,5,27,17,7);
        vi.setSystemTime(fakeDate);
        expect(convertToShortTimestamp('2021-06-24T08:44:00')).toBe('Jun 24 2021');
    })
    it('should return valid short timestamp - posted over 24 hours in the future, future month + future year', () => {
        const fakeDate = new Date(2025,5,27,17,7);
        vi.setSystemTime(fakeDate);
        expect(convertToShortTimestamp('2027-06-24T08:44:00')).toBe('Jun 24 2027');
    })
})

describe('test conversion of Bluesky media URL to format can be used with proxy route+target', () => {
    it('should fail when given empty string', () =>{
        expect(() => CreateBskyMediaDownloadURL("")).toThrow('empty');
    })
    it('should fail when given invalid url', () =>{
        expect(() => CreateBskyMediaDownloadURL("this is not a valid url")).toThrow('Invalid URL');
    })
    it('should return formatted link for download', () =>{
        expect(CreateBskyMediaDownloadURL("https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:5lhjs7l3lheh4jdo4ljceaif/bafkreiarov6gichxnmjdnohpohaglvjksbmm7cdnm7af6ywhs2f5wmubhy@jpeg"))
        .toBe('/img/feed_thumbnail/plain/did:plc:5lhjs7l3lheh4jdo4ljceaif/bafkreiarov6gichxnmjdnohpohaglvjksbmm7cdnm7af6ywhs2f5wmubhy@jpeg');
    })
})