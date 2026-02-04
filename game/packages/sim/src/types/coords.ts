/**
 * Types related to coordinates and rotations in the game world.
 */

export type Int = number;

//0=0, 1=90, 2=180, 3=270
export type Rotation = 0 | 1 | 2 | 3 

/**
 * Coordinate of a tile in the world grid.
 */
export interface TileCoord {
    x: Int;
    y: Int;
}

/**
 * Coordinate of a chunk in the world grid.
 */
export interface ChunkCoord {
    x: Int;
    y: Int;
}