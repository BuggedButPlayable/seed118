import type { BuildPreview, Camera, ViewportSize } from '@seed118/render';
import { isSameCoord } from '@seed118/sim';
import type { Command, SimCommandQueue, TileCoord } from '@seed118/sim';
import { BeltDrag, isBeltDefinition } from '@seed118/ui';
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
 * Turns mouse input on the map into commands for the active tool. Dragging applies the tool to every tile
 * the cursor enters; with a belt it draws a line that follows the drag and bends with curves.
 * Right click puts the tool away (and drops an unfinished belt line).
 */
export class BuildInput {
    private hoverTile: TileCoord | null = null;
    private paintingPointerId: number | null = null;
    private lastPaintedTile: TileCoord | null = null;
    private beltDrag: BeltDrag | null = null;

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
        if (this.beltDrag) {
            return { kind: 'place', request: this.beltDrag.pendingPlacement(this.options.tools.rotation) };
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
        if (event.pointerId !== this.paintingPointerId) {
            return;
        }
        if (this.beltDrag) {
            this.enqueueAll(this.beltDrag.moveTo(this.hoverTile));
            return;
        }
        this.applyToolAt(this.hoverTile);
    };

    private readonly onPointerDown = (event: PointerEvent): void => {
        if (event.button !== LEFT_BUTTON || this.options.tools.tool.kind === 'none') {
            return;
        }
        this.paintingPointerId = event.pointerId;
        this.lastPaintedTile = null;
        this.options.canvas.setPointerCapture(event.pointerId);
        const tool = this.options.tools.tool;
        if (tool.kind === 'place' && isBeltDefinition(tool.definitionId)) {
            this.beltDrag = new BeltDrag(this.tileUnder(event));
            return;
        }
        this.applyToolAt(this.tileUnder(event));
    };

    private readonly onPointerUp = (event: PointerEvent): void => {
        if (event.pointerId !== this.paintingPointerId) {
            return;
        }
        this.paintingPointerId = null;
        if (this.beltDrag) {
            this.enqueueAll(this.beltDrag.finish(this.options.tools.rotation));
            this.beltDrag = null;
        }
    };

    private readonly onPointerLeave = (): void => {
        this.hoverTile = null;
    };

    private readonly onContextMenu = (event: MouseEvent): void => {
        event.preventDefault();
        this.beltDrag = null;
        this.paintingPointerId = null;
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

    private enqueueAll(commands: readonly Command[]): void {
        for (const command of commands) {
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
