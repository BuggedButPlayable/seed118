import { describe, expect, it } from 'vitest';

import { generateResourceId } from '../../../src/core/cluster_generator';
import { HYDROGEN_DEFINITION } from '../../../src/defs/resource_def/hydrogen_def';

const REGION_SIZE = 64;

/** Encodes which tiles of a region carry hydrogen, as a compact fingerprint. */
function fingerprintRegion(worldSeed: number): string {
    let hydrogenTiles = 0;
    let checksum = 0;
    for (let tileY = -REGION_SIZE / 2; tileY < REGION_SIZE / 2; tileY++) {
        for (let tileX = -REGION_SIZE / 2; tileX < REGION_SIZE / 2; tileX++) {
            const resourceId = generateResourceId({ x: tileX, y: tileY }, worldSeed, HYDROGEN_DEFINITION);
            hydrogenTiles += resourceId === HYDROGEN_DEFINITION.id ? 1 : 0;
            checksum = (Math.imul(checksum, 31) + resourceId * (tileX * 7 + tileY * 13)) >>> 0;
        }
    }
    return `${hydrogenTiles}:${checksum}`;
}

// Golden values: if this test fails, world generation changed and every existing world looks different.
// Update the values only on purpose, together with a note in the changelog.
describe('world generation golden values', () => {
    it('produces the same hydrogen layout for seed 118', () => {
        expect(fingerprintRegion(118)).toBe('83:3880099247');
    });

    it('produces the same hydrogen layout for seed 424242', () => {
        expect(fingerprintRegion(424242)).toBe('50:2891090648');
    });
});
