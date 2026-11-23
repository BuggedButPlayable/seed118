import { describe, expect, it } from 'vitest';

import { FixedStepClock } from '../src/fixed_step_clock';

const STEP_MS = 50;
const MAX_STEPS = 5;

describe('FixedStepClock', () => {
    it('runs one step per full step length and carries the rest over', () => {
        const clock = new FixedStepClock(STEP_MS, MAX_STEPS);

        expect(clock.takeDueSteps(30)).toBe(0);
        expect(clock.stepProgress).toBeCloseTo(0.6);
        expect(clock.takeDueSteps(30)).toBe(1);
        expect(clock.takeDueSteps(90)).toBe(2);
        expect(clock.stepProgress).toBeCloseTo(0);
    });

    it('runs the same number of steps however the time is split into frames', () => {
        const fewFrames = new FixedStepClock(STEP_MS, MAX_STEPS);
        const manyFrames = new FixedStepClock(STEP_MS, MAX_STEPS);

        const fewSteps = [100, 150].reduce((sum, ms) => sum + fewFrames.takeDueSteps(ms), 0);
        const manySteps = Array.from({ length: 25 }, () => manyFrames.takeDueSteps(10)).reduce(
            (sum, steps) => sum + steps,
            0,
        );

        expect(fewSteps).toBe(5);
        expect(manySteps).toBe(5);
    });

    it('caps catch-up after a long pause and drops the backlog', () => {
        const clock = new FixedStepClock(STEP_MS, MAX_STEPS);

        expect(clock.takeDueSteps(10_000)).toBe(MAX_STEPS);
        expect(clock.takeDueSteps(0)).toBe(0);
    });

    it('ignores negative elapsed time', () => {
        const clock = new FixedStepClock(STEP_MS, MAX_STEPS);

        expect(clock.takeDueSteps(-100)).toBe(0);
        expect(clock.stepProgress).toBe(0);
    });
});
