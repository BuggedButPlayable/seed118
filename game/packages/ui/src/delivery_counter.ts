import { EventType, ITEM_DEFINITIONS, getItemDefinitionByKey } from '@seed118/sim';
import type { Event, ItemKey, SimWorld } from '@seed118/sim';

import { BORDER_COLOR, FONT, PANEL_COLOR, TEXT_COLOR } from './dom_style';

const COUNTER_STYLE = [
    'position:fixed',
    'left:16px',
    'top:16px',
    'padding:8px 12px',
    'border-radius:6px',
    `border:1px solid ${BORDER_COLOR}`,
    `background:${PANEL_COLOR}`,
    `font:${FONT}`,
    `color:${TEXT_COLOR}`,
    'white-space:pre',
].join(';');

/** One line per item: "H delivered: 12". */
export function formatDeliveries(counts: ReadonlyMap<ItemKey, number>): string {
    return Array.from(
        counts,
        ([itemKey, count]) => `${getItemDefinitionByKey(itemKey).symbol} delivered: ${count}`,
    ).join('\n');
}

/** HUD counter of items delivered to the Core: reads the totals on WorldLoaded, then follows Delivered events. */
export class DeliveryCounter {
    private readonly element = document.createElement('div');
    private readonly counts = new Map<ItemKey, number>();

    public mount(host: HTMLElement): void {
        this.element.style.cssText = COUNTER_STYLE;
        host.appendChild(this.element);
        this.render();
    }

    public applyEvents(view: Pick<SimWorld, 'getDeliveredCount'>, events: readonly Event[]): void {
        for (const event of events) {
            this.applyEvent(view, event);
        }
        this.render();
    }

    private applyEvent(view: Pick<SimWorld, 'getDeliveredCount'>, event: Event): void {
        if (event.type === EventType.WorldLoaded) {
            this.readTotals(view);
        }
        if (event.type === EventType.Delivered) {
            this.counts.set(event.itemKey, event.total);
        }
    }

    private readTotals(view: Pick<SimWorld, 'getDeliveredCount'>): void {
        for (const item of ITEM_DEFINITIONS) {
            this.counts.set(item.key, view.getDeliveredCount(item.key));
        }
    }

    private render(): void {
        this.element.textContent = formatDeliveries(this.counts);
    }
}
