/**
 * Public API of @seed118/sim (architecture §11).
 * Other packages import only from here. Everything not exported is internal.
 */

export { SimWorld } from './sim/sim_world';
export { SimCommandQueue } from './sim/sim_command_queue';

export { CHUNK_SIZE, RESOURCE_ID_NONE, STRUCTURE_ID_NONE } from './core/constants';
export {
    STRUCTURE_DEFINITIONS,
    getStructureDefinitionById,
    getStructureDefinitionByKey,
} from './defs/structure_registry';
export { RESOURCE_DEFINITIONS, getResourceDefinitionById } from './defs/resource_registry';

// Shared geometry: preview and simulation must use the same footprint rules (architecture §8)
export { computeFootprintTiles, rotateOffsets, tileToChunk } from './grid/grid_math';

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
    StructurePort,
    StructureRecord,
} from './types/structure';
export type { ResourceDefinition } from './types/resource';
export { SAVE_V1_VERSION } from './save/save_v1';
export type { SaveGameV1, SaveStructureV1 } from './save/save_v1';
