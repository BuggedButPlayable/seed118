import { ResourceDefinition } from "../../types/resource";

export const HYDROGEN_DEFINITION: ResourceDefinition = Object.freeze({
  id: 1, 
  key: "hydrogen",
  cellSizeTiles: 8,
  spawnProb: 0.1,
  radiusMin: 2,
  radiusMax: 3,
  edgeSoftness: 0.25,
  seedSalt: 0x4C3B2A19,
  jitterSaltX: 0xA53A9B7D,
  jitterSaltY: 0x1B56C4E9,
  radiusSalt: 0x7F4A7C15,
}); 