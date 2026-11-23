import { computeWorldPorts, getStructureDefinitionById } from '@seed118/sim';
import type { ItemSlotSnapshot, StructureRecord } from '@seed118/sim';
import { Graphics } from 'pixi.js';

import { crossingProgress, itemPosition } from './item_motion';
import { itemColor } from './palette';
import type { SimView } from './sim_view';
import { tileCenter } from './tile_geometry';

const ITEM_RADIUS = 0.17;

/** Items held by structures, redrawn every frame from the snapshot and moved smoothly between ticks. */
export class ItemLayer {
    public readonly graphics = new Graphics();

    public update(view: SimView, stepProgress: number): void {
        this.graphics.clear();
        for (const slot of view.getItemSlots()) {
            const holder = view.getStructure(slot.structureId);
            if (holder) {
                this.drawItem(slot, holder, stepProgress);
            }
        }
    }

    private drawItem(slot: ItemSlotSnapshot, holder: StructureRecord, stepProgress: number): void {
        const definition = getStructureDefinitionById(holder.definitionId);
        const ports = computeWorldPorts(holder.position, holder.rotation, definition.ports);
        const transitTicks = definition.transport?.transitTicks;
        const moving =
            transitTicks === undefined
                ? null
                : itemPosition(ports, crossingProgress(slot.ticksRemaining, transitTicks, stepProgress));
        const center = moving ?? tileCenter(holder.position);
        this.graphics.circle(center.x, center.y, ITEM_RADIUS).fill(itemColor(slot.itemKey));
    }
}
