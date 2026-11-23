import { getStructureDefinitionByKey } from '@seed118/sim';

import type { BuildTool, ToolState } from './tool_state';

interface BuildBarEntry {
    label: string;
    hotkey: string;
    keyCode: string;
    tool: () => BuildTool;
}

/** What the bar offers in M1. The Core is placed by the world start, so it is not here. */
const ENTRIES: readonly BuildBarEntry[] = [
    {
        label: 'Collector',
        hotkey: '1',
        keyCode: 'Digit1',
        tool: () => ({ kind: 'place', definitionId: getStructureDefinitionByKey('collector').id }),
    },
    {
        label: 'Belt',
        hotkey: '2',
        keyCode: 'Digit2',
        tool: () => ({ kind: 'place', definitionId: getStructureDefinitionByKey('belt').id }),
    },
    { label: 'Remove', hotkey: 'X', keyCode: 'KeyX', tool: () => ({ kind: 'remove' }) },
];

const BAR_STYLE = [
    'position:fixed',
    'left:50%',
    'bottom:16px',
    'transform:translateX(-50%)',
    'display:flex',
    'gap:8px',
    'align-items:center',
    'font:14px system-ui,sans-serif',
    'color:#c8d2e8',
].join(';');
const BUTTON_STYLE =
    'padding:8px 14px;border-radius:6px;border:1px solid #2c3854;background:#0e1422;color:inherit;cursor:pointer';
const ACTIVE_BORDER = '#6f9bff';
const IDLE_BORDER = '#2c3854';

/**
 * Minimal build bar (plain DOM over the canvas): one button per tool, hotkeys 1/2/X,
 * R to rotate, Esc to put the tool away.
 */
export class BuildBar {
    private readonly buttons = new Map<BuildBarEntry, HTMLButtonElement>();

    constructor(private readonly tools: ToolState) {}

    /** Adds the bar to `host` and starts listening for hotkeys. */
    public mount(host: HTMLElement): void {
        const bar = document.createElement('div');
        bar.style.cssText = BAR_STYLE;
        for (const entry of ENTRIES) {
            bar.appendChild(this.createButton(entry));
        }
        bar.appendChild(createHint('R rotate · Esc cancel'));
        host.appendChild(bar);

        this.tools.onChange(() => this.highlightActive());
        window.addEventListener('keydown', this.onKeyDown);
    }

    private createButton(entry: BuildBarEntry): HTMLButtonElement {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = `${entry.label} [${entry.hotkey}]`;
        button.style.cssText = BUTTON_STYLE;
        button.addEventListener('click', () => this.tools.toggle(entry.tool()));
        this.buttons.set(entry, button);
        return button;
    }

    private highlightActive(): void {
        const active = this.tools.tool;
        for (const [entry, button] of this.buttons) {
            const isActive = JSON.stringify(entry.tool()) === JSON.stringify(active);
            button.style.borderColor = isActive ? ACTIVE_BORDER : IDLE_BORDER;
        }
    }

    private readonly onKeyDown = (event: KeyboardEvent): void => {
        const entry = ENTRIES.find((candidate) => candidate.keyCode === event.code);
        if (entry) {
            this.tools.toggle(entry.tool());
            return;
        }
        if (event.code === 'KeyR') {
            this.tools.rotate();
            return;
        }
        if (event.code === 'Escape') {
            this.tools.clear();
        }
    };
}

function createHint(text: string): HTMLSpanElement {
    const hint = document.createElement('span');
    hint.textContent = text;
    hint.style.opacity = '0.6';
    return hint;
}
