/**
 * Grid math utility functions for converting between tile and chunk coordinates,
 * rotating offsets, and computing structure footprints.
 */

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
 * @param a - The dividend.
 * @param b - The divisor.
 * @returns The floor modulus of a and b.
 */
export const floorMod = (a: number, b: number): number => {
    return ((a % b) + b) % b;
};

/** Turns -0 into 0 so rotated offsets compare and serialize cleanly. */
const withoutNegativeZero = (n: number): number => (n === 0 ? 0 : n);

/**
 * Rotates tile offsets around the anchor in 90-degree steps (clockwise in screen space).
 * Simulation and preview must both use this function (architecture §8).
 * @param offsets - The offsets to rotate. They are not modified.
 * @param rotationQuadrants - The rotation in quadrants (0, 1, 2, or 3).
 * @returns New, rotated offsets.
 */
export function rotateOffsets(offsets: readonly TileCoord[], rotationQuadrants: Rotation): TileCoord[] {
    return offsets.map((o) => {
        switch (rotationQuadrants) {
            case 0:
                return { x: o.x, y: o.y };
            case 1:
                return { x: withoutNegativeZero(-o.y), y: o.x };
            case 2:
                return { x: withoutNegativeZero(-o.x), y: withoutNegativeZero(-o.y) };
            case 3:
                return { x: o.y, y: withoutNegativeZero(-o.x) };
        }
    });
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
 * @param a - First coordinate.
 * @param b - Second coordinate.
 * @returns True if both point to the same cell.
 */
export function isSameCoord(a: TileCoord | ChunkCoord, b: TileCoord | ChunkCoord): boolean {
    return a.x === b.x && a.y === b.y;
}

/**
 * Removes duplicate chunk coordinates and sorts them (x, then y) for deterministic output.
 * @param coords - The chunk coordinates to deduplicate.
 * @returns A new, sorted array without duplicates.
 */
export function dedupeChunkCoords(coords: readonly ChunkCoord[]): ChunkCoord[] {
    const out: ChunkCoord[] = [];
    for (const coord of coords) {
        if (!out.some((c) => isSameCoord(c, coord))) {
            out.push(coord);
        }
    }
    return out.sort((a, b) => a.x - b.x || a.y - b.y);
}
