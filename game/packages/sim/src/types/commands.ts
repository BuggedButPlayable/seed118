/**
 * Defines command types and structures for simulation actions in the game.
 */

import {DefId} from "./ids";
import {TileCoord, Rotation, ChunkCoord} from "./coords";

/**
 * Types of commands that can be executed in the simulation.
 */
export enum CommandType {
    SetFocusChunk,
    PlaceStructure,
    RemoveStructure,
}

/**
 * Represents a command to be executed in the simulation.
 */
export type Command = 
    | {
        type: CommandType.PlaceStructure;
        definitionId: DefId;
        coord: TileCoord;
        rotation: Rotation;
    }
    | {
        type: CommandType.RemoveStructure;
        coord: TileCoord;
    }
    | {
        type: CommandType.SetFocusChunk;
        coord: ChunkCoord;
    };