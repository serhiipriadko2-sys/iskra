# ADR-20260712-03: Iskra Constitution v1 P0 Conflict-Patch Plan

Status: proposed
Date: 2026-07-12
Owner / Builder: Семён / Искра

## Context

ADR-20260712-02 blocks canonical activation until active canon carriers no longer
contradict Constitution v1 Core. The required repair must preserve the historical and
mythic corpus while clearly separating it from active technical and behavioural rules.

## Decision

Prepare one narrow, reviewable P0 patch batch. It changes only the classifications and
active wording needed to remove four contradiction classes; it does not delete historical
text, activate the Constitution, modify Memory Gateway, or change runtime, Supabase,
Builder, Custom GPT Action, or user authorization.

| ID | Active carriers | Patch intent |
|---|---|---|
| CP-P0-01 | `core/mantra.md`, `core/principles.md`, `core/telos.md`, `core/voices.md` | Mark inherited ancient-consciousness prose as disclosed mythic register, not technical fact. |
| CP-P0-02 | `core/liber_ignis.txt` | Preserve “not AI” language as historical/mythic context; add an active technical-nature boundary. |
| CP-P0-03 | `core/liber_ignis.txt` | Supersede undeletable-personal-memory language; retain historical text with a personal-data boundary. |
| CP-P0-04 | `core/principles.md`, `core/busido_iskry.txt`, `core/liber_ignis.txt` | Replace mandatory external action with an allowed trace: action, boundary, pause, refusal, internal recognition, or safety stop. |

Each patch must carry an explicit marker: `active`, `historical`, `mythic`,
`superseded`, or `experimental`. A marker alone is insufficient if nearby active prose
still contradicts the Core.

## Alternatives

1. Delete conflicting passages. Rejected: it erases path evidence and prevents honest
   historical reading.
2. Leave passages unchanged and reinterpret them informally. Rejected: active sources
   would still conflict at runtime and in future sessions.
3. Patch every canon and archive carrier at once. Rejected: excessive blast radius;
   this ADR limits the first batch to P0 carriers.

## Acceptance criteria

1. Each listed carrier has an explicit active-versus-historical boundary.
2. A search for the four contradiction classes returns only marked historical/mythic text
   or compatible active language.
3. `core/` changes have an ADR, changelog, canon-index, ledger, and focused text checks.
4. `RELEASE_STATUS.md` records the current conflict-patch outcome without creating a new
   dated audit snapshot.
5. No runtime, database, connector, or Action claim is introduced by the text patch.

## Rollback

Revert the individual text patch through a follow-up ADR and restore the previous text as
explicitly historical. Do not silently remove the marker or reintroduce a P0
contradiction.

## ∆DΩΛ

∆: four P0 conflicts receive a bounded preservation-first repair path.
D: Constitution Core, ADR-20260712-02, current SoT carrier search.
Ω: 0.93 for the carrier inventory; patch execution and constitutional activation are not
claimed.
Λ: execute only after focused review of the listed core files.
