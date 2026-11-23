import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SAVE_V1_VERSION } from '../../../src/save/save_v1';
import type { SaveGameV1 } from '../../../src/save/save_v1';
import { SimWorld } from '../../../src/sim/sim_world';
import { EventType, RejectReason } from '../../../src/types/events';
import type { Event } from '../../../src/types/events';
import { placeCommand } from '../../fixtures/commands';
import { findEvent } from '../../fixtures/find_event';
import { restoreMockRegistry, setupMockRegistry } from '../../fixtures/mock_registry';
import { MOCK_MULTITILE, MOCK_SIMPLE_STRUCTURE } from '../../fixtures/mock_structures';
import { run, runPlacementScript, runTransportScript, SCRIPT_MULTITILE_ANCHOR } from '../../fixtures/scripts';

// Chunk (0, 0) of this seed has a nebula column long enough for the transport script.
const WORLD_SEED = 118;
const CONTINUE_TICKS = 40;

function scriptedWorld(script: (sim: SimWorld) => unknown): SimWorld {
    const sim = new SimWorld();
    sim.reset(WORLD_SEED);
    script(sim);
    return sim;
}

/** Saves, sends the save through JSON (like browser storage does) and loads it into a fresh world. */
function reload(original: SimWorld): SimWorld {
    const reloaded = new SimWorld();
    reloaded.loadSave(JSON.parse(JSON.stringify(original.saveV2())));
    return reloaded;
}

describe('Save v2 (integration)', () => {
    beforeEach(() => {
        setupMockRegistry();
    });

    afterEach(() => {
        restoreMockRegistry();
    });

    it('save -> load -> save is identical, including items in flight and deliveries', () => {
        const original = scriptedWorld(runTransportScript);
        const save = original.saveV2();
        expect(save.item_slots.length).toBeGreaterThan(0);
        expect(save.delivered[0]?.count).toBeGreaterThan(0);

        expect(reload(original).saveV2()).toEqual(save);
    });

    it('a reloaded world continues exactly like the original', () => {
        const original = scriptedWorld(runTransportScript);
        const reloaded = reload(original);

        run(original, CONTINUE_TICKS);
        run(reloaded, CONTINUE_TICKS);

        expect(reloaded.saveV2()).toEqual(original.saveV2());
        expect(reloaded.getDeliveredCount('hydrogen')).toBe(original.getDeliveredCount('hydrogen'));
    });

    it('load rebuilds every footprint tile of a multi-tile structure', () => {
        const reloaded = reload(scriptedWorld(runPlacementScript));

        const multiTile = reloaded
            .getStructures()
            .find((structure) => structure.definitionId === MOCK_MULTITILE.id);
        for (const offset of MOCK_MULTITILE.footprint) {
            const tile = { x: SCRIPT_MULTITILE_ANCHOR.x + offset.x, y: SCRIPT_MULTITILE_ANCHOR.y + offset.y };
            expect(reloaded.getStructureIdAt(tile)).toBe(multiTile!.id);
        }
    });

    it('load preserves occupancy: placing onto a loaded structure is rejected', () => {
        const reloaded = reload(scriptedWorld(runPlacementScript));
        const events: Event[] = [];

        reloaded.tick([placeCommand(MOCK_SIMPLE_STRUCTURE.id, SCRIPT_MULTITILE_ANCHOR)], events);

        expect(findEvent(events, EventType.CommandRejected).reason).toBe(RejectReason.Occupied);
    });

    it('migrates a v1 save: structures stay, nothing is in flight or delivered', () => {
        const v1: SaveGameV1 = {
            version: SAVE_V1_VERSION,
            world_seed: WORLD_SEED,
            tick_index: 7,
            structures: [{ id: 3, definition_key: MOCK_MULTITILE.key, coord: { x: 2, y: 2 }, rotation: 1 }],
            persistent_chunks: [{ x: 0, y: 0 }],
        };
        const sim = new SimWorld();

        sim.loadSave(v1);

        expect(sim.getStructures()).toMatchObject([{ id: 3, definitionId: MOCK_MULTITILE.id, rotation: 1 }]);
        expect(sim.getTickIndex()).toBe(7);
        expect(sim.getItemSlots()).toEqual([]);
        expect(sim.saveV2()).toMatchObject({
            version: 2,
            item_slots: [],
            extraction_progress: [],
            delivered: [],
        });
    });

    const validSave = (): Record<string, unknown> => scriptedWorld(runPlacementScript).saveV2();
    const badRotation = {
        id: 1,
        definition_key: MOCK_SIMPLE_STRUCTURE.key,
        coord: { x: 0, y: 0 },
        rotation: 4,
    };

    // Rows are functions: the mock registry only exists inside each test.
    it.each<[string, () => unknown]>([
        ['not an object', () => null],
        ['an unknown version', () => ({ ...validSave(), version: 99 })],
        ['a list field that is missing', () => ({ ...validSave(), structures: undefined })],
        ['a rotation out of range', () => ({ ...validSave(), structures: [badRotation] })],
        ['a negative count', () => ({ ...validSave(), delivered: [{ item_key: 'hydrogen', count: -1 }] })],
    ])('rejects a save with %s and keeps the current world', (_, createData) => {
        const sim = scriptedWorld(runPlacementScript);
        const before = sim.saveV2();
        const data = createData();

        expect(() => sim.loadSave(data)).toThrow();
        expect(sim.saveV2()).toEqual(before);
    });
});
