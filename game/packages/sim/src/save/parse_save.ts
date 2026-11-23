/**
 * Turns untrusted save data (e.g. JSON from browser storage) into a valid current-version save.
 * Older versions are migrated step by step. Anything malformed throws: a broken save is not player input.
 */

import { SIDE_COUNT } from '../grid/grid_math';
import type { ChunkCoord, Rotation } from '../types';
import { SAVE_V1_VERSION, migrateV1ToV2 } from './save_v1';
import type { SaveBase, SaveStructureV1 } from './save_v1';
import { SAVE_V2_VERSION } from './save_v2';
import type { SaveDeliveredV2, SaveGameV2, SaveItemSlotV2, SaveProgressV2 } from './save_v2';

type JsonObject = Record<string, unknown>;

/**
 * Validates and migrates save data of any supported version.
 * @param data Parsed JSON of unknown shape.
 * @returns A save in the current format.
 * @throws If the data is not a supported, well-formed save.
 */
export function parseSave(data: unknown): SaveGameV2 {
    const root = asObject(data, 'save');
    const version = readInt(root, 'version');
    if (version === SAVE_V1_VERSION) {
        return migrateV1ToV2({ ...readBase(root), version: SAVE_V1_VERSION });
    }
    if (version === SAVE_V2_VERSION) {
        return {
            ...readBase(root),
            version: SAVE_V2_VERSION,
            item_slots: readList(root, 'item_slots', readItemSlot),
            extraction_progress: readList(root, 'extraction_progress', readProgress),
            delivered: readList(root, 'delivered', readDelivered),
        };
    }
    throw new Error(`Unsupported save version: ${version}`);
}

function readBase(root: JsonObject): SaveBase {
    return {
        world_seed: readInt(root, 'world_seed'),
        tick_index: readInt(root, 'tick_index'),
        structures: readList(root, 'structures', readStructure),
        persistent_chunks: readList(root, 'persistent_chunks', readCoord),
    };
}

function readStructure(value: unknown): SaveStructureV1 {
    const entry = asObject(value, 'structure');
    const tick = entry.tick === undefined ? undefined : readInt(entry, 'tick');
    return {
        id: readPositiveInt(entry, 'id'),
        definition_key: readString(entry, 'definition_key'),
        coord: readCoord(entry.coord),
        rotation: readRotation(entry),
        ...(tick === undefined ? {} : { tick }),
    };
}

function readItemSlot(value: unknown): SaveItemSlotV2 {
    const entry = asObject(value, 'item slot');
    return {
        structure_id: readPositiveInt(entry, 'structure_id'),
        item_key: readString(entry, 'item_key'),
        ticks_remaining: readNonNegativeInt(entry, 'ticks_remaining'),
    };
}

function readProgress(value: unknown): SaveProgressV2 {
    const entry = asObject(value, 'extraction progress');
    return {
        structure_id: readPositiveInt(entry, 'structure_id'),
        ticks: readNonNegativeInt(entry, 'ticks'),
    };
}

function readDelivered(value: unknown): SaveDeliveredV2 {
    const entry = asObject(value, 'delivered');
    return { item_key: readString(entry, 'item_key'), count: readNonNegativeInt(entry, 'count') };
}

function readCoord(value: unknown): ChunkCoord {
    const coord = asObject(value, 'coord');
    return { x: readInt(coord, 'x'), y: readInt(coord, 'y') };
}

function readRotation(entry: JsonObject): Rotation {
    const rotation = readNonNegativeInt(entry, 'rotation');
    if (rotation >= SIDE_COUNT) {
        throw new Error(`Invalid rotation in save: ${rotation}`);
    }
    return rotation as Rotation;
}

function readList<T>(root: JsonObject, key: string, readEntry: (value: unknown) => T): T[] {
    const value = root[key];
    if (!Array.isArray(value)) {
        throw new Error(`Save field "${key}" must be a list.`);
    }
    return value.map(readEntry);
}

function readString(entry: JsonObject, key: string): string {
    const value = entry[key];
    if (typeof value !== 'string' || value === '') {
        throw new Error(`Save field "${key}" must be a non-empty string.`);
    }
    return value;
}

function readInt(entry: JsonObject, key: string): number {
    const value = entry[key];
    if (typeof value !== 'number' || !Number.isInteger(value)) {
        throw new Error(`Save field "${key}" must be an integer, got: ${String(value)}`);
    }
    return value;
}

function readNonNegativeInt(entry: JsonObject, key: string): number {
    const value = readInt(entry, key);
    if (value < 0) {
        throw new Error(`Save field "${key}" must not be negative, got: ${value}`);
    }
    return value;
}

function readPositiveInt(entry: JsonObject, key: string): number {
    const value = readInt(entry, key);
    if (value < 1) {
        throw new Error(`Save field "${key}" must be positive, got: ${value}`);
    }
    return value;
}

function asObject(value: unknown, what: string): JsonObject {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new Error(`Expected ${what} to be an object.`);
    }
    return value as JsonObject;
}
