// Adapted from an external snippet; the original source was not recorded.

/**
 * Places resource clusters (e.g. hydrogen nebulae) deterministically from the world seed.
 * The world is divided into cells; each cell may hold one cluster with a jittered centre and radius.
 */

import { hash2i, hashToUnitFloat, hashU32 } from '../core/hash2d';
import type { TileCoord } from '../types/coords';
import type { ResourceDefinition } from '../types/resource';
import { RESOURCE_ID_NONE } from './constants';

/** A tile belongs to a cluster once the strongest influence on it reaches this value. */
const CLUSTER_MEMBERSHIP_THRESHOLD = 0.25;

/** The cell containing the tile and its eight neighbours: a cluster never reaches further. */
const NEIGHBOUR_CELL_OFFSETS: readonly TileCoord[] = [-1, 0, 1].flatMap((y) =>
    [-1, 0, 1].map((x) => ({ x, y })),
);

/**
 * Computes which resource (if any) lies on a world tile.
 * @param worldTile The world tile coordinate.
 * @param worldSeed The seed for the world generation.
 * @param resourceDefinition The definition of the resource.
 * @returns The resource id, or RESOURCE_ID_NONE if no resource is present.
 */
export const generateResourceId = (
    worldTile: TileCoord,
    worldSeed: number,
    resourceDefinition: ResourceDefinition,
): number => {
    const homeCell: TileCoord = {
        x: Math.floor(worldTile.x / resourceDefinition.cellSizeTiles),
        y: Math.floor(worldTile.y / resourceDefinition.cellSizeTiles),
    };

    const strongestInfluence = Math.max(
        ...NEIGHBOUR_CELL_OFFSETS.map((offset) =>
            clusterInfluenceFromCell(
                { x: homeCell.x + offset.x, y: homeCell.y + offset.y },
                worldTile,
                worldSeed,
                resourceDefinition,
            ),
        ),
    );

    return strongestInfluence >= CLUSTER_MEMBERSHIP_THRESHOLD ? resourceDefinition.id : RESOURCE_ID_NONE;
};

/**
 * Computes the influence of a single cluster cell on a world tile.
 * @param cell The cluster cell (in units of cellSizeTiles).
 * @param worldTile The world tile coordinate.
 * @param worldSeed The seed for the world generation.
 * @param resourceDefinition The definition of the resource.
 * @returns The influence in [0, 1]: 1 at the cluster centre, 0 outside its radius.
 */
const clusterInfluenceFromCell = (
    cell: TileCoord,
    worldTile: TileCoord,
    worldSeed: number,
    resourceDefinition: ResourceDefinition,
): number => {
    const seed = (worldSeed ^ resourceDefinition.seedSalt) >>> 0;
    const cellHash = hash2i(cell.x, cell.y, seed);

    if (hashToUnitFloat(cellHash) > resourceDefinition.spawnProb) {
        return 0;
    }

    const cellSize = resourceDefinition.cellSizeTiles;
    const centre: TileCoord = {
        x: cell.x * cellSize + ((hashU32(cellHash ^ resourceDefinition.jitterSaltX) % cellSize) | 0),
        y: cell.y * cellSize + ((hashU32(cellHash ^ resourceDefinition.jitterSaltY) % cellSize) | 0),
    };

    const radiusSpan = Math.max(1, resourceDefinition.radiusMax - resourceDefinition.radiusMin + 1);
    const radius =
        resourceDefinition.radiusMin + ((hashU32(cellHash ^ resourceDefinition.radiusSalt) % radiusSpan) | 0);
    const deltaX = worldTile.x - centre.x;
    const deltaY = worldTile.y - centre.y;
    // Math.sqrt is exactly rounded on every engine; Math.hypot is not, which would break determinism.
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const falloff = 1 - distance / (radius + resourceDefinition.edgeSoftness);
    return falloff > 0 ? falloff * falloff : 0;
};
