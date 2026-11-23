/**
 * Registry of all item definitions (nuclei).
 */

import type { DefId } from '../types/ids';
import type { ItemDefinition, ItemKey } from '../types/item';
import { findDefinitionById, findDefinitionByKey } from './definition_lookup';
import { HYDROGEN_ITEM_DEFINITION } from './item_def';

export const ITEM_DEFINITIONS: readonly ItemDefinition[] = [HYDROGEN_ITEM_DEFINITION];

export const getItemDefinitionById = (id: DefId): ItemDefinition =>
    findDefinitionById(ITEM_DEFINITIONS, id, 'item');

export const getItemDefinitionByKey = (key: ItemKey): ItemDefinition =>
    findDefinitionByKey(ITEM_DEFINITIONS, key, 'item');
