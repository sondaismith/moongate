import { describe, expect, test } from 'vitest';
import { calculateValidTargetPos } from'./FeedButton.vue';

describe('given a target position that is not a whole number', () =>{
    test('return valid target position', () => {
        // expect(calculateValidTargetPos(370.5)).toBe(370);
        expect(calculateValidTargetPos(307.5)).toBe(307);
    })
})