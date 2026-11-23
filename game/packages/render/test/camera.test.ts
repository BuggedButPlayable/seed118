import { describe, expect, it } from 'vitest';

import { Camera, DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM } from '../src/camera';

const VIEWPORT = { width: 800, height: 600 };
const SCREEN_MIDDLE = { x: 400, y: 300 };

describe('Camera', () => {
    it('maps the screen middle to its center and finds the tile under a pixel', () => {
        const camera = new Camera({ x: 1, y: 1 });

        expect(camera.screenToWorld(SCREEN_MIDDLE, VIEWPORT)).toEqual({ x: 1, y: 1 });
        expect(camera.screenToTile({ x: 400 - DEFAULT_ZOOM / 2, y: 300 }, VIEWPORT)).toEqual({ x: 0, y: 1 });
        expect(camera.centerTile()).toEqual({ x: 1, y: 1 });
    });

    it('pans so the world follows the drag', () => {
        const camera = new Camera({ x: 0, y: 0 });

        camera.panByScreen({ x: DEFAULT_ZOOM, y: -2 * DEFAULT_ZOOM });

        expect(camera.center).toEqual({ x: -1, y: 2 });
    });

    it('zooms around the anchor: the world point under the cursor stays put', () => {
        const camera = new Camera({ x: 5, y: 5 });
        const cursor = { x: 700, y: 100 };
        const before = camera.screenToWorld(cursor, VIEWPORT);

        camera.zoomAt(cursor, 1.5, VIEWPORT);

        expect(camera.zoom).toBe(DEFAULT_ZOOM * 1.5);
        const after = camera.screenToWorld(cursor, VIEWPORT);
        expect(after.x).toBeCloseTo(before.x);
        expect(after.y).toBeCloseTo(before.y);
    });

    it('clamps the zoom', () => {
        const camera = new Camera({ x: 0, y: 0 });

        camera.zoomAt(SCREEN_MIDDLE, 1000, VIEWPORT);
        expect(camera.zoom).toBe(MAX_ZOOM);
        camera.zoomAt(SCREEN_MIDDLE, 0.0001, VIEWPORT);
        expect(camera.zoom).toBe(MIN_ZOOM);
    });

    it('worldOrigin puts the center in the screen middle', () => {
        const camera = new Camera({ x: 2, y: 3 });
        const origin = camera.worldOrigin(VIEWPORT);

        expect(origin.x + 2 * camera.zoom).toBe(SCREEN_MIDDLE.x);
        expect(origin.y + 3 * camera.zoom).toBe(SCREEN_MIDDLE.y);
    });
});
