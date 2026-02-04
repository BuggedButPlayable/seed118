/**
 * Grid math utility functions for converting between tile and chunk coordinates,
 * rotating offsets, and computing structure footprints.
 */

import { TileCoord, ChunkCoord, Rotation } from "../types";
import { CHUNK_SIZE } from "../core/constants";

/**
 * Converts tile coordinates to chunk coordinates.
 * @param tile - The tile coordinates to convert.
 * @returns The corresponding chunk coordinates.
 */
export function tileToChunk(tile: TileCoord): ChunkCoord {
    return {
        x: Math.floor(tile.x / CHUNK_SIZE),
        y: Math.floor(tile.y / CHUNK_SIZE)
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
        y: floorMod(tile.y, CHUNK_SIZE)
    }
}

/**
 * Converts tile coordinates to both chunk coordinates and local tile coordinates.
 * @param tile - The tile coordinates to convert.
 * @returns An object containing both chunk coordinates and local tile coordinates.
 */
export function chunkAndLocal(tile: TileCoord): { chunk: ChunkCoord, local: TileCoord } {
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
    const [x, y] = key.split(",").map(Number);
    return { x, y };
}

/** * Computes the floor modulus of two numbers.
 * @param a - The dividend.
 * @param b - The divisor.
 * @returns The floor modulus of a and b.
 */
export const floorMod = (a: number, b: number): number => {
    return ((a % b) + b) % b;
}

/** Rotates a set of tile coordinate offsets based on the given rotation in quadrants (90-degree increments).
 * @param offsets - The array of tile coordinate offsets to rotate.
 * @param rotationQuadrants - The rotation in quadrants (0, 1, 2, or 3).
 * @returns The rotated array of tile coordinate offsets.
 */
export function rotateOffsets(offsets: readonly TileCoord[], rotationQuadrants: Rotation): TileCoord[] {
    var rotation = rotationQuadrants % 4;

    var rotated: TileCoord[] = [];
    
    for (var offset of offsets) {
        var o = offset;
        var ro: TileCoord

        switch (rotation) {
            case 0:
                ro = o;
                break;
            case 1:
                ro = { x: -o.y, y: o.x };
                break;
            case 2:
                ro = { x: -o.x, y: -o.y };
                break;
            case 3:
                ro = { x: o.y, y: -o.x };
                break;
            default:
                ro = o;
        }
        
        if (ro.x === 0) ro.x = 0;
        if (ro.y === 0) ro.y = 0;       
        rotated.push(ro);
    }
    return rotated;
}

/** Computes the absolute tile coordinates covered by a structure's footprint given its anchor position and offsets.
 * @param anchor - The anchor tile coordinate of the structure.
 * @param offsets - The array of tile coordinate offsets defining the structure's footprint.
 * @returns An array of absolute tile coordinates covered by the structure's footprint.
 */
export function computeFootprintTiles(anchor: TileCoord, offsets: TileCoord[]): TileCoord[] {
    var result: TileCoord[] = [];

    for (var offset of offsets) {
        result.push({
            x: anchor.x + offset.x,
            y: anchor.y + offset.y
        });
    }

    return result;
}