/**
 * View-local camera: where the player looks and how close. Pure math, no PixiJS, so it is easy to test.
 * World units are tiles: tile (x, y) covers [x, x + 1) × [y, y + 1).
 */

import type { TileCoord } from '@seed118/sim';

import type { WorldPoint } from './tile_geometry';

export interface ScreenPoint {
    x: number;
    y: number;
}

export interface ViewportSize {
    width: number;
    height: number;
}

/** Screen pixels per tile. The minimum keeps the view inside the chunks the simulation generates. */
export const MIN_ZOOM = 24;
export const MAX_ZOOM = 128;
export const DEFAULT_ZOOM = 48;

export class Camera {
    private centerX: number;
    private centerY: number;
    private zoomLevel = DEFAULT_ZOOM;

    constructor(center: WorldPoint) {
        this.centerX = center.x;
        this.centerY = center.y;
    }

    public get zoom(): number {
        return this.zoomLevel;
    }

    /** The world point in the middle of the screen, in tiles. */
    public get center(): WorldPoint {
        return { x: this.centerX, y: this.centerY };
    }

    /** The tile in the middle of the screen. */
    public centerTile(): TileCoord {
        return { x: Math.floor(this.centerX), y: Math.floor(this.centerY) };
    }

    /** Moves the view so the world follows a drag of `delta` screen pixels. */
    public panByScreen(delta: ScreenPoint): void {
        this.centerX -= delta.x / this.zoomLevel;
        this.centerY -= delta.y / this.zoomLevel;
    }

    /** Zooms by `factor` while keeping the world point under `anchor` where it is on screen. */
    public zoomAt(anchor: ScreenPoint, factor: number, viewport: ViewportSize): void {
        const before = this.screenToWorld(anchor, viewport);
        this.zoomLevel = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, this.zoomLevel * factor));
        const after = this.screenToWorld(anchor, viewport);
        this.centerX += before.x - after.x;
        this.centerY += before.y - after.y;
    }

    /** Converts a screen pixel to a world point in tiles (fractional). */
    public screenToWorld(point: ScreenPoint, viewport: ViewportSize): WorldPoint {
        return {
            x: this.centerX + (point.x - viewport.width / 2) / this.zoomLevel,
            y: this.centerY + (point.y - viewport.height / 2) / this.zoomLevel,
        };
    }

    /** The tile under a screen pixel. */
    public screenToTile(point: ScreenPoint, viewport: ViewportSize): TileCoord {
        const world = this.screenToWorld(point, viewport);
        return { x: Math.floor(world.x), y: Math.floor(world.y) };
    }

    /** Where world (0, 0) lands on screen; with `zoom` as scale this is the world layer's transform. */
    public worldOrigin(viewport: ViewportSize): ScreenPoint {
        return {
            x: viewport.width / 2 - this.centerX * this.zoomLevel,
            y: viewport.height / 2 - this.centerY * this.zoomLevel,
        };
    }
}
