import { RESOURCE_ID_NONE, STRUCTURE_ID_NONE } from "../core/constants";
import { ChunkCoord, TileCoord } from "../types";
import { Chunk } from "./chunk";
import { chunkKey, parseChunkKey, tileToChunk, tileToLocal } from "./grid_math";

/**
 * Represents the grid model of the game world, managing chunks and their data.
 */
export class GridModel {
    private chunks: Map<string, Chunk> = new Map();

    private persistentChunks: Set<string> = new Set();

    private chunkGenerationCallback: ((chunk: Chunk, coord: ChunkCoord) => void) | null = null;

    /**
     * Marks a chunk as persistent, preventing it from being unloaded.
     * @param chunkKey - The unique key of the chunk to mark as persistent.
     */
    public setChunkGenerationCallback(cb: (chunk: Chunk, coord: ChunkCoord) => void): void {
        this.chunkGenerationCallback = cb;
    }

    /**
     * Checks if a chunk exists in the grid model.
     * @param chunkKey - The unique key of the chunk to check.
     * @returns 
     */
    public hasChunk(chunkCoord: ChunkCoord): boolean {
        return this.chunks.has(chunkKey(chunkCoord));
    }

    /**
     * Retrieves a chunk from the grid model.
     * @param chunkKey - The unique key of the chunk to retrieve.
     * @returns The chunk if it exists, otherwise undefined.
     */

    public getChunk(chunkCoord: ChunkCoord): Chunk | undefined {
        return this.chunks.get(chunkKey(chunkCoord));
    }

    /**
     * Retrieves an existing chunk or creates a new one if it doesn't exist.
     * @param chunkKey - The unique key of the chunk to retrieve or create.
     * @returns The existing or newly created chunk.
     */
    public getOrCreateChunk(chunkCoord: ChunkCoord): Chunk {
        const key = chunkKey(chunkCoord);
        const existingChunk = this.chunks.get(key);

        if (existingChunk) {
            return existingChunk;
        }

        const newChunk = new Chunk(chunkCoord);
        
        this.chunks.set(key, newChunk);

        if (this.chunkGenerationCallback) {
            this.chunkGenerationCallback(newChunk, chunkCoord);
        }

        return newChunk;
    }

    /**
     * Sets the structure ID at the specified tile coordinate.
     * @param tileCoordinate The tile coordinate to set the structure ID at.
     * @param structureId The structure ID to set.
     */
    public setStructureIdAt(tileCoordinate: TileCoord, structureId: number): void {
        const chunkCoord = tileToChunk(tileCoordinate);
        const chunk = this.getOrCreateChunk(chunkCoord);

        const local = tileToLocal(tileCoordinate);
        chunk.setStructureAt(local, structureId);
    }

    /**
     * Checks if there is a structure at the specified tile coordinate.
     * @param tileCoordinate The tile coordinate to check.
     * @returns True if there is a structure at the specified tile coordinate, otherwise false.
     */
    public hasStructureAt(tile: TileCoord): boolean {
        return this.getStructureIdAt(tile) !== STRUCTURE_ID_NONE;
    }

    /**
     * Retrieves the structure ID at the specified tile coordinate.
     * @param tileCoord The tile coordinate to retrieve the structure ID from.
     * @returns The structure ID at the specified tile coordinate, or ENTITY_ID_NONE if none exists.
     */
    public getStructureIdAt(tileCoord: TileCoord): number | null {
        const chunkCoord = tileToChunk(tileCoord);
        const chunk = this.getChunk(chunkCoord);

        if (!chunk) return STRUCTURE_ID_NONE;

        const local = tileToLocal(tileCoord);
        return chunk.getStructureId(local);
    }

    /**
     * Sets the resource ID at the specified tile coordinate.
     * @param tileCoordinate The tile coordinate to set the resource ID at.
     * @param resourceId The resource ID to set.
     */
    public setResourceIdAt(tileCoordinate: TileCoord, resourceId: number): void {
        const chunkCoord = tileToChunk(tileCoordinate);
        const chunk = this.getOrCreateChunk(chunkCoord);

        const local = tileToLocal(tileCoordinate);
        chunk.setResourceAt(local, resourceId);
    }

    /**
     * Checks if there is a resource at the specified tile coordinate.
     * @param tileCoordinate The tile coordinate to check.
     * @returns True if there is a resource at the specified tile coordinate, otherwise false.
     */
    public hasResourceAt(tile: TileCoord): boolean {
        return this.getResourceIdAt(tile) !== RESOURCE_ID_NONE;
    }

    /**
     * Retrieves the resource ID at the specified tile coordinate.
     * @param tileCoord The tile coordinate to retrieve the resource ID from.
     * @returns The resource ID at the specified tile coordinate, or ENTITY_ID_NONE if none exists.
     */
    public getResourceIdAt(tileCoord: TileCoord): number | null {
        const chunkCoord = tileToChunk(tileCoord);
        const chunk = this.getChunk(chunkCoord);

        if (!chunk) return RESOURCE_ID_NONE;

        const local = tileToLocal(tileCoord);
        return chunk.getResourceId(local);
    }

    /**
     * Retrieves all chunk coordinates currently stored in the grid model.
     * @returns An array of all chunk coordinates.
     */
    public getAllChunkCoords(): ChunkCoord[] {
        const coords: ChunkCoord[] = [];
        for (const key of this.chunks.keys()) {
            coords.push(parseChunkKey(key));
        }
        return coords;
    }

    /**
     * Checks if a chunk is marked as persistent.
     * @param chunkKey - The unique key of the chunk to check.
     * @returns True if the chunk is persistent, otherwise false.
     */
    public isChunkPersistent(chunk: ChunkCoord): boolean {
        return this.persistentChunks.has(chunkKey(chunk));
    }

    /**
     * Marks or unmarks a chunk as persistent.
     * @param chunkCoords - The unique keys of the chunks to mark or unmark.
     * @param persistent - True to mark as persistent, false to unmark.
     */
    public setChunkPersistent(chunkCoords: ChunkCoord[], persistent = true): void {
        for (const coord of chunkCoords) {
            if (persistent) {
                this.persistentChunks.add(chunkKey(coord));
                this.getOrCreateChunk(coord);
                continue;
            }

            this.persistentChunks.delete(chunkKey(coord));
        }
    }

    /**
     * Retrieves all persistent chunk coordinates currently stored in the grid model.
     * @returns An array of all persistent chunk coordinates.
     */
    public getAllPersistentChunks(): ChunkCoord[] {
        const coords: ChunkCoord[] = [];
        for (const key of this.persistentChunks) {
            coords.push(parseChunkKey(key));
        }
        return coords;
    }
}