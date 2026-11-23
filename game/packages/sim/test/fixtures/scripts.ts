import { SimWorld } from '../../src/sim/sim_world';
import type { TileCoord } from '../../src/types/coords';
import type { Command } from '../../src/types/commands';
import type { Event } from '../../src/types/events';
import { focusCommand, placeCommand } from './commands';
import {
    MOCK_BELT,
    MOCK_EXTRACTOR,
    MOCK_MULTITILE,
    MOCK_SIMPLE_STRUCTURE,
    MOCK_SINK,
} from './mock_structures';
import { findResourceTile } from './resource_tiles';

export const SCRIPT_SIMPLE_ANCHOR: TileCoord = { x: 10, y: 10 };
export const SCRIPT_MULTITILE_ANCHOR: TileCoord = { x: 13, y: 10 };

/** A fresh world from the given seed with the camera focused on chunk (0, 0), so its chunks exist. */
export function createFocusedWorld(worldSeed: number): SimWorld {
    const sim = new SimWorld();
    sim.reset(worldSeed);
    sim.tick([focusCommand({ x: 0, y: 0 })], []);
    return sim;
}

/**
 * Runs `ticks` ticks: `commands` go into the first one, the rest are empty.
 * @param outEvents Receives the events of all ticks; omit it if the test does not need them.
 */
export function run(sim: SimWorld, ticks: number, commands: Command[] = [], outEvents: Event[] = []): void {
    sim.tick(commands, outEvents);
    for (let tick = 1; tick < ticks; tick++) {
        sim.tick([], outEvents);
    }
}

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

const TRANSPORT_BELT_COUNT = 3;
/** Long enough for deliveries, short enough that items are still on the belts. */
const TRANSPORT_SCRIPT_TICKS = 25;

/**
 * Extractor → belts → sink in chunk (0, 0), run until items are in flight and some are delivered.
 * Needs the mock registry. Shared by save and determinism tests.
 */
export function runTransportScript(sim: SimWorld): void {
    sim.tick([focusCommand({ x: 0, y: 0 })], []);
    const source = findResourceTile(sim, TRANSPORT_BELT_COUNT + 1);
    const tileBelow = (steps: number): TileCoord => ({ x: source.x, y: source.y + steps });
    const belts = Array.from({ length: TRANSPORT_BELT_COUNT }, (_, index) =>
        placeCommand(MOCK_BELT.id, tileBelow(index + 1)),
    );
    run(sim, TRANSPORT_SCRIPT_TICKS, [
        placeCommand(MOCK_EXTRACTOR.id, source),
        ...belts,
        placeCommand(MOCK_SINK.id, tileBelow(TRANSPORT_BELT_COUNT + 1)),
    ]);
}
