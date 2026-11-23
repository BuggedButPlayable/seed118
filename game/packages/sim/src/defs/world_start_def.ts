/**
 * What every new world starts with (M1: one cold Core at the origin, approved by Daniel).
 */

import type { Rotation, TileCoord } from '../types/coords';
import type { StructureKey } from '../types/structure';

export interface StartStructure {
    key: StructureKey;
    coord: TileCoord;
    rotation: Rotation;
}

export const WORLD_START_STRUCTURES: readonly StartStructure[] = [
    { key: 'core', coord: { x: 0, y: 0 }, rotation: 0 },
];
