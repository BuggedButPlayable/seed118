# seed118 — Canon & Context (Authoritative)
Version: v0.2

## Project Identity
- Gameplay project name: Project: ARCH
- Internal codename: seed118
- Publical communicated: SEED118 | SEED 118
- Player entity: S.E.E.D. 118 (Stellar Elemental Engineering Device — Unit 118)
- Genre: 2D top-down factory / automation
- Core inspiration: Shapez / Factorio (conceptual only; no copying)

## Core Progression
- The periodic table is authoritative progression, progress tracker, and narrative backbone.
- Goal: assemble elements and deliver them to the local S.E.E.D core \ unit.
- Each delivered element = permanent progress (saved).
- Main ending: ~40–60 elements.
- True ending: all 118 elements.

## Core Loop
1) Extract (nebular) resources  
2) Transport via belts / tubes / ... 
3) Split elements (byproducts exist)  
4) Combine elements via rule-based recipes (not machine-specific)  
5) Handle waste (cheap early, constrained later)  
6) Deliver to Core  
7) Unlock next element / new machines (not every lvl) / new machine modes (not every lvl)

## Machines (Minimal Set)
- Extractor / Collector
- Belt / Tube / Transportation medium
- Splitter (filter / priority)
- Combiner (fusion + splitting via recipes)
- Bridge / Underground passage
- Sink / Dump
- Storrage
- Core (Hub) (arives; anchors the system and relays confirmations to ARCH)

Design rule: **Few machines, many rules.**  
No new machine every level. Machines are generic; recipes are data-driven.

## Lore (Implementation-Relevant)
- ARCH is a central control and coordination system (maybe an AI, a machine, a System, we don't know).
- ARCH is NOT deployed with S.E.E.D. units and does not exist as per-system instances.
- Exactly 118 S.E.E.D. units were created and deployed independently (Project: ARCH).
- ARCH is a legacy system designed to outlive its creators. Player-facing content must only imply this via hints; never state it directly.
- Upon arrival, each S.E.E.D. unit transformes into a Core.
- The Core is the initial construct around which all factories are built.
- The Core is the sole communication and confirmation relay to central ARCH.
- The Core is still S.E.E.D 118 just transformed.
- Units 001–117 completed their missions, delivered Logs to ARCH, then were intentionally destroyed during final ignition.
- Their systems were created but remained lifeless (cause ambiguous / TBD).
- S.E.E.D. 118 malfunctioned, did not self-destruct, and continues creating systems without life.
- Only by completing all 118 elements can life emerge without sacrifice.

## Genesis Counter (Global)
- A global Genesis counter exists across all players/instances.
- It appears only in logs, never explained, never in UI.
Example line:
ARCH Genesis Log #1043

## Lore Delivery Rules (Hard Constraints)
- No exposition dumps.
- Story is delivered via:
  - short ARCH logs
  - short S.E.E.D. logs
  - UI wording changes
  - absence of expected events (e.g., self-destruction)
  - visual anomalies
- Logs are optional, non-linear, and unlocked gradually.
- Ending is mostly silent; visual storytelling only.

## Visual Direction
- Stylized pixel art, abstract/schematic, machine-made.
- High readability > realism.
- Life breaks visual rules only near the true ending (e.g., plant).

## Savegame Screen Requirement
- Save selection shows the periodic table in the background.
- Only unlocked elements are visible (visual progress snapshot).

## Hard Constraints
- No combat
- No multiplayer
- No base defense
- No realistic chemistry simulation
- Combination of element should reflact the real world
- Periodic table is authoritative progression

## Emotional Target
- Feel: calm, clever, curious
- Ending: quiet, reflective, hopeful (not nihilistic, not comedic)

## Update Rule
Any change to lore, progression, core mechanics, tone, or constraints must be reflected here.