import type { BuildPreview, Camera, ViewportSize } from '@seed118/render';
import { isSameCoord } from '@seed118/sim';
import type { SimCommandQueue, TileCoord } from '@seed118/sim';
import type { ToolState } from '@seed118/ui';

const LEFT_BUTTON = 0;

export interface BuildInputOptions {
    canvas: HTMLCanvasElement;
    camera: Camera;
    viewportSize: () => ViewportSize;
    tools: ToolState;
    commands: SimCommandQueue;
}

/**
 * Turns mouse input on the map into commands for the active tool. Holding the left button and dragging
 * applies the tool to every tile the cursor enters (draws belt lines). Right click puts the tool away.
 */
export class BuildInput {
    private hoverTile: TileCoord | null = null;
    private paintingPointerId: number | null = null;
    private lastPaintedTile: TileCoord | null = null;

    constructor(private readonly options: BuildInputOptions) {
        const { canvas } = options;
        canvas.addEventListener('pointermove', this.onPointerMove);
        canvas.addEventListener('pointerdown', this.onPointerDown);
        canvas.addEventListener('pointerup', this.onPointerUp);
        canvas.addEventListener('pointerleave', this.onPointerLeave);
        canvas.addEventListener('contextmenu', this.onContextMenu);
    }

    /** What the active tool would do at the hovered tile, for the ghost. */
    public preview(): BuildPreview | null {
        const tool = this.options.tools.tool;
        if (this.hoverTile === null || tool.kind === 'none') {
            return null;
        }
        if (tool.kind === 'remove') {
            return { kind: 'remove', tile: this.hoverTile };
        }
        return {
            kind: 'place',
            request: {
                definitionId: tool.definitionId,
                coord: this.hoverTile,
                rotation: this.options.tools.rotation,
            },
        };
    }

    private readonly onPointerMove = (event: PointerEvent): void => {
        this.hoverTile = this.tileUnder(event);
        if (event.pointerId === this.paintingPointerId) {
            this.applyToolAt(this.hoverTile);
        }
    };

    private readonly onPointerDown = (event: PointerEvent): void => {
        if (event.button !== LEFT_BUTTON || this.options.tools.tool.kind === 'none') {
            return;
        }
        this.paintingPointerId = event.pointerId;
        this.lastPaintedTile = null;
        this.options.canvas.setPointerCapture(event.pointerId);
        this.applyToolAt(this.tileUnder(event));
    };

    private readonly onPointerUp = (event: PointerEvent): void => {
        if (event.pointerId === this.paintingPointerId) {
            this.paintingPointerId = null;
        }
    };

    private readonly onPointerLeave = (): void => {
        this.hoverTile = null;
    };

    private readonly onContextMenu = (event: MouseEvent): void => {
        event.preventDefault();
        this.options.tools.clear();
    };

    /** Applies the tool once per tile, so a drag does not repeat commands on the same tile. */
    private applyToolAt(tile: TileCoord): void {
        if (this.lastPaintedTile && isSameCoord(this.lastPaintedTile, tile)) {
            return;
        }
        this.lastPaintedTile = tile;
        const command = this.options.tools.commandAt(tile);
        if (command) {
            this.options.commands.enqueueCommand(command);
        }
    }

    private tileUnder(event: PointerEvent): TileCoord {
        return this.options.camera.screenToTile(
            { x: event.offsetX, y: event.offsetY },
            this.options.viewportSize(),
        );
    }
}
