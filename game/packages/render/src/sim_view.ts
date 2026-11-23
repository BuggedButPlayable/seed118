import type { SimWorld } from '@seed118/sim';

/**
 * The part of the simulation the view may read: snapshot getters and queries only (architecture §3, §11).
 * Typing the view against this keeps it from calling `tick`, `loadSave` or anything else that mutates.
 */
export type SimView = Pick<SimWorld, 'getChunkCoords' | 'getResourceIdAt'>;
