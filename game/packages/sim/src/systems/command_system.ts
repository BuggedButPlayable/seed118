import { ChunkCoord, Rotation, TileCoord } from "../types";
import { Command, CommandType } from "../types/commands";
import { Event, EventType, RejectReason } from "../types/events";
import { WorldState } from "../state/world_state";
import { GridModel } from "../grid/grid_model";
import { STRUCTURE_ID_NONE } from "../core/constants";
import { computeFootprintTiles, rotateOffsets } from "../grid/grid_math";
import { getStructureDefinitionById } from "../defs/structure_registry";
import { StructureRecord } from "../types/structure";

/**
 * The CommandSystem processes player commands and updates the world state and grid model accordingly.
 */
export class CommandSystem {

    /**
     * Processes a list of commands for the current tick.
     * @param state The current world state.
     * @param grid The grid model representing the world.
     * @param commands The list of commands to process.
     * @param outEvents The array to which events will be pushed.
     */
    public tick(state: WorldState, grid: GridModel, commands: readonly Command[], outEvents: Event[]): void {
        for (const command of commands) {
            this.applyCommand(state, grid, command, outEvents);
        }
    }

    /**
     * Applies a command to the world state and grid model.
     * @param state The current world state.
     * @param grid The grid model representing the world.
     * @param command The command to apply.
     * @param outEvents The array to which events will be pushed.
     */
    public applyCommand(state: WorldState, grid: GridModel, command: Command, outEvents: Event[]): void {
        switch (command.type) {
            case CommandType.PlaceStructure:
                this._placeStructure(state, grid, command, outEvents);
                break;
            case CommandType.RemoveStructure:
                this._removeStructure(state, grid, command, outEvents);
                break;
            case CommandType.SetFocusChunk:
                this._setFocusChunk(state, command.coord);
                break;
            default:
                this._emitCommandRejected(
                    command, 
                    RejectReason.UnknownCommand, 
                    "", 
                    outEvents);
        }
    }

    /**
     * Places a structure at the specified tile coordinate.
     * @param state The current world state.
     * @param grid The grid model representing the world.
     * @param command The command containing the placement details.
     * @param outEvents The array to which events will be pushed.
     */
    private _placeStructure(state: WorldState, grid: GridModel, command: Command, outEvents: Event[]): void {
        if (command.type !== CommandType.PlaceStructure) {
            this._emitCommandRejected(
                command, 
                RejectReason.InvalidType, 
                "Invalid command type for placing structure.", 
                outEvents);
            return;
        }
        
        var structureDefinition = getStructureDefinitionById(command.definitionId);
        var rotationQuadrants: Rotation = (command.rotation % 4) as Rotation;
        var footprintOffsets = structureDefinition.footprint;
        var rotatedOffsets = rotateOffsets(footprintOffsets, rotationQuadrants);
        var footprintTiles: TileCoord[] = computeFootprintTiles(command.coord, rotatedOffsets);

        if (structureDefinition.placeable === false) {
            this._emitCommandRejected(
                command, 
                RejectReason.NotPlaceable, 
                "This structure cannot be placed.", 
                outEvents);
            return;
        }

        for (var tileCoord of footprintTiles) {
            if (grid.hasStructureAt(tileCoord)) {
                this._emitCommandRejected(
                    command, 
                    RejectReason.Occupied, 
                    "Cannot place structure; footprint area is occupied.", 
                    outEvents);
                return;
            }
        }

        var createdStructure: StructureRecord = state.structureStore.createStructure(command.definitionId, command.rotation, command.coord);
        createdStructure.tick = state.tickIndex;

        for (var tileCoord of footprintTiles) {
            grid.setStructureIdAt(tileCoord, createdStructure.id);
        }

        grid.setChunkPersistent(footprintTiles);

        outEvents.push({
            type: EventType.StructurePlaced,
            structureId: createdStructure.id,
            structureKey: getStructureDefinitionById(createdStructure.definitionId).key,
            structureCoord: command.coord,
            structureRotation: command.rotation,
        });
    }

    /**
     * Removes a structure at the specified tile coordinate.
     * @param state The current world state.
     * @param grid The grid model representing the world.
     * @param command The command containing the tile coordinate.
     * @param outEvents The array to which events will be pushed.
     */
    private _removeStructure(state: WorldState, grid: GridModel, command: Command, outEvents: Event[]): void { 
        if (command.type !== CommandType.RemoveStructure) {
            this._emitCommandRejected(
                command, 
                RejectReason.InvalidType, 
                "Invalid command type for removing structure.", 
                outEvents);
            return;
        }
        
        var selectedTilePosition = command.coord;
        var structureId = grid.getStructureIdAt(selectedTilePosition);
        var structure = state.structureStore.getStructureById(structureId);
        
        if (structureId == STRUCTURE_ID_NONE || structureId === null || structure === null) {
            this._emitCommandRejected(
                command, 
                RejectReason.Empty, 
                "No structure to remove at the selected position.", 
                outEvents);
            return;
        }

        var structureDefinition = getStructureDefinitionById(structure.definitionId)
        var structureKey = structureDefinition.key;
        var footprintOffsets = structureDefinition.footprint;
        var rotatedOffsets = rotateOffsets(footprintOffsets, structure.rotation);
        var footprintTiles = computeFootprintTiles(structure.position, rotatedOffsets);

        if (structureDefinition.deletable === false) {
            this._emitCommandRejected(
                command, 
                RejectReason.NotRemovable, 
                "This structure cannot be removed.", 
                outEvents);
            return;
        }

        for (var tile of footprintTiles) {
            if (grid.getStructureIdAt(tile) == structureId) {
                grid.setStructureIdAt(tile, STRUCTURE_ID_NONE);
            }
        }

        state.structureStore.removeStructure(structureId);

        outEvents.push({
            type: EventType.StructureRemoved,
            structureId: structureId,   
            structureKey: structureKey,
            structureCoord: structure.position,
            structureRotation: structure.rotation,
        });

    }

    /**
     * Sets the focus chunk in the world state.
     * @param state The current world state.
     * @param coord The chunk coordinate to set as the focus chunk.
     */
    private _setFocusChunk(state: WorldState, coord: ChunkCoord): void {        
        var newFocusChunkCoord = coord;

        state.hasPendingFocusChunk = true;
        state.pendingFocusChunkCoord = newFocusChunkCoord;
    }

    /**
     * Emits a CommandRejected event.
     * @param command The command that was rejected.
     * @param reason The reason for rejection.
     * @param details Additional details about the rejection.
     * @param outEvents The array to which the event will be pushed.
     */
    private _emitCommandRejected(command: Command, reason: RejectReason, details: string, outEvents: Event[]): void {
        outEvents.push({
            type: EventType.CommandRejected,
            rejectedCommand: command,
            reason: reason,
            details: details,
        });
    }
}

