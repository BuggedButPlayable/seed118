/**
 * Items are atomic nuclei (game design §2.1). Chapter I only needs the proton count.
 */

import type { DefId, StructureId } from './ids';

export type ItemKey = string;

export interface ItemDefinition {
    id: DefId;
    key: ItemKey;
    /** Element symbol shown on the item, e.g. "H". */
    symbol: string;
    /** Z: number of protons. */
    protonCount: number;
}

/** Read-only view of an item held by a structure (snapshot for the view). */
export interface ItemSlotSnapshot {
    structureId: StructureId;
    itemKey: ItemKey;
    /** Ticks until the item may leave its holder; 0 = ready to move on. */
    ticksRemaining: number;
}
