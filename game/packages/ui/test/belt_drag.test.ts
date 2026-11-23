import { CommandType, getStructureDefinitionByKey } from '@seed118/sim';
import type { Command } from '@seed118/sim';
import { describe, expect, it } from 'vitest';

import { BeltDrag, chooseBelt, isBeltDefinition } from '../src/belt_drag';

const BELT = getStructureDefinitionByKey('belt');
const TURN_LEFT = getStructureDefinitionByKey('belt_turn_left');
const TURN_RIGHT = getStructureDefinitionByKey('belt_turn_right');
const NORTH = 0;
const EAST = 1;
const SOUTH = 2;
const WEST = 3;

/** Placed belts as "x,y:key/rotation" for compact expectations. */
function describePlacements(commands: readonly Command[]): string[] {
    return commands.map((command) => {
        if (command.type !== CommandType.PlaceStructure) {
            throw new Error('Expected only placements.');
        }
        const key = [BELT, TURN_LEFT, TURN_RIGHT].find(
            (definition) => definition.id === command.definitionId,
        )?.key;
        return `${command.coord.x},${command.coord.y}:${key}/${command.rotation}`;
    });
}

describe('chooseBelt', () => {
    it('picks a straight belt for opposite sides and a curve for a bend', () => {
        expect(chooseBelt(NORTH, SOUTH)).toEqual({ definitionId: BELT.id, rotation: 0 });
        expect(chooseBelt(EAST, WEST)).toEqual({ definitionId: BELT.id, rotation: 1 });
        expect(chooseBelt(EAST, SOUTH)).toEqual({ definitionId: TURN_LEFT.id, rotation: 0 });
        expect(chooseBelt(WEST, SOUTH)).toEqual({ definitionId: TURN_RIGHT.id, rotation: 0 });
    });

    it('has no answer for in and out on the same side', () => {
        expect(chooseBelt(NORTH, NORTH)).toBeNull();
    });
});

describe('BeltDrag', () => {
    it('lays a straight line in the drag direction, the last tile on release', () => {
        const drag = new BeltDrag({ x: 0, y: 0 });

        const placed = [...drag.moveTo({ x: 3, y: 0 }), ...drag.finish(0)];

        expect(describePlacements(placed)).toEqual(['0,0:belt/3', '1,0:belt/3', '2,0:belt/3', '3,0:belt/3']);
    });

    it('puts a curve where the line bends', () => {
        const drag = new BeltDrag({ x: 0, y: 0 });

        const placed = [...drag.moveTo({ x: 2, y: 0 }), ...drag.moveTo({ x: 2, y: 2 }), ...drag.finish(0)];

        // East along the row, then south: the corner takes items from the west and passes them south.
        expect(describePlacements(placed)).toEqual([
            '0,0:belt/3',
            '1,0:belt/3',
            '2,0:belt_turn_right/0',
            '2,1:belt/0',
            '2,2:belt/0',
        ]);
    });

    it('a click without moving places one belt with the preview rotation', () => {
        expect(describePlacements(new BeltDrag({ x: 5, y: 5 }).finish(2))).toEqual(['5,5:belt/2']);
    });

    it('ignores dragging back over the line', () => {
        const drag = new BeltDrag({ x: 0, y: 0 });
        drag.moveTo({ x: 1, y: 0 });

        expect(drag.moveTo({ x: 0, y: 0 })).toEqual([]);
        expect(drag.pendingPlacement(0).coord).toEqual({ x: 1, y: 0 });
    });

    it('knows which definitions are belts', () => {
        expect(isBeltDefinition(TURN_LEFT.id)).toBe(true);
        expect(isBeltDefinition(getStructureDefinitionByKey('collector').id)).toBe(false);
    });
});
