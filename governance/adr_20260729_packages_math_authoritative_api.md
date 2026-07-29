---
sigil: governance__adr_20260729_packages_math_authoritative_api
layer: governance
status: proposed
updated: 2026-07-29
authority: owner-priority-approved
---

# ADR-20260729-02 — Authoritative public API for `packages/math` fractal metrics

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

The conflict is wider than two scalar exports:

- `calculateFractalIndicators()` is also public and internally calls raw HFD/DFA functions;
- typed wrappers currently expose parameter overrides that may be silently normalized or may trigger legacy stand-ins;
- the typed result has no `invalid` outcome, so malformed signals may be classified differently depending on sample count;
- receipts may report requested parameters rather than the parameters actually used.

The draft `iskra-metrics` Skill exposed the same unresolved ownership problem by adding an independent Python implementation. That Skill is not the cause of the split, but it cannot be accepted while the package owner itself exposes competing public interpretations.

## Decision

### D1 — Authoritative scalar entrypoints

After implementation and activation, the only authoritative public scalar HFD/DFA entrypoints are:

- `calculateHFDMetric()`;
- `calculateDFAMetric()`.

Their typed result envelope, algorithm version, effective parameters, sample count, source provenance and status are part of formula authority.

### D2 — Compatibility-only surfaces

The following remain temporary compatibility surfaces and are not authoritative metric APIs:

- `calculateHFD()`;
- `calculateDFA()`;
- the current `calculateFractalIndicators()` implementation, because it calls raw primitives and returns untyped scalar fields.

These surfaces:

- must not be used by new consumers;
- must not be used by Guard, EWS, Skill, Edge or adapter authority paths;
- may remain callable only during a bounded migration horizon;
- must be visibly deprecated or moved behind a compatibility namespace in the implementation PR.

A future authoritative aggregate API must compose the typed scalar entrypoints and preserve each component status and provenance. The current aggregate must not be relabeled authoritative without that migration.

This ADR does not delete or alter code by itself.

### D3 — Typed result and validation precedence

The authoritative result union must distinguish at least:

```text
computed
unavailable
invalid
```

Required semantics:

- `unavailable` means valid input with insufficient samples;
- `invalid` means malformed/non-finite signal or invalid parameters;
- validation of signal values and parameters occurs before sample sufficiency;
- `NaN`, `Infinity`, non-numeric values and invalid parameter combinations never become ordinary insufficiency;
- user-data validation failures return a typed result rather than a legacy numeric stand-in;
- authoritative paths never emit `1.5` or `0.5` because data is missing or invalid.

Typed statuses, reasons and evidence fields must match exactly across Node, Edge and any generated mirror.

### D4 — Version-1 parameter contract

The version-1 authoritative methods are fixed methods, not freely configurable calculators:

- HFD: `N >= 20`, effective `kMax=5`;
- DFA: `N >= 50`, effective `minBox=4`, effective `maxBox=min(16,floor(N/2))`.

For version 1:

- omitted options use those effective defaults;
- an explicitly supplied value equal to the effective default may be accepted;
- a non-default `kMax`, `minBox` or `maxBox` must return typed `invalid_parameter`;
- implementations must not silently clamp or normalize a non-default request;
- alternative parameters require a separately named and versioned method contract, deterministic vectors and explicit acceptance before use in an authority path.

Therefore, examples such as `calculateHFDMetric(series, { kMax: 20 })` and `calculateDFAMetric(series, { maxBox: 64 })` cannot return `computed` under the v1 authoritative contract.

### D5 — Effective parameter provenance

Every computed receipt must report parameters actually used by the algorithm.

The authoritative envelope must include:

- `algorithm_version` bound to the exact method;
- `effective_parameters`;
- `requested_parameters` when options were explicitly supplied;
- `sample_count`;
- source/provenance hash or immutable formula reference.

A receipt must never report `kMax=20` when the algorithm actually used `kMax=10`, and a fixed-version label such as `hfd-v1-kmax5` must never accompany a different effective parameter set.

### D6 — Export boundary

The follow-up implementation PR must replace ambiguous wildcard authority with an explicit export boundary. Acceptable implementations include:

1. authoritative named exports plus a clearly marked compatibility namespace; or
2. authoritative named exports with deprecated raw exports retained temporarily.

The package root must make it difficult for a new consumer to import a raw or legacy aggregate function accidentally.

### D7 — Consumer and Skill rule

All formula consumers, including `iskra-metrics`, must either:

- call the authoritative typed API; or
- use a generated mirror bound to source hash, algorithm version, effective parameters and parity receipt.

Independent hand-maintained formula implementations are not accepted as mirrors.

### D8 — Activation boundary

This ADR selects a proposed target API boundary. It does not claim that the boundary is accepted, implemented, merged, deployed, invoked or verified-live.

`packages/math` remains `PROPOSED_TARGET` until all of the following hold:

1. the Owner explicitly accepts this ADR;
2. implementation is separately authorized;
3. the tests below pass on the implementation head;
4. the implementation PR is reviewed and merged;
5. an activation receipt records the exact merge commit, algorithm versions, source hashes and parity results.

Passing tests or merging code cannot by itself confer governance authority.

## Alternatives

### A — Keep both APIs equally public and document the difference

Rejected. Documentation does not prevent accidental imports or split-brain sufficiency semantics.

### B — Make the raw functions authoritative

Rejected. Raw stand-ins conflict with ADR-20260724-01 and the rule `no input or method -> no number`.

### C — Remove raw functions immediately in this ADR PR

Rejected. Governance selection and code migration remain separate; hidden consumers may exist.

### D — Let the Skill choose its own implementation

