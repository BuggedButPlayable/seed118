import { DEFAULT_WORLD_SEED } from '../core/constants';
import type { ItemSlot } from './item_slot';
import { PerStructureStore } from './per_structure_store';
import { StructureStore } from './structure_store';
import type { ChunkCoord } from '../types';
import type { StructureId } from '../types/ids';
import type { Event } from '../types/events';

/**
 * Single source of truth for the simulation.
 * Systems receive a reference and mutate it only during SimWorld.tick().
 */
export class WorldState {
    public worldSeed = DEFAULT_WORLD_SEED;
    public tickIndex = 0;

    public generatedChunkCount = 0;
    public activeRadiusChunks = 2;

    /** Chunk the camera is centred on; null until the view sets one. */
    public focusChunkCoord: ChunkCoord | null = null;
    /** Focus requested by a command in the current tick; applied after all commands. */
    public pendingFocusChunkCoord: ChunkCoord | null = null;

    public structureStore = new StructureStore();
    /** Item held by each structure that currently holds one. */
    public itemSlots = new PerStructureStore<ItemSlot>();
    /** Ticks a collector has already worked on its next item. */
    public extractionProgress = new PerStructureStore<number>();

    /** Event sink of the tick in progress; null outside of SimWorld.tick(). */
    public currentTickOutEvents: Event[] | null = null;

    /**
     * Drops everything stored for a structure that no longer exists. Every per-structure store
     * is cleared here, so a removal can never leave state behind. A held item is lost (M1 rule).
     */
    public forgetStructure(structureId: StructureId): void {
        this.structureStore.removeStructure(structureId);
        this.itemSlots.delete(structureId);
        this.extractionProgress.delete(structureId);
    }
}
