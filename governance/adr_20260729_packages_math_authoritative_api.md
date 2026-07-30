---
sigil: governance__adr_20260729_packages_math_authoritative_api
layer: governance
status: accepted
updated: 2026-07-29
authority: owner-accepted
accepted_at: 2026-07-29T21:19:00+03:00
acceptance_phrase: "Принимаю ADR-20260729-02"
---

# ADR-20260729-02 — Authoritative HFD/DFA public API boundary in `packages/math`

**Status:** `accepted`
**Accepted:** `2026-07-29T21:19:00+03:00` by Owner Семён
**Layer:** `system + governance`
**Owner:** Семён
**Builder:** Искра / SAM+ISKRIV
**Repository:** `serhiipriadko2-sys/iskra`
**Parent decision:** ADR-20260724-01
**Priority:** urgent prerequisite before Atom 3 Skill parity work

## Context

ADR-20260724-01 selected `packages/math` as the target formula owner for entropy, HFD and DFA, but only after all activation gates pass.

This ADR is deliberately narrower. It selects the target **HFD/DFA API boundary only**. It does not activate package-wide formula authority and does not waive the parent entropy gates.

Current `main` exposes incompatible DFA semantics:

| Public call | Default sufficiency behavior at `N=60` | Result on `s[i]=(i mod 7)/7` |
|---|---|---:|
| `calculateDFA(series)` | raw legacy path; default `maxBox=64`; returns stand-in when `N < maxBox` | `0.5` |
| `calculateDFAMetric(series)` | typed path; `N >= 50`; default `maxBox=min(16,floor(N/2))` | `0.6664677293867074` |

The conflict is wider than two scalar exports:

- `calculateFractalIndicators()` is public and internally calls raw HFD/DFA functions;
- `packages/engine/src/services/metricsService.ts` imports raw `calculateHFD()` and manufactures the `1.5` fallback in a state-mutating path;
- `runtime/src/types/fractal.ts` contains a second raw HFD/DFA/aggregate implementation with `1.5` and `0.5` stand-ins, re-exported from `runtime/src/index.ts`;
- typed wrappers expose parameter overrides that may be silently normalized or may trigger legacy stand-ins;
- malformed signals may be classified differently depending on sample count;
- finite inputs can still overflow and produce non-finite computed outputs;
- receipts may report requested parameters rather than parameters actually used;
- the Edge fractal implementation is currently a hand-maintained port, not a reproducibly generated mirror.

The parent entropy gate remains independently open: package-wide formula authority cannot activate until Unicode-safe entropy and Node/Edge entropy parity are verified under ADR-20260724-01.

The draft `iskra-metrics` Skill exposed the unresolved ownership problem by adding an independent Python implementation. That Skill is not the cause of the split, but it cannot be accepted while the target owner exposes competing interpretations.

## Decision

### D1 — Authoritative scalar entrypoints

After HFD/DFA implementation and scoped activation, the only authoritative public scalar entrypoints are:

- `calculateHFDMetric()`;
- `calculateDFAMetric()`.

Their typed result envelope, algorithm version, effective parameters, sample count, source provenance and status are part of formula authority.

### D2 — Compatibility-only surfaces

The following are compatibility-only and are not authoritative metric APIs:

- `calculateHFD()`;
- `calculateDFA()`;
- the current `calculateFractalIndicators()` implementation;
- the duplicate raw implementations and exports in `runtime/src/types/fractal.ts` and `runtime/src/index.ts`;
- any state, UI, Edge or Skill path that calls raw primitives or manufactures numeric stand-ins.

These surfaces:

- must not be used by new consumers;
- must not remain in Guard, EWS, Skill, Edge, runtime or state-adapter authority paths at activation;
- may remain temporarily callable only for explicitly allowlisted, non-authority compatibility consumers;
- must be visibly deprecated or moved behind a compatibility namespace in the implementation PR.

A future authoritative aggregate API must compose typed scalar entrypoints and preserve each component status and provenance.

### D3 — Enforceable migration horizon

The scoped activation receipt must record:

