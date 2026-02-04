import { ChunkCoord } from "../types";
import { StructureStore } from "../state/structure_store";
import { Event } from "../types/events";

/**
 * Single source of truth for the simulation.
 * Systems get a reference and mutate it during SimWorld.tick().
 */
export class WorldState {
  public worldSeed: number = 118;
  public tickIndex: number = 0;

  public generatedChunkCount: number = 0;
  public activeRadiusChunks: number = 2;

  public hasFocusChunk: boolean = false;
  public focusChunkCoord: ChunkCoord | null = null;

  public hasPendingFocusChunk: boolean = false;
  public pendingFocusChunkCoord: ChunkCoord | null = null;

  public structureStore = new StructureStore();

  public currentTickOutEvents: Event[] = [];
}