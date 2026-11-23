import { computePlacedFootprint, computeWorldPorts } from '@seed118/sim';
import type { Rotation, StructureDefinition, StructurePort, TileCoord } from '@seed118/sim';
import type { Graphics } from 'pixi.js';

import { INPUT_PORT_COLOR, OUTPUT_PORT_COLOR } from './palette';
import type { BodyStyle } from './palette';
import { sideStep, tileCenter } from './tile_geometry';

/** Gap between a body and its tile edges, in tiles, so neighbouring structures stay apart. */
const BODY_INSET = 0.1;
const BODY_CORNER_RADIUS = 0.15;
const BODY_STROKE_WIDTH = 0.06;
/** Port arrows: distance of the arrow's inner and outer end from the tile center, and half its width. */
const ARROW_INNER = 0.22;
const ARROW_OUTER = 0.46;
const ARROW_HALF_WIDTH = 0.16;

export interface PlacedShape {
    definition: StructureDefinition;
    anchor: TileCoord;
    rotation: Rotation;
}

/**
 * Draws a structure the way the simulation sees it: footprint and ports come from the same functions
 * the simulation uses (architecture §8), so preview and placed structure always match.
 */
export function drawStructure(graphics: Graphics, shape: PlacedShape, style: BodyStyle, alpha = 1): void {
    const tiles = computePlacedFootprint(shape.anchor, shape.rotation, shape.definition.footprint);
    drawFootprintBox(graphics, tiles, style, alpha);
    for (const port of computeWorldPorts(shape.anchor, shape.rotation, shape.definition.ports)) {
        drawPortArrow(graphics, port, alpha);
    }
}

/** One rounded box around all given tiles. */
export function drawFootprintBox(
    graphics: Graphics,
    tiles: readonly TileCoord[],
    style: BodyStyle,
    alpha = 1,
): void {
    const xs = tiles.map((tile) => tile.x);
    const ys = tiles.map((tile) => tile.y);
    const left = Math.min(...xs) + BODY_INSET;
    const top = Math.min(...ys) + BODY_INSET;
    const width = Math.max(...xs) + 1 - BODY_INSET - left;
    const height = Math.max(...ys) + 1 - BODY_INSET - top;
    graphics
        .roundRect(left, top, width, height, BODY_CORNER_RADIUS)
        .fill({ color: style.fill, alpha })
        .stroke({ color: style.stroke, width: BODY_STROKE_WIDTH, alpha });
}

/** Outputs point out of the tile edge, inputs point into it. */
function drawPortArrow(graphics: Graphics, port: StructurePort, alpha: number): void {
    const step = sideStep(port.side);
    const across = { x: -step.y, y: step.x };
    const isOutput = port.type === 'output';
    const tip = isOutput ? ARROW_OUTER : ARROW_INNER;
    const base = isOutput ? ARROW_INNER : ARROW_OUTER;
    const { x: centerX, y: centerY } = tileCenter(port.tile);
    graphics
        .poly([
            centerX + step.x * tip,
            centerY + step.y * tip,
            centerX + step.x * base + across.x * ARROW_HALF_WIDTH,
            centerY + step.y * base + across.y * ARROW_HALF_WIDTH,
            centerX + step.x * base - across.x * ARROW_HALF_WIDTH,
            centerY + step.y * base - across.y * ARROW_HALF_WIDTH,
        ])
        .fill({ color: isOutput ? OUTPUT_PORT_COLOR : INPUT_PORT_COLOR, alpha });
}
