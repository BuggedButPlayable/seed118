import { describe, expect, it } from 'vitest';

import { STRUCTURE_DEFINITIONS } from '../../../src/defs/structure_registry';

describe('structure definitions', () => {
    it.each(STRUCTURE_DEFINITIONS.map((def) => [def.key, def] as const))(
        '%s has no duplicate ports',
        (_key, def) => {
            const keys = def.ports.map((port) => `${port.tile.x},${port.tile.y},${port.side}`);
            expect(new Set(keys).size).toBe(keys.length);
        },
    );

    it.each(STRUCTURE_DEFINITIONS.map((def) => [def.key, def] as const))(
        '%s only has ports on outer edges of its footprint',
        (_key, def) => {
            const occupied = new Set(def.footprint.map((tile) => `${tile.x},${tile.y}`));
            const neighbour = [
                { x: 0, y: -1 },
                { x: 1, y: 0 },
                { x: 0, y: 1 },
                { x: -1, y: 0 },
            ] as const;
            for (const port of def.ports) {
                const step = neighbour[port.side];
                const outside = `${port.tile.x + step.x},${port.tile.y + step.y}`;
                expect(occupied.has(outside)).toBe(false);
            }
        },
    );

    it('uses unique ids and keys', () => {
        expect(new Set(STRUCTURE_DEFINITIONS.map((definition) => definition.id)).size).toBe(
            STRUCTURE_DEFINITIONS.length,
        );
        expect(new Set(STRUCTURE_DEFINITIONS.map((definition) => definition.key)).size).toBe(
            STRUCTURE_DEFINITIONS.length,
        );
    });
});
