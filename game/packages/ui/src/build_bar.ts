import { getStructureDefinitionByKey } from '@seed118/sim';

import { ACTIVE_BORDER_COLOR, BORDER_COLOR, FONT, TEXT_COLOR, createButton } from './dom_style';
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
    `font:${FONT}`,
    `color:${TEXT_COLOR}`,
].join(';');

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
        const button = createButton(`${entry.label} [${entry.hotkey}]`, () =>
            this.tools.toggle(entry.tool()),
        );
        this.buttons.set(entry, button);
        return button;
    }

    private highlightActive(): void {
        for (const [entry, button] of this.buttons) {
            button.style.borderColor = this.tools.isActive(entry.tool()) ? ACTIVE_BORDER_COLOR : BORDER_COLOR;
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
