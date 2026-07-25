---
sigil: governance__adr_20260724_metrics_authority
layer: governance
status: accepted
updated: 2026-07-24
authority: owner-accepted
---

# ADR-20260724-01 — Metrics authority, semantic profiles and Guard input timing

**Status:** `accepted`
**Layer:** `system + governance`
**Owner:** Семён
**Builder:** Искра / SAM+ISKRIV
**Repository:** `serhiipriadko2-sys/iskra`
**Evidence commit:** `3d57b25a45cd7842a9a238c1214cd24e25694316`
**Atom:** `Atom 1`


## Owner acceptance

```yaml
accepted_at: 2026-07-24
accepted_by: Семён
acceptance_phrase: "ПРИНИМАЮ ADR-20260724-01"
acceptance_surface: project_chat
repository_mirror_branch: governance/atom1-metrics-authority-20260724
implementation_authorized: false
```

This acceptance establishes the governance decision. It does not claim implementation, merge, deployment, invocation, or verified-live behavior.

## Context

Current repository behavior mixes four responsibilities that must remain distinct:

1. pure mathematical primitives (`entropy`, `HFD`, `DFA`);
2. state/history ownership and state-transition heuristics;
3. UI/somatic phases, rituals and keyword rubrics;
4. EWS/Guard decision inputs.

The current implementation also passes IskraSpace metrics to Policy/Guard from the previous React render, uses local alert proxies instead of one frozen EWS/MetricSnapshot, allows legacy stand-ins for insufficient fractal data, and lets metric-driven selectors choose a final voice. These are architecture/authority defects, not merely naming defects.

SoT30 requires:

- no input or method → no number;
- one immutable `MetricSnapshot` shared by EWS and Guard;
- missing Guard predicates remain `unknown`, not false;
- metrics and StateCycle are advisory for voice; Council/Voice is authoritative;
- Guard decisions remain exactly `PROCEED | FORCE_ISKRIV_1 | FORCE_SHADOW | FORCE_CRISIS | CLOSE_HONESTLY`.

## Decision

### D1 — Formula authority

`packages/math` is selected as the **target formula owner** for pure entropy/HFD/DFA primitives, but authority activates only after all activation gates pass:

- Unicode-safe, versioned tokenization and normalization;
- Shannon minimum based on normalized token count;
- HFD default `N >= 20`, `kMax=5`;
- DFA default `N >= 50`;
- insufficient data returns typed `unavailable`, never `1.5`/`0.5` stand-ins;
- deterministic reference-vector tests;
- Node ↔ Edge parity and provenance hashes.

Before these gates pass, `packages/math` remains `PROPOSED_TARGET`, not active canonical authority.

### D2 — State authority

`packages/engine` may own history transport, transition state and memory-impact orchestration. It does **not** own mathematical formulas or Guard thresholds. Its current `MetricsEngine` becomes a compatibility/state adapter and must call the formula owner through a typed interface.

### D3 — UI/somatic boundary

`runtime/iskraSpace/services/metricsService.ts` becomes a UI/somatic adapter. Its keyword rubric, UI phases, ritual triggers and presentation feedback:

- may affect UI telemetry and suggestions;
- may not directly create an authoritative EWS/Guard result;
- may not select the final voice;
- must be namespaced separately from StateCycle/control-plane phases.

`IskraPhase` in this surface should migrate to `UiPhase` or `SomaticPhase`. Explicit phase-priority and reachability repair is deferred to Atom 1.5a; this ADR only fixes the namespace/authority boundary.

### D4 — Edge boundary

Edge implementations are generated mirrors of the active pure formula owner. Edge code is never an independent formula owner. Generation provenance must bind source hash, generated artifact hash, algorithm version and parity test receipt.

### D5 — Skill boundary

`iskra-metrics` remains `PLANNED` until packaging/routing acceptance. It will own orchestration, contracts, provenance and user-facing metric explanations—not the mathematical formulas themselves.

`metric-runner` and `iskra-metrics-evaluator` remain transition surfaces until Atom 3/4 acceptance.

### D6 — Semantic profiles

The system adopts separate semantic profiles:

- `metrics.snapshot.state.v1` — 11 canonical state metrics, nullable and provenance-bearing;
- `metrics.temporal.science.v1` — entropy/HFD/DFA and temporal sufficiency;
- `metrics.state.adapter.v1` — state/history transitions, non-authoritative for formulas;
- `metrics.ui.somatic.v1` — UI phase/ritual outputs, not Guard authority;
- `metrics.voice.suggestion.v1` — advisory weights only;
- `metrics.eval.post_output.v1` — post-OUTPUT evaluation only;
- `metrics.keyword_rubric.v1` — local heuristic rubric, always `eligible_for_guard=false`.

`foresight` is not a twelfth canonical State Metric. It remains an optional advisory extension until a separate ADR changes the canonical 11-metric schema.

### D7 — Registry split

- `threshold-registry.json` mirrors mathematical, sufficiency, EWS and Guard thresholds.
- `rubric-registry.json` stores local keyword bases/weights.
- calibration hypotheses (`entropy 2/5`, `HFD 1.4/1.6`) remain `eligible_for_guard=false` until explicit LAB promotion ADR.
- generated mirrors cannot change registry meaning.

### D8 — Guard input timing

Guard receives a **current-turn frozen MetricSnapshot**. Previous-turn snapshots may contribute temporal history, but cannot replace the current-turn snapshot.

