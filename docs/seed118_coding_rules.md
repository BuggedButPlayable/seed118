# seed118 — Coding Rules & Workflow
Version: v1.1 · Status: **binding**

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
- [ ] `npm run check` passes (format, lint, typecheck, duplication, tests) 🔒
- [ ] Review pass done (§1.5)
- [ ] Coverage of `packages/sim` stays above its thresholds 🔒
- [ ] Every new behaviour has a test; every fixed bug has a regression test
- [ ] Determinism tests still pass 🔒
- [ ] No `TODO` without an issue link, no commented-out code, no dead code
- [ ] Docs updated if a contract, mechanic or public API changed

### 1.5 Review pass
Before a PR goes to Daniel, run a fresh review over the diff (Claude Code: `/simplify` for reuse and
clarity, `/code-review` for bugs). It looks for what tools can't see: helpers that already exist,
logic duplicated in different words, unclear names, functions doing two jobs.

### 1.6 When unsure
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
| Nesting depth inside a function | 2 |
| Cyclomatic complexity | 12 |
| Cognitive complexity (how hard it is to *read*) | 10 |

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

### 3.4 Readability

**Never nesting** 🔒 (depth 2): handle the special case first and leave the function early.
```ts
// no                                   // yes
if (definition) {                       if (!definition) {
    if (definition.placeable) {             return reject(...);
        place(...);                     }
    }                                   if (!definition.placeable) {
}                                           return reject(...);
                                        }
                                        place(...);
```
Loops inside loops become a helper function or a precomputed list (see `NEIGHBOUR_CELL_OFFSETS`).

**Names** 🔒: at least two characters, except `x`, `y` (coordinates) and `_` (unused). No `e`, `s`,
`a`/`b`, `i`: write `event`, `structure`, `left`/`right`, `tileIndex`. Booleans read as questions
(`isPlaceable`, `hasStructureAt`). Functions start with a verb (`computeFootprintTiles`).

**No magic numbers** 🔒 in `sim` logic: every number except -1, 0, 1, 2 gets a named constant that says
what it means. Balancing values belong in `defs/`, not in systems.

**One function, one job.** If you need "and" to describe it, split it. A function either changes state
or returns information (command-query separation), not both, unless the name says so (`createStructure`).

**No flag parameters.** `setVisible(true)` / `place(tile, true)` hide meaning. Use two functions or an
options object with named fields.

**Pure where possible.** Prefer functions that take input and return output. Do not modify parameters
🔒 (`no-param-reassign`); systems mutate only the `WorldState` they are given.

**Consistent shape** 🔒: class members are ordered fields → constructor → public → private methods.
Files are ordered imports → constants → types → exports → private helpers.

**Prefer clear over clever.** No nested ternaries 🔒, no bit tricks outside `core/hash2d`, no
one-liners that need a comment to be understood.

### 3.5 No duplication (DRY, with judgement)

**Enforced** 🔒: `npm run dup` (jscpd) fails on copy-paste of ≥ 40 tokens in source and ≥ 70 tokens in
tests. SonarJS additionally flags identical functions and branches.

**Before writing a helper, search for it.** Helpers have a fixed home, so there is one place to look:

| Kind of helper | Lives in |
|---|---|
| Coordinate math, footprints, rotation | `sim/src/grid/grid_math.ts` |
| Sort order (`byId`, `byCoord`) | `sim/src/core/ordering.ts` |
| Seeded randomness | `sim/src/core/hash2d.ts` |
| Definition lookup | `sim/src/defs/definition_lookup.ts` |
| Test builders (`placeCommand`, ...), `findEvent`, shared scripts | `sim/test/fixtures/` |

**DRY means one place for each piece of knowledge**, not "no two lines look alike". Two functions that
look the same but change for different reasons (structure layer vs. resource layer) may stay separate.
Rule of three: when the same logic appears a third time, extract it. Don't build abstractions for
cases that don't exist yet (YAGNI).

Tools only find copy-paste. The same idea written differently is caught in the review pass (§1.5).

### 3.6 Formatting 🔒
Prettier decides (4 spaces, single quotes, trailing commas, width 110). Don't discuss style in reviews.

### 3.7 Comments
- Exported API gets a TSDoc comment explaining *what* and any non-obvious constraint.
- Inside functions, comments explain *why*, never *what*.
- Reference contracts where relevant: `// architecture §5.2: receiver decides acceptance`.
- No commented-out code. Git remembers.

### 3.8 Errors
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
