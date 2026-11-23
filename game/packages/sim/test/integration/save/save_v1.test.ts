import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SimWorld } from '../../../src/sim/sim_world';
import { EventType, RejectReason } from '../../../src/types/events';
import type { Event } from '../../../src/types/events';
import { placeCommand } from '../../fixtures/commands';
import { findEvent } from '../../fixtures/find_event';
import { restoreMockRegistry, setupMockRegistry } from '../../fixtures/mock_registry';
import { MOCK_MULTITILE, MOCK_SIMPLE_STRUCTURE } from '../../fixtures/mock_structures';
import { runPlacementScript, SCRIPT_MULTITILE_ANCHOR } from '../../fixtures/scripts';

const WORLD_SEED = 12345;

/** Runs the placement script, saves, and loads the save into a fresh world. */
function saveAndReload(): { original: SimWorld; reloaded: SimWorld } {
    const original = new SimWorld();
    original.reset(WORLD_SEED);
    runPlacementScript(original);

    const reloaded = new SimWorld();
    reloaded.loadV1(original.saveV1());
    return { original, reloaded };
}

describe('SaveGameV1 (integration)', () => {
    beforeEach(() => {
        setupMockRegistry();
    });

    afterEach(() => {
        restoreMockRegistry();
    });

    it('save -> load -> save roundtrip is stable', () => {
        const { original, reloaded } = saveAndReload();

        expect(reloaded.saveV1()).toEqual(original.saveV1());
    });

    it('load rebuilds every footprint tile of a multi-tile structure on the grid', () => {
        const { reloaded } = saveAndReload();

        const multiTile = reloaded
            .getStructures()
            .find((structure) => structure.definitionId === MOCK_MULTITILE.id);
        expect(multiTile).toBeDefined();

        for (const offset of MOCK_MULTITILE.footprint) {
            const tile = { x: SCRIPT_MULTITILE_ANCHOR.x + offset.x, y: SCRIPT_MULTITILE_ANCHOR.y + offset.y };
            expect(reloaded.getStructureIdAt(tile)).toBe(multiTile!.id);
        }
    });

    it('load preserves occupancy: placing onto a loaded structure is rejected', () => {
        const { reloaded } = saveAndReload();
        const events: Event[] = [];

        reloaded.tick([placeCommand(MOCK_SIMPLE_STRUCTURE.id, SCRIPT_MULTITILE_ANCHOR)], events);

        expect(findEvent(events, EventType.CommandRejected).reason).toBe(RejectReason.Occupied);
        const multiTileCount = reloaded
            .getStructures()
            .filter((structure) => structure.definitionId === MOCK_MULTITILE.id).length;
        expect(multiTileCount).toBe(1);
    });
});
