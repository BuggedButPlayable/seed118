import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["packages/sim/src/**/*.ts"],
      exclude: [
        "**/*.d.ts",
        "**/test/**",
        "**/*.test.ts",
        "**/*.spec.ts",
      ],
    },
  },
});