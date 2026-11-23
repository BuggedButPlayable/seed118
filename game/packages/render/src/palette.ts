/**
 * Placeholder colours drawn by code (game design §9). Daniel replaces them with the real art later.
 */

export const SPACE_COLOR = 0x05070d;
export const GRID_COLOR = 0x151c2b;
export const CHUNK_BORDER_COLOR = 0x222c42;

export interface TintStyle {
    color: number;
    alpha: number;
}

/** Nebula tint by resource key; unknown resources fall back to a neutral haze. */
const RESOURCE_TINTS: Readonly<Record<string, TintStyle>> = {
    hydrogen: { color: 0x4f7cff, alpha: 0.35 },
};
const FALLBACK_RESOURCE_TINT: TintStyle = { color: 0x888888, alpha: 0.25 };

export function resourceTint(resourceKey: string): TintStyle {
    return RESOURCE_TINTS[resourceKey] ?? FALLBACK_RESOURCE_TINT;
}

export interface BodyStyle {
    fill: number;
    stroke: number;
}

/** Structure bodies by structure key; unknown structures fall back to a neutral chip. */
const STRUCTURE_STYLES: Readonly<Record<string, BodyStyle>> = {
    core: { fill: 0x1d2236, stroke: 0xffb347 },
    collector: { fill: 0x173d36, stroke: 0x4fd1a5 },
    belt: { fill: 0x1f2433, stroke: 0x5a6480 },
    belt_turn_left: { fill: 0x1f2433, stroke: 0x5a6480 },
    belt_turn_right: { fill: 0x1f2433, stroke: 0x5a6480 },
};
const FALLBACK_STRUCTURE_STYLE: BodyStyle = { fill: 0x222222, stroke: 0x999999 };

export function structureStyle(structureKey: string): BodyStyle {
    return STRUCTURE_STYLES[structureKey] ?? FALLBACK_STRUCTURE_STYLE;
}

export const INPUT_PORT_COLOR = 0x6f9bff;
export const OUTPUT_PORT_COLOR = 0xffb347;
export const VALID_PREVIEW_COLOR = 0x4fd18b;
export const INVALID_PREVIEW_COLOR = 0xff5a5a;

/** Item colours by item key (game design §9: elements distinguishable at a glance). */
const ITEM_COLORS: Readonly<Record<string, number>> = {
    hydrogen: 0xdfe8ff,
};
const FALLBACK_ITEM_COLOR = 0xffffff;

export function itemColor(itemKey: string): number {
    return ITEM_COLORS[itemKey] ?? FALLBACK_ITEM_COLOR;
}
