import { DEFAULT_WORLD_SEED } from '../core/constants';
import { StructureStore } from './structure_store';
import type { ChunkCoord } from '../types';
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

    /** Event sink of the tick in progress; null outside of SimWorld.tick(). */
    public currentTickOutEvents: Event[] | null = null;
}
