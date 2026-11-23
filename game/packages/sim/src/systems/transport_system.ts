import type { WorldState } from '../state/world_state';

/** Moves every held item one tick closer to leaving its holder (belt travel time). */
export class TransportSystem {
    public tick(state: WorldState): void {
        // Every slot counts down on its own, so the order does not matter.
        for (const slot of state.itemSlots.values()) {
            if (slot.ticksRemaining > 0) {
                slot.ticksRemaining -= 1;
            }
        }
    }
}