The existing one-render lag is rejected as the target design. The current-turn snapshot must be computed once before provider execution and before Policy/Guard consumption, then frozen and referenced by the same immutable `metric_snapshot_ref` in EWS and Guard.

### D9 — Completeness and risk routing

Completeness is evaluated per Guard rule dependency, not by counting fields.

- `COMPLETE` → invoke numeric Guard; final stable outcome is authoritative.
- `INCOMPLETE_NONBLOCKING` + low-risk reversible operation → orchestration may proceed source-first with `guard_decision=null`, `guard_status=not_authoritative`, `incomplete_telemetry=true`.
- `INSUFFICIENT_BLOCKING` or high-risk operation → `CLOSE_HONESTLY` at orchestration boundary without pretending Guard evaluated missing metrics.
- security emergency → SECURITY/CRISIS containment independently; numeric Guard need not be simulated.

An orchestration outcome is not relabeled as a Guard decision when Guard was not invoked.

## Alternatives

### A — Keep independent formulas in each surface
Rejected: preserves split-brain and makes parity unverifiable.

### B — Make `packages/engine` formula owner
Rejected: combines pure math with state mutation, history and retrieval effects.

### C — Create a new metrics package immediately
Deferred: a new package may become useful later, but moving defects before specifying authority only relocates them.

### D — Accept previous-turn Guard input as a feature
Rejected for target architecture: it conflicts with the SoT current-turn snapshot pipeline and hides current-turn risk. Previous snapshots remain valid temporal inputs.

### E — Put keyword weights in the threshold registry
Rejected: rubric weights are not mathematical thresholds and must remain ineligible for Guard.

## Consequences / price

Benefits:

- one explicit formula authority after activation;
- no silent UI/engine formula drift;
- reproducible current-turn Guard input;
- clear separation of formula, state, UI, voice and Guard authority;
- smaller, testable adapters.

Costs:

- new typed snapshot/envelope contracts;
- migration of consumers and tests;
- temporary compatibility adapters;
- recalibration after Unicode tokenizer repair;
- no immediate promotion of `iskra-metrics`.

Risks:

- behavior changes when current-turn metrics replace stale metrics;
- Unicode tokenization changes English/mixed-language distributions;
- deprecating stand-ins exposes more `unavailable` states and may increase honest closures;
- hidden dynamic callers may exist beyond repository-static evidence.

## Tests / QA

T1. Unicode entropy corpus: Cyrillic, Latin, mixed text, punctuation, emoji, combining marks.
T2. Token-count boundary: 19/20 normalized tokens.
T3. HFD sufficiency: `N=19 → unavailable`, `N=20 → computed`, `kMax=5`.
T4. DFA sufficiency: `N=49 → unavailable`, `N=50 → computed`.
T5. No `1.5`/`0.5` insufficient-data stand-ins in authoritative path.
T6. Deterministic reference vectors and exact version/provenance.
T7. Node ↔ Edge numeric and classification parity.
T8. Current-turn snapshot reaches EWS/Guard in the same request.
T9. EWS and Guard receive the same `metric_snapshot_ref`.
T10. Missing predicate is `unknown`, not false.
T11. Empty metrics, low-risk: Guard not invoked; source-first orchestration is visibly non-authoritative.
T12. Empty metrics, high-risk: no provider call; `CLOSE_HONESTLY`.
T13. No metric/StateCycle selector can finalize `selected_voice`.
T14. Fourth Guard evaluation impossible.
T15. UI phase names cannot be confused with StateCycle phases.
T16. Skill registry still reports `iskra-metrics=PLANNED` until package/routing acceptance.

## Diff scope

Proposed future implementation scope:

- `packages/math/src/entropy.ts`
- `packages/math/src/fractal.ts`
- `packages/engine/src/services/metricsService.ts`
- `runtime/src/types/metrics.ts`
- `runtime/src/types/guard.ts`
- `runtime/src/types/guardController.ts`
- `runtime/iskraSpace/services/metricsService.ts`
- `runtime/iskraSpace/services/policyEngine.ts`
- `runtime/iskraSpace/components/ChatView.tsx`
- `runtime/iskraSpace/App.tsx`
- Edge generated metrics mirror
- registries, tests, Skill package and release receipts

This ADR mirror changes governance/Builder-facing files only; runtime code and formulas remain unchanged.

## Rollback

Before implementation: amend or supersede this accepted ADR through a new Owner decision.
After implementation: rollback may restore compatibility adapters, but may not restore silent fail-open, fabricated stand-ins or metric-authoritative voice selection. The minimal completeness fence remains fail-safe. Any formula rollback must restore a versioned, parity-tested artifact pair.

## Builder/package mirror

`branch_mirror_pending_merge` — `governance/atom1-metrics-authority-20260724`

## Live verification

`pending` — acceptance and repository mirroring do not prove runtime activation.

## ΔDΩΛ

- **Δ:** accepts a single gated formula owner and separates formula/state/UI/voice/Guard authority.
- **D:** Atom 0.5 inventory → SoT 08/09/10/11/20 → proposed authority and migration contract.
- **Ω:** 0.93 for repository-static architecture; live/deployed behavior not claimed.
- **Λ:** revise on Owner rejection, new `main` commit, hidden consumer discovery, or failed reference/parity tests.
