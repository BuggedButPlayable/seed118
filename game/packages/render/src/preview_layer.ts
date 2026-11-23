import { computePlacedFootprint, getStructureDefinitionById } from '@seed118/sim';
import type { PlacementRequest, TileCoord } from '@seed118/sim';
import { Graphics } from 'pixi.js';

import { INVALID_PREVIEW_COLOR, VALID_PREVIEW_COLOR } from './palette';
import type { SimView } from './sim_view';
import { drawFootprintBox, drawStructure } from './structure_shapes';

/** What the active tool would do at the hovered tile. */
export type BuildPreview = { kind: 'place'; request: PlacementRequest } | { kind: 'remove'; tile: TileCoord };

const GHOST_ALPHA = 0.55;

/**
 * The ghost under the cursor. Its colour comes from the simulation's own placement rule
 * (`checkPlacement`), so green here means the command will succeed.
 */
export class PreviewLayer {
    public readonly graphics = new Graphics();

    public update(view: SimView, preview: BuildPreview | null): void {
        this.graphics.clear();
        if (preview?.kind === 'place') {
            this.drawPlacement(view, preview.request);
            return;
        }
        if (preview?.kind === 'remove') {
            this.drawRemoval(view, preview.tile);
        }
    }

    private drawPlacement(view: SimView, request: PlacementRequest): void {
        const isValid = view.checkPlacement(request) === null;
        const color = isValid ? VALID_PREVIEW_COLOR : INVALID_PREVIEW_COLOR;
        drawStructure(
            this.graphics,
            {
                definition: getStructureDefinitionById(request.definitionId),
                anchor: request.coord,
                rotation: request.rotation,
            },
            { fill: color, stroke: color },
            GHOST_ALPHA,
        );
    }

    private drawRemoval(view: SimView, tile: TileCoord): void {
        const structure = view.getStructure(view.getStructureIdAt(tile));
        const style = { fill: INVALID_PREVIEW_COLOR, stroke: INVALID_PREVIEW_COLOR };
        if (!structure) {
            drawFootprintBox(this.graphics, [tile], style, GHOST_ALPHA / 2);
            return;
        }
        const definition = getStructureDefinitionById(structure.definitionId);
        const tiles = computePlacedFootprint(structure.position, structure.rotation, definition.footprint);
        drawFootprintBox(this.graphics, tiles, style, GHOST_ALPHA);
    }
}
