/**
 * Where an item is drawn inside its holder. Pure math, so the interpolation can be tested without PixiJS.
 */

import { neighbourAcross } from '@seed118/sim';
import type { Side, StructurePort } from '@seed118/sim';

import type { ScreenPoint } from './camera';

const HALF_TILE = 0.5;

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
 * Point between the input edge and the output edge of a one-tile holder (a belt).
 * Without both ports the item sits in the middle of the anchor tile.
 */
export function itemPosition(ports: readonly StructurePort[], progress: number): ScreenPoint | null {
    const input = ports.find((port) => port.type === 'input');
    const output = ports.find((port) => port.type === 'output');
    if (!input || !output) {
        return null;
    }
    const start = edgeMidpoint(input.tile, input.side);
    const end = edgeMidpoint(output.tile, output.side);
    return { x: start.x + (end.x - start.x) * progress, y: start.y + (end.y - start.y) * progress };
}

function edgeMidpoint(tile: { x: number; y: number }, side: Side): ScreenPoint {
    const step = neighbourAcross({ x: 0, y: 0 }, side);
    return { x: tile.x + HALF_TILE + step.x * HALF_TILE, y: tile.y + HALF_TILE + step.y * HALF_TILE };
}
