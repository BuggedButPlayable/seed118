import { RESOURCE_ID_NONE, STRUCTURE_ID_NONE } from '../core/constants';
import type { ChunkCoord, TileCoord } from '../types';
import { Chunk } from './chunk';
import { chunkKey, parseChunkKey, tileToChunk, tileToLocal } from './grid_math';

/**
 * Represents the grid model of the game world, managing chunks and their data.
 */
export class GridModel {
    private readonly chunks: Map<string, Chunk> = new Map();

    private readonly persistentChunks: Set<string> = new Set();

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

    public getStructureIdAt(tile: TileCoord): number {
        return this.readTile(tile, (chunk, local) => chunk.getStructureAt(local), STRUCTURE_ID_NONE);
    }

    public setStructureIdAt(tile: TileCoord, structureId: number): void {
        this.writeTile(tile, (chunk, local) => chunk.setStructureAt(local, structureId));
    }

    public hasStructureAt(tile: TileCoord): boolean {
        return this.getStructureIdAt(tile) !== STRUCTURE_ID_NONE;
    }

    public getResourceIdAt(tile: TileCoord): number {
        return this.readTile(tile, (chunk, local) => chunk.getResourceAt(local), RESOURCE_ID_NONE);
    }

    public setResourceIdAt(tile: TileCoord, resourceId: number): void {
        this.writeTile(tile, (chunk, local) => chunk.setResourceAt(local, resourceId));
    }

    public hasResourceAt(tile: TileCoord): boolean {
        return this.getResourceIdAt(tile) !== RESOURCE_ID_NONE;
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

    /** Reads a value from the chunk containing the tile; ungenerated chunks yield the fallback. */
    private readTile(
        tile: TileCoord,
        read: (chunk: Chunk, local: TileCoord) => number,
        fallback: number,
    ): number {
        const chunk = this.getChunk(tileToChunk(tile));
        return chunk ? read(chunk, tileToLocal(tile)) : fallback;
    }

    /** Writes into the chunk containing the tile, generating the chunk first if needed. */
    private writeTile(tile: TileCoord, write: (chunk: Chunk, local: TileCoord) => void): void {
        write(this.getOrCreateChunk(tileToChunk(tile)), tileToLocal(tile));
    }
}
