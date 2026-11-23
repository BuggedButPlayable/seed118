/**
 * Public API of @seed118/sim (architecture §11).
 * Other packages import only from here. Everything not exported is internal.
 */

export { SimWorld } from './sim/sim_world';
export { SimCommandQueue } from './sim/sim_command_queue';
export type { PlacementRejection, PlacementRequest } from './systems/placement_rules';

export { CHUNK_SIZE, RESOURCE_ID_NONE, SIM_TICKS_PER_SECOND, STRUCTURE_ID_NONE } from './core/constants';
export {
    STRUCTURE_DEFINITIONS,
    getStructureDefinitionById,
    getStructureDefinitionByKey,
} from './defs/structure_registry';
export { RESOURCE_DEFINITIONS, getResourceDefinitionById } from './defs/resource_registry';
export { ITEM_DEFINITIONS, getItemDefinitionById, getItemDefinitionByKey } from './defs/item_registry';

// Shared geometry: preview and simulation must use the same footprint rules (architecture §8)
export {
    computeFootprintTiles,
    computePlacedFootprint,
    computeWorldPorts,
    neighbourAcross,
    oppositeSide,
    rotateOffsets,
    rotateSide,
    tileToChunk,
} from './grid/grid_math';

export { CommandType } from './types/commands';
export type { Command } from './types/commands';
export { EventType, RejectReason } from './types/events';
export type { Event } from './types/events';
export type { ChunkCoord, Rotation, TileCoord } from './types/coords';
export type { DefId, StructureId } from './types/ids';
export type {
    PortType,
    Side,
    StructureDefinition,
    StructureKey,
    ExtractionSpec,
    StructurePort,
    StructureRecord,
    TransportSpec,
} from './types/structure';
export type { ResourceDefinition } from './types/resource';
export type { ItemDefinition, ItemKey, ItemSlotSnapshot } from './types/item';
export { SAVE_V2_VERSION } from './save/save_v2';
export type { SaveGameV2 } from './save/save_v2';
