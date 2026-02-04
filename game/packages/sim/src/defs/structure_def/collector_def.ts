import type { StructureDefinition } from "../../types/structure";

export const COLLECTOR_DEFINITION: StructureDefinition = Object.freeze({
    id: 3,
    key: "collector",
    footprint: [
        { x: 0, y: 0 },
    ],
    ports: [
        { tile: {x: 0, y: 0}, side: 0, type: 'output' },
    ],
    deletable: true,
    placeable: true,
    rotatable: true,
});