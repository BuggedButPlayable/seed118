/**
 * Public API of @seed118/runtime: frame loop, input and platform glue.
 */

export { startAutosave } from './autosave';
export { BuildInput } from './build_input';
export type { BuildInputOptions } from './build_input';
export { CameraControls } from './camera_controls';
export type { CameraControlsOptions } from './camera_controls';
export { FixedStepClock } from './fixed_step_clock';
export { GameLoop } from './game_loop';
export type { GameLoopOptions } from './game_loop';
export { BROKEN_SAVE_STORAGE_KEY, SAVE_STORAGE_KEY, SaveStorage } from './save_storage';
export type { KeyValueStorage, RestoreResult } from './save_storage';
