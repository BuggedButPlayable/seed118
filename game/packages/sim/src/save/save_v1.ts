/**
 * Save format v1 (M0): structures and persistent chunks only. Kept so old saves can still be loaded:
 * `parseSave` migrates them to the current version. Nothing writes v1 any more, and v1 depends on nothing newer.
 */

import type { ChunkCoord, Rotation, TileCoord } from '../types';

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
