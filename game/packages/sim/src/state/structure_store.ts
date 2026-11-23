import type { Rotation, TileCoord } from '../types/coords';
import type { DefId, StructureId } from '../types/ids';
import type { StructureRecord } from '../types/structure';

/**
 * Store for all structures in the world
 */
export class StructureStore {
    private nextId: number;

    private readonly structures: Map<StructureId, StructureRecord> = new Map();

    constructor(structures?: StructureRecord[]) {
        this.nextId = 1;

        if (structures) {
            for (const structure of structures) {
                this.structures.set(structure.id, structure);
                if (structure.id >= this.nextId) {
                    this.nextId = structure.id + 1;
                }
            }
        }
    }

    /**
     * Creates a new structure with the next free id and adds it to the store.
     * @param definitionId Definition of the structure.
     * @param rotation Rotation chosen at placement time.
     * @param position Anchor tile.
     * @returns The created record.
     */
    public createStructure(definitionId: DefId, rotation: Rotation, position: TileCoord): StructureRecord {
        const id = this.nextId;
        this.nextId += 1;

        const structureRecord: StructureRecord = {
            id: id,
            definitionId: definitionId,
            position: position,
            tick: 0,
            rotation: rotation,
        };

        this.structures.set(id, structureRecord);

        return structureRecord;
    }

    /**
     * Checks if a structure exists in the store
     * @param structureId Id of the structure to check
     * @returns Whether the structure exists in the store
     */
    public hasStructure(structureId: StructureId): boolean {
        return this.structures.has(structureId);
    }

    /**
     * Retrieves a structure from the store
     * @param structureId Id of the structure to get
     * @returns The structure record, or null if it does not exist
     */
    public getStructureById(structureId: StructureId): StructureRecord | null {
        return this.structures.get(structureId) ?? null;
    }

    /**
     * Removes a structure from the store
     * @param structureId Id of the structure to remove
     * @returns Whether the structure was successfully removed
     */
    public removeStructure(structureId: StructureId): boolean {
        return this.structures.delete(structureId);
    }

    /**
     * Retrieves all structures in the store
     * @returns An array of all structure records
     */
    public getAllStructures(): StructureRecord[] {
        return Array.from(this.structures.values());
    }
}
