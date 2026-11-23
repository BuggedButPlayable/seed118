import { EventType, ITEM_DEFINITIONS, getItemDefinitionByKey } from '@seed118/sim';
import type { Event, ItemKey, SimWorld } from '@seed118/sim';

const COUNTER_STYLE = [
    'position:fixed',
    'left:16px',
    'top:16px',
    'padding:8px 12px',
    'border-radius:6px',
    'border:1px solid #2c3854',
    'background:#0e1422cc',
    'font:14px system-ui,sans-serif',
    'color:#c8d2e8',
    'white-space:pre',
].join(';');

/** One line per item: "H delivered: 12". */
export function formatDeliveries(counts: ReadonlyMap<ItemKey, number>): string {
    return Array.from(
        counts,
        ([itemKey, count]) => `${getItemDefinitionByKey(itemKey).symbol} delivered: ${count}`,
    ).join('\n');
}

/** HUD counter of items delivered to the Core. Starts from a snapshot, then follows Delivered events. */
export class DeliveryCounter {
    private readonly element = document.createElement('div');
    private readonly counts = new Map<ItemKey, number>();

    public mount(host: HTMLElement): void {
        this.element.style.cssText = COUNTER_STYLE;
        host.appendChild(this.element);
        this.render();
    }

    /** Reads the totals from the simulation, e.g. after a new world or a load. */
    public reset(view: Pick<SimWorld, 'getDeliveredCount'>): void {
        for (const item of ITEM_DEFINITIONS) {
            this.counts.set(item.key, view.getDeliveredCount(item.key));
        }
        this.render();
    }

    public applyEvents(events: readonly Event[]): void {
        let hasChanged = false;
        for (const event of events) {
            if (event.type === EventType.Delivered) {
                this.counts.set(event.itemKey, event.total);
                hasChanged = true;
            }
        }
        if (hasChanged) {
            this.render();
        }
    }

    private render(): void {
        this.element.textContent = formatDeliveries(this.counts);
    }
}
