import { createWorldGrid } from '../core/world_generator';
import { isSameCoord } from '../grid/grid_math';
import { byId } from '../core/ordering';
import { parseSave } from '../save/parse_save';
import { loadSaveV2, writeSaveV2 } from '../save/save_v2';
import type { SaveGameV2 } from '../save/save_v2';
import { WorldState } from '../state/world_state';
import { CommandSystem } from '../systems/command_system';
import { ExtractionSystem } from '../systems/extraction_system';
import { TransferSystem } from '../systems/transfer_system';
import { TransportSystem } from '../systems/transport_system';
import { getItemDefinitionById, getItemDefinitionByKey } from '../defs/item_registry';
import { getStructureDefinitionByKey } from '../defs/structure_registry';
import { WORLD_START_STRUCTURES } from '../defs/world_start_def';
import { checkPlacement } from '../systems/placement_rules';
import type { PlacementRejection, PlacementRequest } from '../systems/placement_rules';
import type { ChunkCoord, TileCoord } from '../types';
import { CommandType } from '../types/commands';
import type { Command } from '../types/commands';
import { EventType } from '../types/events';
import type { Event } from '../types/events';
import type { ItemKey, ItemSlotSnapshot } from '../types/item';
import type { StructureRecord } from '../types/structure';

/**
 * Public entry point of the simulation. Owns all world state and advances it in fixed ticks.
 * Everything outside the sim package talks to the world only through this class.
 */
export class SimWorld {
    private worldState = new WorldState();
    private gridModel = createWorldGrid(this.worldState);
    private readonly commandSystem = new CommandSystem();
    private readonly extractionSystem = new ExtractionSystem();
    private readonly transportSystem = new TransportSystem();
    private readonly transferSystem = new TransferSystem();

    /**
     * Advances the simulation by one tick. Fixed system order:
     * commands → focus → chunk generation → extraction → transport → transfer.
     * @param commands Commands to apply this tick, in enqueue order.
     * @param outEvents Receives every event produced during this tick.
     */
    public tick(commands: readonly Command[], outEvents: Event[]): void {
        this.worldState.currentTickOutEvents = outEvents;
        this.worldState.pendingFocusChunkCoord = null;

        this.commandSystem.tick(this.worldState, this.gridModel, commands, outEvents);
        this.applyPendingFocusChange(outEvents);
        this.ensureActiveChunksGenerated();
        this.extractionSystem.tick(this.worldState, this.gridModel);
        this.transportSystem.tick(this.worldState);
        this.transferSystem.tick(this.worldState, this.gridModel, outEvents);

        this.worldState.tickIndex += 1;
        outEvents.push({ type: EventType.TickAdvanced, tickIndex: this.worldState.tickIndex });

        this.worldState.currentTickOutEvents = null;
    }

    /** Resets the world to an empty state generated from the given seed. */
    public reset(worldSeed: number): void {
        this.worldState = new WorldState();
        this.worldState.worldSeed = worldSeed;
        this.gridModel = createWorldGrid(this.worldState);
    }

    /**
     * Resets the world and places what every new world starts with (the cold Core at the origin).
     * @throws If a start structure cannot be placed: the start definition is broken.
     */
    public startNewWorld(worldSeed: number): void {
        this.reset(worldSeed);
        for (const start of WORLD_START_STRUCTURES) {
            const command: Command = {
                type: CommandType.PlaceStructure,
                definitionId: getStructureDefinitionByKey(start.key).id,
                coord: start.coord,
                rotation: start.rotation,
            };
            const rejection = checkPlacement(this.gridModel, command);
            if (rejection) {
                throw new Error(`Start structure "${start.key}" cannot be placed: ${rejection.details}`);
            }
            // World setup, like load, happens outside a tick; the events are not needed (architecture §2).
            this.commandSystem.applyCommand(this.worldState, this.gridModel, command, []);
        }
    }

    /** Serializes everything that cannot be regenerated from the seed (current format, v2). */
    public saveV2(): SaveGameV2 {
        return writeSaveV2(this.worldState, this.gridModel);
    }

    /**
     * Replaces the current world with a saved one. Accepts every supported version (older ones are migrated).
     * @param data Save data of unknown shape, e.g. parsed JSON from storage.
     * @throws If the data is not a valid save; the current world is then left unchanged.
     */
    public loadSave(data: unknown): void {
        const { state, grid } = loadSaveV2(parseSave(data));
        this.worldState = state;
        this.gridModel = grid;
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

    /** Every item currently held by a structure, sorted by structure id. */
    public getItemSlots(): ItemSlotSnapshot[] {
        return this.worldState.itemSlots.entries().map(([structureId, slot]) => ({
            structureId,
            itemKey: getItemDefinitionById(slot.itemId).key,
            ticksRemaining: slot.ticksRemaining,
        }));
    }

    /** How many of the given item have been delivered to the Core so far. */
    public getDeliveredCount(itemKey: ItemKey): number {
        return this.worldState.deliveredCounts.get(getItemDefinitionByKey(itemKey).id) ?? 0;
    }

    /**
     * Asks whether a placement would succeed right now, without changing anything (for the preview).
     * @returns Why it would be rejected, or null if it is allowed.
     */
    public checkPlacement(request: PlacementRequest): PlacementRejection | null {
        return checkPlacement(this.gridModel, request);
    }

    public getStructureIdAt(tile: TileCoord): number {
        return this.gridModel.getStructureIdAt(tile);
    }

    public getResourceIdAt(tile: TileCoord): number {
        return this.gridModel.getResourceIdAt(tile);
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
