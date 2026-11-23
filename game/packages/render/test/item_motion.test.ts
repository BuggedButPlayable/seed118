import { computeWorldPorts, getStructureDefinitionByKey } from '@seed118/sim';
import { describe, expect, it } from 'vitest';

import { crossingProgress, itemPosition } from '../src/item_motion';

const BELT = getStructureDefinitionByKey('belt');

describe('item motion', () => {
    it('crossingProgress runs from 0 on entry to 1 at the exit and glides between ticks', () => {
        expect(crossingProgress(10, 10, 0)).toBe(0);
        expect(crossingProgress(5, 10, 0.5)).toBeCloseTo(0.55);
        expect(crossingProgress(0, 10, 0.9)).toBe(1);
    });

    it('itemPosition moves from the input edge to the output edge of a rotated belt', () => {
        // Rotation 1: input on the east edge, output on the west edge
        const ports = computeWorldPorts({ x: 4, y: 2 }, 1, BELT.ports);

        expect(itemPosition(ports, 0)).toEqual({ x: 5, y: 2.5 });
        expect(itemPosition(ports, 1)).toEqual({ x: 4, y: 2.5 });
        expect(itemPosition(ports, 0.5)).toEqual({ x: 4.5, y: 2.5 });
    });

    it('itemPosition has no answer for a holder without an input and an output', () => {
        expect(itemPosition([], 0.5)).toBeNull();
    });
});
