/**
 * Registry for all built-in resource definitions.
 * 
 * Collects and exposes resource definitions for easy access.
 */

import { DefId } from "../types/ids";
import { HYDROGEN_DEFINITION } from "./resource_def";
import { ResourceDefinition } from "../types/resource";

export const RESOURCE_DEFINITIONS: readonly ResourceDefinition[] = Object.freeze([
    HYDROGEN_DEFINITION,
] satisfies readonly ResourceDefinition[]);
/**
 * Retrieves a resource definition by its ID.
 * @param id - The definition ID.
 * @returns The corresponding resource definition.
 * @throws If no definition is found for the given ID.
 */
export const getResourceDefinitionById = (id: DefId): ResourceDefinition => {
    for (const def of RESOURCE_DEFINITIONS) {
        if (def.id === id) {
            return def;
        }
    }
    throw new Error(`No resource definition found for id: ${id}`);
}

/**
 * Retrieves a resource definition by its key.
 * @param key - The definition key.
 * @returns The corresponding structure definition.
 * @throws If no definition is found for the given key.
 */
export const getResourceDefinitionByKey = (key: string): ResourceDefinition => {
    for (const def of RESOURCE_DEFINITIONS) {
        if (def.key === key) {
            return def;
        }
    }
    throw new Error(`No resource definition found for key: ${key}`);
}