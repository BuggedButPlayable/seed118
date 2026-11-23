/**
 * Registry of all built-in structure definitions.
 */

import type { DefId } from '../types/ids';
import type { StructureDefinition } from '../types/structure';
import { findDefinitionById, findDefinitionByKey } from './definition_lookup';
import { BELT_DEFINITION, COLLECTOR_DEFINITION, CORE_DEFINITION } from './structure_def';

export const STRUCTURE_DEFINITIONS: readonly StructureDefinition[] = [
    CORE_DEFINITION,
    BELT_DEFINITION,
    COLLECTOR_DEFINITION,
];

export const getStructureDefinitionById = (id: DefId): StructureDefinition =>
    findDefinitionById(STRUCTURE_DEFINITIONS, id, 'structure');

export const getStructureDefinitionByKey = (key: string): StructureDefinition =>
    findDefinitionByKey(STRUCTURE_DEFINITIONS, key, 'structure');
