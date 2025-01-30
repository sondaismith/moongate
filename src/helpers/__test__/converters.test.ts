import { beforeAll, describe, expect, it, vi } from "vitest";
import { convertToLongTimestamp, convertToShortTimestamp } from "../converters";

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
    var curDayInSameHour = new Date();
    var curDayPastHoursNonExact = new Date();
    var curDayPastHoursExact = new Date();
    var subtractInHour = 45;
    var subtractInDay = 100;
    var subtractExactHours = 3;

    curDayInSameHour.setMinutes(curDayInSameHour.getMinutes()-subtractInHour);
    curDayPastHoursNonExact.setMinutes(curDayPastHoursNonExact.getMinutes()-subtractInDay);
    curDayPastHoursExact.setHours(curDayPastHoursExact.getHours()-subtractExactHours);

    it('should fail when given invalid date format', () => {
        expect(convertToShortTimestamp('this is not a valid date')).toBe('invalid');
    })
    it('should return valid short timestamp - format for past day, same year', () => {
        expect(convertToShortTimestamp('2025-01-16T13:37:00')).toBe('Jan 16');
    })
    it('should return valid short timestamp - format for past year', () => {
        expect(convertToShortTimestamp('2024-01-23T13:37:00')).toBe('Jan 23 2024');
    })
    it('should return valid short timestamp - format for same day, last hour', () => {
        expect(convertToShortTimestamp(curDayInSameHour.toUTCString())).toBe(subtractInHour+'m');
    })
    it('should return valid short timestamp - format for same day, over an hour ago non exact', () => {
        expect(convertToShortTimestamp(curDayPastHoursNonExact.toUTCString())).toBe(Math.floor(subtractInDay/60)+'h');
    })
    it('should return valid short timestamp - format for same day, over an hour ago exact', () => {
        expect(convertToShortTimestamp(curDayPastHoursExact.toUTCString())).toBe('3h');
    })
})