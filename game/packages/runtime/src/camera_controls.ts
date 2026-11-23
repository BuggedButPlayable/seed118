import type { Camera, ViewportSize } from '@seed118/render';

/** Keyboard pan speed in screen pixels per second, so it feels the same at every zoom. */
const KEY_PAN_PIXELS_PER_SECOND = 600;
/** Zoom change per wheel notch (deltaY of about 100). */
const WHEEL_ZOOM_BASE = 1.0015;
const MIDDLE_BUTTON = 1;

/** Screen direction for each pan key. */
const PAN_KEYS: Readonly<Record<string, { x: number; y: number }>> = {
    KeyW: { x: 0, y: 1 },
    ArrowUp: { x: 0, y: 1 },
    KeyS: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: -1 },
    KeyA: { x: 1, y: 0 },
    ArrowLeft: { x: 1, y: 0 },
    KeyD: { x: -1, y: 0 },
    ArrowRight: { x: -1, y: 0 },
};

export interface CameraControlsOptions {
    canvas: HTMLCanvasElement;
    camera: Camera;
    viewportSize: () => ViewportSize;
    /** Whether a left-button drag should pan (true while no build tool is selected). */
    isLeftDragPan: () => boolean;
}

/**
 * Moves the camera from player input: WASD/arrow keys, mouse wheel zoom, and dragging with the middle
 * button (or the left button while no tool is selected). Camera state is view-local, never simulation state.
 */
export class CameraControls {
    private readonly heldKeys = new Set<string>();
    private dragPointerId: number | null = null;

    constructor(private readonly options: CameraControlsOptions) {
        const { canvas } = options;
        canvas.addEventListener('wheel', this.onWheel, { passive: false });
        canvas.addEventListener('pointerdown', this.onPointerDown);
        canvas.addEventListener('pointermove', this.onPointerMove);
        canvas.addEventListener('pointerup', this.onPointerUp);
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('blur', this.onBlur);
    }

    /** Applies held keys for the time since the last frame. */
    public update(elapsedSeconds: number): void {
        const distance = KEY_PAN_PIXELS_PER_SECOND * elapsedSeconds;
        for (const key of this.heldKeys) {
            const direction = PAN_KEYS[key];
            if (direction) {
                this.options.camera.panByScreen({ x: direction.x * distance, y: direction.y * distance });
            }
        }
    }

    private readonly onWheel = (event: WheelEvent): void => {
        event.preventDefault();
        const factor = WHEEL_ZOOM_BASE ** -event.deltaY;
        this.options.camera.zoomAt(
            { x: event.offsetX, y: event.offsetY },
            factor,
            this.options.viewportSize(),
        );
    };

    private readonly onPointerDown = (event: PointerEvent): void => {
        const isPanButton =
            event.button === MIDDLE_BUTTON || (event.button === 0 && this.options.isLeftDragPan());
        if (!isPanButton) {
            return;
        }
        this.dragPointerId = event.pointerId;
        this.options.canvas.setPointerCapture(event.pointerId);
    };

    private readonly onPointerMove = (event: PointerEvent): void => {
        if (event.pointerId !== this.dragPointerId) {
            return;
        }
        this.options.camera.panByScreen({ x: event.movementX, y: event.movementY });
    };

    private readonly onPointerUp = (event: PointerEvent): void => {
        if (event.pointerId === this.dragPointerId) {
            this.dragPointerId = null;
        }
    };

    private readonly onKeyDown = (event: KeyboardEvent): void => {
        if (event.code in PAN_KEYS) {
            this.heldKeys.add(event.code);
        }
    };

    private readonly onKeyUp = (event: KeyboardEvent): void => {
        this.heldKeys.delete(event.code);
    };

    private readonly onBlur = (): void => {
        this.heldKeys.clear();
    };
}
