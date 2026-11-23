import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { SimWorld } from '../../../src/sim/sim_world';
import type { Rotation, TileCoord } from '../../../src/types/coords';
import { EventType, RejectReason } from '../../../src/types/events';
import type { Event } from '../../../src/types/events';
import type { ItemSlotSnapshot } from '../../../src/types/item';
import { placeCommand, removeCommand } from '../../fixtures/commands';
import { findEvent, findEvents } from '../../fixtures/find_event';
import { restoreMockRegistry, setupMockRegistry } from '../../fixtures/mock_registry';
import {
    MOCK_BELT,
    MOCK_EXTRACTOR,
    MOCK_PICKY_BELT,
    MOCK_SINK,
    MOCK_SLOW_BELT,
} from '../../fixtures/mock_structures';
import { findEmptyTile, findResourceTile } from '../../fixtures/resource_tiles';
import { createFocusedWorld, run } from '../../fixtures/scripts';

const WORLD_SEED = 118;
const LINE_LENGTH = 3;
/** Long enough to fill the whole line (extractor + belts) several times over. */
const FILL_TICKS = 60;

const createWorld = (): SimWorld => createFocusedWorld(WORLD_SEED);

const below = (tile: TileCoord, steps: number): TileCoord => ({ x: tile.x, y: tile.y + steps });

function slotAt(sim: SimWorld, tile: TileCoord): ItemSlotSnapshot | undefined {
    const structureId = sim.getStructureIdAt(tile);
    return sim.getItemSlots().find((slot) => slot.structureId === structureId);
}

type BuildOrder = 'top-down' | 'bottom-up';

/** Extractor on a resource tile with a straight belt line below it (one free tile left for a sink). */
function buildLine(sim: SimWorld, order: BuildOrder, beltId = MOCK_BELT.id): TileCoord[] {
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
function placeSinkBelow(sim: SimWorld, line: readonly TileCoord[]): void {
    sim.tick([placeCommand(MOCK_SINK.id, below(line.at(-1)!, 1))], []);
}

describe('Extraction and transfer (integration)', () => {
    beforeEach(() => {
        setupMockRegistry();
    });

    afterEach(() => {
        restoreMockRegistry();
    });

    it('an extractor on a resource produces one ready item and then waits while it is full', () => {
        const sim = createWorld();
        const source = findResourceTile(sim);

        run(sim, MOCK_EXTRACTOR.extraction!.ticksPerItem, [placeCommand(MOCK_EXTRACTOR.id, source)]);
        expect(slotAt(sim, source)).toMatchObject({ itemKey: 'hydrogen', ticksRemaining: 0 });

        run(sim, FILL_TICKS);
        expect(sim.getItemSlots()).toHaveLength(1);
    });

    it('an extractor cannot be placed on empty space', () => {
        const sim = createWorld();
        const events: Event[] = [];

        sim.tick([placeCommand(MOCK_EXTRACTOR.id, findEmptyTile(sim))], events);

        expect(findEvent(events, EventType.CommandRejected).reason).toBe(RejectReason.NoResource);
        expect(sim.getStructures()).toEqual([]);
    });

    it('items advance one belt per transitTicks', () => {
        const sim = createWorld();
        const [, ...belts] = buildLine(sim, 'top-down');
        const firstArrival = belts.map(() => -1);

        for (let tick = 0; tick < FILL_TICKS; tick++) {
            sim.tick([], []);
            belts.forEach((tile, index) => {
                if (firstArrival[index] === -1 && slotAt(sim, tile)) {
                    firstArrival[index] = sim.getTickIndex();
                }
            });
        }

        const transit = MOCK_BELT.transport!.transitTicks;
        expect(firstArrival[1]! - firstArrival[0]!).toBe(transit);
        expect(firstArrival[2]! - firstArrival[1]!).toBe(transit);
    });

    it('a blocked line fills up without gaps, whatever the build order', () => {
        const snapshotsFor = (order: BuildOrder): (ItemSlotSnapshot | undefined)[][] => {
            const sim = createWorld();
            const line = buildLine(sim, order);
            return Array.from({ length: FILL_TICKS }, () => {
                sim.tick([], []);
                return line
                    .map((tile) => slotAt(sim, tile))
                    .map((slot) => slot && { ...slot, structureId: 0 });
            });
        };

        const topDown = snapshotsFor('top-down');

        expect(snapshotsFor('bottom-up')).toEqual(topDown);
        expect(topDown.at(-1)!.every((slot) => slot?.ticksRemaining === 0)).toBe(true);
    });

    it('a sink takes every item, counts it and reports each delivery', () => {
        const sim = createWorld();
        placeSinkBelow(sim, buildLine(sim, 'top-down'));
        const events: Event[] = [];

        run(sim, FILL_TICKS, [], events);

        const deliveries = findEvents(events, EventType.Delivered);
        expect(deliveries.length).toBeGreaterThan(0);
        expect(sim.getDeliveredCount('hydrogen')).toBe(deliveries.length);
        expect(deliveries.at(-1)).toMatchObject({ itemKey: 'hydrogen', total: deliveries.length });
    });

    it.each<BuildOrder>(['top-down', 'bottom-up'])(
        'a saturated line delivers one item per transitTicks, without gaps (%s)',
        (order) => {
            const sim = createWorld();
            placeSinkBelow(sim, buildLine(sim, order, MOCK_SLOW_BELT.id));
            run(sim, FILL_TICKS);
            const before = sim.getDeliveredCount('hydrogen');

            run(sim, FILL_TICKS);

            const transit = MOCK_SLOW_BELT.transport!.transitTicks;
            expect(sim.getDeliveredCount('hydrogen') - before).toBe(FILL_TICKS / transit);
        },
    );

    it.each<[string, number, Rotation]>([
        ['the belt input faces away', MOCK_BELT.id, 2],
        ['the receiver refuses the item', MOCK_PICKY_BELT.id, 0],
    ])('no transfer when %s', (_, beltId, rotation) => {
        const sim = createWorld();
        const source = findResourceTile(sim, 1);

        run(sim, FILL_TICKS, [
            placeCommand(MOCK_EXTRACTOR.id, source),
            placeCommand(beltId, below(source, 1), rotation),
        ]);

        expect(slotAt(sim, source)).toBeDefined();
        expect(slotAt(sim, below(source, 1))).toBeUndefined();
    });

    it('removing a belt drops the item it carries', () => {
        const sim = createWorld();
        const line = buildLine(sim, 'top-down');
        run(sim, FILL_TICKS);
        const lastBelt = line.at(-1)!;
        const lastBeltId = sim.getStructureIdAt(lastBelt);
        expect(slotAt(sim, lastBelt)).toBeDefined();

        run(sim, 1, [removeCommand(lastBelt)]);

        expect(sim.getItemSlots().map((slot) => slot.structureId)).not.toContain(lastBeltId);
        expect(sim.getItemSlots()).toHaveLength(LINE_LENGTH);
    });
});
