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
