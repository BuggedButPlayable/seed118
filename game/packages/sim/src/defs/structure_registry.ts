/**
 * Registry for all built-in structure definitions.
 * 
 * Collects and exposes structure definitions for easy access.
 */

import { DefId } from "../types/ids";
import { CORE_DEFINITION, BELT_DEFINITION, COLLECTOR_DEFINITION } from "./structure_def";
import { StructureDefinition } from "../types/structure";

export const STRUCTURE_DEFINITIONS: readonly StructureDefinition[] = Object.freeze([
    CORE_DEFINITION,
    BELT_DEFINITION,
    COLLECTOR_DEFINITION,
] satisfies readonly StructureDefinition[]);

/**
 * Retrieves a structure definition by its ID.
 * @param id - The definition ID.
 * @returns The corresponding structure definition.
 * @throws If no definition is found for the given ID.
 */
export const getStructureDefinitionById = (id: DefId): StructureDefinition => {
    for (const def of STRUCTURE_DEFINITIONS) {
        if (def.id === id) {
            return def;
        }
    }
    throw new Error(`No structure definition found for id: ${id}`);
}

/**
 * Retrieves a structure definition by its key.
 * @param key - The definition key.
 * @returns The corresponding structure definition.
 * @throws If no definition is found for the given key.
 */
export const getStructureDefinitionByKey = (key: string): StructureDefinition => {
    for (const def of STRUCTURE_DEFINITIONS) {
        if (def.key === key) {
            return def;
        }
    }
    throw new Error(`No structure definition found for key: ${key}`);
}