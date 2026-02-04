import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { CommandSystem } from "../../../src/systems/command_system";
import { GridModel } from "../../../src/grid/grid_model";
import { WorldState } from "../../../src/state/world_state";

import { CommandType } from "../../../src/types/commands";
import { EventType, RejectReason } from "../../../src/types/events";
import { StructureDefinition } from "../../../src/types/structure";
import * as structureRegistry from "../../../src/defs/structure_registry";

const MOCK_SIMPLE_STRUCTURE: StructureDefinition = {
    id: "test-simple" as any,
    key: "test-simple",
    footprint: [{ x: 0, y: 0 }],
    ports: [],
    deletable: true,
    placeable: true,
    rotatable: true,
};

const MOCK_NOT_PLACEABLE: StructureDefinition = {
    id: "test-not-placeable" as any,
    key: "test-not-placeable",
    footprint: [{ x: 0, y: 0 }],
    ports: [],
    deletable: true,
    placeable: false,
    rotatable: true,
};

const MOCK_NOT_DELETABLE: StructureDefinition = {
    id: "test-not-deletable" as any,
    key: "test-not-deletable",
    footprint: [{ x: 0, y: 0 }],
    ports: [],
    deletable: false,
    placeable: true,
    rotatable: true,
};

const MOCK_NOT_ROTATABLE: StructureDefinition = {
    id: "test-not-rotatable" as any,
    key: "test-not-rotatable",
    footprint: [{ x: 0, y: 0 }],
    ports: [],
    deletable: true,
    placeable: true,
    rotatable: false,
};

const MOCK_MULTITILE: StructureDefinition = {
    id: "test-multitile" as any,
    key: "test-multitile",
    footprint: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
    ],
    ports: [],
    deletable: true,
    placeable: true,
    rotatable: true,
};

function sortChunkCoords(coords: { x: number; y: number }[]): { x: number; y: number }[] {
    return [...coords].sort((a, b) => (a.y - b.y) || (a.x - b.x));
}

