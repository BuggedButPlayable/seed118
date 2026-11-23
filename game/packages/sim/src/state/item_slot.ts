import type { DefId } from '../types/ids';

/** The single item a structure holds (belt contents, collector output buffer). */
export interface ItemSlot {
    itemId: DefId;
    /** Ticks until the item may leave; 0 = ready to move on. */
    ticksRemaining: number;
}
