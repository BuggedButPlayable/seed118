import {DefId, StructureId} from './ids'
import {Rotation, TileCoord} from './coords'

export type Side = 0 | 1 | 2 | 3 // 0: north, 1: east, 2: south, 3: west
export type PortType = 'input' | 'output'

export type StructureKey = string

export interface StructurePort {
    tile: TileCoord;
    side: Side;
    type: PortType;
}

export interface StructureDefinition {
    id: DefId;
    key: StructureKey;
    footprint: readonly TileCoord[];
    ports: readonly StructurePort[];
    deletable: boolean;
    placeable: boolean;
    rotatable: boolean;
}

export interface StructureRecord {
    id: StructureId;
    definitionId: DefId;
    tick: number;
    position: TileCoord;
    rotation: Rotation;
}