/**
 * Rudimentary save/load system for the game. This is a very basic implementation and is not optimized for performance or storage efficiency.
 * It serves as a starting point for implementing a more robust save/load system in the future.
 */

import { getStructureDefinitionById, getStructureDefinitionByKey } from "../defs/structure_registry";
import { computeFootprintTiles, rotateOffsets, tileToChunk } from "../grid/grid_math";
import { GridModel } from "../grid/grid_model";
import { StructureStore } from "../state/structure_store";
import { WorldState } from "../state/world_state";
import { ChunkCoord, Rotation, TileCoord } from "../types";
import { StructureRecord } from "../types/structure";
import { dedupeChunkCoords } from "./utils.";

export const SAVE_V1_VERSION = 1 as const;

export type SaveStructureV1 = {
  id: number;
  definition_key: string;
  coord: TileCoord;
  rotation: number;
  tick?: number;
};

export type SaveGameV1 = {
  version: 1;
  world_seed: number;
  tick_index: number;

  structures: SaveStructureV1[];
  persistent_chunks: ChunkCoord[];
};

/**
 * Saves the current game state into the SaveGameV1 format.
 * @param state The current world state.
 * @param grid The current grid model.
 * @returns The saved game data in SaveGameV1 format.
 */
export function saveSaveGameV1(state: WorldState, grid: GridModel): SaveGameV1 {
  const structures: SaveStructureV1[] = state.structureStore
    .getAllStructures()
    .slice()
    .sort((a, b) => a.id - b.id)
    .map((s) => {
      const definition = getStructureDefinitionById(s.definitionId);
      return {
        id: s.id,
        definition_key: definition.key,
        coord: s.position,
        rotation: s.rotation,
        tick: s.tick
      };
    });

  const persistentChunks: ChunkCoord[] = grid
    .getAllPersistentChunks()
    .slice()
    .sort((a, b) => (a.y - b.y) || (a.x - b.x))
    .map((coord) => ({ x: coord.x, y: coord.y }));

  return {
    version: SAVE_V1_VERSION,
    world_seed: state.worldSeed,
    tick_index: state.tickIndex,
    structures,
    persistent_chunks: persistentChunks
  };
}


/**
 * Loads the game state from the given SaveGameV1 data.
 * @param save The saved game data in SaveGameV1 format.
 * @returns An object containing the loaded world state and grid model.
 */
export function loadSaveGameV1(save: SaveGameV1): {state: WorldState; grid: GridModel}  {
  const state = new WorldState();
  state.worldSeed = save.world_seed;
  state.tickIndex = save.tick_index;

  const grid = new GridModel();

  const persistentChunkCoords = save.persistent_chunks.map((coord) => ({ x: coord.x, y: coord.y }));
  grid.setChunkPersistent(persistentChunkCoords, true);

  const records: StructureRecord[] = [];
  for (const structure of save.structures) {
    if (!Number.isFinite(structure.id) || structure.id <= 0) continue;
    if (!structure.definition_key || typeof structure.definition_key !== 'string') continue;

    const definition = getStructureDefinitionByKey(structure.definition_key);
    records.push({
      id: structure.id,
      definitionId: definition.id,
      position: { x: structure.coord.x, y: structure.coord.y },
      rotation: structure.rotation as Rotation,
      tick: structure.tick ?? 0
    });
  }

  records.sort((a, b) => a.id - b.id);
  state.structureStore = new StructureStore(records);

  for (const structure of records) {
    const definition = getStructureDefinitionById(structure.definitionId);
    const tiles = computeFootprintTiles(structure.position, rotateOffsets(definition.footprint, structure.rotation));

    for (const tile of tiles) {
      grid.setStructureIdAt(tile, structure.id);
    }

    const chunkCoords = dedupeChunkCoords(tiles.map((tile) => tileToChunk(tile)))
    grid.setChunkPersistent(chunkCoords, true);
  }

  return { state, grid };
}