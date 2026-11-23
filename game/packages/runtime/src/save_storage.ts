import type { SimWorld } from '@seed118/sim';

/** The part of the Web Storage API we use; `window.localStorage` fits, tests pass a fake. */
export interface KeyValueStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}

export const SAVE_STORAGE_KEY = 'seed118.save';
/** A save that could not be loaded is moved here instead of being thrown away. */
export const BROKEN_SAVE_STORAGE_KEY = 'seed118.save.broken';

export type RestoreResult = { kind: 'none' } | { kind: 'loaded' } | { kind: 'broken'; reason: string };

/**
 * Keeps one world in browser storage. The simulation does the (de)serialisation and validation;
 * this class only moves the JSON in and out of storage.
 */
export class SaveStorage {
    private lastSavedTick: number | null = null;

    constructor(private readonly storage: KeyValueStorage) {}

    /** Stores the world, unless nothing has ticked since the last write. */
    public write(sim: Pick<SimWorld, 'getTickIndex' | 'saveV2'>): void {
        const tick = sim.getTickIndex();
        if (tick === this.lastSavedTick) {
            return;
        }
        this.storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(sim.saveV2()));
        this.lastSavedTick = tick;
    }

    /**
     * Loads the stored world into `sim`. A broken save leaves `sim` untouched and is moved aside,
     * so the next start does not trip over it again and the data is not lost.
     */
    public restoreInto(sim: Pick<SimWorld, 'loadSave'>): RestoreResult {
        const json = this.storage.getItem(SAVE_STORAGE_KEY);
        if (json === null) {
            return { kind: 'none' };
        }
        try {
            sim.loadSave(JSON.parse(json));
            return { kind: 'loaded' };
        } catch (error) {
            this.storage.setItem(BROKEN_SAVE_STORAGE_KEY, json);
            this.storage.removeItem(SAVE_STORAGE_KEY);
            return { kind: 'broken', reason: error instanceof Error ? error.message : String(error) };
        }
    }

    /** Forgets the stored world (before starting a new one). */
    public clear(): void {
        this.storage.removeItem(SAVE_STORAGE_KEY);
        this.lastSavedTick = null;
    }
}
