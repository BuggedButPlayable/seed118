import { CommandType, getStructureDefinitionById } from '@seed118/sim';
import type { Command, DefId, Rotation, TileCoord } from '@seed118/sim';

/** What a click on the map does. */
export type BuildTool = { kind: 'none' } | { kind: 'place'; definitionId: DefId } | { kind: 'remove' };

const NEXT_ROTATION: Readonly<Record<Rotation, Rotation>> = { 0: 1, 1: 2, 2: 3, 3: 0 };

/**
 * Local tool state of the UI (architecture §3: UI may keep it): the selected tool and the preview rotation.
 * The rotation is committed only through the place command (architecture §7).
 */
export class ToolState {
    private selectedTool: BuildTool = { kind: 'none' };
    private previewRotation: Rotation = 0;
    private readonly listeners: (() => void)[] = [];

    public get tool(): BuildTool {
        return this.selectedTool;
    }

    public get rotation(): Rotation {
        return this.previewRotation;
    }

    public isActive(tool: BuildTool): boolean {
        return isSameTool(tool, this.selectedTool);
    }

    /** Selects a tool; selecting the active place or remove tool again puts the tool away. */
    public toggle(tool: BuildTool): void {
        this.selectedTool = isSameTool(tool, this.selectedTool) ? { kind: 'none' } : tool;
        this.notify();
    }

    public clear(): void {
        this.selectedTool = { kind: 'none' };
        this.notify();
    }

    /** Turns the preview a quarter turn clockwise, if the selected structure can rotate. */
    public rotate(): void {
        if (this.selectedTool.kind !== 'place') {
            return;
        }
        if (!getStructureDefinitionById(this.selectedTool.definitionId).rotatable) {
            return;
        }
        this.previewRotation = NEXT_ROTATION[this.previewRotation];
        this.notify();
    }

    /** The command a click on `tile` stands for, or null while no tool is selected. */
    public commandAt(tile: TileCoord): Command | null {
        switch (this.selectedTool.kind) {
            case 'none':
                return null;
            case 'remove':
                return { type: CommandType.RemoveStructure, coord: tile };
            case 'place':
                return {
                    type: CommandType.PlaceStructure,
                    definitionId: this.selectedTool.definitionId,
                    coord: tile,
                    rotation: this.previewRotation,
                };
        }
    }

    /** Calls `listener` whenever the tool or the rotation changes. */
    public onChange(listener: () => void): void {
        this.listeners.push(listener);
    }

    private notify(): void {
        for (const listener of this.listeners) {
            listener();
        }
    }
}

function isSameTool(left: BuildTool, right: BuildTool): boolean {
    if (left.kind === 'place' && right.kind === 'place') {
        return left.definitionId === right.definitionId;
    }
    return left.kind === right.kind;
}
