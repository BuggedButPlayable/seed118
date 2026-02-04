import { Rotation, TileCoord } from "../types/coords";
import { DefId, StructureId } from "../types/ids";
import { StructureRecord } from "../types/structure";

/**
 * Store for all structures in the world
 */
export class StructureStore {

    private nextId: number;

    private structures: Map<StructureId, StructureRecord> = new Map();

    constructor() {
        this.nextId = 1
    }

    /**
     * Creates a new structure and adds it to the store
     * @param structureType 
     * @param rotation 
     * @param position 
     * @returns 
     */
    public createStructure(definitionId: DefId, rotation: Rotation, position: TileCoord): StructureRecord {
        var id = this.nextId;
        this.nextId += 1;

        const structureRecord: StructureRecord = {
            id: id as StructureId,
            definitionId: definitionId,
            position: position,
            tick: 0,
            rotation: rotation as Rotation
        };

        this.structures.set(id as StructureId, structureRecord);

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
    public getStructureById(structureId: StructureId | null): StructureRecord | null {
        if (structureId === null) {
            return null;
        }
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
     * Rotates a structure in the store
     * @param structureId Id of the structure to rotate
     * @param rotation New rotation value
     * @returns Whether the structure was successfully rotated
     */
    public rotateStructure(structureId: StructureId, rotation: Rotation): boolean {
        if (this.hasStructure(structureId)) {
            const structure = this.structures.get(structureId)!;
            structure.rotation = rotation;
            this.structures.set(structureId, structure);
            return true;
        }
        return false;
    }

    /**
     * Retrieves all structures in the store
     * @returns An array of all structure records
     */
    public getAllStructures(): StructureRecord[] {
        return Array.from(this.structures.values());
    }
    
}