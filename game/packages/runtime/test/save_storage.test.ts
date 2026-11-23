import { CommandType, SimWorld, getStructureDefinitionByKey } from '@seed118/sim';
import { describe, expect, it } from 'vitest';

import { BROKEN_SAVE_STORAGE_KEY, SAVE_STORAGE_KEY, SaveStorage } from '../src/save_storage';
import type { KeyValueStorage } from '../src/save_storage';

class MemoryStorage implements KeyValueStorage {
    public readonly values = new Map<string, string>();
    public writes = 0;

    public getItem(key: string): string | null {
        return this.values.get(key) ?? null;
    }

    public setItem(key: string, value: string): void {
        this.values.set(key, value);
        this.writes += 1;
    }

    public removeItem(key: string): void {
        this.values.delete(key);
    }
}

function playedWorld(): SimWorld {
    const sim = new SimWorld();
    sim.startNewWorld(118);
    const belt = getStructureDefinitionByKey('belt');
    sim.tick(
        [{ type: CommandType.PlaceStructure, definitionId: belt.id, coord: { x: 5, y: 5 }, rotation: 1 }],
        [],
    );
    return sim;
}

describe('SaveStorage', () => {
    it('a stored world comes back identical in a fresh simulation', () => {
        const storage = new MemoryStorage();
        const original = playedWorld();
        new SaveStorage(storage).write(original);

        const restored = new SimWorld();
        expect(new SaveStorage(storage).restoreInto(restored)).toEqual({ kind: 'loaded' });
        expect(restored.saveV2()).toEqual(original.saveV2());
    });

    it('reports when there is nothing stored', () => {
        expect(new SaveStorage(new MemoryStorage()).restoreInto(new SimWorld())).toEqual({ kind: 'none' });
    });

    it('moves a broken save aside and leaves the simulation untouched', () => {
        const storage = new MemoryStorage();
        storage.setItem(SAVE_STORAGE_KEY, '{"version": 2, "nonsense": true');
        const sim = playedWorld();
        const before = sim.saveV2();

        const result = new SaveStorage(storage).restoreInto(sim);

        expect(result.kind).toBe('broken');
        expect(sim.saveV2()).toEqual(before);
        expect(storage.getItem(SAVE_STORAGE_KEY)).toBeNull();
        expect(storage.getItem(BROKEN_SAVE_STORAGE_KEY)).toBe('{"version": 2, "nonsense": true');
    });

    it('skips writing when no tick has passed since the last save, and clear forgets the world', () => {
        const storage = new MemoryStorage();
        const saves = new SaveStorage(storage);
        const sim = playedWorld();

        saves.write(sim);
        saves.write(sim);
        expect(storage.writes).toBe(1);

        saves.clear();
        expect(storage.getItem(SAVE_STORAGE_KEY)).toBeNull();
        saves.write(sim);
        expect(storage.writes).toBe(2);
    });
});
