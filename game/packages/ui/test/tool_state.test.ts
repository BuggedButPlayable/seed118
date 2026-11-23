import { CommandType, getStructureDefinitionByKey } from '@seed118/sim';
import { describe, expect, it } from 'vitest';

import { ToolState } from '../src/tool_state';

const BELT = getStructureDefinitionByKey('belt');
const CORE = getStructureDefinitionByKey('core');
const TILE = { x: 3, y: -2 };

describe('ToolState', () => {
    it('turns clicks into nothing, place or remove commands depending on the tool', () => {
        const tools = new ToolState();
        expect(tools.commandAt(TILE)).toBeNull();

        tools.toggle({ kind: 'place', definitionId: BELT.id });
        tools.rotate();
        expect(tools.commandAt(TILE)).toEqual({
            type: CommandType.PlaceStructure,
            definitionId: BELT.id,
            coord: TILE,
            rotation: 1,
        });

        tools.toggle({ kind: 'remove' });
        expect(tools.commandAt(TILE)).toEqual({ type: CommandType.RemoveStructure, coord: TILE });
    });

    it('toggling the active tool again puts it away', () => {
        const tools = new ToolState();

        tools.toggle({ kind: 'place', definitionId: BELT.id });
        tools.toggle({ kind: 'place', definitionId: BELT.id });

        expect(tools.tool).toEqual({ kind: 'none' });
    });

    it('rotates clockwise and wraps, but only rotatable structures', () => {
        const tools = new ToolState();
        tools.toggle({ kind: 'place', definitionId: BELT.id });
        for (let turn = 0; turn < 5; turn++) {
            tools.rotate();
        }
        expect(tools.rotation).toBe(1);

        tools.toggle({ kind: 'place', definitionId: CORE.id });
        tools.rotate();
        expect(tools.rotation).toBe(1);
    });

    it('tells listeners about every change', () => {
        const tools = new ToolState();
        let changes = 0;
        tools.onChange(() => {
            changes += 1;
        });

        tools.toggle({ kind: 'remove' });
        tools.clear();

        expect(changes).toBe(2);
    });
});
