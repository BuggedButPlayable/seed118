import type { SimWorld } from '../../src/sim/sim_world';
import type { TileCoord } from '../../src/types/coords';
import type { Event } from '../../src/types/events';
import { focusCommand, placeCommand } from './commands';
import { MOCK_MULTITILE, MOCK_SIMPLE_STRUCTURE } from './mock_structures';

export const SCRIPT_SIMPLE_ANCHOR: TileCoord = { x: 10, y: 10 };
export const SCRIPT_MULTITILE_ANCHOR: TileCoord = { x: 13, y: 10 };

/**
 * A short, fixed command stream: focus the origin, place one simple and one multi-tile structure.
 * Shared by determinism and save tests so both check the same world.
 * @returns All events produced by the script.
 */
export function runPlacementScript(sim: SimWorld): Event[] {
    const events: Event[] = [];
    sim.tick([focusCommand({ x: 0, y: 0 })], events);
    sim.tick([placeCommand(MOCK_SIMPLE_STRUCTURE.id, SCRIPT_SIMPLE_ANCHOR)], events);
    sim.tick([placeCommand(MOCK_MULTITILE.id, SCRIPT_MULTITILE_ANCHOR)], events);
    return events;
}
