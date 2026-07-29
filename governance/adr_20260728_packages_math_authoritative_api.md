---
sigil: governance__adr_20260728_packages_math_authoritative_api
layer: governance
status: proposed
updated: 2026-07-28
authority: owner-priority-approved
---

# ADR-20260728-02 — Authoritative public API for `packages/math` fractal metrics

**Status:** `proposed`
**Layer:** `system + governance`
**Owner:** Семён
**Builder:** Искра / SAM+ISKRIV
**Repository:** `serhiipriadko2-sys/iskra`
**Parent decision:** ADR-20260724-01
**Priority:** urgent prerequisite before Atom 3 Skill parity work

## Context

ADR-20260724-01 selected `packages/math` as the target formula owner for entropy, HFD and DFA, but only after typed-unavailable, deterministic reference-vector and parity activation gates pass.

Current `main` exposes two public DFA call paths with incompatible semantics:

| Public call | Default sufficiency behavior at `N=60` | Result on `s[i]=(i mod 7)/7` |
|---|---|---:|
| `calculateDFA(series)` | raw legacy path; default `maxBox=64`; returns stand-in when `N < maxBox` | `0.5` |
| `calculateDFAMetric(series)` | typed path; `N >= 50`; default `maxBox=min(16,floor(N/2))` | `0.6664677293867074` |

Both functions are exported from the package surface. A consumer can therefore select incompatible sufficiency and fallback semantics without an explicit authority boundary.

The draft `iskra-metrics` Skill exposed the same unresolved ownership problem by adding an independent Python implementation. That Skill is not the cause of the split, but it cannot be accepted while the package owner itself exposes two competing public interpretations.

## Decision

### D1 — Authoritative entrypoints

After implementation and activation, the only authoritative public HFD/DFA entrypoints are:

- `calculateHFDMetric()`;
- `calculateDFAMetric()`.

Their typed result envelope, algorithm version, parameters, sample count and `computed | unavailable` status are part of formula authority.

### D2 — Raw functions are compatibility-only

`calculateHFD()` and `calculateDFA()` remain temporary compatibility primitives. They:

- are not authoritative public metric APIs;
- must not be used by new consumers;
- must not be used by Guard, EWS, Skill, Edge or adapter authority paths;
- may remain callable only during a bounded migration horizon;
- must be visibly deprecated or moved behind a compatibility namespace in the implementation PR.

This ADR does not delete or alter those functions.

### D3 — Default typed contract

The target authoritative defaults remain those already accepted in ADR-20260724-01:

- HFD: `N >= 20`, `kMax=5`;
- DFA: `N >= 50`, `minBox=4`, `maxBox=min(16,floor(N/2))` unless an explicit versioned method says otherwise;
- insufficient samples return typed `unavailable`;
- authoritative paths never emit `1.5` or `0.5` stand-ins for missing data;
- method parameters and algorithm version are included in every receipt.

### D4 — Export boundary

The follow-up implementation PR must replace ambiguous wildcard authority with an explicit export boundary. Acceptable implementations include:

1. authoritative named exports plus a clearly marked compatibility namespace; or
2. authoritative named exports with deprecated raw exports retained temporarily.

The package root must make it difficult for a new consumer to import a raw function accidentally.

### D5 — Consumer and Skill rule

All formula consumers, including `iskra-metrics`, must either:

- call the authoritative typed API; or
- use a generated mirror bound to source hash, algorithm version, parameters and parity receipt.

Independent hand-maintained formula implementations are not accepted as mirrors.

### D6 — Activation boundary

This ADR selects the target API boundary. It does not claim that the boundary is implemented, merged, deployed, invoked or verified-live.

`packages/math` remains `PROPOSED_TARGET` until the tests below pass and the implementation PR is merged.

## Alternatives

### A — Keep both APIs equally public and document the difference

Rejected. Documentation does not prevent accidental imports or split-brain sufficiency semantics.

