/**
 * Shared look of the HTML overlay (placeholder until Daniel's UI design).
 */

export const TEXT_COLOR = '#c8d2e8';
export const PANEL_COLOR = '#0e1422';
export const BORDER_COLOR = '#2c3854';
export const ACTIVE_BORDER_COLOR = '#6f9bff';
export const FONT = '14px system-ui,sans-serif';

const BUTTON_STYLE = `padding:6px 12px;border-radius:6px;border:1px solid ${BORDER_COLOR};background:${PANEL_COLOR};color:inherit;cursor:pointer`;

/** A plain overlay button. */
export function createButton(label: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.style.cssText = BUTTON_STYLE;
    button.addEventListener('click', onClick);
    return button;
}