- `activated_at` as an immutable UTC timestamp;
- `compatibility_sunset_at = activated_at + 30 calendar days`.

There is no release-cut shortcut. The fixed 30-day rule is the sole v1 sunset trigger and is machine-detectable from the activation receipt.

Before scoped activation:

- every existing authority-path raw consumer must be migrated;
- any remaining raw consumer must appear in a committed allowlist with owner, non-authority justification and the same fixed sunset date.

At or after `compatibility_sunset_at`, CI must fail if raw scalar or legacy aggregate APIs remain first-class package-root or runtime-root exports, or if any consumer still imports them outside the compatibility namespace.

This ADR does not delete or alter runtime code by itself.

### D4 — Typed result contract

The authoritative result union must distinguish at least:

```text
computed
unavailable
invalid
numerical_failure
```

Required semantics:

- `computed` contains a finite numeric value;
- `unavailable` means valid input with insufficient samples;
- `invalid` means malformed signal or explicitly supplied invalid parameters;
- `numerical_failure` means valid finite inputs passed validation but computation produced a non-finite or otherwise unusable result;
- authoritative paths never emit `1.5` or `0.5` because data is missing, invalid or numerically unstable.

Typed statuses, reasons and evidence fields must match exactly across Node, generated Edge and any generated mirror.

### D5 — Validation and sufficiency order

The v1 evaluation order is:

1. validate signal container, numeric type and finiteness;
2. validate only parameters explicitly supplied by the caller;
3. if valid sample count is below the method minimum, return `unavailable`;
4. derive fixed effective defaults only after sufficiency is established;
5. compute;
6. validate output finiteness and method invariants;
7. return `computed` or typed `numerical_failure`.

Derived defaults are not treated as caller errors on very short inputs. Therefore valid `N=0`, `N=1`, `N=19` HFD inputs and valid `N=0`, `N=1`, `N=49` DFA inputs return `unavailable`, not `invalid_parameter`.

Malformed values such as `NaN` or `Infinity` return `invalid` even when the series is short.

### D6 — Version-1 parameter contract

The v1 authoritative methods are fixed methods, not freely configurable calculators:

- HFD: `N >= 20`, effective `kMax=5`;
- DFA: `N >= 50`, effective `minBox=4`, effective `maxBox=min(16,floor(N/2))`.

For v1:

- omitted options use fixed effective defaults after sufficiency passes;
- an explicitly supplied value exactly equal to the effective default **must be accepted** and must produce the same typed result and numeric value as omission;
- a non-default `kMax`, `minBox` or `maxBox` returns typed `invalid_parameter`;
- implementations must not silently clamp or normalize a non-default request;
- alternative parameters require a separately named/versioned method contract, deterministic vectors and explicit acceptance.

Thus `calculateHFDMetric(series, { kMax: 5 })` is equivalent to omission, while `calculateHFDMetric(series, { kMax: 20 })` is invalid. Likewise, a supplied DFA default pair is equivalent to omission, while `calculateDFAMetric(series, { maxBox: 64 })` cannot return `computed` under v1.

### D7 — Effective parameter and generation provenance

Every computed receipt must include:

- `algorithm_version` bound to the exact method;
- `requested_parameters` when explicitly supplied;
- `effective_parameters` actually used;
- `sample_count`;
- canonical source hash;
- generator identity/version when a mirror is generated;
- generated artifact hash;
- parity corpus hash.

A receipt must never report a requested value as effective when the algorithm used another value.

The Edge mirror is accepted only when:

1. a committed deterministic generation command exists;
2. regeneration from the recorded canonical source hash produces the recorded artifact hash;
3. regeneration followed by repository diff is clean;
4. source hash, generator version, artifact hash and parity receipt are bound together.

A hand-maintained port that merely passes a finite corpus is not a generated mirror.

### D8 — Export boundary

The implementation PR must replace ambiguous wildcard authority with an explicit export boundary. Acceptable implementations include:

1. authoritative named exports plus a clearly marked compatibility namespace; or
2. authoritative named exports with deprecated raw exports retained only until the recorded sunset.

