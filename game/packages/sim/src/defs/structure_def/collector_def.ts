import type { StructureDefinition } from '../../types/structure';

/** Placeholder balancing (M1): one item per second at 20 ticks per second. */
const COLLECTOR_TICKS_PER_ITEM = 20;

export const COLLECTOR_DEFINITION: StructureDefinition = {
    id: 3,
    key: 'collector',
    footprint: [{ x: 0, y: 0 }],
    ports: [{ tile: { x: 0, y: 0 }, side: 0, type: 'output' }],
    deletable: true,
    placeable: true,
    rotatable: true,
    extraction: { ticksPerItem: COLLECTOR_TICKS_PER_ITEM },
};
