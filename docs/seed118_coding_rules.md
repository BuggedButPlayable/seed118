# seed118 — Coding Rules & Workflow
Version: v1.0 · Status: **binding**

This file defines *how* code is written for S.E.E.D 118. `seed118_architecture.md` defines *what* the
system must guarantee. Both are binding. If a rule blocks you, change the rule here (in its own commit,
with a reason). Never work around it.

Most rules are **enforced by tooling** (marked 🔒). A rule without enforcement is a suggestion, so
whenever a rule is broken twice, add a check for it.

---

## 1. Workflow

### 1.1 One feature = one branch = one pull request
1. Branch from `develop`: `feat/<topic>`, `fix/<topic>`, `refactor/<topic>`, `docs/<topic>`.
2. Before writing code, state the plan in the PR description: goal, files touched, public API changes,
   new events/commands, save format impact.
3. Small slices: aim for **≤ 400 changed lines** per PR (tests, lockfiles and docs not counted).
   Bigger features are split into several PRs that each leave `develop` working.
4. Merge into `develop` only when CI is green and Daniel approved it. `main` is for releases only.

### 1.2 Order of work inside a slice
1. **Types & data first:** new definitions, commands, events.
2. **Tests next:** describe the behaviour, see them fail.
3. **Implementation:** the smallest code that makes the tests pass.
4. **Clean up:** names, duplication, docs. Lint and size limits must pass.
5. **Docs:** update the architecture doc / game design doc if a contract or mechanic changed.

### 1.3 Commits 🔒
- Conventional Commits: `feat(sim): add belt transport`, `fix(render): ...`, `refactor: ...`,
  `test: ...`, `docs: ...`, `chore: ...`, `ci: ...` (enforced by the `commit-msg` hook).
- One logical change per commit. Refactors are separate from features.
- The pre-commit hook runs format, lint, typecheck and tests. **Never use `--no-verify`.**

### 1.4 Definition of Done
- [ ] `npm run check` passes (format, lint, typecheck, tests) 🔒
- [ ] Coverage of `packages/sim` stays above its thresholds 🔒
- [ ] Every new behaviour has a test; every fixed bug has a regression test
- [ ] Determinism tests still pass 🔒
- [ ] No `TODO` without an issue link, no commented-out code, no dead code
- [ ] Docs updated if a contract, mechanic or public API changed

### 1.5 When unsure
Ask instead of guessing. This applies especially to gameplay rules, numbers (balancing), lore wording
and anything visual: those decisions belong to Daniel.

---

## 2. Project structure

```
game/
  packages/
    sim/       deterministic simulation, owns all state      (exists)
    render/    PixiJS view, read-only                        (M1)
    ui/        HUD, menus, emits commands only               (M1+)
    runtime/   game loop, input, platform adapters           (M1)
  apps/web/    browser entry point (Vite)                    (M1)
```

### 2.1 Layer boundaries 🔒
| Package | May import |
|---|---|
| `sim` | nothing (no other package, no DOM, no PixiJS) |
| `render` | `@seed118/sim` |
| `ui` | `@seed118/sim` |
| `runtime` | `@seed118/sim`, `@seed118/render`, `@seed118/ui` |
| `apps/web` | all packages |

- Import other packages **only through their public index** (`@seed118/sim`), never deep paths. 🔒
- Each package exposes its public API in `src/index.ts`. Anything not exported there is internal.

### 2.2 Inside `sim`
| Folder | Contains |
|---|---|
| `core/` | constants, hashing, world generation (pure functions) |
| `defs/` | data definitions (structures, resources, later recipes) + registries |
| `grid/` | chunk storage and grid math |
| `state/` | `WorldState` and stores: the only mutable state |
| `systems/` | stateless systems, run in a fixed order by `SimWorld.tick()` |
| `save/` | versioned save/load |
| `sim/` | `SimWorld` (public entry point), command queue |
| `types/` | shared types: commands, events, coords, ids |

---

## 3. Code rules

### 3.1 TypeScript 🔒
- `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`, `verbatimModuleSyntax`.
- No `any`. Use `unknown` and narrow it. No non-null assertions (`!`) in source code.
- Use `import type` for types.
- Exported functions and methods declare their return types.
- `switch` over unions/enums must be exhaustive.
- `const` by default, `let` only when reassigned, never `var`. Always `===`.
- No inline suppression: `eslint-disable` comments are switched off (`noInlineConfig`) and
  `@ts-ignore` is banned. Fix the code or change the rule in the config, with a reason.

