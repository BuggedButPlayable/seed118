import type { ItemKey } from './item';

export interface ResourceDefinition {
    id: number;
    key: string;
    /** Item a collector extracts from this resource. */
    itemKey: ItemKey;
    cellSizeTiles: number;
    spawnProb: number;
    radiusMin: number;
    radiusMax: number;
    edgeSoftness: number;
    seedSalt: number;
    jitterSaltX: number;
    jitterSaltY: number;
    radiusSalt: number;
}
