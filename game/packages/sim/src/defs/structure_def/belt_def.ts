import type { StructureDefinition } from '../../types/structure';

/** Placeholder balancing (M1): 10 ticks per tile = 2 tiles per second at 20 ticks per second. */
export const BELT_TRANSIT_TICKS = 10;

/** Straight belt: in on the north edge, out on the south edge. */
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
    transport: { transitTicks: BELT_TRANSIT_TICKS },
};
