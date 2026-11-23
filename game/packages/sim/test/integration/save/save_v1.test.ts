import { findEvent } from '../../fixtures/find_event';
import type { Event } from '../../../src/types/events';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SimWorld } from '../../../src/sim/sim_world';
import { CommandType } from '../../../src/types/commands';
import { MOCK_MULTITILE, MOCK_SIMPLE_STRUCTURE } from '../../fixtures/mock_structures';
import { setupMockRegistry, restoreMockRegistry } from '../../fixtures/mock_registry';
import { EventType, RejectReason } from '../../../src/types/events';

describe('SaveGameV1 (integration)', () => {
    beforeEach(() => {
        setupMockRegistry();
    });

    afterEach(() => {
        restoreMockRegistry();
    });

    it('save -> load -> save roundtrip should be stable ', () => {
        const sim = new SimWorld();
        const wordSeed = 12345;
        sim.reset(wordSeed);

        const events: Event[] = [];
        sim.tick([{ type: CommandType.SetFocusChunk, coord: { x: 0, y: 0 } }], events);
        sim.tick(
            [
                {
                    type: CommandType.PlaceStructure,
                    definitionId: MOCK_SIMPLE_STRUCTURE.id,
                    coord: { x: 10, y: 10 },
                    rotation: 0,
                },
            ],
            events,
        );
        sim.tick(
            [
                {
                    type: CommandType.PlaceStructure,
                    definitionId: MOCK_MULTITILE.id,
                    coord: { x: 13, y: 10 },
                    rotation: 0,
                },
            ],
            events,
        );

        const save1 = sim.saveV1();

        const sim2 = new SimWorld();
        sim2.loadV1(save1);

        const save2 = sim2.saveV1();

        expect(save2).toEqual(save1);
    });

    it('load should rebuild structure on the grid', () => {
        const sim = new SimWorld();
        const wordSeed = 12345;
        sim.reset(wordSeed);

        const events: Event[] = [];
        sim.tick([{ type: CommandType.SetFocusChunk, coord: { x: 0, y: 0 } }], events);
        sim.tick(
            [
                {
                    type: CommandType.PlaceStructure,
                    definitionId: MOCK_SIMPLE_STRUCTURE.id,
                    coord: { x: 10, y: 10 },
                    rotation: 0,
                },
            ],
            events,
        );

        const multiAnchor = { x: 13, y: 10 };
        sim.tick(
            [
                {
                    type: CommandType.PlaceStructure,
                    definitionId: MOCK_MULTITILE.id,
                    coord: multiAnchor,
                    rotation: 0,
                },
            ],
            events,
        );

        const save = sim.saveV1();

        const sim2 = new SimWorld();
        sim2.loadV1(save);

        const loadedMulti = sim2
            .getStructures()
            .find(
                (s) =>
                    s.definitionId === MOCK_MULTITILE.id &&
                    s.position.x === multiAnchor.x &&
                    s.position.y === multiAnchor.y,
            );

        expect(loadedMulti).toBeTruthy();

        for (const off of MOCK_MULTITILE.footprint) {
            const tile = { x: multiAnchor.x + off.x, y: multiAnchor.y + off.y };

            expect(sim2.getStructureIdAt(tile)).toBe(loadedMulti!.id);
            expect(sim2.getResourceIdAt(tile)).not.toBe(loadedMulti!.id);
        }
    });

    it('load should preserve occupancy rules (overlapping place is rejected)', () => {
        const sim = new SimWorld();
        const wordSeed = 12345;
        sim.reset(wordSeed);

        const events: Event[] = [];
        sim.tick([{ type: CommandType.SetFocusChunk, coord: { x: 0, y: 0 } }], events);

        const multiAnchor = { x: 13, y: 10 };
        sim.tick(
            [
                {
                    type: CommandType.PlaceStructure,
                    definitionId: MOCK_MULTITILE.id,
                    coord: multiAnchor,
                    rotation: 0,
                },
            ],
            events,
        );

        const save = sim.saveV1();
        const sim2 = new SimWorld();
        sim2.loadV1(save);

        const events2: Event[] = [];
        sim2.tick(
            [
                {
                    type: CommandType.PlaceStructure,
                    definitionId: MOCK_SIMPLE_STRUCTURE.id,
                    coord: multiAnchor,
                    rotation: 0,
                },
            ],
            events2,
        );

        const rejected = findEvent(events2, EventType.CommandRejected);
        expect(rejected).toBeTruthy();
        expect(rejected.reason).toBe(RejectReason.Occupied);

        const multiCount = sim2.getStructures().filter((s) => s.definitionId === MOCK_MULTITILE.id).length;
        expect(multiCount).toBe(1);
    });
});
