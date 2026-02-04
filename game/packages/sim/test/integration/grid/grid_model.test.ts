import { describe, expect, it } from "vitest";
import { GridModel } from "../../../src/grid/grid_model";
import { RESOURCE_ID_NONE, STRUCTURE_ID_NONE } from "../../../src/core/constants";
import type { ChunkCoord, TileCoord } from "../../../src/types";

function sortChunkCoords(coords: ChunkCoord[]): ChunkCoord[] {
  return [...coords].sort((a, b) => (a.y - b.y) || (a.x - b.x));
}

describe("GridModel (integration)", () => {
  it("should invoke chunkGenerationCallback exactly once per new chunk", () => {
    const grid = new GridModel();

    const calls: ChunkCoord[] = [];
    grid.setChunkGenerationCallback((_chunk, coord) => {
      calls.push({ x: coord.x, y: coord.y });
    });

    const c0 = grid.getOrCreateChunk({ x: 0, y: 0 });
    const c0Again = grid.getOrCreateChunk({ x: 0, y: 0 });
    const c1 = grid.getOrCreateChunk({ x: 1, y: -1 });

    expect(c0).toBe(c0Again);
    expect(c1).not.toBe(c0);

    expect(sortChunkCoords(calls)).toEqual(sortChunkCoords([
      { x: 0, y: 0 },
      { x: 1, y: -1 },
    ]));
  });

  it("should return NONE when chunk does not exist", () => {
    const grid = new GridModel();

    expect(grid.getStructureIdAt({ x: 0, y: 0 })).toBe(STRUCTURE_ID_NONE);
    expect(grid.getResourceIdAt({ x: 0, y: 0 })).toBe(RESOURCE_ID_NONE);
    expect(grid.hasStructureAt({ x: 0, y: 0 })).toBe(false);
    expect(grid.hasResourceAt({ x: 0, y: 0 })).toBe(false);
  });

  it("should create chunk on demand and then retrieve the same structure ID", () => {
    const grid = new GridModel();

    const tile: TileCoord = { x: 0, y: 0 };
    grid.setStructureIdAt(tile, 123);

    expect(grid.getStructureIdAt(tile)).toBe(123);
    expect(grid.hasStructureAt(tile)).toBe(true);
    expect(grid.getStructureIdAt({ x: 1000, y: 1000 })).toBe(STRUCTURE_ID_NONE);
  });

  it("should create chunk on demand and then retrieve the same resource ID", () => {
    const grid = new GridModel();

    const tile: TileCoord = { x: -1, y: -1 };
    grid.setResourceIdAt(tile, 7);

    expect(grid.getResourceIdAt(tile)).toBe(7);
    expect(grid.hasResourceAt(tile)).toBe(true);

    grid.setResourceIdAt(tile, RESOURCE_ID_NONE);
    expect(grid.getResourceIdAt(tile)).toBe(RESOURCE_ID_NONE);
    expect(grid.hasResourceAt(tile)).toBe(false);
  });

  it("should return all currently created chunks (order independent)", () => {
    const grid = new GridModel();

    grid.getOrCreateChunk({ x: 0, y: 0 });
    grid.getOrCreateChunk({ x: -1, y: 2 });
    grid.getOrCreateChunk({ x: 5, y: -3 });

    const coords = sortChunkCoords(grid.getAllChunkCoords());
    expect(coords).toEqual(sortChunkCoords([
      { x: 0, y: 0 },
      { x: -1, y: 2 },
      { x: 5, y: -3 },
    ]));
  });

  it("should mark multiple chunks persistent and ensure they are created", () => {
    const grid = new GridModel();

    const a: ChunkCoord = { x: 0, y: 0 };
    const b: ChunkCoord = { x: 1, y: 0 };

    grid.setChunkPersistent([a, b], true);

    expect(grid.isChunkPersistent(a)).toBe(true);
    expect(grid.isChunkPersistent(b)).toBe(true);
    expect(grid.hasChunk(a)).toBe(true);
    expect(grid.hasChunk(b)).toBe(true);
    expect(sortChunkCoords(grid.getAllPersistentChunks())).toEqual(sortChunkCoords([a, b]));
  });

  it("should unmark persistence without deleting chunks", () => {
    const grid = new GridModel();

    const a: ChunkCoord = { x: 0, y: 0 };
    grid.setChunkPersistent([a], true);

    expect(grid.isChunkPersistent(a)).toBe(true);
    expect(grid.hasChunk(a)).toBe(true);

    grid.setChunkPersistent([a], false);

    expect(grid.isChunkPersistent(a)).toBe(false);
    expect(grid.hasChunk(a)).toBe(true);
  });

  it("should trigger chunk generation by setStructureIdAt and setResourceIdAt", () => {
    const grid = new GridModel();

    const generated: ChunkCoord[] = [];
    grid.setChunkGenerationCallback((_chunk, coord) => {
      generated.push({ x: coord.x, y: coord.y });
    });

    grid.setStructureIdAt({ x: 0, y: 0 }, 1);
    grid.setResourceIdAt({ x: 16, y: 0 }, 2);
    grid.setResourceIdAt({ x: 0, y: 1 }, 3);

    expect(sortChunkCoords(generated)).toEqual(sortChunkCoords([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ]));
  });
});
