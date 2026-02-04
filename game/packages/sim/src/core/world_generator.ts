/**
 * World generation functions for creating and populating chunks in the game world.
 */

import { GridModel } from "../grid/grid_model";
import { WorldState } from "../state/world_state";
import { ChunkCoord } from "../types";
import { EventType } from "../types/events";
import { CHUNK_SIZE } from "./constants";
import { HYDROGEN_DEFINITION } from "../defs/resource_def/hydrogen_def";
import { generateResourceId } from "./cluster_generator";

/**
 * Generates a new chunk at the given coordinates, populating it with resources based on the world seed.
 * @param chunkCoord The coordinates of the chunk to generate. Each coordinate corresponds to a CHUNK_SIZE x CHUNK_SIZE area in the world.
 * @param grid The grid model representing the world.
 * @param state The current state of the world.
 */
export function generateNewChunk(chunkCoord: ChunkCoord, grid: GridModel, state: WorldState): void {
    var tilesPerChunk = CHUNK_SIZE
    var worldOrigin = {
        x: chunkCoord.x * tilesPerChunk,
        y: chunkCoord.y * tilesPerChunk
    };

    for (var y = 0; y < tilesPerChunk; y++) {
        for (var x = 0; x < tilesPerChunk; x++) {
            var localTilePosition = { x: x, y: y };
            var worldTile = {
                x: worldOrigin.x + localTilePosition.x,
                y: worldOrigin.y + localTilePosition.y
            };

            var resourceId = generateResourceId(
                worldTile,
                state.worldSeed,
                HYDROGEN_DEFINITION
            );
            grid.setResourceIdAt(worldTile, resourceId);
        }
    }

    state.generatedChunkCount++;

    if (state.currentTickOutEvents) {
        state.currentTickOutEvents.push({
            type: EventType.ChunkGenerated,
            coord: chunkCoord
        })
    }
}