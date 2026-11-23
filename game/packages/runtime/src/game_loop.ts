import { CommandType, SIM_TICKS_PER_SECOND, tileToChunk } from '@seed118/sim';
import type { ChunkCoord, Event, SimCommandQueue, SimWorld } from '@seed118/sim';
import type { BuildPreview, Camera, WorldRenderer } from '@seed118/render';

import type { CameraControls } from './camera_controls';
import { FixedStepClock } from './fixed_step_clock';

const MS_PER_SECOND = 1000;
const STEP_MS = MS_PER_SECOND / SIM_TICKS_PER_SECOND;
/** At most a quarter second of catch-up per frame. */
const MAX_STEPS_PER_FRAME = 5;

export interface GameLoopOptions {
    sim: SimWorld;
    renderer: WorldRenderer;
    camera: Camera;
    controls: CameraControls;
    /** Player intent for the next tick, filled by input and UI. */
    commands: SimCommandQueue;
    /** The ghost to draw this frame. */
    preview: () => BuildPreview | null;
}

/**
 * Browser frame loop: runs the simulation at its fixed rate, keeps the simulation's focus chunk under the
 * camera, and draws a frame. All player intent reaches the simulation as commands (architecture §3).
 */
export class GameLoop {
    private readonly clock = new FixedStepClock(STEP_MS, MAX_STEPS_PER_FRAME);
    private lastFrameMs: number | null = null;
    private focusChunk: ChunkCoord | null = null;

    constructor(private readonly options: GameLoopOptions) {}

    public start(): void {
        requestAnimationFrame(this.frame);
    }

    private readonly frame = (nowMs: number): void => {
        const elapsedMs = this.lastFrameMs === null ? 0 : nowMs - this.lastFrameMs;
        this.lastFrameMs = nowMs;

        this.options.controls.update(elapsedMs / MS_PER_SECOND);
        this.followCamera();
        const steps = this.clock.takeDueSteps(elapsedMs);
        for (let step = 0; step < steps; step++) {
            this.tickOnce();
        }
        this.options.renderer.draw(this.options.sim, this.options.camera, this.options.preview());
        requestAnimationFrame(this.frame);
    };

    private tickOnce(): void {
        const events: Event[] = [];
        this.options.sim.tick(this.options.commands.drainCommands(), events);
        this.options.renderer.applyEvents(this.options.sim, events);
    }

    /** Asks the simulation to generate chunks around the camera whenever it enters a new chunk. */
    private followCamera(): void {
        const chunk = tileToChunk(this.options.camera.centerTile());
        if (this.focusChunk?.x === chunk.x && this.focusChunk.y === chunk.y) {
            return;
        }
        this.focusChunk = chunk;
        this.options.commands.enqueueCommand({ type: CommandType.SetFocusChunk, coord: chunk });
    }
}
