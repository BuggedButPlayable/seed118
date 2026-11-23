import type { SimWorld } from '@seed118/sim';

import type { SaveStorage } from './save_storage';

/** Placeholder: often enough that a crash loses little, rare enough to cost nothing. */
const AUTOSAVE_INTERVAL_MS = 5000;

/** Saves the world regularly and whenever the page is hidden or closed. */
export function startAutosave(sim: Pick<SimWorld, 'getTickIndex' | 'saveV2'>, saves: SaveStorage): void {
    const save = (): void => saves.write(sim);
    window.setInterval(save, AUTOSAVE_INTERVAL_MS);
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            save();
        }
    });
}
