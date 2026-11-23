import { STRUCTURE_ID_NONE } from '../core/constants';
import { getStructureDefinitionById } from '../defs/structure_registry';
import type { GridModel } from '../grid/grid_model';
import { computeFootprintTiles, dedupeChunkCoords, rotateOffsets, tileToChunk } from '../grid/grid_math';
import type { WorldState } from '../state/world_state';
import { CommandType } from '../types/commands';
import type { Command } from '../types/commands';
import { EventType, RejectReason } from '../types/events';
import type { Event } from '../types/events';

type PlaceStructureCommand = Extract<Command, { type: CommandType.PlaceStructure }>;
type RemoveStructureCommand = Extract<Command, { type: CommandType.RemoveStructure }>;

/**
 * Applies player commands to the world state and grid.
 * Invalid commands never throw: they emit a CommandRejected event (architecture §6).
 */
export class CommandSystem {
    /**
     * Applies commands in the given order (FIFO, architecture §2).
     * @param state The world state to mutate.
     * @param grid The grid to mutate.
     * @param commands The commands of this tick.
     * @param outEvents Receives all resulting events.
     */
    public tick(state: WorldState, grid: GridModel, commands: readonly Command[], outEvents: Event[]): void {
        for (const command of commands) {
            this.applyCommand(state, grid, command, outEvents);
        }
    }

    /**
     * Applies a single command.
     * @param state The world state to mutate.
     * @param grid The grid to mutate.
     * @param command The command to apply.
     * @param outEvents Receives all resulting events.
     */
    public applyCommand(state: WorldState, grid: GridModel, command: Command, outEvents: Event[]): void {
        switch (command.type) {
            case CommandType.PlaceStructure:
                this.placeStructure(state, grid, command, outEvents);
                return;
            case CommandType.RemoveStructure:
                this.removeStructure(state, grid, command, outEvents);
                return;
            case CommandType.SetFocusChunk:
                state.pendingFocusChunkCoord = command.coord;
                return;
        }
        // Unreachable for well-typed callers, but commands may come from untyped sources at runtime.
        outEvents.push(rejected(command, RejectReason.UnknownCommand, 'Unknown command type.'));
    }

    private placeStructure(
        state: WorldState,
        grid: GridModel,
        command: PlaceStructureCommand,
        outEvents: Event[],
    ): void {
        if (!isValidRotation(command.rotation)) {
            outEvents.push(rejected(command, RejectReason.InvalidPayload, 'Rotation must be 0, 1, 2 or 3.'));
            return;
        }

        const definition = getStructureDefinitionById(command.definitionId);
        if (!definition.placeable) {
            outEvents.push(rejected(command, RejectReason.NotPlaceable, 'This structure cannot be placed.'));
            return;
        }

        const footprintTiles = computeFootprintTiles(
            command.coord,
            rotateOffsets(definition.footprint, command.rotation),
        );
        if (footprintTiles.some((tile) => grid.hasStructureAt(tile))) {
            outEvents.push(rejected(command, RejectReason.Occupied, 'Footprint area is occupied.'));
            return;
        }

        const structure = state.structureStore.createStructure(
            command.definitionId,
            command.rotation,
            command.coord,
        );
        structure.tick = state.tickIndex;

        for (const tile of footprintTiles) {
            grid.setStructureIdAt(tile, structure.id);
        }
        grid.setChunkPersistent(dedupeChunkCoords(footprintTiles.map(tileToChunk)));

        outEvents.push({
            type: EventType.StructurePlaced,
            structureId: structure.id,
            structureKey: definition.key,
            structureCoord: command.coord,
            structureRotation: command.rotation,
        });
    }

    private removeStructure(
        state: WorldState,
        grid: GridModel,
        command: RemoveStructureCommand,
        outEvents: Event[],
    ): void {
        const structureId = grid.getStructureIdAt(command.coord);
        const structure = state.structureStore.getStructureById(structureId);
        if (structureId === STRUCTURE_ID_NONE || structure === null) {
            outEvents.push(rejected(command, RejectReason.Empty, 'No structure at the selected position.'));
            return;
        }

        const definition = getStructureDefinitionById(structure.definitionId);
        if (!definition.deletable) {
            outEvents.push(rejected(command, RejectReason.NotRemovable, 'This structure cannot be removed.'));
            return;
        }

        const footprintTiles = computeFootprintTiles(
            structure.position,
            rotateOffsets(definition.footprint, structure.rotation),
        );
        for (const tile of footprintTiles) {
            if (grid.getStructureIdAt(tile) === structureId) {
                grid.setStructureIdAt(tile, STRUCTURE_ID_NONE);
            }
        }
        state.structureStore.removeStructure(structureId);

        outEvents.push({
            type: EventType.StructureRemoved,
            structureId,
            structureKey: definition.key,
            structureCoord: structure.position,
            structureRotation: structure.rotation,
        });
    }
}

/** Builds the canonical rejection event (architecture freeze: command rejection contract). */
function rejected(command: Command, reason: RejectReason, details: string): Event {
    return { type: EventType.CommandRejected, rejectedCommand: command, reason, details };
}

function isValidRotation(rotation: number): boolean {
    return Number.isInteger(rotation) && rotation >= 0 && rotation <= 3;
}
