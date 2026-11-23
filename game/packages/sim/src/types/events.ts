/**
 * Defines event types and structures for simulation events in the game.
 */

import type { Command } from './commands';
import type { ChunkCoord, Rotation, TileCoord } from './coords';
import type { ItemKey } from './item';
import type { StructureKey } from './structure';

/**
 * Reasons why a command might be rejected
 */
export enum RejectReason {
    UnknownCommand,
    InvalidPayload,
    Occupied,
    Empty,
    NotRemovable,
    NotPlaceable,
    /** The structure extracts resources, but there is none under its anchor tile. */
    NoResource,
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
          structureId: number;
          itemKey: ItemKey;
          /** Total of this item delivered so far, including this one. */
          total: number;
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
          chunkCoord: ChunkCoord;
      }
    | {
          type: EventType.ChunkGenerated;
          coord: ChunkCoord;
      };
