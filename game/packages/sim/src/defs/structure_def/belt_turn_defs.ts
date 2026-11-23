import type { StructureDefinition } from '../../types/structure';
import { BELT_TRANSIT_TICKS } from './belt_def';

/**
 * Curved belts: like the straight belt (out on the south edge), but the item comes in from a side.
 * Named after the turn the item makes. The build tool places them automatically when a dragged line bends.
 */

/** In on the east edge: an item heading west turns left, to the south. */
export const BELT_TURN_LEFT_DEFINITION: StructureDefinition = {
    id: 4,
    key: 'belt_turn_left',
    footprint: [{ x: 0, y: 0 }],
    ports: [
        { tile: { x: 0, y: 0 }, side: 1, type: 'input' },
        { tile: { x: 0, y: 0 }, side: 2, type: 'output' },
    ],
    deletable: true,
    placeable: true,
    rotatable: true,
    transport: { transitTicks: BELT_TRANSIT_TICKS },
};

/** In on the west edge: an item heading east turns right, to the south. */
export const BELT_TURN_RIGHT_DEFINITION: StructureDefinition = {
    ...BELT_TURN_LEFT_DEFINITION,
    id: 5,
    key: 'belt_turn_right',
    ports: [
        { tile: { x: 0, y: 0 }, side: 3, type: 'input' },
        { tile: { x: 0, y: 0 }, side: 2, type: 'output' },
    ],
};
