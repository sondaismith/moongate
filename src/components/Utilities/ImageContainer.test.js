import { describe, expect, test } from 'vitest';
import { calculateImageContainerMinHeight } from './ImageContainer.vue';

describe('calculateImageContainerMinHeight', () => {
    describe('given an invalid number', () => {
        test('to throw error', () => {
            expect(() => calculateImageContainerMinHeight('fail')).toThrowError();
        })
    })
    describe('given a value of 1280', () => {
        test('container height should be 720', () => {
            expect(calculateImageContainerMinHeight(1280)).toBe(720);
        })
    })
})