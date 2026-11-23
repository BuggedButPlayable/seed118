import type { StructureDefinition } from '../../types/structure';

/** The Core (S.E.E.D. 118 itself): 2x2, one input on every outer tile edge, cannot be removed, counts deliveries. */
export const CORE_DEFINITION: StructureDefinition = {
    id: 1,
    key: 'core',
    footprint: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
    ],
    ports: [
        { tile: { x: 0, y: 0 }, side: 0, type: 'input' },
        { tile: { x: 0, y: 0 }, side: 3, type: 'input' },
        { tile: { x: 1, y: 0 }, side: 0, type: 'input' },
        { tile: { x: 1, y: 0 }, side: 1, type: 'input' },
        { tile: { x: 0, y: 1 }, side: 2, type: 'input' },
        { tile: { x: 0, y: 1 }, side: 3, type: 'input' },
        { tile: { x: 1, y: 1 }, side: 1, type: 'input' },
        { tile: { x: 1, y: 1 }, side: 2, type: 'input' },
    ],
    deletable: false,
    placeable: true,
    rotatable: false,
    intake: 'deliver',
};
