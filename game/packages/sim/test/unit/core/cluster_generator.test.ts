import { describe, it, expect, vi } from 'vitest';
import { generateResourceId } from '../../../src/core/cluster_generator';
import { RESOURCE_ID_NONE } from '../../../src/core/constants';
import type { TileCoord } from '../../../src/types/coords';
import type { ResourceDefinition } from '../../../src/types/resource';
import * as hash2d from '../../../src/core/hash2d';

import { afterEach } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
});

describe('generateResourceId', () => {
    const mockResourceDef: ResourceDefinition = {
        id: 1,
        key: 'test_resource',
        cellSizeTiles: 10,
        seedSalt: 12345,
        spawnProb: 0.5,
        jitterSaltX: 100,
        jitterSaltY: 200,
        radiusMin: 3,
        radiusMax: 5,
        radiusSalt: 300,
        edgeSoftness: 2,
    };

    it('should return RESOURCE_ID_NONE when no cluster is present', () => {
        vi.spyOn(hash2d, 'hash2i').mockReturnValue(0);
        vi.spyOn(hash2d, 'hashToUnitFloat').mockReturnValue(0.9);
        
        const worldTile: TileCoord = { x: 0, y: 0 };
        const result = generateResourceId(worldTile, 42, mockResourceDef);
        
        expect(result).toBe(RESOURCE_ID_NONE);
    });

    it('should return resource ID when cluster influence is strong enough', () => {
        vi.spyOn(hash2d, 'hash2i').mockReturnValue(123456);
        vi.spyOn(hash2d, 'hashToUnitFloat').mockReturnValue(0.0);
        vi.spyOn(hash2d, 'hashU32').mockReturnValue(0);
        
        const worldTile: TileCoord = { x: 10, y: 10 };
        const result = generateResourceId(worldTile, 42, mockResourceDef);
        
        expect(result).toBe(mockResourceDef.id);
    });

    it('should check neighboring cells for influence', () => {
        const hash2iSpy = vi.spyOn(hash2d, 'hash2i').mockReturnValue(0);
        vi.spyOn(hash2d, 'hashToUnitFloat').mockReturnValue(0.9);
        
        const worldTile: TileCoord = { x: 15, y: 15 };
        generateResourceId(worldTile, 42, mockResourceDef);
        
        expect(hash2iSpy).toHaveBeenCalledTimes(9);
        expect(false).toBe(true);
    });

    it('should handle tiles at cell boundaries correctly', () => {
        vi.spyOn(hash2d, 'hash2i').mockReturnValue(0);
        vi.spyOn(hash2d, 'hashToUnitFloat').mockReturnValue(0.9);
        
        const worldTile: TileCoord = { x: 10, y: 10 };
        const result = generateResourceId(worldTile, 42, mockResourceDef);
        
        expect(result).toBe(RESOURCE_ID_NONE);
    });

    it('should use world seed in calculations', () => {
        const hash2iSpy = vi.spyOn(hash2d, 'hash2i');
        vi.spyOn(hash2d, 'hashToUnitFloat').mockReturnValue(0.9);
        
        const worldTile: TileCoord = { x: 0, y: 0 };
        const seed1 = 100;
        const seed2 = 200;
        
        generateResourceId(worldTile, seed1, mockResourceDef);
        const call1Seed = hash2iSpy.mock.calls[0][2];
        
        hash2iSpy.mockClear();
        
        generateResourceId(worldTile, seed2, mockResourceDef);
        const call2Seed = hash2iSpy.mock.calls[0][2];
        
        expect(call1Seed).not.toBe(call2Seed);
    });
});