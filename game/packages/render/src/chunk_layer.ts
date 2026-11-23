import { CHUNK_SIZE, RESOURCE_ID_NONE, getResourceDefinitionById } from '@seed118/sim';
import type { ChunkCoord, TileCoord } from '@seed118/sim';
import { Container, Graphics } from 'pixi.js';

import { CHUNK_BORDER_COLOR, GRID_COLOR, resourceTint } from './palette';
import type { SimView } from './sim_view';

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
        const key = `${chunk.x},${chunk.y}`;
        if (this.drawnChunks.has(key)) {
            return;
        }
        const graphics = new Graphics();
        graphics.position.set(chunk.x * CHUNK_SIZE, chunk.y * CHUNK_SIZE);
        drawNebula(graphics, view, chunk);
        drawGrid(graphics);
        this.container.addChild(graphics);
        this.drawnChunks.set(key, graphics);
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
    for (const local of LOCAL_TILES) {
        const resourceId = view.getResourceIdAt({
            x: chunk.x * CHUNK_SIZE + local.x,
            y: chunk.y * CHUNK_SIZE + local.y,
        });
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
