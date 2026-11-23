import { describe, expect, it } from 'vitest';

import { RESOURCE_ID_NONE } from '../../../src/core/constants';
import { getStructureDefinitionByKey } from '../../../src/defs/structure_registry';
import { SimWorld } from '../../../src/sim/sim_world';
import { EventType, RejectReason } from '../../../src/types/events';
import type { Event } from '../../../src/types/events';
import { placeCommand, removeCommand } from '../../fixtures/commands';
import { findEvent, findEvents } from '../../fixtures/find_event';
import { run } from '../../fixtures/scripts';

// Uses the production definitions on purpose: this is the M1 loop as the player sees it.
const CORE = getStructureDefinitionByKey('core');
const COLLECTOR = getStructureDefinitionByKey('collector');
/** Directly south of the Core's bottom-left tile; a collector facing north feeds the Core from here. */
const BELOW_CORE = { x: 0, y: 2 };
const MAX_SEED_TRIES = 200;
const RUN_TICKS = 200;

/** First seed whose start area has nebula right below the Core (worldgen is seeded, so this is stable). */
function startWorldWithNebulaBelowCore(): SimWorld {
    const sim = new SimWorld();
    for (let seed = 1; seed <= MAX_SEED_TRIES; seed++) {
        sim.startNewWorld(seed);
        if (sim.getResourceIdAt(BELOW_CORE) !== RESOURCE_ID_NONE) {
            return sim;
        }
    }
    throw new Error('No seed with nebula below the Core.');
}

describe('A new world', () => {
    it('starts with exactly one Core at the origin and nothing delivered', () => {
        const sim = new SimWorld();
        sim.startNewWorld(118);

        expect(sim.getStructures()).toMatchObject([{ definitionId: CORE.id, position: { x: 0, y: 0 } }]);
        expect(sim.getStructureIdAt({ x: 1, y: 1 })).toBe(sim.getStructures()[0]!.id);
        expect(sim.getDeliveredCount('hydrogen')).toBe(0);
        expect(sim.getStructure(sim.getStructures()[0]!.id)).toMatchObject({ definitionId: CORE.id });
        expect(sim.getStructure(999)).toBeNull();
    });

    it('does not let the player remove the Core', () => {
        const sim = new SimWorld();
        sim.startNewWorld(118);
        const events: Event[] = [];

        sim.tick([removeCommand({ x: 1, y: 0 })], events);

        expect(findEvent(events, EventType.CommandRejected).reason).toBe(RejectReason.NotRemovable);
    });

    it('checkPlacement answers like the command system, without changing the world', () => {
        const sim = startWorldWithNebulaBelowCore();
        const onCore = { x: 1, y: 1 };

        expect(sim.checkPlacement({ definitionId: COLLECTOR.id, coord: onCore, rotation: 0 })?.reason).toBe(
            RejectReason.Occupied,
        );
        expect(sim.checkPlacement({ definitionId: COLLECTOR.id, coord: BELOW_CORE, rotation: 0 })).toBeNull();
        expect(sim.getStructures()).toHaveLength(1);

        const events: Event[] = [];
        sim.tick([placeCommand(COLLECTOR.id, onCore)], events);
        expect(findEvent(events, EventType.CommandRejected).reason).toBe(RejectReason.Occupied);
    });

    it('a collector next to the Core delivers hydrogen', () => {
        const sim = startWorldWithNebulaBelowCore();
        const events: Event[] = [];

        run(sim, RUN_TICKS, [placeCommand(COLLECTOR.id, BELOW_CORE, 0)], events);

        // Extraction already runs in the placement tick, so every tick counts.
        const expected = Math.floor(RUN_TICKS / COLLECTOR.extraction!.ticksPerItem);
        expect(sim.getDeliveredCount('hydrogen')).toBe(expected);
        expect(findEvents(events, EventType.Delivered)).toHaveLength(expected);
    });
});
