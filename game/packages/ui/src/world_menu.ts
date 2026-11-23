import { FONT, TEXT_COLOR, createButton } from './dom_style';

const MENU_STYLE = [
    'position:fixed',
    'right:16px',
    'top:16px',
    'display:flex',
    'flex-direction:column',
    'align-items:flex-end',
    'gap:8px',
    'max-width:360px',
    `font:${FONT}`,
    `color:${TEXT_COLOR}`,
].join(';');
const NOTICE_STYLE = 'padding:8px 12px;border-radius:6px;border:1px solid #8a5a2c;background:#2a1a0ecc';
const NEW_WORLD_QUESTION = 'Start a new world? The current world will be lost.';

/** Top-right menu: "New world" (with confirmation) and a place for notices. */
export class WorldMenu {
    private readonly element = document.createElement('div');
    private readonly newWorldHandlers: (() => void)[] = [];

    public mount(host: HTMLElement): void {
        this.element.style.cssText = MENU_STYLE;
        this.element.appendChild(createButton('New world', () => this.confirmNewWorld()));
        host.appendChild(this.element);
    }

    /** Calls `handler` once the player has confirmed a new world. */
    public onNewWorld(handler: () => void): void {
        this.newWorldHandlers.push(handler);
    }

    /** Shows a message under the menu until the page is reloaded. */
    public showNotice(text: string): void {
        const notice = document.createElement('div');
        notice.textContent = text;
        notice.style.cssText = NOTICE_STYLE;
        this.element.appendChild(notice);
    }

    private confirmNewWorld(): void {
        if (!window.confirm(NEW_WORLD_QUESTION)) {
            return;
        }
        for (const handler of this.newWorldHandlers) {
            handler();
        }
    }
}
