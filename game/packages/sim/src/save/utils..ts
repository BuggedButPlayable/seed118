/**
 * Utility functions for saving and loading game data.
 */

import { ChunkCoord } from "../types";

/**
 * Deduplicates the given array of chunk coordinates.
 * @param coords The array of chunk coordinates to deduplicate.
 * @returns A new array of chunk coordinates with duplicates removed and sorted.
 */
export function dedupeChunkCoords(coords: ChunkCoord[]): ChunkCoord[] {
    const out: ChunkCoord[] = [];
    for (const coord of coords) {
        if (!out.find((c) => c.x === coord.x && c.y === coord.y)) {
            out.push(coord);
        }
    }
    out.sort((a, b) => (a.x - b.x) || (a.y - b.y));
    return out;
}

/**
 * Checks whether the given value is a record (i.e., a non-null object that is not an array).
 * @param value The value to check.
 * @returns True if the value is a record, false otherwise.
 */
export function isRecord(value: unknown): value is Record<string, any> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Coerces the given value into an array of records.
 * @param value The value to coerce.
 * @returns An array of records. If the value is not an array, returns an empty array.
 */
export function coerceArrayOfRecord(value: unknown): Record<string, any>[] {
    if (!Array.isArray(value)) return [];

    const out: Record<string, any>[] = [];
    for (const item of value) {
        if (isRecord(item)) {
            out.push(item);
        }
    }
    return out;
}

/**
 * Converts the given value to an integer. If conversion fails, returns the default value.
 * @param value The value to convert.
 * @param defaultValue The default value to return if conversion fails. Defaults to 0.
 * @returns The converted integer or the default value.
 */
export function toInt(value: unknown, defaultValue: number = 0): number {
    const n = Number(value);
    if (Number.isInteger(n)) {
        return n;
    }
    return defaultValue;
}