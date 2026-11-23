/**
 * Turns variable frame times into a whole number of fixed simulation steps (architecture §4:
 * no frame-dependent logic). Leftover time carries over to the next frame.
 */
export class FixedStepClock {
    private accumulatedMs = 0;

    /**
     * @param stepMs Length of one simulation step in milliseconds.
     * @param maxStepsPerFrame Cap so a long pause (background tab) does not trigger a burst of catch-up ticks.
     */
    constructor(
        private readonly stepMs: number,
        private readonly maxStepsPerFrame: number,
    ) {}

    /**
     * Adds the real time that passed and takes the steps that are now due.
     * @returns How many simulation steps to run this frame.
     */
    public takeDueSteps(elapsedMs: number): number {
        this.accumulatedMs += Math.max(0, elapsedMs);
        const dueSteps = Math.floor(this.accumulatedMs / this.stepMs);
        if (dueSteps > this.maxStepsPerFrame) {
            this.accumulatedMs = 0;
            return this.maxStepsPerFrame;
        }
        this.accumulatedMs -= dueSteps * this.stepMs;
        return dueSteps;
    }

    /** Progress towards the next step, 0..1, for smooth visual interpolation. */
    public get stepProgress(): number {
        return this.accumulatedMs / this.stepMs;
    }
}
