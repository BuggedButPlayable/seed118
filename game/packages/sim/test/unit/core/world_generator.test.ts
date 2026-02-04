import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateNewChunk } from '../../../src/core/world_generator';
import { GridModel } from '../../../src/grid/grid_model';
import { WorldState } from '../../../src/state/world_state';
import { ChunkCoord } from '../../../src/types';
import { EventType } from '../../../src/types/events';
import { CHUNK_SIZE } from '../../../src/core/constants';
import { generateResourceId } from '../../../src/core/cluster_generator';

vi.mock('../../../src/core/cluster_generator');

describe('generateNewChunk', () => {
    let mockGrid: GridModel;
    let mockState: WorldState;
    let chunkCoord: ChunkCoord;

    beforeEach(() => {
        mockGrid = {
            setResourceIdAt: vi.fn()
        } as any;

        mockState = {
            worldSeed: 12345,
            generatedChunkCount: 0,
            currentTickOutEvents: []
        } as any;

        chunkCoord = { x: 1, y: 2 };

        vi.mocked(generateResourceId).mockReturnValue(1);
    });

    it('should generate tiles for entire chunk', () => {
        generateNewChunk(chunkCoord, mockGrid, mockState);

        expect(mockGrid.setResourceIdAt).toHaveBeenCalledTimes(CHUNK_SIZE * CHUNK_SIZE);
    });

    it('should calculate correct world coordinates', () => {
        generateNewChunk(chunkCoord, mockGrid, mockState);

        const firstCall = vi.mocked(mockGrid.setResourceIdAt).mock.calls[0][0];
        expect(firstCall).toEqual({ x: CHUNK_SIZE, y: CHUNK_SIZE * 2 });
    });

    it('should increment generatedChunkCount', () => {
        generateNewChunk(chunkCoord, mockGrid, mockState);

        expect(mockState.generatedChunkCount).toBe(1);
    });

    it('should push ChunkGenerated event when currentTickOutEvents exists', () => {
        generateNewChunk(chunkCoord, mockGrid, mockState);

        expect(mockState.currentTickOutEvents).toHaveLength(1);
        expect(mockState.currentTickOutEvents![0]).toEqual({
            type: EventType.ChunkGenerated,
            coord: chunkCoord
        });
    });

    it('should call generateResourceId with correct parameters', () => {
        generateNewChunk(chunkCoord, mockGrid, mockState);

        const call = vi.mocked(generateResourceId).mock.calls[0];
        expect(call[1]).toBe(mockState.worldSeed);
    });
});