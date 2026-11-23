/**
 * Grid math utility functions for converting between tile and chunk coordinates,
 * rotating offsets, and computing structure footprints.
 */

import { byCoord } from '../core/ordering';
import type { TileCoord, ChunkCoord, Rotation } from '../types';
import { CHUNK_SIZE } from '../core/constants';

/**
 * Converts tile coordinates to chunk coordinates.
 * @param tile - The tile coordinates to convert.
 * @returns The corresponding chunk coordinates.
 */
export function tileToChunk(tile: TileCoord): ChunkCoord {
    return {
        x: Math.floor(tile.x / CHUNK_SIZE),
        y: Math.floor(tile.y / CHUNK_SIZE),
    };
}

/**
 * Converts tile coordinates to local tile coordinates within its chunk.
 * @param tile - The tile coordinates to convert.
 * @returns The local tile coordinates within the chunk.
 */
export function tileToLocal(tile: TileCoord): TileCoord {
    return {
        x: floorMod(tile.x, CHUNK_SIZE),
        y: floorMod(tile.y, CHUNK_SIZE),
    };
}

/**
 * Converts tile coordinates to both chunk coordinates and local tile coordinates.
 * @param tile - The tile coordinates to convert.
 * @returns An object containing both chunk coordinates and local tile coordinates.
 */
export function chunkAndLocal(tile: TileCoord): { chunk: ChunkCoord; local: TileCoord } {
    const chunk = tileToChunk(tile);
    const local = tileToLocal(tile);
    return { chunk, local };
}

/**
 * Converts chunk coordinates to the origin tile coordinates of that chunk.
 * @param chunk - The chunk coordinates to convert.
 * @returns The origin tile coordinates of the specified chunk.
 */
export function chunkToTileOrigin(chunk: ChunkCoord): TileCoord {
    return {
        x: chunk.x * CHUNK_SIZE,
        y: chunk.y * CHUNK_SIZE,
    };
}

/**
 * Generates a unique string key for the given chunk coordinates.
 * @param chunk - The chunk coordinates.
 * @returns A string key representing the chunk.
 */
export function chunkKey(chunk: ChunkCoord): string {
    return `${chunk.x},${chunk.y}`;
}

/** Parses a chunk key string back into chunk coordinates.
 * @param key - The chunk key string.
 * @returns The corresponding chunk coordinates.
 */
export function parseChunkKey(key: string): ChunkCoord {
    const [x, y] = key.split(',').map(Number);
    if (x === undefined || y === undefined || Number.isNaN(x) || Number.isNaN(y)) {
        throw new Error(`Invalid chunk key: "${key}"`);
    }
    return { x, y };
}

/**
 * Computes the floor modulus of two numbers.
 * @param dividend - The dividend.
 * @param divisor - The divisor.
 * @returns The floor modulus (always in [0, divisor)).
 */
export const floorMod = (dividend: number, divisor: number): number => {
    return ((dividend % divisor) + divisor) % divisor;
};

/** Turns -0 into 0 so rotated offsets compare and serialize cleanly. */
const withoutNegativeZero = (value: number): number => (value === 0 ? 0 : value);

/** One quarter turn per step, clockwise in screen space (y points down). */
const ROTATE_OFFSET: Readonly<Record<Rotation, (offset: TileCoord) => TileCoord>> = {
    0: (offset) => ({ x: offset.x, y: offset.y }),
    1: (offset) => ({ x: withoutNegativeZero(-offset.y), y: offset.x }),
    2: (offset) => ({ x: withoutNegativeZero(-offset.x), y: withoutNegativeZero(-offset.y) }),
    3: (offset) => ({ x: offset.y, y: withoutNegativeZero(-offset.x) }),
};

/**
 * Rotates tile offsets around the anchor in 90-degree steps.
 * Simulation and preview must both use this function (architecture §8).
 * @param offsets - The offsets to rotate. They are not modified.
 * @param rotation - The rotation in quarter turns (0, 1, 2, or 3).
 * @returns New, rotated offsets.
 */
export function rotateOffsets(offsets: readonly TileCoord[], rotation: Rotation): TileCoord[] {
    return offsets.map(ROTATE_OFFSET[rotation]);
}

/** Computes the absolute tile coordinates covered by a structure's footprint given its anchor position and offsets.
 * @param anchor - The anchor tile coordinate of the structure.
 * @param offsets - The array of tile coordinate offsets defining the structure's footprint.
 * @returns An array of absolute tile coordinates covered by the structure's footprint.
 */
export function computeFootprintTiles(anchor: TileCoord, offsets: readonly TileCoord[]): TileCoord[] {
    const result: TileCoord[] = [];

    for (const offset of offsets) {
        result.push({
            x: anchor.x + offset.x,
            y: anchor.y + offset.y,
        });
    }

    return result;
}

/**
 * Compares two coordinates by value.
 * @param left - First coordinate.
 * @param right - Second coordinate.
 * @returns True if both point to the same cell.
 */
export function isSameCoord(left: TileCoord | ChunkCoord, right: TileCoord | ChunkCoord): boolean {
    return left.x === right.x && left.y === right.y;
}

/**
 * Removes duplicate chunk coordinates and sorts them row by row for deterministic output.
 * @param coords - The chunk coordinates to deduplicate.
 * @returns A new, sorted array without duplicates.
 */
export function dedupeChunkCoords(coords: readonly ChunkCoord[]): ChunkCoord[] {
    const out: ChunkCoord[] = [];
    for (const coord of coords) {
        if (!out.some((existing) => isSameCoord(existing, coord))) {
            out.push(coord);
        }
    }
    return out.sort(byCoord);
}
