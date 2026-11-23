import { CommandType } from '../../src/types/commands';
import type { Command } from '../../src/types/commands';
import type { ChunkCoord, Rotation, TileCoord } from '../../src/types/coords';

/** Builders for commands, so tests state only what matters to them. */

export const placeCommand = (definitionId: number, coord: TileCoord, rotation: Rotation = 0): Command => ({
    type: CommandType.PlaceStructure,
    definitionId,
    coord,
    rotation,
});

export const removeCommand = (coord: TileCoord): Command => ({ type: CommandType.RemoveStructure, coord });

export const focusCommand = (coord: ChunkCoord): Command => ({ type: CommandType.SetFocusChunk, coord });