### 3.2 Size limits 🔒
| Limit | Max |
|---|---|
| Lines per file (source) | 300 |
| Lines per function | 60 |
| Parameters per function | 4 (group the rest into an object) |
| Nesting depth | 3 |
| Cyclomatic complexity | 12 |

If you hit a limit, split by responsibility. Don't squeeze the code.

### 3.3 Naming 🔒
| Thing | Style | Example |
|---|---|---|
| Files | `snake_case.ts` | `belt_system.ts` |
| Classes, types, interfaces, enums | `PascalCase` | `BeltSystem`, `TileCoord` |
| Enum members | `PascalCase` | `EventType.StructurePlaced` |
| Functions, methods, variables | `camelCase` | `computeFootprintTiles` |
| Module constants | `UPPER_SNAKE_CASE` | `CHUNK_SIZE` |
| Private members | `private` keyword, **no** `_` prefix | `private placeStructure()` |
| Tests | mirror the source path, `.test.ts` | `test/unit/grid/grid_math.test.ts` |

Names say what something *is* in game terms (`fusor`, `heatRing`, `coreStage`), using the vocabulary of
the game design doc. No abbreviations except well-known ones (`id`, `def`, `coord`).

### 3.4 Formatting 🔒
Prettier decides (4 spaces, single quotes, trailing commas, width 110). Don't discuss style in reviews.

### 3.5 Comments
- Exported API gets a TSDoc comment explaining *what* and any non-obvious constraint.
- Inside functions, comments explain *why*, never *what*.
- Reference contracts where relevant: `// architecture §5.2: receiver decides acceptance`.
- No commented-out code. Git remembers.

### 3.6 Errors
- **Invalid player input** (commands): never throw. Emit `CommandRejected` with a `RejectReason`.
- **Broken invariants / programmer errors** (unknown definition id, corrupt state): `throw new Error()`
  with a message that names the value.
- No empty `catch`, no swallowed errors, no `console.*` in packages. 🔒

---

## 4. Simulation rules

These come from the architecture contract and are the rules most likely to be broken by accident.

1. **Determinism** 🔒: no `Math.random`, no `Date`, no timers, no platform APIs inside `sim`. Randomness
   comes from `core/hash2d` with a seed. Logic counts ticks, not time.
2. **Stable order:** iterate in a defined order (by id, by coordinate). Never depend on the iteration
   order of something that could differ between two runs or after save/load.
3. **Integers in game logic:** item counts, progress, timers and stages are integers. Floats only where
   unavoidable (world generation), and never accumulated over ticks.
4. **State lives in `WorldState`** (or stores it owns). Systems are stateless and run in the fixed order
   documented in `SimWorld.tick()`.
5. **Data-driven:** a new machine is a new definition in `defs/` plus registry entry plus tests. Generic
   systems never check `if (def.key === 'fusor')`; they read properties of the definition.
6. **Events for everything the view needs.** The view never reads internals to find out what changed.
7. **Derived state is computed, not saved** (e.g. heat rings). Persistent state is saved.
8. **Save format changes:** new persistent state ⇒ bump the save version, write a migration from the
   previous version, add a roundtrip test (`save → load → save` is identical).

---

## 5. Tests

- Framework: Vitest. `test/unit/` for single modules, `test/integration/` for systems working together.
- Test behaviour through public functions; don't reach into private fields. If a test needs internals,
  the class is missing a read API (add a snapshot getter instead).
- Every system needs: a happy path, a rejection/edge case, and a determinism check when it changes state.
- Use typed helpers from `test/fixtures/` (e.g. `findEvent`) instead of casts.
- Mock structure definitions via `test/fixtures/mock_registry.ts`, so balancing changes don't break tests.

---

## 6. Dependencies

- Adding a runtime or dev dependency needs Daniel's OK and a one-line reason in the PR.
- Prefer the platform and small focused libraries. The simulation has **zero** runtime dependencies.

---

## 7. Working with Claude (token-efficient)

- Start every session from `CLAUDE.md`; read only the doc sections the task needs.
- Use `npm run check` as the single source of truth for "is it done".
- One session per feature slice. Start a fresh session for unrelated work instead of growing one thread.
- Routine implementation can run on a cheaper model; design and architecture decisions stay with the
  strongest model and with Daniel.
