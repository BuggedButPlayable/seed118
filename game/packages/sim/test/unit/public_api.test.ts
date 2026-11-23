import { describe, expect, it } from 'vitest';

import { CommandType, EventType, SimWorld } from '@seed118/sim';
import type { Event } from '@seed118/sim';

describe('@seed118/sim public API', () => {
    it('can run a tick through the package entry point', () => {
        const sim = new SimWorld();
        const events: Event[] = [];

        sim.tick([{ type: CommandType.SetFocusChunk, coord: { x: 0, y: 0 } }], events);

        expect(events.some((e) => e.type === EventType.TickAdvanced)).toBe(true);
    });
});