The package and runtime roots must make accidental import of raw or legacy aggregate functions difficult and must cease exporting them at sunset.

### D9 — Consumer and Skill rule

All formula consumers, including `iskra-metrics`, must either:

- call the authoritative typed API; or
- use a reproducibly generated mirror bound to source hash, generator version, generated artifact hash, effective parameters and parity receipt.

Independent hand-maintained formula implementations are not accepted as mirrors.

### D10 — Existing-consumer migration gate

Inventory alone is insufficient.

Scoped activation fails while any authority-path consumer or public runtime surface still:

- imports or exports `calculateHFD()` or `calculateDFA()` as an authority path;
- calls or exports the current raw `calculateFractalIndicators()`;
- manufactures `1.5` or `0.5` as missing-data stand-ins;
- converts `unavailable`, `invalid` or `numerical_failure` into a numeric Guard/EWS/state input;
- exposes a duplicate HFD/DFA implementation outside the bounded compatibility namespace.

The migration gate explicitly includes:

- `packages/engine/src/services/metricsService.ts`;
- `runtime/src/types/fractal.ts`;
- the corresponding exports in `runtime/src/index.ts`.

### D11 — Scoped activation versus package formula authority

This ADR can authorize only **HFD/DFA scoped activation**.

It cannot activate `packages/math` as the package-wide formula owner for entropy/HFD/DFA.

Package-wide formula authority remains `PROPOSED_TARGET` until every outstanding parent ADR gate passes, including:

- Unicode-safe versioned entropy tokenization;
- Shannon sufficiency based on normalized token count;
- Node/Edge entropy parity;
- entropy provenance hashes;
- HFD/DFA gates in this ADR.

No HFD/DFA receipt may claim entropy parity or package-wide formula-owner activation.

### D12 — Governance activation boundary

This ADR was explicitly accepted by the Owner on `2026-07-29T21:19:00+03:00` with the exact phrase `Принимаю ADR-20260729-02`.

Acceptance establishes the decision boundary only. It does **not** authorize implementation, merge runtime changes, activate HFD/DFA authority, activate package-wide formula authority, install a Skill, or deprecate transition Skills.

HFD/DFA scoped activation requires all of:

1. Owner acceptance of this ADR — **satisfied**;
2. separate implementation authorization — **not satisfied**;
3. all tests below passing on the implementation head;
4. review and merge of the implementation PR;
5. migration of every authority-path raw consumer and duplicate public runtime surface;
6. a scoped activation receipt recording merge SHA, `activated_at`, fixed 30-day `compatibility_sunset_at`, algorithm versions, canonical source hashes, generator/artifact hashes, corpus hash and parity results.

Passing tests or merging code cannot by itself confer governance authority.

## Alternatives

### A — Keep both APIs equally public and document the difference

Rejected. Documentation does not prevent accidental imports or split-brain semantics.

### B — Make raw functions authoritative

Rejected. Numeric stand-ins conflict with ADR-20260724-01 and `no input or method -> no number`.

### C — Remove raw functions immediately in this ADR PR

Rejected. Governance selection and code migration remain separate; hidden consumers may exist.

### D — Let the Skill choose its own implementation

Rejected. The Skill owns orchestration, contracts, provenance and explanation, not formula authority.

### E — Permit arbitrary parameter overrides in v1

Rejected. A free override surface makes method identity, sufficiency and provenance ambiguous.

### F — Activate all `packages/math` formula authority through this ADR

Rejected. Entropy parity remains a separate unsatisfied parent gate.

### G — End compatibility at an undefined “release cut”

Rejected. The repository has multiple release-like surfaces and no unique machine-detectable event; v1 uses one fixed 30-day deadline.

## Consequences / price

Benefits:

- one unambiguous HFD/DFA authority path;
- typed insufficiency, invalidity and numerical failure;
- receipts describe effective execution;
- existing authority-path consumers and duplicate runtime exports must migrate, not merely be inventoried;
- Edge generation provenance becomes reproducible;
- compatibility sunset is machine-detectable;
- package-wide entropy authority cannot be accidentally inferred.

