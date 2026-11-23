# S.E.E.D 118 — Game

The game client and simulation, written in TypeScript. It runs in the browser (PixiJS, coming in M1).

## Structure

```
game/
├── packages/
│   └── sim/        deterministic simulation, owns all world state (@seed118/sim)
├── eslint.config.mjs   enforces layer boundaries, determinism and size limits
└── vitest.config.ts    tests and coverage thresholds
```

Planned packages (`render`, `ui`, `runtime`, `apps/web`) are described in
[`docs/seed118_coding_rules.md`](../docs/seed118_coding_rules.md) §2.

## Getting started

Requires Node.js 24+.

```bash
npm install
```

## Commands

| Command                             | What it does                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| `npm run check`                     | everything CI checks: format, lint, typecheck, tests. **Run before every PR.** |
| `npm test`                          | run all tests once                                                             |
| `npm run test:watch`                | tests in watch mode                                                            |
| `npm run coverage`                  | tests with coverage report (`coverage/index.html`) and thresholds              |
| `npm run lint` / `npm run lint:fix` | ESLint                                                                         |
| `npm run format`                    | format everything with Prettier                                                |
| `npm run typecheck`                 | TypeScript, no emit                                                            |

Git hooks (in the repo root `.husky/`) run lint-staged, typecheck and tests before each commit and check
the commit message format.

## Rules

How to write code for this project is defined in [`docs/seed118_coding_rules.md`](../docs/seed118_coding_rules.md),
the system guarantees in [`docs/seed118_architecture.md`](../docs/seed118_architecture.md).
