import {
    CommandType,
    computeWorldPorts,
    getStructureDefinitionByKey,
    isSameCoord,
    neighbourAcross,
    oppositeSide,
} from '@seed118/sim';
import type { Command, PlacementRequest, Rotation, Side, TileCoord } from '@seed118/sim';

/** The belt variants a dragged line is made of: straight and both curves. */
const BELT_KEYS = ['belt', 'belt_turn_left', 'belt_turn_right'] as const;
const ROTATIONS: readonly Rotation[] = [0, 1, 2, 3];
const SIDES: readonly Side[] = [0, 1, 2, 3];

/** The tile the drag is on, waiting until we know where the line goes next. */
interface PendingBelt {
    tile: TileCoord;
    /** Side the items come in from; null for the first tile until the drag moves. */
    inSide: Side | null;
}

/** Whether a definition id is one of the belt variants (so dragging it draws lines with curves). */
export function isBeltDefinition(definitionId: number): boolean {
    return BELT_KEYS.some((key) => getStructureDefinitionByKey(key).id === definitionId);
}

/**
 * The belt variant and rotation that takes items in on `inSide` and passes them out on `outSide`
 * (world sides). Found from the definitions' own ports, so it follows any change to them.
 * @returns null if no variant fits (e.g. in and out on the same side).
 */
export function chooseBelt(inSide: Side, outSide: Side): Omit<PlacementRequest, 'coord'> | null {
    for (const key of BELT_KEYS) {
        const definition = getStructureDefinitionByKey(key);
        const rotation = ROTATIONS.find((candidate) =>
            hasPorts(definition.ports, candidate, inSide, outSide),
        );
        if (rotation !== undefined) {
            return { definitionId: definition.id, rotation };
        }
    }
    return null;
}

/**
 * Plans a belt line while the player drags. A tile's belt is only placed once the next tile is known,
 * so straight pieces and curves come out right without removing anything already placed.
 */
export class BeltDrag {
    private pending: PendingBelt;

    constructor(start: TileCoord) {
        this.pending = { tile: start, inSide: null };
    }

    /**
     * The belt the pending tile gets if the line ends here: straight on, or `rotation` if the drag has not moved.
     * Used for the ghost and for the last tile on release.
     */
    public pendingPlacement(rotation: Rotation): PlacementRequest {
        const { tile, inSide } = this.pending;
        const continued = inSide === null ? null : chooseBelt(inSide, oppositeSide(inSide));
        const belt = continued ?? { definitionId: getStructureDefinitionByKey('belt').id, rotation };
        return { coord: tile, ...belt };
    }

    /** Follows the cursor to `tile`, one tile step at a time. @returns Commands for tiles now settled. */
    public moveTo(tile: TileCoord): Command[] {
        const commands: Command[] = [];
        for (const next of stepsBetween(this.pending.tile, tile)) {
            const direction = sideTowards(this.pending.tile, next);
            if (direction === this.pending.inSide) {
                break; // dragging back over the line: ignore until the cursor turns around
            }
            commands.push(...this.settle(this.pending.inSide ?? oppositeSide(direction), direction));
            this.pending = { tile: next, inSide: oppositeSide(direction) };
        }
        return commands;
    }

    /** Ends the drag. @returns The command for the last tile. */
    public finish(rotation: Rotation): Command[] {
        return [{ type: CommandType.PlaceStructure, ...this.pendingPlacement(rotation) }];
    }

    private settle(inSide: Side, outSide: Side): Command[] {
        const belt = chooseBelt(inSide, outSide);
        return belt ? [{ type: CommandType.PlaceStructure, coord: this.pending.tile, ...belt }] : [];
    }
}

function hasPorts(
    ports: Parameters<typeof computeWorldPorts>[2],
    rotation: Rotation,
    inSide: Side,
    outSide: Side,
): boolean {
    const placed = computeWorldPorts({ x: 0, y: 0 }, rotation, ports);
    const hasInput = placed.some((port) => port.type === 'input' && port.side === inSide);
    const hasOutput = placed.some((port) => port.type === 'output' && port.side === outSide);
    return hasInput && hasOutput;
}

/** Side of `from` that faces the neighbouring tile `to`. */
function sideTowards(from: TileCoord, to: TileCoord): Side {
    const side = SIDES.find((candidate) => isSameCoord(neighbourAcross(from, candidate), to));
    if (side === undefined) {
        throw new Error(`Tiles are not neighbours: ${JSON.stringify(from)} → ${JSON.stringify(to)}`);
    }
    return side;
}

/** Neighbour-by-neighbour path from `from` (excluded) to `to` (included): first along x, then along y. */
function stepsBetween(from: TileCoord, to: TileCoord): TileCoord[] {
    const steps: TileCoord[] = [];
    let current = from;
    while (!isSameCoord(current, to)) {
        current =
            current.x === to.x
                ? { x: current.x, y: current.y + Math.sign(to.y - current.y) }
                : { x: current.x + Math.sign(to.x - current.x), y: current.y };
        steps.push(current);
    }
    return steps;
}
