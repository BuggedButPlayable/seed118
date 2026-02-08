import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { SimWorld } from "../../../src/sim/sim_world";
import { CommandType } from "../../../src/types/commands";
import { MOCK_MULTITILE, MOCK_SIMPLE_STRUCTURE } from "../../fixtures/mock_structures";
import { restoreMockRegistry, setupMockRegistry } from "../../fixtures/mock_registry";

describe("Determinism gate (test-only hash)", () => {
    beforeEach(() => {
        setupMockRegistry();
    });

    afterEach(() => {
        restoreMockRegistry();
    });

    const fnv1a32 = (input: string): number => {
        let hash = 0x811c9dc5;
        for (let i = 0; i < input.length; i++) {
            hash ^= input.charCodeAt(i);
            hash = Math.imul(hash, 0x01000193);
        }
        return hash >>> 0;
    };

    const getTestDeterminismHash = (sim: any): number => {
        const worldState = sim.worldState;

        const seed =
            worldState.worldSeed ??
            worldState.seed ??
            worldState.rngSeed ??
            0;

        const tick =
            worldState.tick ??
            worldState.tickIndex ??
            worldState.currentTick ??
            0;

        const structures = worldState.structureStore
            .getAllStructures()
            .map((s: any) => ({
                id: s.id,
                definitionId: s.definitionId,
                x: s.position?.x ?? s.x,
                y: s.position?.y ?? s.y,
                rotation: s.rotation ?? 0,
            }))
            .sort((a: any, b: any) => {
                if (a.id < b.id) return -1;
                if (a.id > b.id) return 1;
                return 0;
            });

        const payload = { seed, tick, structures };
        return fnv1a32(JSON.stringify(payload));
    };

    const runScript = (sim: SimWorld) => {
        const events: any[] = [];
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
    };

    it("same seed + same command stream => same hash", () => {
        const seed = 424242;

        const a = new SimWorld();
        a.reset(seed);
        runScript(a);

        const b = new SimWorld();
        b.reset(seed);
        runScript(b);

        const hashA = getTestDeterminismHash(a as any);
        const hashB = getTestDeterminismHash(b as any);

        expect(hashA).toBe(hashB);
    });

    it("save -> load preserves hash", () => {
        const seed = 424242;

        const a = new SimWorld();
        a.reset(seed);
        runScript(a);

        const save = a.saveV1();

        const b = new SimWorld();
        b.loadV1(save);

        const hashA = getTestDeterminismHash(a as any);
        const hashB = getTestDeterminismHash(b as any);

        expect(hashB).toBe(hashA);
    });
});