Costs:

- import migration and compatibility warnings;
- explicit export/result-type changes;
- migration of aggregate, runtime and state-adapter paths;
- deterministic generator and receipt work;
- fixed removal deadline for raw APIs;
- possible behavior changes where callers currently receive stand-ins or use overrides.

Risks:

- hidden callers may depend on raw fallbacks or overrides;
- overflow cases may expose previously hidden numerical failures;
- premature export removal could break non-authority consumers;
- package-wide authority may remain blocked after HFD/DFA scoped activation because entropy gates are independent.

## Tests / QA required before HFD/DFA scoped activation

T1. HFD sufficiency: valid `N=0/1/19 -> unavailable`; `N=20 -> computed`; effective `kMax=5`.

T2. DFA sufficiency: valid `N=0/1/49 -> unavailable`; `N=50 -> computed`; effective `minBox=4`, `maxBox=min(16,floor(N/2))`.

T3. Invalid-signal precedence: `NaN`, `Infinity`, malformed values and invalid containers return typed `invalid` at both short and sufficient lengths.

T4. Parameter determinism:

- omitted defaults and explicitly supplied exact defaults produce identical typed outcomes and computed values;
- non-default HFD/DFA parameters return typed `invalid_parameter`;
- no silent clamp, normalization or legacy stand-in is allowed.

T5. Effective provenance: receipts report requested/effective parameters accurately and algorithm version matches the effective method.

T6. Post-computation finiteness: every `computed.value` is finite. Overflow vectors, including alternating `Number.MAX_VALUE` and `-Number.MAX_VALUE`, return typed `numerical_failure` when computation is unusable.

T7. Reference corpus: fixed deterministic vectors cover constant, linear, periodic, alternating, seeded-noise, malformed, overflow, boundary-length, omitted-default and explicitly supplied-default calls.

T8. Numeric parity:

- status, reason, requested/effective parameters, algorithm version and sample counts match exactly;
- Node and reproducibly generated Edge JavaScript outputs match exactly for the registered corpus;
- a cross-language generated mirror satisfies `abs(candidate-reference) <= 1e-12 * max(1, abs(reference))` for each computed scalar;
- any relaxation requires a separate Owner-accepted calibration ADR.

T9. Consumer inventory identifies direct and transitive uses of raw scalar and aggregate APIs across `packages`, `runtime`, Edge and Skills.

T10. Authority-consumer migration: no Guard, EWS, Skill, Edge, runtime or state-adapter authority path uses or publicly re-exports raw APIs or numeric stand-ins. The gate includes `packages/engine/src/services/metricsService.ts`, `runtime/src/types/fractal.ts` and `runtime/src/index.ts`.

T11. Aggregate fence: the current `calculateFractalIndicators()` is compatibility-only; any replacement preserves typed component outcomes and calls authoritative scalar APIs.

T12. New-import/export fence: CI rejects new raw imports or public re-exports outside a committed compatibility allowlist/namespace.

T13. Sunset fence: the activation receipt records immutable `activated_at` and `compatibility_sunset_at = activated_at + 30 calendar days`; CI fails at or after that timestamp if raw package/runtime exports or allowlisted imports remain.

T14. Export test: package and runtime roots present typed APIs as primary and raw/legacy aggregate APIs only through the bounded compatibility surface.

T15. Generation provenance: deterministic regeneration produces a clean diff and hashes matching the activation receipt.

T16. Skill gate: `iskra-metrics` remains unaccepted until it delegates to the typed API or a verified generated mirror and passes the same corpus.

T17. Transition registry gate preserves the exact current registry states until a separate accepted deprecation decision:

- `metric-runner`: `status=ACTIVE`, `readiness=TRANSITIONAL`;
- `iskra-metrics-evaluator`: `status=ABSORB`, `readiness=TRANSITION_ALIAS`.

Registry state does not by itself prove activation on every Builder surface.

