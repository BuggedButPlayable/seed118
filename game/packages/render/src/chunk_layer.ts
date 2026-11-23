import {
    CHUNK_SIZE,
    RESOURCE_ID_NONE,
    chunkKey,
    chunkToTileOrigin,
    getResourceDefinitionById,
} from '@seed118/sim';
import type { ChunkCoord, TileCoord } from '@seed118/sim';
import { Container, Graphics } from 'pixi.js';

import { CHUNK_BORDER_COLOR, GRID_COLOR, resourceTint } from './palette';
import type { SimView } from './sim_view';
import type { WorldPoint } from './tile_geometry';

/** All local tile positions of a chunk, row by row. */
const LOCAL_TILES: readonly TileCoord[] = Array.from({ length: CHUNK_SIZE * CHUNK_SIZE }, (_, index) => ({
    x: index % CHUNK_SIZE,
    y: Math.floor(index / CHUNK_SIZE),
}));

/**
 * Draws the ground of each generated chunk once: nebula tint and tile grid. Chunks never change after
 * generation (resources are immutable, architecture §9), so a chunk is drawn when its event arrives.
 */
export class ChunkLayer {
    public readonly container = new Container();
    private readonly drawnChunks = new Map<string, Graphics>();

    public drawChunk(view: SimView, chunk: ChunkCoord): void {
        const key = chunkKey(chunk);
        if (this.drawnChunks.has(key)) {
            return;
        }
        const graphics = new Graphics();
        const origin = chunkToTileOrigin(chunk);
        graphics.position.set(origin.x, origin.y);
        drawNebula(graphics, view, chunk);
        drawGrid(graphics);
        this.container.addChild(graphics);
        this.drawnChunks.set(key, graphics);
    }

    /**
     * Hides chunks outside the visible world rectangle, so exploring far does not make every frame slower.
     * @param topLeft Top-left corner of the view in tiles.
     * @param bottomRight Bottom-right corner of the view in tiles.
     */
    public cull(topLeft: WorldPoint, bottomRight: WorldPoint): void {
        for (const graphics of this.drawnChunks.values()) {
            graphics.visible =
                graphics.x + CHUNK_SIZE > topLeft.x &&
                graphics.x < bottomRight.x &&
                graphics.y + CHUNK_SIZE > topLeft.y &&
                graphics.y < bottomRight.y;
        }
    }

    /** Forgets everything and draws every chunk the simulation has (after a load or a new world). */
    public redrawAll(view: SimView): void {
        for (const graphics of this.drawnChunks.values()) {
            graphics.destroy();
        }
        this.drawnChunks.clear();
        for (const chunk of view.getChunkCoords()) {
            this.drawChunk(view, chunk);
        }
    }
}

function drawNebula(graphics: Graphics, view: SimView, chunk: ChunkCoord): void {
    const origin = chunkToTileOrigin(chunk);
    for (const local of LOCAL_TILES) {
        const resourceId = view.getResourceIdAt({ x: origin.x + local.x, y: origin.y + local.y });
        if (resourceId === RESOURCE_ID_NONE) {
            continue;
        }
        const tint = resourceTint(getResourceDefinitionById(resourceId).key);
        graphics.rect(local.x, local.y, 1, 1).fill(tint);
    }
}

function drawGrid(graphics: Graphics): void {
    for (let line = 1; line < CHUNK_SIZE; line++) {
        graphics.moveTo(line, 0).lineTo(line, CHUNK_SIZE);
        graphics.moveTo(0, line).lineTo(CHUNK_SIZE, line);
    }
    graphics.stroke({ color: GRID_COLOR, width: 1, pixelLine: true });
    graphics
        .rect(0, 0, CHUNK_SIZE, CHUNK_SIZE)
        .stroke({ color: CHUNK_BORDER_COLOR, width: 1, pixelLine: true });
}
