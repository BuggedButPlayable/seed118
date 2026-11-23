import { getStructureDefinitionById } from '../defs/structure_registry';
import type { GridModel } from '../grid/grid_model';
import { computePlacedFootprint, isValidRotation } from '../grid/grid_math';
import type { Rotation, TileCoord } from '../types/coords';
import { RejectReason } from '../types/events';
import type { DefId } from '../types/ids';

export interface PlacementRequest {
    definitionId: DefId;
    coord: TileCoord;
    rotation: Rotation;
}

export interface PlacementRejection {
    reason: RejectReason;
    details: string;
}

/**
 * The single placement rule. The command system enforces it; the preview asks it through
 * `SimWorld.checkPlacement`, so both always agree.
 * @returns Why the placement is invalid, or null if it is allowed.
 */
export function checkPlacement(grid: GridModel, request: PlacementRequest): PlacementRejection | null {
    if (!isValidRotation(request.rotation)) {
        return { reason: RejectReason.InvalidPayload, details: 'Rotation must be 0, 1, 2 or 3.' };
    }
    const definition = getStructureDefinitionById(request.definitionId);
    if (!definition.placeable) {
        return { reason: RejectReason.NotPlaceable, details: 'This structure cannot be placed.' };
    }
    const footprintTiles = computePlacedFootprint(request.coord, request.rotation, definition.footprint);
    if (footprintTiles.some((tile) => grid.hasStructureAt(tile))) {
        return { reason: RejectReason.Occupied, details: 'Footprint area is occupied.' };
    }
    if (definition.extraction && !grid.hasResourceAt(request.coord)) {
        return { reason: RejectReason.NoResource, details: 'Collectors must stand on a nebula.' };
    }
    return null;
}