describe("CommandSystem (integration)", () => {
    beforeEach(() => {
        vi.spyOn(structureRegistry, "getStructureDefinitionById").mockImplementation((id) => {
            const allMocks = [
                MOCK_SIMPLE_STRUCTURE,
                MOCK_NOT_PLACEABLE,
                MOCK_NOT_DELETABLE,
                MOCK_NOT_ROTATABLE,
                MOCK_MULTITILE,
            ];
            const found = allMocks.find((def) => def.id === id);
            if (!found) {
                throw new Error(`No structure definition found for id: ${id}`);
            }
            return found;
        });

        vi.spyOn(structureRegistry, "getStructureDefinitionByKey").mockImplementation((key) => {
            const allMocks = [
                MOCK_SIMPLE_STRUCTURE,
                MOCK_NOT_PLACEABLE,
                MOCK_NOT_DELETABLE,
                MOCK_NOT_ROTATABLE,
                MOCK_MULTITILE,
            ];
            const found = allMocks.find((def) => def.key === key);
            if (!found) {
                throw new Error(`No structure definition found for key: ${key}`);
            }
            return found;
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Should reject PlaceStructure when definition is not placeable", () => {
        const state = new WorldState();
        const grid = new GridModel();
        const sys = new CommandSystem();
        const events: any[] = [];

        sys.applyCommand(
            state,
            grid,
            { type: CommandType.PlaceStructure, definitionId: MOCK_NOT_PLACEABLE.id, coord: { x: 0, y: 0 }, rotation: 0 },
            events
        );

        const rejected = events.find((e) => e.type === EventType.CommandRejected);
        expect(rejected).toBeTruthy();
        expect(rejected.reason).toBe(RejectReason.NotPlaceable);
    });

    it("Should reject RemoveStructure when structure is not deletable", () => {
        const state = new WorldState();
        const grid = new GridModel();
        const sys = new CommandSystem();

        const placeEvents: any[] = [];
        sys.applyCommand(
            state,
            grid,
            { type: CommandType.PlaceStructure, definitionId: MOCK_NOT_DELETABLE.id, coord: { x: 0, y: 0 }, rotation: 0 },
            placeEvents
        );

        const placed = placeEvents.find((e) => e.type === EventType.StructurePlaced);
        expect(placed).toBeTruthy();

        const removeEvents: any[] = [];
        sys.applyCommand(state, grid, { type: CommandType.RemoveStructure, coord: { x: 0, y: 0 } }, removeEvents);

        const rejected = removeEvents.find((e) => e.type === EventType.CommandRejected);
        expect(rejected).toBeTruthy();
        expect(rejected.reason).toBe(RejectReason.NotRemovable);
    });

    it("Should placeStructure place footprint, create record, and emit StructurePlaced", () => {
        const state = new WorldState();
        const grid = new GridModel();
        const sys = new CommandSystem();
        const events: any[] = [];

        sys.applyCommand(
            state,
            grid,
            {
                type: CommandType.PlaceStructure,
                definitionId: MOCK_SIMPLE_STRUCTURE.id,
                coord: { x: 0, y: 0 },
                rotation: 0,
            },
            events
        );

        const placed = events.find((e) => e.type === EventType.StructurePlaced);
        expect(placed).toBeTruthy();
        expect(placed.structureKey).toBe("test-simple");

        const placedId = placed.structureId as number;
        expect(grid.getStructureIdAt({ x: 0, y: 0 })).toBe(placedId);
        expect(state.structureStore.getStructureById(placedId)).not.toBeNull();
    });

    it("Should reject PlaceStructure when footprint is occupied", () => {
        const state = new WorldState();
        const grid = new GridModel();
        const sys = new CommandSystem();

        const events1: any[] = [];
        sys.applyCommand(
            state,
            grid,
            { type: CommandType.PlaceStructure, definitionId: MOCK_SIMPLE_STRUCTURE.id, coord: { x: 1, y: 1 }, rotation: 0 },
            events1
        );

        const events2: any[] = [];
        sys.applyCommand(
            state,
            grid,
            { type: CommandType.PlaceStructure, definitionId: MOCK_SIMPLE_STRUCTURE.id, coord: { x: 1, y: 1 }, rotation: 0 },
            events2
        );

        const rejected = events2.find((e) => e.type === EventType.CommandRejected);
        expect(rejected).toBeTruthy();
        expect(rejected.reason).toBe(RejectReason.Occupied);
    });

    it("Should reject RemoveStructure when selected tile is empty", () => {
        const state = new WorldState();
        const grid = new GridModel();
        const sys = new CommandSystem();
        const events: any[] = [];

        sys.applyCommand(state, grid, { type: CommandType.RemoveStructure, coord: { x: 0, y: 0 } }, events);

        const rejected = events.find((e) => e.type === EventType.CommandRejected);
        expect(rejected).toBeTruthy();
        expect(rejected.reason).toBe(RejectReason.Empty);
    });

    it("Should emit StructureRemoved with the correct structureKey", () => {
        const state = new WorldState();
        const grid = new GridModel();
        const sys = new CommandSystem();

        const placeEvents: any[] = [];
        sys.applyCommand(
            state,
            grid,
            { type: CommandType.PlaceStructure, definitionId: MOCK_SIMPLE_STRUCTURE.id, coord: { x: 2, y: 2 }, rotation: 0 },
            placeEvents
        );

        const placed = placeEvents.find((e) => e.type === EventType.StructurePlaced);
        expect(placed).toBeTruthy();

        const removeEvents: any[] = [];
        sys.applyCommand(state, grid, { type: CommandType.RemoveStructure, coord: { x: 2, y: 2 } }, removeEvents);

        const removed = removeEvents.find((e) => e.type === EventType.StructureRemoved);
        expect(removed).toBeTruthy();

        expect(removed.structureKey).toBe("test-simple");
    });

    it("Should mark all affected chunks persistent (multi-tile footprint across chunk boundary) when placing a structure", () => {
        const state = new WorldState();
        const grid = new GridModel();
        const sys = new CommandSystem();

        const anchor = { x: 15, y: 0 };

        const events: any[] = [];
        sys.applyCommand(
            state,
            grid,
            { type: CommandType.PlaceStructure, definitionId: MOCK_MULTITILE.id, coord: anchor, rotation: 0 },
            events
        );

        const placed = events.find((e) => e.type === EventType.StructurePlaced);
        expect(placed).toBeTruthy();

        const expectedChunks = sortChunkCoords([
            { x: 15, y: 0 },
            { x: 16, y: 0 },
            { x: 15, y: 1 },
            { x: 16, y: 1 },
        ]);

        const dedup: { x: number; y: number }[] = [];
        for (const c of expectedChunks) {
            if (!dedup.some((d) => d.x === c.x && d.y === c.y)) dedup.push(c);
        }

        expect(sortChunkCoords(grid.getAllPersistentChunks())).toEqual(sortChunkCoords(dedup));
    });

    it("Should set pending focus state when SetFocusChunk is called", () => {
        const state = new WorldState();
        const grid = new GridModel();
        const sys = new CommandSystem();
        const events: any[] = [];

        sys.applyCommand(state, grid, { type: CommandType.SetFocusChunk, coord: { x: 5, y: -3 } }, events);

        expect(state.hasPendingFocusChunk).toBe(true);
        expect(state.pendingFocusChunkCoord).toEqual({ x: 5, y: -3 });
    });

});