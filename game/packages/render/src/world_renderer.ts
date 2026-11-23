import { EventType, getStructureDefinitionByKey } from '@seed118/sim';
import type { Event } from '@seed118/sim';
import { Application, Container } from 'pixi.js';

import type { Camera, ViewportSize } from './camera';
import { ChunkLayer } from './chunk_layer';
import { ItemLayer } from './item_layer';
import { PreviewLayer } from './preview_layer';
import type { BuildPreview } from './preview_layer';
import { StructureLayer } from './structure_layer';
import { SPACE_COLOR } from './palette';
import type { SimView } from './sim_view';

/** Everything a frame needs besides the simulation. */
export interface FrameState {
    camera: Camera;
    preview: BuildPreview | null;
    stepProgress: number;
}

/**
 * Owns the PixiJS application and projects simulation snapshots onto the screen.
 * It only reads the simulation (architecture §3: the view is read-only).
 */
export class WorldRenderer {
    private readonly world = new Container();
    private readonly chunkLayer = new ChunkLayer();
    private readonly structureLayer = new StructureLayer();
    private readonly itemLayer = new ItemLayer();
    private readonly previewLayer = new PreviewLayer();

    private constructor(private readonly app: Application) {
        this.world.addChild(
            this.chunkLayer.container,
            this.structureLayer.container,
            this.itemLayer.graphics,
            this.previewLayer.graphics,
        );
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
            this.applyEvent(view, event);
        }
    }

    /**
     * Draws one frame from the camera's point of view, with the ghost of the active tool.
     * `frame.stepProgress` (0..1, progress towards the next tick) lets items glide between ticks.
     */
    public draw(view: SimView, frame: FrameState): void {
        const { camera } = frame;
        this.itemLayer.update(view, frame.stepProgress);
        this.previewLayer.update(view, frame.preview);
        const viewport = this.viewportSize();
        this.chunkLayer.cull(
            camera.screenToWorld({ x: 0, y: 0 }, viewport),
            camera.screenToWorld({ x: viewport.width, y: viewport.height }, viewport),
        );
        const origin = camera.worldOrigin(viewport);
        this.world.position.set(origin.x, origin.y);
        this.world.scale.set(camera.zoom);
        this.app.render();
    }

    /** Rebuilds the whole view from snapshots (on WorldLoaded: a new world or a load). */
    private rebuild(view: SimView): void {
        this.chunkLayer.redrawAll(view);
        this.structureLayer.redrawAll(view);
    }

    private applyEvent(view: SimView, event: Event): void {
        switch (event.type) {
            case EventType.WorldLoaded:
                this.rebuild(view);
                return;
            case EventType.ChunkGenerated:
                this.chunkLayer.drawChunk(view, event.coord);
                return;
            case EventType.StructurePlaced:
                this.structureLayer.add(event.structureId, {
                    definition: getStructureDefinitionByKey(event.structureKey),
                    anchor: event.structureCoord,
                    rotation: event.structureRotation,
                });
                return;
            case EventType.StructureRemoved:
                this.structureLayer.remove(event.structureId);
                return;
            // Nothing to draw for these (yet); the HUD reads deliveries itself.
            case EventType.CommandRejected:
            case EventType.Delivered:
            case EventType.FocusChunkUpdated:
            case EventType.TickAdvanced:
                return;
        }
    }
}
