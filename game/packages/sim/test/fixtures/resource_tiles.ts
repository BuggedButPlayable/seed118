import { CHUNK_SIZE, RESOURCE_ID_NONE } from '../../src/core/constants';
import type { SimWorld } from '../../src/sim/sim_world';
import type { TileCoord } from '../../src/types/coords';

/** Every tile of chunk (0, 0), row by row. The chunk must already be generated. */
function originChunkTiles(): TileCoord[] {
    return Array.from({ length: CHUNK_SIZE * CHUNK_SIZE }, (_, index) => ({
        x: index % CHUNK_SIZE,
        y: Math.floor(index / CHUNK_SIZE),
    }));
}

/**
 * Finds a tile in chunk (0, 0) where `isWanted` holds and the `freeBelow` tiles under it lie in the same chunk.
 * Worldgen is seeded, so the result is stable for a given seed.
 */
function findTile(sim: SimWorld, freeBelow: number, isWanted: (resourceId: number) => boolean): TileCoord {
    const found = originChunkTiles().find(
        (tile) => tile.y + freeBelow < CHUNK_SIZE && isWanted(sim.getResourceIdAt(tile)),
    );
    if (!found) {
        throw new Error('No matching tile in chunk (0, 0); pick another seed.');
    }
    return found;
}

export const findResourceTile = (sim: SimWorld, freeBelow = 0): TileCoord =>
    findTile(sim, freeBelow, (resourceId) => resourceId !== RESOURCE_ID_NONE);

export const findEmptyTile = (sim: SimWorld): TileCoord =>
    findTile(sim, 0, (resourceId) => resourceId === RESOURCE_ID_NONE);
