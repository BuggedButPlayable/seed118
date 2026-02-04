export interface ResourceDefinition {
    id: number;
    key: string;
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