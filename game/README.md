# S.E.E.D 118 — Game

The game client and simulation, written in TypeScript. It runs in the browser (PixiJS + Vite).

## Structure

```
game/
├── packages/
│   ├── sim/        deterministic simulation, owns all world state (@seed118/sim)
│   ├── render/     PixiJS view and camera, read-only (@seed118/render)
│   └── runtime/    fixed-step game loop, input (@seed118/runtime)
├── apps/web/       browser entry point (Vite)
├── eslint.config.mjs   enforces layer boundaries, determinism and size limits
└── vitest.config.ts    tests and coverage thresholds
```

Layer rules (who may import whom) are in [`docs/seed118_coding_rules.md`](../docs/seed118_coding_rules.md) §2.
`sim` is type-checked without DOM types; the browser packages each have their own `tsconfig.json` with DOM.

## Getting started

Requires Node.js 24+.

```bash
npm install
```

## Commands

| Command                             | What it does                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `npm run dev`                       | start the game at http://localhost:5173                                                     |
| `npm run build`                     | production build of the web app into `apps/web/dist`                                        |
| `npm run check`                     | everything CI checks: format, lint, typecheck, duplication, tests. **Run before every PR.** |
| `npm test`                          | run all tests once                                                                          |
| `npm run test:watch`                | tests in watch mode                                                                         |
| `npm run coverage`                  | tests with coverage report (`coverage/index.html`) and thresholds                           |
| `npm run lint` / `npm run lint:fix` | ESLint                                                                                      |
| `npm run format`                    | format everything with Prettier                                                             |
| `npm run dup`                       | fails on copy-pasted code (jscpd)                                                           |
| `npm run typecheck`                 | TypeScript, no emit                                                                         |

Git hooks (in the repo root `.husky/`) run lint-staged, typecheck and tests before each commit and check
the commit message format.

## Rules

How to write code for this project is defined in [`docs/seed118_coding_rules.md`](../docs/seed118_coding_rules.md),
the system guarantees in [`docs/seed118_architecture.md`](../docs/seed118_architecture.md).
