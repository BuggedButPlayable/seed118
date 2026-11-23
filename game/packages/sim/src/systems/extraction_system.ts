import { RESOURCE_ID_NONE } from '../core/constants';
import { getItemDefinitionByKey } from '../defs/item_registry';
import { getResourceDefinitionById } from '../defs/resource_registry';
import { getStructureDefinitionById } from '../defs/structure_registry';
import type { GridModel } from '../grid/grid_model';
import type { WorldState } from '../state/world_state';
import type { StructureRecord } from '../types/structure';

/**
 * Lets every structure with an `extraction` spec produce the item of the resource under its anchor.
 * A full output slot pauses extraction until the item has been passed on.
 */
export class ExtractionSystem {
    public tick(state: WorldState, grid: GridModel): void {
        // Each structure touches only its own slot and progress, so the order does not matter.
        for (const structure of state.structureStore.getAllStructures()) {
            this.extract(state, grid, structure);
        }
    }

    private extract(state: WorldState, grid: GridModel, structure: StructureRecord): void {
        const extraction = getStructureDefinitionById(structure.definitionId).extraction;
        if (!extraction || state.itemSlots.has(structure.id)) {
            return;
        }
        const resourceId = grid.getResourceIdAt(structure.position);
        if (resourceId === RESOURCE_ID_NONE) {
            return;
        }

        const progress = (state.extractionProgress.get(structure.id) ?? 0) + 1;
        if (progress < extraction.ticksPerItem) {
            state.extractionProgress.set(structure.id, progress);
            return;
        }

        const itemKey = getResourceDefinitionById(resourceId).itemKey;
        state.extractionProgress.delete(structure.id);
        state.itemSlots.set(structure.id, { itemId: getItemDefinitionByKey(itemKey).id, ticksRemaining: 0 });
    }
}
