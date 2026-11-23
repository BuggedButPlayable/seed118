import { getStructureDefinitionById, getStructureDefinitionByKey } from '@seed118/sim';
import type { StructureId } from '@seed118/sim';
import { Container, Graphics } from 'pixi.js';

import { structureStyle } from './palette';
import type { SimView } from './sim_view';
import { drawStructure } from './structure_shapes';
import type { PlacedShape } from './structure_shapes';

/** One graphic per placed structure, kept in sync through StructurePlaced/StructureRemoved events. */
export class StructureLayer {
    public readonly container = new Container();
    private readonly graphicsById = new Map<StructureId, Graphics>();

    public add(structureId: StructureId, shape: PlacedShape): void {
        this.remove(structureId);
        const graphics = new Graphics();
        drawStructure(graphics, shape, structureStyle(shape.definition.key));
        this.container.addChild(graphics);
        this.graphicsById.set(structureId, graphics);
    }

    /** Convenience for events, which name the structure by key. */
    public addByKey(structureId: StructureId, key: string, shape: Omit<PlacedShape, 'definition'>): void {
        this.add(structureId, { ...shape, definition: getStructureDefinitionByKey(key) });
    }

    public remove(structureId: StructureId): void {
        this.graphicsById.get(structureId)?.destroy();
        this.graphicsById.delete(structureId);
    }

    public redrawAll(view: SimView): void {
        for (const structureId of [...this.graphicsById.keys()]) {
            this.remove(structureId);
        }
        for (const structure of view.getStructures()) {
            this.add(structure.id, {
                definition: getStructureDefinitionById(structure.definitionId),
                anchor: structure.position,
                rotation: structure.rotation,
            });
        }
    }
}
