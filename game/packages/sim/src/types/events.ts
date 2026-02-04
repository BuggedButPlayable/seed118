/**
 * Defines event types and structures for simulation events in the game.
 */

import { Command } from "./commands";
import { ChunkCoord, Rotation, TileCoord } from "./coords";
import { StructureKey } from "./structure";

/** 
 * Reasons why a command might be rejected
 */
export enum RejectReason {
    UnknownCommand,
    InvalidPayload,
    Occupied,
    Empty,
    InvalidType,
    NotRemovable,
    NotPlaceable,
}

/**
 * Types of events that can occur in the simulation.
 */
export enum EventType {
    CommandRejected,
    WorldLoaded,
    Delivered,
    StructureRemoved,
    StructurePlaced,
    FocusChunkUpdated,
    ChunkGenerated,
    TickAdvanced,
}

/**
 * Represents an event that occurs in the simulation.
 */
export type Event =
    | {
        type: EventType.CommandRejected;
        reason: RejectReason;
        rejectedCommand: Command;
        details: string;
    }
    | {
        type: EventType.WorldLoaded;
    }
    | {
        type: EventType.TickAdvanced;
        tickIndex: number;
    }
    | {
        type: EventType.Delivered;
    }
    | {
        type: EventType.StructureRemoved;
        structureId: number;
        structureKey: StructureKey;
        structureCoord: TileCoord;
        structureRotation: Rotation;
    }
    | {
        type: EventType.StructurePlaced;
        structureId: number;
        structureKey: StructureKey;
        structureCoord: TileCoord;
        structureRotation: Rotation;
    }
    | {
        type: EventType.FocusChunkUpdated;
        chunkCoord: ChunkCoord
    }
    | {
        type: EventType.ChunkGenerated;
        coord: ChunkCoord;
    }