import { generateNewChunk } from "../core/world_generator";
import { GridModel } from "../grid/grid_model";
import { loadSaveGameV1, saveSaveGameV1 } from "../save/save_v1";
import { StructureStore } from "../state/structure_store";
import { WorldState } from "../state/world_state";
import { CommandSystem } from "../systems/command_system";
import { ChunkCoord } from "../types";
import { Command } from "../types/commands";
import { EventType, Event } from "../types/events";
import { SaveGameV1 } from "../types/save_v1";

/**
 * Represents the simulation world, managing state, grid, and command processing.
 */
export class SimWorld {

    private gridModel: GridModel;
    private commandSystem: CommandSystem;
    private worldState: WorldState;

    constructor() {
        this.worldState = new WorldState();
        this.gridModel = new GridModel();
        this.commandSystem = new CommandSystem();

        this.gridModel.setChunkGenerationCallback((chunk, chunkCoord) => {
            generateNewChunk(chunkCoord, this.gridModel, this.worldState);
        });
        
        this.reset(this.worldState.worldSeed);
    }

    /**
     * Advances the simulation by one tick.
     * @param commands The list of commands to process during this tick.
     * @param outEvents The list to which events generated during this tick will be added.
     */
    public tick(commands: Command[], outEvents: Event[]): void {
        let currentTickOutEvents = outEvents;

        this.worldState.hasPendingFocusChunk = false;

        for (const command of commands) {
            this.commandSystem.tick(this.worldState, this.gridModel, [command], currentTickOutEvents);
        }

        this._applyPendingFocusChange(outEvents);
        this._ensureActiveChunksGenerated(outEvents);
        this._simulate(outEvents);

        this.worldState.tickIndex += 1;

        outEvents.push({
            type: EventType.TickAdvanced,
            tickIndex: this.worldState.tickIndex,
        });

        currentTickOutEvents = [];
    }

    /** 
     * Resets the simulation world to its initial state with the given seed.
     * @param wordSeed The seed to use for world generation.
     */
    public reset(wordSeed: number) {
        this.worldState.tickIndex = 0;
        this.worldState.worldSeed = wordSeed;
        this.worldState.generatedChunkCount = 0;

        this.worldState.hasFocusChunk = false;
        this.worldState.focusChunkCoord = null;

        this.gridModel = new GridModel();
        this.worldState.structureStore = new StructureStore();
        this.gridModel.setChunkGenerationCallback((chunk, chunkCoord) => {
            generateNewChunk(chunkCoord, this.gridModel, this.worldState);
        });
    }

    /**
     * Serializes the current state of the world into a format suitable for saving.
     * @returns The serialized state of the world.
     */
    public saveV1(): SaveGameV1 {
        return saveSaveGameV1(this.worldState, this.gridModel);
    }

    /**
     * Loads the world state from a saved state.
     * @param save The saved state to load.
     */
    public loadV1(save: SaveGameV1): void {
        const { state: worldState, grid: gridModel } = loadSaveGameV1(save);
        this.worldState = worldState;
        this.gridModel = gridModel;
        this.commandSystem = new CommandSystem();
        
        this.gridModel.setChunkGenerationCallback((chunk, chunkCoord) => {
            generateNewChunk(chunkCoord, this.gridModel, this.worldState);
        });
    }

    /**
     * Ensures that all active chunks are generated.
     * @param outEvents The list to which events generated during this process will be added.
     */
    private _applyPendingFocusChange(outEvents: Event[]): void {
        if (!this.worldState.hasPendingFocusChunk)
            return;

        var newFocusChunkCoord = this.worldState.pendingFocusChunkCoord;

        if (this.worldState.hasFocusChunk && newFocusChunkCoord == this.worldState.focusChunkCoord)
            return

        this.worldState.focusChunkCoord = newFocusChunkCoord;
        this.worldState.hasFocusChunk = true;
        outEvents.push({
            type: EventType.FocusChunkUpdated,
            chunkCoord: this.worldState.focusChunkCoord!,
        });
    }

    /**
     * Ensures that all chunks within the active radius of the focus chunk are generated.
     * @param outEvents The list to which events generated during this process will be added.
     */
    private _ensureActiveChunksGenerated(outEvents: Event[]): void {
        if (!this.worldState.hasFocusChunk)
            return;

        const minChunk: ChunkCoord = {
            x: this.worldState.focusChunkCoord!.x - this.worldState.activeRadiusChunks,
            y: this.worldState.focusChunkCoord!.y - this.worldState.activeRadiusChunks,
        };

        const maxChunk: ChunkCoord = {
            x: this.worldState.focusChunkCoord!.x + this.worldState.activeRadiusChunks,
            y: this.worldState.focusChunkCoord!.y + this.worldState.activeRadiusChunks,
        };

        for (let chunkY = minChunk.y; chunkY <= maxChunk.y; chunkY++) {
            for (let chunkX = minChunk.x; chunkX <= maxChunk.x; chunkX++) {
                const chunkCoord: ChunkCoord = { x: chunkX, y: chunkY };

                if (this.gridModel.hasChunk(chunkCoord)) {
                    continue;
                }

                this.gridModel.getOrCreateChunk(chunkCoord);
            }
        }
    }

    /** 
     * Simulates the behavior of all structures in the world for the current tick.
     * @param outEvents The list to which events generated during this process will be added.
     */
    private _simulate(outEvents: Event[]): void {
        var structureIds = this.worldState.structureStore.getAllStructures();
        structureIds.sort((a, b) => a.id - b.id);

        // Simulate each structure
        // CollectorSystem.tick(self, ids, out_events)
        // TransportSystem.tick(self, ids, out_events)
        // CoreSystem.tick(self, ids, out_events)
    }
}