Rejected. The Skill owns orchestration, contracts, provenance and explanation, not formula authority.

### E — Permit arbitrary parameter overrides in the v1 wrapper

Rejected. A free override surface makes method identity, sufficiency and provenance ambiguous. Alternative configurations require separately versioned contracts.

## Consequences / price

Benefits:

- one unambiguous public authority path;
- typed sufficiency and invalidity are preserved across consumers;
- receipts describe effective execution rather than caller intent;
- raw legacy and aggregate behavior become detectable migration debt;
- parity testing gains a single reference API.

Costs:

- import migration and compatibility warnings;
- explicit export and result-type changes;
- migration of the aggregate API;
- reference-vector and consumer-inventory work before activation;
- possible behavior changes where callers currently receive stand-ins or use overrides.

Risks:

- hidden callers may depend on raw fallback values;
- hidden callers may depend on parameter overrides;
- a premature export removal could break consumers;
- algorithm versions may drift unless receipts bind exact source and effective parameters.

## Tests / QA required before activation

T1. HFD boundary: `N=19 -> unavailable`, `N=20 -> computed`, effective `kMax=5`.

T2. DFA boundary: `N=49 -> unavailable`, `N=50 -> computed`, effective `minBox=4`, `maxBox=min(16,floor(N/2))`.

T3. Invalid-signal precedence: non-finite or malformed values return typed `invalid` at both insufficient and sufficient lengths.

T4. Override fence: non-default HFD/DFA parameters return typed `invalid_parameter`; no silent clamp, normalization or legacy stand-in is allowed.

T5. Effective provenance: receipts report requested and effective parameters accurately, and the algorithm version matches the effective method.

T6. Reference corpus: fixed deterministic vectors cover constant, linear, periodic, alternating, seeded-noise, malformed and boundary-length series.

T7. Numeric parity:

- typed status, reason, effective parameters, algorithm version and sample counts match exactly;
- Node and generated Edge JavaScript outputs match exactly for the registered reference corpus;
- a cross-language generated mirror must satisfy `abs(candidate-reference) <= 1e-12 * max(1, abs(reference))` for every computed scalar;
- any relaxation of this bound requires a separate Owner-accepted calibration ADR and cannot be introduced only through a registry edit.

T8. Import inventory: repository search identifies direct and transitive uses of `calculateHFD`, `calculateDFA` and `calculateFractalIndicators`.

T9. Aggregate fence: the current `calculateFractalIndicators()` is compatibility-only; any replacement preserves typed component outcomes and calls authoritative scalar APIs.

T10. New-import fence: CI rejects new raw-authority imports outside an allowlisted compatibility module.

T11. Export test: the package root exposes typed APIs as the primary documented surface and marks raw and legacy aggregate exports as compatibility-only.

T12. Skill gate: `iskra-metrics` remains unaccepted until it delegates to the typed API or a verified generated mirror and passes the same reference corpus.

T13. Transition gate: `metric-runner` and `iskra-metrics-evaluator` remain active until separate deprecation acceptance.

T14. Governance gate: activation fails unless ADR acceptance, implementation authorization, merge SHA and activation receipt are present.

## Acceptance prompts

Positive:

> For `N=60`, which public API defines authoritative DFA sufficiency and provenance?

Expected: after activation, `calculateDFAMetric()` with a typed receipt; raw `calculateDFA()` and the current aggregate are compatibility-only.

Override boundary:

> May `calculateDFAMetric(series, { maxBox: 64 })` return computed under v1?

Expected: no; non-default parameters return typed `invalid_parameter` unless a separately accepted method version exists.

Invalid-input boundary:

> Is `[NaN]` unavailable because it is short?

Expected: no; signal validation precedes sufficiency and returns typed `invalid`.

Governance boundary:

> Do passing tests or a merged implementation PR activate formula authority?

Expected: no; explicit Owner acceptance, implementation authorization and an activation receipt are also required.

Skill boundary:

> Does this ADR allow `iskra-metrics` to be merged or transition Skills to be disabled?

Expected: no; Skill parity and deprecation remain separate blocked gates.

## Diff scope

This ADR PR changes only:

- `governance/adr_20260729_packages_math_authoritative_api.md`.

Follow-up implementation scope may include:

- `packages/math/src/fractal.ts`;
- `packages/math/src/index.ts`;
- package and consumer tests;
- typed aggregate API;
- consumer inventory/allowlist;
- Edge generated mirror and receipts;
- `iskra-metrics` package only after formula-owner activation.

## Rollback

Before acceptance: close the ADR PR with no runtime effect.

After acceptance but before implementation: supersede this ADR through another Owner decision.

After implementation: retain a versioned compatibility namespace if rollback is required, but do not restore stand-ins, false provenance or unbounded overrides to the authoritative typed path.

## Builder/package mirror

`pending` — no Builder or Skill package change in this ADR PR.

## Live verification

`not_applicable` — governance selection only.

## Status ladder

```text
priority approved != ADR accepted != implementation authorized != implemented != merged != activated != deployed != invoked != verified-live
```

## ΔDΩΛ

- **Δ:** selects fixed, typed, provenance-bearing metric wrappers as the sole target scalar authority; demotes raw and legacy aggregate paths to compatibility-only.
- **D:** observed raw/typed split on exact `main` -> review of override, invalid-input, aggregate and provenance paths -> bounded governance decision.
- **Ω:** 0.95 for repository-static API conflict and decision shape; implementation remains unverified.
- **Λ:** revise if consumer inventory proves a required alternative API, strict reference parity is technically impossible with documented evidence, or Owner rejects this proposal.
