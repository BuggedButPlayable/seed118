/**
 * Browser entry point: wires simulation, view, input and loop together.
 */

import { Camera, WorldRenderer } from '@seed118/render';
import { CameraControls, GameLoop } from '@seed118/runtime';
import { SimWorld } from '@seed118/sim';

/** M1 always starts the same world; picking a seed comes later. */
const NEW_WORLD_SEED = 118;
/** Middle of the 2×2 Core at the origin. */
const START_VIEW_CENTER = { x: 1, y: 1 };

async function startGame(host: HTMLElement): Promise<void> {
    const sim = new SimWorld();
    sim.startNewWorld(NEW_WORLD_SEED);

    const renderer = await WorldRenderer.create(host);
    renderer.rebuild(sim);
    const camera = new Camera(START_VIEW_CENTER);
    const controls = new CameraControls({
        canvas: renderer.canvas,
        camera,
        viewportSize: () => renderer.viewportSize(),
        isLeftDragPan: () => true,
    });
    new GameLoop({ sim, renderer, camera, controls }).start();
}

const host = document.getElementById('game');
if (!host) {
    throw new Error('Missing #game element.');
}
void startGame(host);
