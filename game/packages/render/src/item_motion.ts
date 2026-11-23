/**
 * Where an item is drawn inside its holder. Pure math, so the interpolation can be tested without PixiJS.
 */

import type { StructurePort } from '@seed118/sim';

import { edgeMidpoint, tileCenter } from './tile_geometry';

const HALF_WAY = 0.5;
import type { WorldPoint } from './tile_geometry';

/**
 * How far an item has crossed its holder, 0 (just entered) .. 1 (at the exit).
 * @param ticksRemaining Ticks until the item may leave (from the snapshot).
 * @param transitTicks Ticks a full crossing takes.
 * @param stepProgress Progress towards the next simulation tick, 0..1, so motion is smooth between ticks.
 */
export function crossingProgress(ticksRemaining: number, transitTicks: number, stepProgress: number): number {
    const travelled = transitTicks - ticksRemaining + stepProgress;
    return Math.min(1, Math.max(0, travelled / transitTicks));
}

/**
 * Point on the way from the input edge through the tile center to the output edge of a one-tile holder,
 * so items go straight on straight belts and round the corner on curves.
 * Without both ports there is no path.
 */
export function itemPosition(ports: readonly StructurePort[], progress: number): WorldPoint | null {
    const input = ports.find((port) => port.type === 'input');
    const output = ports.find((port) => port.type === 'output');
    if (!input || !output) {
        return null;
    }
    const start = edgeMidpoint(input.tile, input.side);
    const center = tileCenter(input.tile);
    const end = edgeMidpoint(output.tile, output.side);
    return progress < HALF_WAY
        ? interpolate(start, center, progress / HALF_WAY)
        : interpolate(center, end, (progress - HALF_WAY) / HALF_WAY);
}

function interpolate(from: WorldPoint, to: WorldPoint, fraction: number): WorldPoint {
    return { x: from.x + (to.x - from.x) * fraction, y: from.y + (to.y - from.y) * fraction };
}
