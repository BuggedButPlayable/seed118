import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            reportsDirectory: './coverage',
            include: ['packages/sim/src/**/*.ts'],
            exclude: ['**/*.d.ts', '**/index.ts'],
            // The simulation is the heart of the game: coverage may only go up.
            thresholds: { lines: 90, statements: 90, functions: 85, branches: 80 },
        },
    },
});
