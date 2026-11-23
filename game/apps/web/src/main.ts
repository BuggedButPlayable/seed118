/**
 * Browser entry point: wires simulation, view, UI, input, loop and saving together.
 */

import { Camera, WorldRenderer } from '@seed118/render';
import {
    BROKEN_SAVE_STORAGE_KEY,
    BuildInput,
    CameraControls,
    GameLoop,
    SaveStorage,
    startAutosave,
} from '@seed118/runtime';
import { DEFAULT_WORLD_SEED, SimCommandQueue, SimWorld } from '@seed118/sim';
import { BuildBar, DeliveryCounter, ToolState, WorldMenu } from '@seed118/ui';

/** Middle of the 2×2 Core at the origin. */
const START_VIEW_CENTER = { x: 1, y: 1 };

async function startGame(host: HTMLElement): Promise<void> {
    const sim = new SimWorld();
    const saves = new SaveStorage(window.localStorage);
    const restored = saves.restoreInto(sim);
    // M1 always starts the same world; picking a seed comes later.
    if (restored.kind !== 'loaded') {
        sim.startNewWorld(DEFAULT_WORLD_SEED);
    }

    const renderer = await WorldRenderer.create(host);
    const camera = new Camera(START_VIEW_CENTER);
    const commands = new SimCommandQueue();
    const tools = new ToolState();
    new BuildBar(tools).mount(host);
    const deliveryCounter = new DeliveryCounter();
    deliveryCounter.mount(host);
    const worldMenu = new WorldMenu();
    worldMenu.mount(host);

    const viewportSize = renderer.viewportSize.bind(renderer);
    const controls = new CameraControls({
        canvas: renderer.canvas,
        camera,
        viewportSize,
        isLeftDragPan: () => tools.tool.kind === 'none',
    });
    const buildInput = new BuildInput({ canvas: renderer.canvas, camera, viewportSize, tools, commands });
    const loop = new GameLoop({
        sim,
        renderer,
        camera,
        controls,
        commands,
        preview: () => buildInput.preview(),
        deliveryCounter,
    });

    worldMenu.onNewWorld(() => {
        // Intent queued for the old world must not land in the new one.
        commands.drainCommands();
        saves.clear();
        sim.startNewWorld(DEFAULT_WORLD_SEED);
    });
    if (restored.kind === 'broken') {
        worldMenu.showNotice(
            `The saved world could not be loaded (${restored.reason}). A new world was started; ` +
                `the old save is kept in browser storage under "${BROKEN_SAVE_STORAGE_KEY}".`,
        );
    }
    startAutosave(sim, saves);
    loop.start();
}

const host = document.getElementById('game');
if (!host) {
    throw new Error('Missing #game element.');
}
void startGame(host);
