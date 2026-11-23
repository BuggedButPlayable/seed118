import { EventType } from '../../src/types/events';
import type { Event } from '../../src/types/events';

/**
 * Returns the first event of the given type, narrowed to that type. Fails the test if none exists.
 */
export function findEvent<T extends EventType>(
    events: readonly Event[],
    type: T,
): Extract<Event, { type: T }> {
    const found = events.find((e): e is Extract<Event, { type: T }> => e.type === type);
    if (!found) {
        throw new Error(
            `Expected a ${EventType[type]} event, got: ${events.map((e) => EventType[e.type]).join(', ')}`,
        );
    }
    return found;
}
