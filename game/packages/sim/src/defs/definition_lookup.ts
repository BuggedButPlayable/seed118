/**
 * Shared lookup for all definition registries (structures, resources, later recipes).
 */

interface Definition {
    readonly id: number;
    readonly key: string;
}

/**
 * Finds a definition by id.
 * @throws If no definition has this id: unknown ids are programmer errors, not player input.
 */
export function findDefinitionById<T extends Definition>(
    definitions: readonly T[],
    id: number,
    kind: string,
): T {
    const found = definitions.find((definition) => definition.id === id);
    if (!found) {
        throw new Error(`No ${kind} definition found for id: ${id}`);
    }
    return found;
}

/**
 * Finds a definition by key.
 * @throws If no definition has this key.
 */
export function findDefinitionByKey<T extends Definition>(
    definitions: readonly T[],
    key: string,
    kind: string,
): T {
    const found = definitions.find((definition) => definition.key === key);
    if (!found) {
        throw new Error(`No ${kind} definition found for key: ${key}`);
    }
    return found;
}
