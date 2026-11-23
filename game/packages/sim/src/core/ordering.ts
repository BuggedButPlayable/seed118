/**
 * Comparators for a stable, deterministic iteration order (coding rules §4.2).
 * Always sort with these instead of writing inline comparators.
 */

import type { ChunkCoord, TileCoord } from '../types/coords';

/** Ascending by id. */
export const byId = (left: { readonly id: number }, right: { readonly id: number }): number =>
    left.id - right.id;

/** Row-major order: by y, then by x. */
export const byCoord = (left: TileCoord | ChunkCoord, right: TileCoord | ChunkCoord): number =>
    left.y - right.y || left.x - right.x;
