import { describe, it, expect, beforeEach } from 'vitest';
import { Chunk } from '../../../src/grid/chunk';
import { CHUNK_SIZE, RESOURCE_ID_NONE, STRUCTURE_ID_NONE } from '../../../src/core/constants';
import { ChunkCoord, TileCoord } from '../../../src/types/coords';

describe('Chunk', () => {
    let chunk: Chunk;
    const testChunkCoord: ChunkCoord = { x: 0, y: 0 };

    beforeEach(() => {
        chunk = new Chunk(testChunkCoord);
    });

    describe('constructor', () => {
        it('should initialize with correct chunk coordinate', () => {
            expect(chunk.coord).toEqual(testChunkCoord);
        });

        it('should initialize with correct size', () => {
            expect(chunk.size).toBe(CHUNK_SIZE);
        });

        it('should initialize all structure IDs to STRUCTURE_ID_NONE', () => {
            for (let y = 0; y < CHUNK_SIZE; y++) {
                for (let x = 0; x < CHUNK_SIZE; x++) {
                    expect(chunk.getStructureAt({ x, y })).toBe(STRUCTURE_ID_NONE);
                }
            }
        });

        it('should initialize all resource IDs to RESOURCE_ID_NONE', () => {
            for (let y = 0; y < CHUNK_SIZE; y++) {
                for (let x = 0; x < CHUNK_SIZE; x++) {
                    expect(chunk.getResourceAt({ x, y })).toBe(RESOURCE_ID_NONE);
                }
            }
        });
    });

    describe('setStructureAt and getStructureAt', () => {
        it('should set and get structure ID at specific coordinate', () => {
            const tileCoord: TileCoord = { x: 5, y: 3 };
            const structureId = 42;

            chunk.setStructureAt(tileCoord, structureId);
            expect(chunk.getStructureAt(tileCoord)).toBe(structureId);
        });

        it('should handle corner coordinates', () => {
            const corners: TileCoord[] = [
                { x: 0, y: 0 },
                { x: CHUNK_SIZE - 1, y: 0 },
                { x: 0, y: CHUNK_SIZE - 1 },
                { x: CHUNK_SIZE - 1, y: CHUNK_SIZE - 1 }
            ];

            corners.forEach((coord, index) => {
                const structureId = 100 + index;
                chunk.setStructureAt(coord, structureId);
                expect(chunk.getStructureAt(coord)).toBe(structureId);
            });
        });
    });

    describe('setResourceAt and getResourceAt', () => {
        it('should set and get resource ID at specific coordinate', () => {
            const tileCoord: TileCoord = { x: 7, y: 2 };
            const resourceId = 99;

            chunk.setResourceAt(tileCoord, resourceId);
            expect(chunk.getResourceAt(tileCoord)).toBe(resourceId);
        });

        it('should handle corner coordinates', () => {
            const corners: TileCoord[] = [
                { x: 0, y: 0 },
                { x: CHUNK_SIZE - 1, y: 0 },
                { x: 0, y: CHUNK_SIZE - 1 },
                { x: CHUNK_SIZE - 1, y: CHUNK_SIZE - 1 }
            ];

            corners.forEach((coord, index) => {
                const resourceId = 200 + index;
                chunk.setResourceAt(coord, resourceId);
                expect(chunk.getResourceAt(coord)).toBe(resourceId);
            });
        });
    });

    describe('getStructureId', () => {
        it('should return the same value as getStructureAt', () => {
            const tileCoord: TileCoord = { x: 4, y: 6 };
            const structureId = 55;

            chunk.setStructureAt(tileCoord, structureId);
            expect(chunk.getStructureId(tileCoord)).toBe(chunk.getStructureAt(tileCoord));
            expect(chunk.getStructureId(tileCoord)).toBe(structureId);
        });
    });

    describe('getResourceId', () => {
        it('should return the same value as getResourceAt', () => {
            const tileCoord: TileCoord = { x: 8, y: 1 };
            const resourceId = 77;

            chunk.setResourceAt(tileCoord, resourceId);
            expect(chunk.getResourceId(tileCoord)).toBe(chunk.getResourceAt(tileCoord));
            expect(chunk.getResourceId(tileCoord)).toBe(resourceId);
        });
    });

    describe('data independence', () => {
        it('should keep structure and resource data independent', () => {
            const tileCoord: TileCoord = { x: 3, y: 3 };
            const structureId = 10;
            const resourceId = 20;

            chunk.setStructureAt(tileCoord, structureId);
            chunk.setResourceAt(tileCoord, resourceId);

            expect(chunk.getStructureAt(tileCoord)).toBe(structureId);
            expect(chunk.getResourceAt(tileCoord)).toBe(resourceId);
        });

        it('should not affect other tiles when setting values', () => {
            const coord1: TileCoord = { x: 1, y: 1 };
            const coord2: TileCoord = { x: 2, y: 2 };

            chunk.setStructureAt(coord1, 111);
            chunk.setResourceAt(coord1, 222);

            expect(chunk.getStructureAt(coord2)).toBe(STRUCTURE_ID_NONE);
            expect(chunk.getResourceAt(coord2)).toBe(RESOURCE_ID_NONE);
        });
    });
});