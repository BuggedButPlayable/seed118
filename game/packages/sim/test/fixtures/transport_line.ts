import type { SimWorld } from '../../src/sim/sim_world';
import type { TileCoord } from '../../src/types/coords';
import { placeCommand } from './commands';
import { MOCK_BELT, MOCK_EXTRACTOR, MOCK_SINK } from './mock_structures';
import { findResourceTile } from './resource_tiles';

/** Belts in a test line. */
export const LINE_LENGTH = 3;

export type BuildOrder = 'top-down' | 'bottom-up';

export const below = (tile: TileCoord, steps: number): TileCoord => ({ x: tile.x, y: tile.y + steps });

/**
 * Extractor on a resource tile in chunk (0, 0) with a straight belt line below it, one free tile left
 * for a sink. Needs the mock registry and generated chunks.
 * @returns The extractor tile followed by the belt tiles, top to bottom.
 */
export function buildLine(sim: SimWorld, order: BuildOrder, beltId = MOCK_BELT.id): TileCoord[] {
    const source = findResourceTile(sim, LINE_LENGTH + 1);
    const belts = Array.from({ length: LINE_LENGTH }, (_, index) => below(source, index + 1));
    const ordered = order === 'top-down' ? belts : [...belts].reverse();
    sim.tick(
        [placeCommand(MOCK_EXTRACTOR.id, source), ...ordered.map((tile) => placeCommand(beltId, tile))],
        [],
    );
    return [source, ...belts];
}

/** Ends the line in a sink that takes every item. */
export function placeSinkBelow(sim: SimWorld, line: readonly TileCoord[]): void {
    const last = line.at(-1);
    if (!last) {
        throw new Error('Cannot place a sink below an empty line.');
    }
    sim.tick([placeCommand(MOCK_SINK.id, below(last, 1))], []);
}
