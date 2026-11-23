/**
 * Save format v2 (M1): v1 plus items held by structures, collector progress and Core deliveries.
 * Everything else (resources, occupancy) is rebuilt from the seed and the structures (architecture §10).
 */

import { byCoord, byEntryKey, byId } from '../core/ordering';
import { getItemDefinitionById, getItemDefinitionByKey } from '../defs/item_registry';
import { getStructureDefinitionById, getStructureDefinitionByKey } from '../defs/structure_registry';
import { computePlacedFootprint, dedupeChunkCoords, tileToChunk } from '../grid/grid_math';
import { createWorldGrid } from '../core/world_generator';
import type { GridModel } from '../grid/grid_model';
import { StructureStore } from '../state/structure_store';
import { WorldState } from '../state/world_state';
import type { StructureRecord } from '../types/structure';
import type { SaveBase, SaveStructureV1 } from './save_v1';

export const SAVE_V2_VERSION = 2 as const;

export type SaveItemSlotV2 = { structure_id: number; item_key: string; ticks_remaining: number };
export type SaveProgressV2 = { structure_id: number; ticks: number };
export type SaveDeliveredV2 = { item_key: string; count: number };

export type SaveGameV2 = SaveBase & {
    version: typeof SAVE_V2_VERSION;
    item_slots: SaveItemSlotV2[];
    extraction_progress: SaveProgressV2[];
    delivered: SaveDeliveredV2[];
};

/**
 * Serializes the world. Every list is sorted, so equal worlds give equal saves.
 * @param state The current world state.
 * @param grid The current grid.
 * @returns A plain, JSON-safe save object.
 */
export function writeSaveV2(state: WorldState, grid: GridModel): SaveGameV2 {
    return {
        version: SAVE_V2_VERSION,
        world_seed: state.worldSeed,
        tick_index: state.tickIndex,
        structures: state.structureStore.getAllStructures().sort(byId).map(toSaveStructure),
        persistent_chunks: grid
            .getAllPersistentChunks()
            .sort(byCoord)
            .map((coord) => ({ x: coord.x, y: coord.y })),
        item_slots: state.itemSlots.entries().map(([structureId, slot]) => ({
            structure_id: structureId,
            item_key: getItemDefinitionById(slot.itemId).key,
            ticks_remaining: slot.ticksRemaining,
        })),
        extraction_progress: state.extractionProgress
            .entries()
            .map(([structureId, ticks]) => ({ structure_id: structureId, ticks })),
        delivered: Array.from(state.deliveredCounts.entries())
            .sort(byEntryKey)
            .map(([itemId, count]) => ({ item_key: getItemDefinitionById(itemId).key, count })),
    };
}

/**
 * Rebuilds a world from a validated save (see `parseSave`).
 * Order (architecture §10): persistent chunks, then structures and their occupancy, then items.
 */
export function loadSaveV2(save: SaveGameV2): { state: WorldState; grid: GridModel } {
    const state = new WorldState();
    state.worldSeed = save.world_seed;
    state.tickIndex = save.tick_index;

    const grid = createWorldGrid(state);
    grid.setChunkPersistent(save.persistent_chunks.map((coord) => ({ x: coord.x, y: coord.y })));

    const records = save.structures.map(toStructureRecord).sort(byId);
    state.structureStore = new StructureStore(records);
    for (const structure of records) {
        occupyFootprint(grid, structure);
    }

    for (const slot of save.item_slots) {
        state.itemSlots.set(slot.structure_id, {
            itemId: getItemDefinitionByKey(slot.item_key).id,
            ticksRemaining: slot.ticks_remaining,
        });
    }
    for (const progress of save.extraction_progress) {
        state.extractionProgress.set(progress.structure_id, progress.ticks);
    }
    for (const delivered of save.delivered) {
        state.deliveredCounts.set(getItemDefinitionByKey(delivered.item_key).id, delivered.count);
    }
    return { state, grid };
}

function toSaveStructure(structure: StructureRecord): SaveStructureV1 {
    return {
        id: structure.id,
        definition_key: getStructureDefinitionById(structure.definitionId).key,
        coord: { x: structure.position.x, y: structure.position.y },
        rotation: structure.rotation,
        tick: structure.tick,
    };
}

function toStructureRecord(structure: SaveStructureV1): StructureRecord {
    return {
        id: structure.id,
        definitionId: getStructureDefinitionByKey(structure.definition_key).id,
        position: { x: structure.coord.x, y: structure.coord.y },
        rotation: structure.rotation,
        tick: structure.tick ?? 0,
    };
}

function occupyFootprint(grid: GridModel, structure: StructureRecord): void {
    const definition = getStructureDefinitionById(structure.definitionId);
    const tiles = computePlacedFootprint(structure.position, structure.rotation, definition.footprint);
    for (const tile of tiles) {
        grid.setStructureIdAt(tile, structure.id);
    }
    grid.setChunkPersistent(dedupeChunkCoords(tiles.map(tileToChunk)));
}
