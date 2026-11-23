import { byEntryKey } from '../core/ordering';
import type { StructureId } from '../types/ids';

/**
 * Holds one value per structure (item slot, progress counter, ...).
 * `entries()` is sorted by structure id, so systems never depend on insertion order.
 */
export class PerStructureStore<T> {
    private readonly byStructure = new Map<StructureId, T>();

    public get(structureId: StructureId): T | undefined {
        return this.byStructure.get(structureId);
    }

    public has(structureId: StructureId): boolean {
        return this.byStructure.has(structureId);
    }

    public set(structureId: StructureId, value: T): void {
        this.byStructure.set(structureId, value);
    }

    public delete(structureId: StructureId): void {
        this.byStructure.delete(structureId);
    }

    /** All values in no particular order: only for work where the order cannot change the result. */
    public values(): IterableIterator<T> {
        return this.byStructure.values();
    }

    /** All entries, sorted by structure id. */
    public entries(): [StructureId, T][] {
        return Array.from(this.byStructure.entries()).sort(byEntryKey);
    }
}
