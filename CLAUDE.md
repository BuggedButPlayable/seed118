# S.E.E.D 118: notes for Claude

Calm browser factory game: the player assembles the periodic table the way stars do (fusion, neutron
capture, decay). Daniel owns design, lore and visuals; Claude writes the code.

## Where things are
| Need | Read |
|---|---|
| How to write code, workflow, Definition of Done | `docs/seed118_coding_rules.md` (binding) |
| System guarantees (determinism, layers, save) | `docs/seed118_architecture.md` (binding) |
| Game mechanics, machines, chapters, milestones | `docs/seed118_game_design.md` (draft) |
| Canon, tone, hard constraints | `docs/seed118_context.md` |
| Lore internals (never player-facing) | `docs/seed118_lore.md`, `docs/seed118_timeline.md` |

Read only the sections a task needs. The game design doc is long, so jump to the relevant heading.

## Code
- `game/packages/sim`: deterministic simulation (TypeScript, zero runtime deps). Public API: `src/index.ts`.
- `homepage/`: Astro website, separate project with its own tooling.
- All commands run in `game/`: `npm run check` (format, lint, typecheck, tests) is the definition of
  "done". `npm run lint:fix` and `npm run format` fix most style issues.

## Non-negotiables (enforced by lint, hooks and CI)
- `sim` imports nothing from other packages and never touches DOM, time or `Math.random`.
- Packages import each other only via `@seed118/<pkg>`.
- No `any`, no `!`, no `var`, no inline `eslint-disable`, no `--no-verify`.
- Size limits: 300 lines per file, 60 per function, 4 params, depth 3.
- Invalid player commands emit `CommandRejected`; they never throw.
- New persistent state needs a save version bump, a migration and a roundtrip test.

## Workflow
- Branch from `develop`, one feature slice per PR (≤ ~400 changed lines), Conventional Commits.
- Order: types → failing tests → implementation → cleanup → docs.
- Ask Daniel before adding dependencies or deciding gameplay numbers, lore wording or visuals.
- Player-facing text is English. Docs for Daniel may be German.
