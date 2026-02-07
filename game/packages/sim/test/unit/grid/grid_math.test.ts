import { describe, it, expect } from 'vitest';
import { tileToChunk, tileToLocal, chunkAndLocal, chunkToTileOrigin, chunkKey, parseChunkKey, floorMod, rotateOffsets, computeFootprintTiles } from '../../../src/grid/grid_math';
import { TileCoord } from '../../../src/types';


describe('tileToChunk', () => {
    it('should convert positive tile coordinates to chunk coordinates', () => {
        expect(tileToChunk({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
        expect(tileToChunk({ x: 15, y: 15 })).toEqual({ x: 0, y: 0 });
        expect(tileToChunk({ x: 16, y: 16 })).toEqual({ x: 1, y: 1 });
        expect(tileToChunk({ x: 32, y: 48 })).toEqual({ x: 2, y: 3 });
    });

    it('should handle negative tile coordinates', () => {
        expect(tileToChunk({ x: -1, y: -1 })).toEqual({ x: -1, y: -1 });
        expect(tileToChunk({ x: -16, y: -16 })).toEqual({ x: -1, y: -1 });
        expect(tileToChunk({ x: -17, y: -17 })).toEqual({ x: -2, y: -2 });
    });
});

describe('tileToLocal', () => {
    it('should convert tile coordinates to local coordinates within chunk', () => {
        expect(tileToLocal({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
        expect(tileToLocal({ x: 5, y: 7 })).toEqual({ x: 5, y: 7 });
        expect(tileToLocal({ x: 16, y: 16 })).toEqual({ x: 0, y: 0 });
        expect(tileToLocal({ x: 18, y: 20 })).toEqual({ x: 2, y: 4 });
        expect(tileToLocal({ x: -16, y: -16 })).toEqual({ x: 0, y: 0 });
    });

    it('should handle negative coordinates correctly', () => {
        expect(tileToLocal({ x: -1, y: -1 })).toEqual({ x: 15, y: 15 });
        expect(tileToLocal({ x: -5, y: -3 })).toEqual({ x: 11, y: 13 });
    });
});

describe('chunkAndLocal', () => {
    it('should return both chunk and local coordinates', () => {
        const result = chunkAndLocal({ x: 18, y: 20 });
        expect(result.chunk).toEqual({ x: 1, y: 1 });
        expect(result.local).toEqual({ x: 2, y: 4 });
    });
});

describe('chunkToTileOrigin', () => {
    it('should convert chunk coordinates to tile origin', () => {
        expect(chunkToTileOrigin({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
        expect(chunkToTileOrigin({ x: 1, y: 1 })).toEqual({ x: 16, y: 16 });
        expect(chunkToTileOrigin({ x: -1, y: 2 })).toEqual({ x: -16, y: 32 });
    });
});

describe('chunkKey', () => {
    it('should generate unique string keys for chunk coordinates', () => {
        expect(chunkKey({ x: 0, y: 0 })).toBe('0,0');
        expect(chunkKey({ x: 5, y: -3 })).toBe('5,-3');
        expect(chunkKey({ x: -10, y: 20 })).toBe('-10,20');
    });
});

describe('parseChunkKey', () => {
    it('should parse chunk key back to coordinates', () => {
        expect(parseChunkKey('0,0')).toEqual({ x: 0, y: 0 });
        expect(parseChunkKey('5,-3')).toEqual({ x: 5, y: -3 });
        expect(parseChunkKey('-10,20')).toEqual({ x: -10, y: 20 });
    });
});

describe('floorMod', () => {
    it('should compute floor modulus for positive numbers', () => {
        expect(floorMod(5, 3)).toBe(2);
        expect(floorMod(6, 3)).toBe(0);
        expect(floorMod(7, 3)).toBe(1);
    });

    it('should compute floor modulus for negative numbers', () => {
        expect(floorMod(-1, 3)).toBe(2);
        expect(floorMod(-3, 3)).toBe(0);
        expect(floorMod(-5, 3)).toBe(1);
    });
});

describe('rotateOffsets', () => {
    const offsets: TileCoord[] = [{ x: 0, y: 0 }, { x: 0, y: 1 }];

    it('should not rotate when rotation is 0', () => {
        expect(rotateOffsets(offsets, 0)).toEqual([{ x: 0, y: 0 }, { x: 0, y: 1 }]);
    });

    it('should rotate 90 degrees when rotation is 1', () => {
        expect(rotateOffsets(offsets, 1)).toEqual([{ x: 0, y: 0 }, { x: -1, y: 0 }]);
    });

    it('should rotate 180 degrees when rotation is 2', () => {
        expect(rotateOffsets(offsets, 2)).toEqual([{ x: 0, y: 0 }, { x: 0, y: -1 }]);
    });

    it('should rotate 270 degrees when rotation is 3', () => {
        expect(rotateOffsets(offsets, 3)).toEqual([{ x: 0, y: 0 }, { x: 1, y: 0 }]);
    });
});

describe('computeFootprintTiles', () => {
    it('should compute absolute tile coordinates from anchor and offsets', () => {
        const anchor = { x: 10, y: 20 };
        const offsets = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }];
        
        expect(computeFootprintTiles(anchor, offsets)).toEqual([
            { x: 10, y: 20 },
            { x: 11, y: 20 },
            { x: 10, y: 21 }
        ]);
    });

    it('should handle negative offsets', () => {
        const anchor = { x: 5, y: 5 };
        const offsets = [{ x: -1, y: -1 }, { x: 1, y: 1 }];
        
        expect(computeFootprintTiles(anchor, offsets)).toEqual([
            { x: 4, y: 4 },
            { x: 6, y: 6 }
        ]);
    });

    it('should return empty array for empty offsets', () => {
        expect(computeFootprintTiles({ x: 0, y: 0 }, [])).toEqual([]);
    });
});