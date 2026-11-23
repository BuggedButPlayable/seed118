/**
 * Core simulation constants. Resource-specific tuning lives in defs/, not here.
 */

export const CHUNK_SIZE = 16;

/** Fixed simulation rate. Every duration in the simulation is counted in ticks of this clock. */
export const SIM_TICKS_PER_SECOND = 20;

/** Seed of a fresh world until the player picks one. */
export const DEFAULT_WORLD_SEED = 118;

export const STRUCTURE_ID_NONE = 0;
export const RESOURCE_ID_NONE = 0;
