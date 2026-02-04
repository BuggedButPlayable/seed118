import { CHUNK_SIZE, RESOURCE_ID_NONE, STRUCTURE_ID_NONE } from "../core/constants"
import { ChunkCoord, TileCoord } from "../types/coords";

/**
 * Represents a chunk of the game world, managing structures and resources within its tiles.
 */
export class Chunk {
    public readonly size = CHUNK_SIZE;

    public readonly coord: ChunkCoord;

    private resourceIds = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);
    private structureIds = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);
    
    constructor(coord: ChunkCoord) {
        this.coord = coord;
        this.structureIds.fill(STRUCTURE_ID_NONE);
        this.resourceIds.fill(RESOURCE_ID_NONE);
    }

    /**
     * Converts a tile coordinate to a linear index in the arrays.
     * @param tileCoordinate The tile coordinate within the chunk.
     * @returns The linear index corresponding to the tile coordinate.
     */
    private index(tileCoordinate: TileCoord): number {
        return tileCoordinate.y * this.size + tileCoordinate.x;
    }

    /**
     * Gets the structure ID at the specified tile coordinate.
     * @param tileCoordinate The tile coordinate within the chunk.
     * @returns The structure ID at the specified tile coordinate.
     */
    public getStructureAt(tileCoordinate: TileCoord): number {
        return this.structureIds[this.index(tileCoordinate)];
    }

    /**
     * Sets the structure ID at the specified tile coordinate.
     * @param tileCoordinate The tile coordinate within the chunk.
     * @param structureId The structure ID to set.
     */
    public setStructureAt(tileCoordinate: TileCoord, structureId: number): void {
        this.structureIds[this.index(tileCoordinate)] = structureId;
    }

    /**
     * Gets the resource ID at the specified tile coordinate.
     * @param tileCoordinate The tile coordinate within the chunk.
     * @returns The resource ID at the specified tile coordinate.
     */
    public getResourceAt(tileCoordinate: TileCoord): number {
        return this.resourceIds[this.index(tileCoordinate)];
    }

    /**
     * Sets the resource ID at the specified tile coordinate.
     * @param tileCoordinate The tile coordinate within the chunk.
     * @param resourceId The resource ID to set.
     */
    public setResourceAt(tileCoordinate: TileCoord, resourceId: number): void {
        this.resourceIds[this.index(tileCoordinate)] = resourceId;
    }

    /**
     * Gets the resource ID at the specified tile coordinate.
     * @param tileCoord The tile coordinate within the chunk.
     * @returns The resource ID at the specified tile coordinate.
     */
    public getResourceId(tileCoord: TileCoord): number {
        return this.getResourceAt(tileCoord);
    }

    /**
     * Gets the structure ID at the specified tile coordinate.
     * @param tileCoord The tile coordinate within the chunk.
     * @returns The structure ID at the specified tile coordinate.
     */
    public getStructureId(tileCoord: TileCoord): number {
        return this.getStructureAt(tileCoord);
    }
}
