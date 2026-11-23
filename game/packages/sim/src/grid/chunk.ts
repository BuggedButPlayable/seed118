import { CHUNK_SIZE, RESOURCE_ID_NONE, STRUCTURE_ID_NONE } from '../core/constants';
import type { ChunkCoord, TileCoord } from '../types/coords';

/**
 * A CHUNK_SIZE x CHUNK_SIZE block of tiles storing structure and resource ids.
 * All tile coordinates passed to a chunk are local (0 .. CHUNK_SIZE - 1).
 */
export class Chunk {
    public readonly size = CHUNK_SIZE;
    public readonly coord: ChunkCoord;

    private readonly resourceIds = new Int32Array(CHUNK_SIZE * CHUNK_SIZE).fill(RESOURCE_ID_NONE);
    private readonly structureIds = new Int32Array(CHUNK_SIZE * CHUNK_SIZE).fill(STRUCTURE_ID_NONE);

    constructor(coord: ChunkCoord) {
        this.coord = coord;
    }

    public getStructureAt(local: TileCoord): number {
        return this.structureIds[this.index(local)] ?? STRUCTURE_ID_NONE;
    }

    public setStructureAt(local: TileCoord, structureId: number): void {
        this.structureIds[this.index(local)] = structureId;
    }

    public getResourceAt(local: TileCoord): number {
        return this.resourceIds[this.index(local)] ?? RESOURCE_ID_NONE;
    }

    public setResourceAt(local: TileCoord, resourceId: number): void {
        this.resourceIds[this.index(local)] = resourceId;
    }

    private index(local: TileCoord): number {
        return local.y * this.size + local.x;
    }
}
