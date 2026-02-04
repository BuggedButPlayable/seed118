import { describe, it, expect } from 'vitest';
import { hashU32, hash2i, hashToUnitFloat } from '../../../src/core/hash2d';

describe('hash2d', () => {
    describe('hashU32', () => {
        it('should return a 32-bit unsigned integer', () => {
            const result = hashU32(42);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThanOrEqual(0xFFFFFFFF);
            expect(Number.isInteger(result)).toBe(true);
        });

        it('should return consistent results for the same input', () => {
            const input = 123;
            expect(hashU32(input)).toBe(hashU32(input));
        });

        it('should return different results for different inputs', () => {
            expect(hashU32(1)).not.toBe(hashU32(2));
        });

        it('should handle zero', () => {
            expect(hashU32(0)).toBe(0);
        });

        it('should handle negative numbers', () => {
            const result = hashU32(-42);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThanOrEqual(0xFFFFFFFF);
        });
    });

    describe('hash2i', () => {
        it('should return a 32-bit unsigned integer', () => {
            const result = hash2i(10, 20, 0);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThanOrEqual(0xFFFFFFFF);
            expect(Number.isInteger(result)).toBe(true);
        });

        it('should return consistent results for the same inputs', () => {
            expect(hash2i(5, 10, 42)).toBe(hash2i(5, 10, 42));
        });

        it('should return different results for different x values', () => {
            expect(hash2i(1, 5, 0)).not.toBe(hash2i(2, 5, 0));
        });

        it('should return different results for different y values', () => {
            expect(hash2i(5, 1, 0)).not.toBe(hash2i(5, 2, 0));
        });

        it('should return different results for different seeds', () => {
            expect(hash2i(5, 5, 1)).not.toBe(hash2i(5, 5, 2));
        });

        it('should handle zero coordinates and seed', () => {
            const result = hash2i(0, 0, 0);
            expect(result).toBeGreaterThanOrEqual(0);
        });

        it('should handle negative coordinates', () => {
            const result = hash2i(-10, -20, 0);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThanOrEqual(0xFFFFFFFF);
        });
    });

    describe('hashToUnitFloat', () => {
        it('should return a value in range [0, 1)', () => {
            const hash = hash2i(10, 20, 42);
            const result = hashToUnitFloat(hash);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(1);
        });

        it('should return 0 for hash 0', () => {
            expect(hashToUnitFloat(0)).toBe(0);
        });

        it('should return consistent results for the same hash', () => {
            const hash = 12345678;
            expect(hashToUnitFloat(hash)).toBe(hashToUnitFloat(hash));
        });

        it('should return different values for different hashes', () => {
            expect(hashToUnitFloat(100)).not.toBe(hashToUnitFloat(200));
        });

        it('should handle max 24-bit value', () => {
            const result = hashToUnitFloat(0x00FFFFFF);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThan(1);
        });
    });
});