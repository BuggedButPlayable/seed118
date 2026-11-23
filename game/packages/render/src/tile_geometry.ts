/**
 * Small geometry shared by the layers. World units are tiles; tile (x, y) covers [x, x + 1) × [y, y + 1).
 */

import { neighbourAcross } from '@seed118/sim';
import type { Side, TileCoord } from '@seed118/sim';

/** A point in world space, in tiles (fractional). */
export interface WorldPoint {
    x: number;
    y: number;
}

const HALF_TILE = 0.5;
const ORIGIN: TileCoord = { x: 0, y: 0 };

export function tileCenter(tile: TileCoord): WorldPoint {
    return { x: tile.x + HALF_TILE, y: tile.y + HALF_TILE };
}

/** Unit step from a tile across one of its sides (y points down). */
export function sideStep(side: Side): TileCoord {
    return neighbourAcross(ORIGIN, side);
}

/** Middle of the given edge of a tile. */
export function edgeMidpoint(tile: TileCoord, side: Side): WorldPoint {
    const center = tileCenter(tile);
    const step = sideStep(side);
    return { x: center.x + step.x * HALF_TILE, y: center.y + step.y * HALF_TILE };
}
