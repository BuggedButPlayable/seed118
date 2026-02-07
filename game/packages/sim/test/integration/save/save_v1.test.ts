import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { SimWorld } from "../../../src/sim/sim_world";
import { CommandType } from "../../../src/types/commands";
import { MOCK_MULTITILE, MOCK_SIMPLE_STRUCTURE } from "../../fixtures/mock_structures";
import { setupMockRegistry, restoreMockRegistry } from "../../fixtures/mock_registry";


describe("SaveGameV1 (integration)", () => {
    beforeEach(() => {
        setupMockRegistry();
    });

    afterEach(() => {
        restoreMockRegistry();
    });


    it("save -> load -> save roundtrip should be stable ", () => {
        const sim = new SimWorld();
        const wordSeed = 12345;
        sim.reset(wordSeed);

        const events: any[] = [];
        sim.tick([{ type: CommandType.SetFocusChunk, coord: { x: 0, y: 0 } }], events);
        sim.tick([{ type: CommandType.PlaceStructure, definitionId: MOCK_SIMPLE_STRUCTURE.id, coord: { x: 10, y: 10 }, rotation: 0 }], events);
        sim.tick([{ type: CommandType.PlaceStructure, definitionId: MOCK_MULTITILE.id, coord: { x: 13, y: 10 }, rotation: 0 }], events);

        const save1 = sim.saveV1();

        const sim2 = new SimWorld();
        sim2.loadV1(save1);

        const save2 = sim2.saveV1();

        expect(save2).toEqual(save1);
    });
});