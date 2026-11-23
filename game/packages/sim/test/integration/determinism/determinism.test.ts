import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SimWorld } from '../../../src/sim/sim_world';
import { restoreMockRegistry, setupMockRegistry } from '../../fixtures/mock_registry';
import { runPlacementScript, runTransportScript } from '../../fixtures/scripts';

const WORLD_SEED = 424242;
const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

/** FNV-1a: small, stable string hash for comparing world states. */
function fnv1a32(input: string): number {
    let hash = FNV_OFFSET_BASIS;
    for (let index = 0; index < input.length; index++) {
        hash ^= input.charCodeAt(index);
        hash = Math.imul(hash, FNV_PRIME);
    }
    return hash >>> 0;
}

/** Hash of the save: it holds every piece of state that cannot be regenerated from the seed. */
function hashWorld(sim: SimWorld): number {
    return fnv1a32(JSON.stringify(sim.saveV2()));
}

/** Structures plus items moving and being delivered. */
function createScriptedWorld(): SimWorld {
    const sim = new SimWorld();
    sim.reset(WORLD_SEED);
    runPlacementScript(sim);
    runTransportScript(sim);
    return sim;
}

describe('Determinism gate', () => {
    beforeEach(() => {
        setupMockRegistry();
    });

    afterEach(() => {
        restoreMockRegistry();
    });

    it('same seed + same command stream => same hash', () => {
        expect(hashWorld(createScriptedWorld())).toBe(hashWorld(createScriptedWorld()));
    });

    it('save -> load preserves the hash', () => {
        const original = createScriptedWorld();
        const reloaded = new SimWorld();

        reloaded.loadSave(original.saveV2());

        expect(hashWorld(reloaded)).toBe(hashWorld(original));
    });
});
