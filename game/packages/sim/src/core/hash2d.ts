/**
 * Seeded integer hashing for procedural generation. This is the only source of randomness in the
 * simulation (coding rules §4.1). Changing any constant changes every generated world.
 */

// MurmurHash3-style finalizer constants (bit shifts and multipliers)
const MIX_SHIFT_A = 16;
const MIX_SHIFT_B = 15;
const MIX_SHIFT_C = 13;
const SINGLE_MULTIPLIER_A = 0x7feb352d;
const SINGLE_MULTIPLIER_B = 0x846ca68b;
const COORD_PRIME_X = 0x27d4eb2d;
const COORD_PRIME_Y = 0x165667b1;
const COORD_MULTIPLIER_A = 0x85ebca6b;
const COORD_MULTIPLIER_B = 0xc2b2ae35;

// hashToUnitFloat keeps the lowest 24 bits
const UNIT_FLOAT_MASK = 0x00ffffff;
const UNIT_FLOAT_RANGE = 0x01000000;

/** Reinterprets a number as an unsigned 32-bit integer. */
const toUint32 = (value: number): number => value >>> 0;

/**
 * Hashes a single 32-bit value.
 * @param value The input value.
 * @returns An unsigned 32-bit hash.
 */
export const hashU32 = (value: number): number => {
    let hash = toUint32(value);
    hash = toUint32((hash ^ (hash >>> MIX_SHIFT_A)) * SINGLE_MULTIPLIER_A);
    hash = toUint32((hash ^ (hash >>> MIX_SHIFT_B)) * SINGLE_MULTIPLIER_B);
    hash = toUint32(hash ^ (hash >>> MIX_SHIFT_A));
    return hash;
};

/**
 * Hashes a 2D integer coordinate together with a seed.
 * @param x The x coordinate.
 * @param y The y coordinate.
 * @param seed The seed value.
 * @returns An unsigned 32-bit hash.
 */
export const hash2i = (x: number, y: number, seed: number): number => {
    let hash = toUint32(seed);
    hash = toUint32(hash ^ toUint32(x * COORD_PRIME_X));
    hash = toUint32(hash ^ toUint32(y * COORD_PRIME_Y));
    hash = toUint32((hash ^ (hash >>> MIX_SHIFT_B)) * COORD_MULTIPLIER_A);
    hash = toUint32((hash ^ (hash >>> MIX_SHIFT_C)) * COORD_MULTIPLIER_B);
    hash = toUint32(hash ^ (hash >>> MIX_SHIFT_A));
    return hash;
};

/**
 * Converts a 32-bit hash to a number in the range [0, 1).
 * @param hash The unsigned 32-bit hash.
 * @returns A number in [0, 1).
 */
export const hashToUnitFloat = (hash: number): number => toUint32(hash & UNIT_FLOAT_MASK) / UNIT_FLOAT_RANGE;
