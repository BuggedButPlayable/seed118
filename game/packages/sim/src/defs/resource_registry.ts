/**
 * Registry of all built-in resource definitions.
 */

import type { DefId } from '../types/ids';
import type { ResourceDefinition } from '../types/resource';
import { findDefinitionById, findDefinitionByKey } from './definition_lookup';
import { HYDROGEN_DEFINITION } from './resource_def';

export const RESOURCE_DEFINITIONS: readonly ResourceDefinition[] = [HYDROGEN_DEFINITION];

export const getResourceDefinitionById = (id: DefId): ResourceDefinition =>
    findDefinitionById(RESOURCE_DEFINITIONS, id, 'resource');

export const getResourceDefinitionByKey = (key: string): ResourceDefinition =>
    findDefinitionByKey(RESOURCE_DEFINITIONS, key, 'resource');
