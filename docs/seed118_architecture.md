# S.E.E.D 118 — Architecture & Implementation Contract

This document defines the non-negotiable engineering constraints for S.E.E.D 118.
If a change violates this contract, the change must be rejected or this file must be updated explicitly.

Version: v2.0 (TypeScript) · Changes from v1 (Godot): engine, API names, enforcement section.

## 0. Scope & Authority

This document is the single authoritative architecture and implementation contract for S.E.E.D 118.
All code must comply with the rules defined here.
`seed118_context.md`, `seed118_lore.md`, and `seed118_timeline.md` remain authoritative for their respective domains.
`seed118_coding_rules.md` defines how code is written and is equally binding.
Any architectural change requires an explicit update to this file.

## 1. Core Principles

- TypeScript, browser-first (later desktop via a wrapper such as Tauri/Electron).
- Rendering with PixiJS; the simulation is a headless TypeScript package (`@seed118/sim`).
- Deterministic fixed-step simulation.
- Simulation owns all world state.
- View is read-only and may never mutate world state.
- UI emits intent only (commands), never effects.
- 2D, top-down
- Data-driven design
- Composition over inheritance
- The render tree is a projection of simulation snapshots, never a source of truth

## 2. Time and Determinism

- All world mutations happen only during simulation ticks.
- Commands are applied in a deterministic order (FIFO by enqueue order).
- Given the same initial state and the same command stream, the resulting world state must be identical.

## 3. Layer Boundaries

Packages map to layers: `sim` = Simulation, `render` = View, `ui` = UI, `runtime` = loop/input/platform
glue. Allowed imports are enforced by ESLint (see `seed118_coding_rules.md` §2.1).

### Simulation (Authoritative)
Owns:
- World seed
- Tick index
- Chunk state required for gameplay
- Entity state
- Persistence flags (persistent chunks)
Emits:
- Simulation events describing results

### View (Read-only)
May:
- Request snapshots
- Render snapshots
- Render previews (ghosts), overlays, debug info
Must not:
- Create or persist world state
- Apply commands
- Write into simulation structures

### UI (Intent)
May:
- Read input and create commands
- Maintain local tool state (selected item, preview rotation, etc.)
Must not:
- Mutate simulation state directly

## 4. Design Constraints

- Fixed-step simulation (no frame-dependent logic)
- Simulation logic operates on plain data, not on render objects
- Rendering may interpolate visually but must not affect logic
- Save data, not render objects

## 5. Simulation Model

- All transport and processing happens in simulation ticks
- Items and entities are logical data (IDs, plain objects, typed arrays), not render objects
- Derived state must be computed, not stored
- Item movement between entities is performed by a dedicated simulation step and must not be embedded implicitly in individual machine logic.

### 5.1 Port-Based Transfer Model

All item transfers are defined in terms of **ports on tile edges**.

- Each entity exposes zero or more ports on its footprint tiles.
- Each port is associated with exactly one tile edge (N, E, S, W).
- Each port has a direction: `'input'` (may receive items) or `'output'` (may provide items).
  An edge without a port does not interact.

Ports are defined **data-driven** in the structure definitions (`packages/sim/src/defs/`) and are rotated
together with the structure footprint.

A transfer between two neighboring tiles is only considered if:
- The source tile exposes an OUT port on the shared edge
- The target tile exposes an IN port on the opposite edge

Placement is always allowed regardless of port compatibility; incompatible ports simply result in no transfer.

### 5.2 Receiver-Gated Item Acceptance

Item movement follows a **receiver-gated rule**:

- The receiving entity (input port) is the sole authority on whether an item type is accepted.
- Sending entities must not encode or assume acceptance rules of other entities.
- A transfer may only occur if the receiving input port explicitly accepts the item type.

Acceptance rules are part of the simulation layer and must be:
- Deterministic
- Data-driven
- Evaluated exclusively during simulation ticks

This rule enables machines with restrictive inputs (e.g. accepting only specific elements)
without coupling transfer logic to sender-side machine knowledge.

## 6. Commands and Events

### Commands
- Commands describe intent only.
- Commands are the `Command` union in `packages/sim/src/types/commands.ts`.
- A command may be rejected; the rejection event carries the full `rejectedCommand` (and with it its
  type) plus a `reason`.

### Events
- Events describe the result of applying commands or simulation progress.
- Events must be sufficient for view updates without view-side state mutation.

## 7. Rotation Policy

- Entities have a rotation stored as part of world state.
- Rotation is chosen during preview and committed only via the place command payload.
- Rotation is creation-time only: no rotate command exists.
- After placement, changing orientation requires remove + re-place.

