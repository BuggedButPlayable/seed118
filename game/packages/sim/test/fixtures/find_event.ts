import { EventType } from '../../src/types/events';
import type { Event } from '../../src/types/events';

/**
 * Returns the first event of the given type, narrowed to that type. Fails the test if none exists.
 */
export function findEvent<T extends EventType>(
    events: readonly Event[],
    type: T,
): Extract<Event, { type: T }> {
    const found = events.find((event): event is Extract<Event, { type: T }> => event.type === type);
    if (!found) {
        throw new Error(
            `Expected a ${EventType[type]} event, got: ${events.map((event) => EventType[event.type]).join(', ')}`,
        );
    }
    return found;
}

/** Returns every event of the given type, narrowed to that type, in order. */
export function findEvents<T extends EventType>(
    events: readonly Event[],
    type: T,
): Extract<Event, { type: T }>[] {
    return events.filter((event): event is Extract<Event, { type: T }> => event.type === type);
}
