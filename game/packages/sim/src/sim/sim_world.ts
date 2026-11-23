import { generateNewChunk } from '../core/world_generator';
import { GridModel } from '../grid/grid_model';
import { isSameCoord } from '../grid/grid_math';
import { byId } from '../core/ordering';
import { loadSaveGameV1, saveSaveGameV1 } from '../save/save_v1';
import { WorldState } from '../state/world_state';
import { CommandSystem } from '../systems/command_system';
import type { ChunkCoord, TileCoord } from '../types';
import type { Command } from '../types/commands';
import { EventType } from '../types/events';
import type { Event } from '../types/events';
import type { SaveGameV1 } from '../types/save_v1';
import type { StructureRecord } from '../types/structure';

/**
 * Public entry point of the simulation. Owns all world state and advances it in fixed ticks.
 * Everything outside the sim package talks to the world only through this class.
 */
export class SimWorld {
    private worldState = new WorldState();
    private gridModel: GridModel;
    private readonly commandSystem = new CommandSystem();

    constructor() {
        this.gridModel = this.createGrid();
    }

    /**
     * Advances the simulation by one tick.
     * @param commands Commands to apply this tick, in enqueue order.
     * @param outEvents Receives every event produced during this tick.
     */
    public tick(commands: readonly Command[], outEvents: Event[]): void {
        this.worldState.currentTickOutEvents = outEvents;
        this.worldState.pendingFocusChunkCoord = null;

        this.commandSystem.tick(this.worldState, this.gridModel, commands, outEvents);
        this.applyPendingFocusChange(outEvents);
        this.ensureActiveChunksGenerated();

        this.worldState.tickIndex += 1;
        outEvents.push({ type: EventType.TickAdvanced, tickIndex: this.worldState.tickIndex });

        this.worldState.currentTickOutEvents = null;
    }

    /** Resets the world to an empty state generated from the given seed. */
    public reset(worldSeed: number): void {
        this.worldState = new WorldState();
        this.worldState.worldSeed = worldSeed;
        this.gridModel = this.createGrid();
    }

    /** Serializes everything that cannot be regenerated from the seed. */
    public saveV1(): SaveGameV1 {
        return saveSaveGameV1(this.worldState, this.gridModel);
    }

    /** Replaces the current world with a saved one. */
    public loadV1(save: SaveGameV1): void {
        const { state, grid } = loadSaveGameV1(save);
        this.worldState = state;
        this.gridModel = grid;
        this.attachChunkGenerator(this.gridModel);
    }

    // Snapshot getters (read-only access for view and tests, architecture §11)

    public getWorldSeed(): number {
        return this.worldState.worldSeed;
    }

    public getTickIndex(): number {
        return this.worldState.tickIndex;
    }

    /** All structures, sorted by id. */
    public getStructures(): readonly Readonly<StructureRecord>[] {
        return this.worldState.structureStore.getAllStructures().sort(byId);
    }

    public getStructureIdAt(tile: TileCoord): number {
        return this.gridModel.getStructureIdAt(tile);
    }

    public getResourceIdAt(tile: TileCoord): number {
        return this.gridModel.getResourceIdAt(tile);
    }

    private createGrid(): GridModel {
        const grid = new GridModel();
        this.attachChunkGenerator(grid);
        return grid;
    }

    private attachChunkGenerator(grid: GridModel): void {
        grid.setChunkGenerationCallback((_chunk, chunkCoord) => {
            generateNewChunk(chunkCoord, grid, this.worldState);
        });
    }

    private applyPendingFocusChange(outEvents: Event[]): void {
        const next = this.worldState.pendingFocusChunkCoord;
        const current = this.worldState.focusChunkCoord;

        if (next === null || (current !== null && isSameCoord(next, current))) {
            return;
        }

        this.worldState.focusChunkCoord = next;
        outEvents.push({ type: EventType.FocusChunkUpdated, chunkCoord: next });
    }

    /** Generates every chunk within the active radius around the focus chunk. */
    private ensureActiveChunksGenerated(): void {
        const focus = this.worldState.focusChunkCoord;
        if (focus === null) {
            return;
        }

        const radius = this.worldState.activeRadiusChunks;
        for (let y = focus.y - radius; y <= focus.y + radius; y++) {
            for (let x = focus.x - radius; x <= focus.x + radius; x++) {
                const chunkCoord: ChunkCoord = { x, y };
                this.gridModel.getOrCreateChunk(chunkCoord);
            }
        }
    }
}