## 8. Entity Footprints (Multi-tile)

- Each structure type has a footprint (tile offsets) defined in its `StructureDefinition`.
- The structure definitions are the single source of truth for footprints. Simulation and preview both
  use `rotateOffsets` / `computeFootprintTiles` from `@seed118/sim`.
- Placement validity checks all footprint tiles.
- Removal clears all footprint tiles (clicking any occupied tile removes the full entity).
- Footprints are rotated using the same rule as preview: rotating around the anchor. 

## 9. Chunk Lifecycle and Persistence

### Ephemeral Resources
Ephemeral resources are deterministic, regenerated data that is not saved.
- Resources may be generated when flying the camera through space.
- Resources are derived from `world_seed` and spatial coordinates.
- Resources are not mutable and are not saved.

### Persistent Chunks
A persistent chunk is a chunk that must be saved because build mutations occurred there.
- A chunk becomes persistent only after a successful world mutation (place/remove).
- Camera focus/streaming must not make a chunk persistent.
- Multi-tile mutations must mark all affected chunk coordinates persistent.
- Persistent chunk state is included in save files.

## 10. Save / Load (v1)

Save files include only state that cannot be reconstructed deterministically:
- Version
- World seed
- Tick index (optional but supported)
- Entities: id, type, anchor position, rotation
- Persistent chunk coordinates

Load rules:
- World is reset from seed.
- Persistent chunks are restored first.
- Entities are restored next.
- Occupancy is rebuilt from entity data using footprints and rotation.

## 11. Public Simulation API Freeze

Gameplay/UI/View may only rely on what `packages/sim/src/index.ts` exports, in particular:
- `SimCommandQueue.enqueueCommand(command)` / `drainCommands()`
- `SimWorld.tick(commands, outEvents)`
- Snapshot getters on `SimWorld` (`getStructures`, `getStructureIdAt`, `getResourceIdAt`, `getTickIndex`, `getWorldSeed`)
- Save/Load entry points (`saveV1`, `loadV1`)
- Definitions and shared geometry (registries, `rotateOffsets`, `computeFootprintTiles`)

Anything else is internal and must not be called across layers.

## 11.1 Internal Simulation Systems (Non-Public)

Within the simulation layer, internal systems may be used to structure gameplay logic.
These systems are **implementation details** and are not part of the public simulation API.

Rules:
- Systems operate only on simulation data (entities, ports, items).
- Systems must be stateless; all mutable state resides in `SimWorld`.
- Systems must be executed in a fixed, deterministic order during each simulation tick.

Typical examples include:
- Machine update systems (production, processing)
- Item transfer systems (port-to-port movement)
- Consumption systems (e.g. core intake)

The existence of systems does not introduce new architectural layers
and does not relax determinism or save/load constraints.

## 12. Determinism Guard

- A headless determinism smoke test must exist.
- A Save→Load→Hash determinism test must exist.
- Both live in `packages/sim/test/integration/determinism/` and run on every commit and in CI.
- Golden hashes may be used as regression guards; updating them is an explicit action.

## Appendix A: Code Style

Code style is binding and defined in `seed118_coding_rules.md`.

---

## Architecture Freeze — Pre-Gameplay Baseline

The architecture defined in this document is considered **stable and frozen** as the baseline
before gameplay implementation begins.

The following rules are now explicitly binding:

### Command Rejection Contract
- Any rejected command **must** emit the canonical event `EventType.CommandRejected`.
- The rejection payload **must** include:
  - `rejectedCommand` (which carries the command type)
  - `reason` (`RejectReason`)
- Optional diagnostic data may be provided via `details`.
- No ad-hoc rejection events or free-form rejection payloads are permitted.

### Determinism as a Hard Gate
- Determinism tests are mandatory and act as a regression gate:
  - Headless determinism smoke test
  - Save → Load → Hash determinism test
- Gameplay code must not introduce:
  - Non-seeded randomness
  - Frame-time (`delta`) dependent logic, `Date`, timers
  - External time or OS state dependencies

### Rotation and Placement Policy (Final)
- Entity rotation is defined only at placement time.
- No rotate command exists.
- Changing orientation requires explicit remove and re-place.
- Simulation and preview must use identical footprint rotation rules.

### Gameplay Extension Rule
Any new gameplay system must:
1. Be expressible entirely within the simulation layer
2. Be saveable and loadable without derived-state reconstruction
3. Preserve determinism guarantees
4. Expose results exclusively through simulation events

If a proposed change violates any of the above, this document must be updated explicitly
before the change is allowed.