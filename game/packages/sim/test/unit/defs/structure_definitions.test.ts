import { describe, expect, it } from 'vitest';

import { ITEM_DEFINITIONS } from '../../../src/defs/item_registry';
import { RESOURCE_DEFINITIONS } from '../../../src/defs/resource_registry';
import { STRUCTURE_DEFINITIONS } from '../../../src/defs/structure_registry';
import { neighbourAcross } from '../../../src/grid/grid_math';

const EACH_STRUCTURE = STRUCTURE_DEFINITIONS.map((def) => [def.key, def] as const);
const ITEM_KEYS = ITEM_DEFINITIONS.map((item) => item.key);

describe('structure definitions', () => {
    it.each(EACH_STRUCTURE)('%s has no duplicate ports', (_key, def) => {
        const keys = def.ports.map((port) => `${port.tile.x},${port.tile.y},${port.side}`);
        expect(new Set(keys).size).toBe(keys.length);
    });

    it.each(EACH_STRUCTURE)('%s only has ports on outer edges of its footprint', (_key, def) => {
        const occupied = new Set(def.footprint.map((tile) => `${tile.x},${tile.y}`));
        for (const port of def.ports) {
            const outside = neighbourAcross(port.tile, port.side);
            expect(occupied.has(`${outside.x},${outside.y}`)).toBe(false);
        }
    });

    it.each(EACH_STRUCTURE)('%s uses whole, positive tick counts', (_key, def) => {
        for (const ticks of [def.transport?.transitTicks, def.extraction?.ticksPerItem]) {
            if (ticks !== undefined) {
                expect(Number.isInteger(ticks) && ticks >= 1).toBe(true);
            }
        }
    });

    it.each(EACH_STRUCTURE)('%s only filters for known items', (_key, def) => {
        const filtered = def.ports.flatMap((port) => port.accepts ?? []);
        expect(filtered.filter((key) => !ITEM_KEYS.includes(key))).toEqual([]);
    });

    it('every resource yields a known item', () => {
        expect(RESOURCE_DEFINITIONS.filter((resource) => !ITEM_KEYS.includes(resource.itemKey))).toEqual([]);
    });

    it('uses unique ids and keys', () => {
        expect(new Set(STRUCTURE_DEFINITIONS.map((definition) => definition.id)).size).toBe(
            STRUCTURE_DEFINITIONS.length,
        );
        expect(new Set(STRUCTURE_DEFINITIONS.map((definition) => definition.key)).size).toBe(
            STRUCTURE_DEFINITIONS.length,
        );
    });
});
