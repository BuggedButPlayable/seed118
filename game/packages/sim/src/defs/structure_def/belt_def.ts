import type { StructureDefinition } from '../../types/structure';

export const BELT_DEFINITION: StructureDefinition = {
    id: 2,
    key: 'belt',
    footprint: [{ x: 0, y: 0 }],
    ports: [
        { tile: { x: 0, y: 0 }, side: 0, type: 'input' },
        { tile: { x: 0, y: 0 }, side: 2, type: 'output' },
    ],
    deletable: true,
    placeable: true,
    rotatable: true,
};
