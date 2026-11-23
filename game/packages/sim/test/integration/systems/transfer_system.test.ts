import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { SimWorld } from '../../../src/sim/sim_world';
import type { Command } from '../../../src/types/commands';
import type { Rotation, TileCoord } from '../../../src/types/coords';
import type { ItemSlotSnapshot } from '../../../src/types/item';
import { placeCommand, removeCommand } from '../../fixtures/commands';
import { restoreMockRegistry, setupMockRegistry } from '../../fixtures/mock_registry';
import { MOCK_BELT, MOCK_EXTRACTOR, MOCK_PICKY_BELT } from '../../fixtures/mock_structures';
import { findEmptyTile, findResourceTile } from '../../fixtures/resource_tiles';
import { createFocusedWorld } from '../../fixtures/scripts';

const WORLD_SEED = 118;
const LINE_LENGTH = 3;
/** Long enough to fill the whole line (extractor + belts) several times over. */
const FILL_TICKS = 60;

const createWorld = (): SimWorld => createFocusedWorld(WORLD_SEED);

function run(sim: SimWorld, ticks: number, commands: Command[] = []): void {
    sim.tick(commands, []);
    for (let tick = 1; tick < ticks; tick++) {
        sim.tick([], []);
    }
}

const below = (tile: TileCoord, steps: number): TileCoord => ({ x: tile.x, y: tile.y + steps });

function slotAt(sim: SimWorld, tile: TileCoord): ItemSlotSnapshot | undefined {
    const structureId = sim.getStructureIdAt(tile);
    return sim.getItemSlots().find((slot) => slot.structureId === structureId);
}

/** Extractor on a resource tile with a straight belt line below it. */
function buildLine(sim: SimWorld, beltOrder: 'top-down' | 'bottom-up'): TileCoord[] {
    const source = findResourceTile(sim, LINE_LENGTH);
    const belts = Array.from({ length: LINE_LENGTH }, (_, index) => below(source, index + 1));
    const ordered = beltOrder === 'top-down' ? belts : [...belts].reverse();
    sim.tick(
        [placeCommand(MOCK_EXTRACTOR.id, source), ...ordered.map((tile) => placeCommand(MOCK_BELT.id, tile))],
        [],
    );
    return [source, ...belts];
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

    it('an extractor on empty space produces nothing', () => {
        const sim = createWorld();

        run(sim, FILL_TICKS, [placeCommand(MOCK_EXTRACTOR.id, findEmptyTile(sim))]);

        expect(sim.getItemSlots()).toEqual([]);
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
        const snapshotsFor = (order: 'top-down' | 'bottom-up'): (ItemSlotSnapshot | undefined)[][] => {
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
