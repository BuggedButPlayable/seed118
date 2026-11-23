import { placeCommand, removeCommand, focusCommand } from '../../fixtures/commands';
import { findEvent } from '../../fixtures/find_event';
import type { Event } from '../../../src/types/events';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { byCoord } from '../../../src/core/ordering';
import { CommandSystem } from '../../../src/systems/command_system';
import type { ChunkCoord } from '../../../src/types/coords';
import { GridModel } from '../../../src/grid/grid_model';
import { WorldState } from '../../../src/state/world_state';

import { EventType, RejectReason } from '../../../src/types/events';

import {
    MOCK_SIMPLE_STRUCTURE,
    MOCK_NOT_PLACEABLE,
    MOCK_MULTITILE,
    MOCK_NOT_DELETABLE,
} from '../../fixtures/mock_structures';
import { setupMockRegistry, restoreMockRegistry } from '../../fixtures/mock_registry';

function sortChunkCoords(coords: ChunkCoord[]): ChunkCoord[] {
    return [...coords].sort(byCoord);
}

describe('CommandSystem (integration)', () => {
    beforeEach(() => {
        setupMockRegistry();
    });

    afterEach(() => {
        restoreMockRegistry();
    });

    it('Should reject PlaceStructure when definition is not placeable', () => {
        const state = new WorldState();
        const grid = new GridModel();
        const sys = new CommandSystem();
        const events: Event[] = [];

        sys.applyCommand(state, grid, placeCommand(MOCK_NOT_PLACEABLE.id, { x: 0, y: 0 }), events);

        const rejected = findEvent(events, EventType.CommandRejected);
        expect(rejected).toBeTruthy();
        expect(rejected.reason).toBe(RejectReason.NotPlaceable);
    });

    it('Should reject RemoveStructure when structure is not deletable', () => {
        const state = new WorldState();
        const grid = new GridModel();
        const sys = new CommandSystem();

        const placeEvents: Event[] = [];
        sys.applyCommand(state, grid, placeCommand(MOCK_NOT_DELETABLE.id, { x: 0, y: 0 }), placeEvents);

        const placed = findEvent(placeEvents, EventType.StructurePlaced);
        expect(placed).toBeTruthy();

        const removeEvents: Event[] = [];
        sys.applyCommand(state, grid, removeCommand({ x: 0, y: 0 }), removeEvents);

        const rejected = findEvent(removeEvents, EventType.CommandRejected);
        expect(rejected).toBeTruthy();
        expect(rejected.reason).toBe(RejectReason.NotRemovable);
    });

    it('Should placeStructure place footprint, create record, and emit StructurePlaced', () => {
        const state = new WorldState();
        const grid = new GridModel();
        const sys = new CommandSystem();
        const events: Event[] = [];

        sys.applyCommand(state, grid, placeCommand(MOCK_SIMPLE_STRUCTURE.id, { x: 0, y: 0 }), events);

        const placed = findEvent(events, EventType.StructurePlaced);
        expect(placed).toBeTruthy();
        expect(placed.structureKey).toBe('test-simple');

        const placedId = placed.structureId;
        expect(grid.getStructureIdAt({ x: 0, y: 0 })).toBe(placedId);
        expect(state.structureStore.getStructureById(placedId)).not.toBeNull();
    });

    it('Should reject PlaceStructure when footprint is occupied', () => {
        const state = new WorldState();
        const grid = new GridModel();
        const sys = new CommandSystem();

        const events1: Event[] = [];
        sys.applyCommand(state, grid, placeCommand(MOCK_SIMPLE_STRUCTURE.id, { x: 1, y: 1 }), events1);

        const events2: Event[] = [];
        sys.applyCommand(state, grid, placeCommand(MOCK_SIMPLE_STRUCTURE.id, { x: 1, y: 1 }), events2);

        const rejected = findEvent(events2, EventType.CommandRejected);
        expect(rejected).toBeTruthy();
        expect(rejected.reason).toBe(RejectReason.Occupied);
    });

    it('Should reject RemoveStructure when selected tile is empty', () => {
        const state = new WorldState();
        const grid = new GridModel();
        const sys = new CommandSystem();
        const events: Event[] = [];

        sys.applyCommand(state, grid, removeCommand({ x: 0, y: 0 }), events);

        const rejected = findEvent(events, EventType.CommandRejected);
        expect(rejected).toBeTruthy();
        expect(rejected.reason).toBe(RejectReason.Empty);
    });

    it('Should emit StructureRemoved with the correct structureKey', () => {
        const state = new WorldState();
        const grid = new GridModel();
        const sys = new CommandSystem();

        const placeEvents: Event[] = [];
        sys.applyCommand(state, grid, placeCommand(MOCK_SIMPLE_STRUCTURE.id, { x: 2, y: 2 }), placeEvents);

        const placed = findEvent(placeEvents, EventType.StructurePlaced);
        expect(placed).toBeTruthy();

        const removeEvents: Event[] = [];
        sys.applyCommand(state, grid, removeCommand({ x: 2, y: 2 }), removeEvents);

        const removed = findEvent(removeEvents, EventType.StructureRemoved);
        expect(removed).toBeTruthy();

        expect(removed.structureKey).toBe('test-simple');
    });

    it('Should mark all affected chunks persistent (multi-tile footprint across chunk boundary) when placing a structure', () => {
        const state = new WorldState();
        const grid = new GridModel();
        const sys = new CommandSystem();

        const anchor = { x: 15, y: 0 };

        const events: Event[] = [];
        sys.applyCommand(state, grid, placeCommand(MOCK_MULTITILE.id, anchor), events);

        const placed = findEvent(events, EventType.StructurePlaced);
        expect(placed).toBeTruthy();

        const expectedChunks = sortChunkCoords([
            { x: 0, y: 0 },
            { x: 1, y: 0 },
        ]);

        expect(sortChunkCoords(grid.getAllPersistentChunks())).toEqual(expectedChunks);
    });

    it('Should set pending focus state when SetFocusChunk is called', () => {
        const state = new WorldState();
        const grid = new GridModel();
        const sys = new CommandSystem();
        const events: Event[] = [];

        sys.applyCommand(state, grid, focusCommand({ x: 5, y: -3 }), events);

        expect(state.pendingFocusChunkCoord).toEqual({ x: 5, y: -3 });
    });
});
