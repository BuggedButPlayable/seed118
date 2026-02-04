import type { StructureDefinition } from "../../types/structure";

export const CORE_DEFINITION: StructureDefinition = Object.freeze({
    id: 1,
    key: "core",
    footprint: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
    ],
    ports: [
        { tile: {x: 0, y: 0}, side: 0, type: 'input' },
        { tile: {x: 0, y: 0}, side: 0, type: 'input' },
        { tile: {x: 1, y: 0}, side: 2, type: 'input' },
        { tile: {x: 1, y: 0}, side: 2, type: 'input' },
        { tile: {x: 0, y: 1}, side: 1, type: 'input' },
        { tile: {x: 0, y: 1}, side: 1, type: 'input' },
        { tile: {x: 1, y: 1}, side: 1, type: 'input' },
        { tile: {x: 1, y: 1}, side: 1, type: 'input' },
    ],
    deletable: false,
    placeable: true,
    rotatable: false,
});