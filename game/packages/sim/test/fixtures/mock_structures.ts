/**
 * Mock structure definitions for testing.
 *
 * These mocks provide controlled test data without depending on production definitions.
 */

import type { StructureDefinition } from '../../src/types/structure';

/**
 * Standard 1x1 placeable, deletable, rotatable structure.
 */
export const MOCK_SIMPLE_STRUCTURE: StructureDefinition = {
    id: 1,
    key: 'test-simple',
    footprint: [{ x: 0, y: 0 }],
    ports: [],
    deletable: true,
    placeable: true,
    rotatable: true,
};

/**
 * Structure that cannot be placed (like Core).
 */
export const MOCK_NOT_PLACEABLE: StructureDefinition = {
    id: 2,
    key: 'test-not-placeable',
    footprint: [{ x: 0, y: 0 }],
    ports: [],
    deletable: true,
    placeable: false,
    rotatable: true,
};

/**
 * Structure that cannot be deleted (like Core).
 */
export const MOCK_NOT_DELETABLE: StructureDefinition = {
    id: 3,
    key: 'test-not-deletable',
    footprint: [{ x: 0, y: 0 }],
    ports: [],
    deletable: false,
    placeable: true,
    rotatable: true,
};

/**
 * Structure that cannot be rotated (No real usecase yet - lol).
 */
export const MOCK_NOT_ROTATABLE: StructureDefinition = {
    id: 4,
    key: 'test-not-rotatable',
    footprint: [{ x: 0, y: 0 }],
    ports: [],
    deletable: true,
    placeable: true,
    rotatable: false,
};

/**
 * 2x2 multi-tile structure for testing footprint logic.
 */
export const MOCK_MULTITILE: StructureDefinition = {
    id: 5,
    key: 'test-multitile',
    footprint: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
    ],
    ports: [],
    deletable: true,
    placeable: true,
    rotatable: true,
};

/** Belt: takes items in on its north edge, passes them out of its south edge after 2 ticks. */
export const MOCK_BELT: StructureDefinition = {
    id: 6,
    key: 'test-belt',
    footprint: [{ x: 0, y: 0 }],
    ports: [
        { tile: { x: 0, y: 0 }, side: 0, type: 'input' },
        { tile: { x: 0, y: 0 }, side: 2, type: 'output' },
    ],
    deletable: true,
    placeable: true,
    rotatable: true,
    transport: { transitTicks: 2 },
};

/** Collector: extracts one item every 3 ticks and offers it on its south edge. */
export const MOCK_EXTRACTOR: StructureDefinition = {
    id: 7,
    key: 'test-extractor',
    footprint: [{ x: 0, y: 0 }],
    ports: [{ tile: { x: 0, y: 0 }, side: 2, type: 'output' }],
    deletable: true,
    placeable: true,
    rotatable: true,
    extraction: { ticksPerItem: 3 },
};

/** Belt whose input refuses hydrogen: tests receiver-gated acceptance. */
export const MOCK_PICKY_BELT: StructureDefinition = {
    ...MOCK_BELT,
    id: 8,
    key: 'test-picky-belt',
    ports: [
        { tile: { x: 0, y: 0 }, side: 0, type: 'input', accepts: ['helium'] },
        { tile: { x: 0, y: 0 }, side: 2, type: 'output' },
    ],
};

/**
 * All mock structures in an array for easy iteration.
 */
export const ALL_MOCK_STRUCTURES: StructureDefinition[] = [
    MOCK_SIMPLE_STRUCTURE,
    MOCK_NOT_PLACEABLE,
    MOCK_NOT_DELETABLE,
    MOCK_NOT_ROTATABLE,
    MOCK_MULTITILE,
    MOCK_BELT,
    MOCK_EXTRACTOR,
    MOCK_PICKY_BELT,
];
