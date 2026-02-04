/**
 * Core 2D hashing functions for procedural generation and randomness.
 */

/**
 * Ensures a number is treated as a 32-bit unsigned integer.
 * @param n The input number.
 * @returns The number as a 32-bit unsigned integer.
 */
const u32 = (n: number): number => n >>> 0;

/**
 * A fast, non-cryptographic hash function for 2D coordinates.
 * Based on MurmurHash3 finalizer.
 * @param x The x coordinate.
 * @param y The y coordinate.
 * @returns A 32-bit unsigned integer hash.
 */
export const hashU32 = (x: number): number => {
    let v = u32(x);
    v = u32((v ^ (v >>> 16)) * 0x7FEB352D);
    v = u32((v ^ (v >>> 15)) * 0x846CA68B);
    v = u32(v ^ (v >>> 16));
    return v;
};

/**
 * A fast, non-cryptographic hash function for 2D coordinates with a seed.
 * Based on MurmurHash3 finalizer.
 * @param x The x coordinate.
 * @param y The y coordinate.
 * @param seed The seed value.
 * @returns A 32-bit unsigned integer hash.
 */
export const hash2i = (x: number, y: number, seed: number): number => {
    let h = u32(seed);
    h = u32(h ^ u32(x * 0x27D4EB2D));
    h = u32(h ^ u32(y * 0x165667B1));
    h = u32((h ^ (h >>> 15)) * 0x85EBCA6B);
    h = u32((h ^ (h >>> 13)) * 0xC2B2AE35);
    h = u32(h ^ (h >>> 16));
    return h;
}

/**
 * Converts a 32-bit hash to a floating-point number in the range [0, 1).
 * @param h The 32-bit unsigned integer hash.
 * @returns A floating-point number in the range [0, 1).
 */
export const hashToUnitFloat = (h: number): number => {
  const v = (h & 0x00ffffff) >>> 0;
  return v / 16777216.0;
};