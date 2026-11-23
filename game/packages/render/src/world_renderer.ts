import { EventType } from '@seed118/sim';
import type { Event } from '@seed118/sim';
import { Application, Container } from 'pixi.js';

import type { Camera, ViewportSize } from './camera';
import { ChunkLayer } from './chunk_layer';
import { SPACE_COLOR } from './palette';
import type { SimView } from './sim_view';

/**
 * Owns the PixiJS application and projects simulation snapshots onto the screen.
 * It only reads the simulation (architecture §3: the view is read-only).
 */
export class WorldRenderer {
    private readonly world = new Container();
    private readonly chunkLayer = new ChunkLayer();

    private constructor(private readonly app: Application) {
        this.world.addChild(this.chunkLayer.container);
        this.app.stage.addChild(this.world);
    }

    /** Creates the canvas inside `host` and sizes it to the host. */
    public static async create(host: HTMLElement): Promise<WorldRenderer> {
        const app = new Application();
        // The runtime drives frames itself, so PixiJS must not run its own loop.
        await app.init({ resizeTo: host, background: SPACE_COLOR, antialias: true, autoStart: false });
        host.appendChild(app.canvas);
        return new WorldRenderer(app);
    }

    public get canvas(): HTMLCanvasElement {
        return this.app.canvas;
    }

    public viewportSize(): ViewportSize {
        return { width: this.app.screen.width, height: this.app.screen.height };
    }

    /** Updates the view from the events of one simulation tick. */
    public applyEvents(view: SimView, events: readonly Event[]): void {
        for (const event of events) {
            if (event.type === EventType.ChunkGenerated) {
                this.chunkLayer.drawChunk(view, event.coord);
            }
        }
    }

    /** Rebuilds the whole view from snapshots, e.g. after a new world or a load. */
    public rebuild(view: SimView): void {
        this.chunkLayer.redrawAll(view);
    }

    /** Draws one frame from the camera's point of view. */
    public draw(camera: Camera): void {
        const origin = camera.worldOrigin(this.viewportSize());
        this.world.position.set(origin.x, origin.y);
        this.world.scale.set(camera.zoom);
        this.app.render();
    }
}
