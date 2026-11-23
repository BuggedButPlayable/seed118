import { describe, expect, it } from 'vitest';

import { SimWorld } from '../../../src/sim/sim_world';
import { CommandType } from '../../../src/types/commands';
import type { Command } from '../../../src/types/commands';
import { EventType, RejectReason } from '../../../src/types/events';
import type { Event } from '../../../src/types/events';
import { findEvent } from '../../fixtures/find_event';

const focusOn = (x: number, y: number): Command => ({ type: CommandType.SetFocusChunk, coord: { x, y } });

describe('SimWorld', () => {
    it('emits FocusChunkUpdated only when the focus actually changes', () => {
        const sim = new SimWorld();

        const first: Event[] = [];
        sim.tick([focusOn(0, 0)], first);
        const second: Event[] = [];
        sim.tick([focusOn(0, 0)], second);
        const third: Event[] = [];
        sim.tick([focusOn(1, 0)], third);

        const count = (events: Event[]): number =>
            events.filter((e) => e.type === EventType.FocusChunkUpdated).length;
        expect(count(first)).toBe(1);
        expect(count(second)).toBe(0);
        expect(count(third)).toBe(1);
    });

    it('reports generated chunks as events of the current tick only', () => {
        const sim = new SimWorld();

        const first: Event[] = [];
        sim.tick([focusOn(0, 0)], first);
        const second: Event[] = [];
        sim.tick([], second);

        const radius = 2;
        const expectedChunks = (2 * radius + 1) ** 2;
        expect(first.filter((e) => e.type === EventType.ChunkGenerated)).toHaveLength(expectedChunks);
        expect(second.filter((e) => e.type === EventType.ChunkGenerated)).toHaveLength(0);
    });

    it('rejects a placement with an invalid rotation', () => {
        const sim = new SimWorld();
        const events: Event[] = [];
        const badCommand = {
            type: CommandType.PlaceStructure,
            definitionId: 2,
            coord: { x: 0, y: 0 },
            rotation: 7,
        } as unknown as Command;

        sim.tick([badCommand], events);

        expect(findEvent(events, EventType.CommandRejected).reason).toBe(RejectReason.InvalidPayload);
        expect(sim.getStructures()).toHaveLength(0);
    });

    it('rejects an unknown command type instead of throwing', () => {
        const sim = new SimWorld();
        const events: Event[] = [];
        const unknown = { type: 999 } as unknown as Command;

        expect(() => sim.tick([unknown], events)).not.toThrow();
        expect(findEvent(events, EventType.CommandRejected).reason).toBe(RejectReason.UnknownCommand);
    });

    it('advances the tick index and reports it', () => {
        const sim = new SimWorld();
        const events: Event[] = [];

        sim.tick([], events);

        expect(sim.getTickIndex()).toBe(1);
        expect(findEvent(events, EventType.TickAdvanced).tickIndex).toBe(1);
    });
});