T18. Entropy non-claim: HFD/DFA scoped activation leaves package-wide formula authority `PROPOSED_TARGET` until parent entropy gates pass.

T19. Governance gate: scoped activation fails unless ADR acceptance, implementation authorization, merge SHA and complete activation receipt are present.

## Acceptance prompts

Positive:

> For `N=60`, which public API defines authoritative DFA sufficiency and provenance?

Expected: after scoped activation, `calculateDFAMetric()` with a typed receipt; raw DFA and the current aggregate are compatibility-only.

Explicit-default boundary:

> May Node accept `{ kMax: 5 }` while Edge rejects it?

Expected: no; an explicitly supplied exact v1 default must be accepted everywhere and match omission.

Very-short boundary:

> Is a valid one-sample DFA series invalid because its derived maxBox would be zero?

Expected: no; caller-supplied values are validated first, then valid insufficient data returns `unavailable`; defaults are derived only for computation.

Overflow boundary:

> May a computed receipt contain `NaN` or `Infinity`?

Expected: no; non-finite output returns typed `numerical_failure`.

Entropy boundary:

> Does HFD/DFA scoped activation make `packages/math` the active authority for entropy too?

Expected: no; package-wide activation remains blocked by the parent entropy gates.

Migration boundary:

> Can HFD/DFA activate while `packages/engine` or `runtime/src/types/fractal.ts` still expose raw HFD/DFA behavior?

Expected: no; every authority-path raw consumer and duplicate public runtime surface must migrate before activation.

Sunset boundary:

> Can compatibility remain until an undefined future release?

Expected: no; v1 expires exactly 30 calendar days after the immutable scoped activation timestamp.

Governance boundary:

> Do passing tests or a merged implementation PR activate formula authority?

Expected: no; explicit Owner acceptance, implementation authorization and an activation receipt are also required.

Skill boundary:

> Does this ADR allow `iskra-metrics` to be merged or transition Skills to be disabled?

Expected: no; Skill parity and deprecation remain separate blocked gates.

## Diff scope

This ADR acceptance PR changes only:

- `governance/adr_20260729_packages_math_authoritative_api.md` lifecycle metadata and acceptance boundary;
- `ledger/sot.json` and `ledger/checksum.asc` as derived integrity receipts for the accepted ADR bytes.

Follow-up implementation scope may include:

- `packages/math/src/fractal.ts`;
- `packages/math/src/index.ts`;
- package and consumer tests;
- typed aggregate API;
- `packages/engine/src/services/metricsService.ts`;
- `runtime/src/types/fractal.ts`;
- `runtime/src/index.ts`;
- consumer inventory/allowlist and fixed sunset enforcement;
- Edge generator, generated mirror and receipts;
- `iskra-metrics` package only after HFD/DFA scoped activation.

Entropy implementation remains governed by the parent ADR and is not silently included in this implementation scope.

## Rollback

After acceptance but before implementation: supersede this ADR through another explicit Owner decision.

After implementation: retain a versioned compatibility namespace until the fixed recorded sunset if rollback is required, but do not restore stand-ins, false provenance, unbounded overrides or raw authority-path consumers.

## Builder/package mirror

`pending` — no Builder or Skill package change in this acceptance PR.

## Live verification

`not_applicable` — governance acceptance only.

## Status ladder

```text
priority approved
!= ADR accepted
!= implementation authorized
!= implemented
!= merged
!= HFD/DFA scoped activation
!= package-wide formula-owner activation
!= deployed
!= invoked
!= verified-live
```

## ΔDΩΛ

- **Δ:** Owner acceptance recorded; the fixed, typed, provenance-bearing HFD/DFA authority boundary is accepted, while implementation and activation remain gated.
- **D:** exact Owner phrase `Принимаю ADR-20260729-02` -> lifecycle transition `proposed -> accepted` -> separate implementation authorization remains required.
- **Ω:** 0.95 for governance acceptance and repository-static decision shape; implementation and activation remain unverified.
- **Λ:** revise only through a later explicit Owner decision, or if implementation evidence proves a load-bearing contract technically impossible.