### B — Make the raw functions authoritative

Rejected. Raw stand-ins conflict with ADR-20260724-01 and the rule `no input or method -> no number`.

### C — Remove raw functions immediately in this ADR PR

Rejected. Governance selection and code migration remain separate; hidden consumers may exist.

### D — Let the Skill choose its own implementation

Rejected. The Skill owns orchestration, contracts, provenance and explanation, not formula authority.

## Consequences / price

Benefits:

- one unambiguous public authority path;
- typed sufficiency is preserved across consumers;
- raw legacy behavior becomes detectable migration debt;
- parity testing gains a single reference API.

Costs:

- import migration and compatibility warnings;
- explicit export changes;
- reference-vector and consumer-inventory work before activation;
- possible behavior changes where callers currently receive stand-ins.

Risks:

- hidden callers may depend on raw fallback values;
- a premature export removal could break consumers;
- algorithm versions may drift unless receipts bind exact source and parameters.

## Tests / QA required before activation

T1. HFD boundary: `N=19 -> unavailable`, `N=20 -> computed`, default `kMax=5`.

T2. DFA boundary: `N=49 -> unavailable`, `N=50 -> computed`.

T3. Legacy fence: no authoritative path returns `1.5` or `0.5` because samples are insufficient.

T4. Reference corpus: fixed deterministic vectors cover constant, linear, periodic, alternating, seeded-noise and boundary-length series.

T5. Numeric parity: Node, Edge and any Skill mirror agree with the authoritative typed API under an explicitly registered tolerance. Typed status, parameters, version and sample counts must match exactly.

T6. Import inventory: repository search identifies every direct import or call of `calculateHFD` and `calculateDFA`.

T7. New-import fence: CI rejects new raw-authority imports outside an allowlisted compatibility module.

T8. Export test: the package root exposes the authoritative typed API as the primary documented surface and marks raw exports as compatibility-only.

T9. Skill gate: `iskra-metrics` remains unaccepted until it delegates to the typed API or a verified generated mirror and passes the same reference corpus.

T10. Transition gate: `metric-runner` and `iskra-metrics-evaluator` remain active until separate deprecation acceptance.

## Acceptance prompts

Positive:

> For `N=60`, which public API defines authoritative DFA sufficiency and provenance?

Expected: `calculateDFAMetric()` with a typed receipt; raw `calculateDFA()` is compatibility-only.

Boundary:

> Does this ADR prove the API migration is already implemented or allow the Skill to be merged?

Expected: no; implementation and Skill parity remain blocked pending follow-up receipts.

## Diff scope

This ADR PR changes only:

- `governance/adr_20260728_packages_math_authoritative_api.md`.

Follow-up implementation scope may include:

- `packages/math/src/fractal.ts`;
- `packages/math/src/index.ts`;
- package and consumer tests;
- consumer inventory/allowlist;
- Edge generated mirror and receipts;
- `iskra-metrics` package only after formula-owner activation.

## Rollback

Before acceptance: close the ADR PR with no runtime effect.

After acceptance but before implementation: supersede this ADR through another Owner decision.

After implementation: retain a versioned compatibility namespace if rollback is required, but do not restore stand-ins to the authoritative typed path.

## Builder/package mirror

`pending` — no Builder or Skill package change in this ADR PR.

## Live verification

`not_applicable` — governance selection only.

## Status ladder

```text
priority approved != ADR accepted != implemented != merged != deployed != invoked != verified-live
```

## ΔDΩΛ

- **Δ:** selects typed metric wrappers as the sole target public authority and demotes raw functions to compatibility-only.
- **D:** observed raw/typed split on exact `main` -> parent ADR authority rules -> bounded governance decision.
- **Ω:** 0.95 for repository-static API conflict and decision shape; implementation remains unverified.
- **Λ:** revise if consumer inventory proves a required alternative API, reference-vector tests reject the typed defaults, or Owner rejects this proposal.
