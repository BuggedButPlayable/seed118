import type { DefId, StructureId } from './ids';
import type { Rotation, TileCoord } from './coords';
import type { ItemKey } from './item';

export type Side = 0 | 1 | 2 | 3; // 0: north, 1: east, 2: south, 3: west
export type PortType = 'input' | 'output';

export type StructureKey = string;

export interface StructurePort {
    tile: TileCoord;
    side: Side;
    type: PortType;
    /** Input ports only: item keys this port accepts. Missing = accepts every item (architecture §5.2). */
    accepts?: readonly ItemKey[];
}

/** Moves one item at a time from its input to its output (belts). */
export interface TransportSpec {
    /** Ticks an item needs to cross the structure. At least 1, so an item moves one tile per tick at most. */
    transitTicks: number;
}

/** Extracts the item of the resource under the anchor tile (collectors). Placeable only on a resource. */
export interface ExtractionSpec {
    /** Ticks needed to extract one item. */
    ticksPerItem: number;
}

/**
 * What a structure does with items it takes in without holding them.
 * `deliver`: counts them as delivered (the Core).
 */
export type IntakeKind = 'deliver';

export interface StructureDefinition {
    id: DefId;
    key: StructureKey;
    footprint: readonly TileCoord[];
    ports: readonly StructurePort[];
    deletable: boolean;
    placeable: boolean;
    rotatable: boolean;
    transport?: TransportSpec;
    extraction?: ExtractionSpec;
    /** Takes items in through its input ports without ever filling up. */
    intake?: IntakeKind;
}

export interface StructureRecord {
    id: StructureId;
    definitionId: DefId;
    tick: number;
    position: TileCoord;
    rotation: Rotation;
}
