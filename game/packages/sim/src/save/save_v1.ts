/**
 * Save format v1 (M0): structures and persistent chunks only. Kept so old saves can still be loaded:
 * `parseSave` migrates them to the current version. Nothing writes v1 any more.
 */

import type { ChunkCoord, Rotation, TileCoord } from '../types';
import type { SaveGameV2 } from './save_v2';

export const SAVE_V1_VERSION = 1 as const;

export type SaveStructureV1 = {
    id: number;
    definition_key: string;
    coord: TileCoord;
    rotation: Rotation;
    tick?: number;
};

/** Fields every save version shares. */
export type SaveBase = {
    world_seed: number;
    tick_index: number;
    structures: SaveStructureV1[];
    persistent_chunks: ChunkCoord[];
};

export type SaveGameV1 = SaveBase & { version: typeof SAVE_V1_VERSION };

/** v1 → v2: v1 worlds had no items, no extraction progress and no deliveries. */
export function migrateV1ToV2(save: SaveGameV1): SaveGameV2 {
    return {
        ...save,
        version: 2,
        item_slots: [],
        extraction_progress: [],
        delivered: [],
    };
}
