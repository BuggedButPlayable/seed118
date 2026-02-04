// not my code lol 

/**
 * Generates resource clusters based on world tile coordinates and resource definitions.
 */

import { hash2i, hashToUnitFloat, hashU32 } from "../core/hash2d";
import type { TileCoord } from "../types/coords";
import { ResourceDefinition } from "../types/resource";
import { RESOURCE_ID_NONE } from "./constants";

/**
 * Computes the resource ID of clusters at a given world tile coordinate.
 * @param worldTile The world tile coordinate.
 * @param worldSeed The seed for the world generation.
 * @param resourceDefinition The definition of the resource.
 * @returns The resource ID or RESOURCE_ID_NONE if no resource is present.
 */
export const generateResourceId = (worldTile: TileCoord, worldSeed: number, resourceDefinition: ResourceDefinition): number => {
  const cx = Math.floor(worldTile.x / resourceDefinition.cellSizeTiles);
  const cy = Math.floor(worldTile.y / resourceDefinition.cellSizeTiles);

  let best = 0.0;
  for (let oy = -1; oy <= 1; oy++) {
    for (let ox = -1; ox <= 1; ox++) {
      const infl = _clusterInfluenceFromCell(cx + ox, cy + oy, worldTile, worldSeed, resourceDefinition);
      if (infl > best) best = infl;
    }
  }
  return best >= 0.25 ? resourceDefinition.id : RESOURCE_ID_NONE;
};

/**
 * Computes the influence of a single cluster cell on a world tile.
 * @param cellX The x coordinate of the cluster cell.
 * @param cellY The y coordinate of the cluster cell.
 * @param worldTile The world tile coordinate.
 * @param worldSeed The seed for the world generation.
 * @param resourceDefinition The definition of the resource.
 * @returns The influence value in the range [0, 1].
 */
const _clusterInfluenceFromCell = (
  cellX: number,
  cellY: number,
  worldTile: TileCoord,
  worldSeed: number,
  resourceDefinition: ResourceDefinition
): number => {
  const seed = (worldSeed ^ resourceDefinition.seedSalt) >>> 0;
  const h = hash2i(cellX, cellY, seed);

  if (hashToUnitFloat(h) > resourceDefinition.spawnProb) return 0.0;

  const jx = (hashU32(h ^ resourceDefinition.jitterSaltX) % resourceDefinition.cellSizeTiles) | 0;
  const jy = (hashU32(h ^ resourceDefinition.jitterSaltY) % resourceDefinition.cellSizeTiles) | 0;

  const centerX = cellX * resourceDefinition.cellSizeTiles + jx;
  const centerY = cellY * resourceDefinition.cellSizeTiles + jy;

  const rSpan = Math.max(1, resourceDefinition.radiusMax - resourceDefinition.radiusMin + 1);
  const radius = resourceDefinition.radiusMin + ((hashU32(h ^ resourceDefinition.radiusSalt) % rSpan) | 0);
  const dx = worldTile.x - centerX;
  const dy = worldTile.y - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const rr = radius + resourceDefinition.edgeSoftness;
  const t = 1.0 - dist / rr;
  if (t <= 0.0) return 0.0;

  return t * t;
};