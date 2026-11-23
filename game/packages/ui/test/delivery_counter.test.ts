import { describe, expect, it } from 'vitest';

import { formatDeliveries } from '../src/delivery_counter';

describe('formatDeliveries', () => {
    it('shows one line per item with its element symbol', () => {
        expect(formatDeliveries(new Map([['hydrogen', 12]]))).toBe('H delivered: 12');
    });

    it('is empty when nothing is tracked', () => {
        expect(formatDeliveries(new Map())).toBe('');
    });
});
