import type { ResourceDefinition } from '../../types/resource';

export const HYDROGEN_DEFINITION: ResourceDefinition = Object.freeze({
    id: 1,
    key: 'hydrogen',
    cellSizeTiles: 8,
    spawnProb: 0.1,
    radiusMin: 2,
    radiusMax: 3,
    edgeSoftness: 0.25,
    seedSalt: 0x4c3b2a19,
    jitterSaltX: 0xa53a9b7d,
    jitterSaltY: 0x1b56c4e9,
    radiusSalt: 0x7f4a7c15,
});
