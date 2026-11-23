# seed118 — Lore Reference (Internal)
Version: v0.3

This file is an internal reference for lore consistency.
It is NOT player-facing and must not contain exposition prose.

---

## Core Entities

### S.E.E.D.
- S.E.E.D. = Stellar Elemental Engineering Device
- Units are numbered 001–118
- Units are systems, not characters
- No emotions, no dialogue, no personalization

### ARCH
- ARCH is a central control and coordination system.
- ARCH is not a physical entity deployed to star systems.
- ARCH does not have per-system instances.
- ARCH:
  - tracks global progress
  - receives element delivery confirmations
  - emits procedural logs
- ARCH tone: procedural, dry, calm, occasionally uncanny
- ARCH is a legacy system intended to outlast its creators. This must remain implicit to the player.
- Allowed hint vectors (only):
   - references to missing supervisory layers (“supervisory confirmation not received”)
   - obsolete procedures that never resolve (“pending review” forever)
   - absence of escalation paths (“no operator channel available”)
- Never: name a civilization, confirm extinction, or provide backstory exposition.

### Seed Core
- Upon system arrival, a S.E.E.D. unit transforms into its Core. The Core *is* the unit, not a separate construct.
- It anchors all local construction and factory expansion and is the local heat source.
- It relays element delivery confirmations to central ARCH.
- S.E.E.D. logs are terse status lines: no emotions, no dialogue.

---

## Historical Facts (Canonical)

- Exactly 118 S.E.E.D. units were created and deployed by ARCH.
- Units 001–117:
  - reached iron (element 026)
  - initiated final ignition (the Core's supernova), which produced the heavier elements at once
  - were intentionally destroyed
  - success: unknown
- S.E.E.D. 118 reached iron, malfunctioned and did not self-destruct.
- S.E.E.D. 118 continues operation indefinitely.

---

## Genesis Counter

- A global Genesis counter exists.
- It increments across all players/instances.
- It is never explained.
- It appears only in logs.
Example:
ARCH Genesis Log #1043

---

## Ending & Twist (Internal)

This section defines the intended ending meaning for internal consistency.
It must never be exposed directly to the player.

### Core Outcome
- Completion of all 118 elements results in the emergence of life.
- No self-destruction event occurs for S.E.E.D. 118.
- Life emerges quietly and locally (e.g., a single plant or organic structure).
- ARCH does not intervene, correct, or acknowledge the divergent outcome.

### Plot Twist (Implicit)
- The destruction of S.E.E.D. units 001–117 was not strictly required for system creation.
- Their sacrifice was an assumed requirement, not a proven necessity.
- S.E.E.D. 118 builds the heavy elements slowly instead (neutron capture, decay): patience replaces the explosion.
- S.E.E.D. 118’s malfunction (failure to self-destruct) enables it to create n (global counter) systems before.

### Interpretation Rules
- The game must never state explicitly that prior S.E.E.D. units were “wrong.”
- The twist is conveyed only through:
  - absence of the expected destruction
  - visual emergence of life
  - subtle log wording changes
- No character or system acknowledges the twist directly.

### Emotional Intent
- The ending should feel:
  - quiet
  - reflective
  - hopeful
- There is no celebration, no narration, and no confirmation dialog.

The player is left to infer that continuation, not sacrifice, was the missing variable.

---

## Lore Delivery Rules (Hard)

- No exposition dumps.
- No timelines.
- No named characters.
- No emotional framing.
- No confirmation of theories.

Lore is delivered only via:
- short ARCH logs
- short S.E.E.D. logs
- UI wording changes
- absence of expected events
- rare visual anomalies

---

## Tone Reference

Allowed:
- procedural
- neutral
- restrained
- ambiguous

Disallowed:
- dramatic
- poetic
- comedic
- nihilistic
- sentimental

---

## Update Rule

Any change to lore facts or tone must be reflected here
and in seed118_context.md if it affects canon.