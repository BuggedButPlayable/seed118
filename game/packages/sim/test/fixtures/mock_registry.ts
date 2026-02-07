/**
 * Helper utilities for mocking the structure registry in tests.
 */

import { vi } from "vitest";
import * as structureRegistry from "../../src/defs/structure_registry";
import { ALL_MOCK_STRUCTURES } from "./mock_structures";

/**
 * Sets up mocks for getStructureDefinitionById and getStructureDefinitionByKey
 * to use the mock structures instead of production definitions.
 */
export function setupMockRegistry(): void {
    vi.spyOn(structureRegistry, "getStructureDefinitionById").mockImplementation((id) => {
        const found = ALL_MOCK_STRUCTURES.find((def) => def.id === id);
        if (!found) {
            throw new Error(`No structure definition found for id: ${id}`);
        }
        return found;
    });

    vi.spyOn(structureRegistry, "getStructureDefinitionByKey").mockImplementation((key) => {
        const found = ALL_MOCK_STRUCTURES.find((def) => def.key === key);
        if (!found) {
            throw new Error(`No structure definition found for key: ${key}`);
        }
        return found;
    });
}

/**
 * Restores all mocks created by setupMockRegistry().
 * Call this in afterEach().
 */
export function restoreMockRegistry(): void {
    vi.restoreAllMocks();
}
