---
sigil: governance__evidence_20260729_adr_20260729_02_runtime_fractal_surface
layer: governance
status: proposed-evidence
updated: 2026-07-29
parent_adr: ADR-20260729-02
source_merge: 46e41b29b5f26afe207aa70625e32bb97fd70f45
---

# Evidence supplement — runtime fractal duplicate surface

## Status boundary

This file strengthens the evidence behind ADR-20260729-02. It does not accept the ADR, authorize implementation, activate formula authority, alter thresholds, or deprecate any export.

```text
PR #318 merged
!= ADR accepted
!= implementation authorized
!= implemented
!= HFD/DFA scoped activation
```

The parent ADR remains `proposed` until an explicit Owner acceptance decision.

## Source observations

### O1 — The duplicate runtime surface is wider than three HFD/DFA symbols

`runtime/src/index.ts` re-exports twelve symbols from `runtime/src/types/fractal.ts`:

```text
D_THRESHOLDS
H_THRESHOLDS
QUANTUM_THRESHOLDS
classifyPhase
calculateEdgeDistance
calculateCSI
calculateEI
calculateNC
calculateHFD
calculateDFA
calculateFractalIndicators
calculateQuantumIndicators
```

The existing ADR migration gate explicitly names the three raw HFD/DFA entrypoints, but implementation inventory must cover all twelve exports because they share the same duplicate source module and public runtime boundary.

### O2 — Threshold exports are a latent authority risk, not a proven active drift

Three of the twelve exports are raw threshold tables:

```text
D_THRESHOLDS
H_THRESHOLDS
QUANTUM_THRESHOLDS
```

A raw exported constant does not carry the authority metadata expected from the threshold registry, including classification and Guard eligibility. Owner-side comparison reported that the current numeric values match their package counterparts; this supplement therefore does **not** claim active threshold-value drift.

Decision effect: the implementation inventory must assign each threshold export an explicit disposition:

1. route to the registered threshold owner;
2. retain only in a named compatibility namespace with non-authority status; or
3. justify a separate owner and add parity/drift tests.

Silence is not an acceptable disposition.

### O3 — Active short-series HFD semantic divergence exists on current `main`

The two raw HFD implementations share the corrected inclusive loop boundary, but their sufficiency guards differ:

- `runtime/src/types/fractal.ts`: default `kMax=10`; returns fabricated `1.5` whenever `N < kMax * 2`;
- `packages/math/src/fractal.ts`: returns `1.5` only for `N < 6`; otherwise reduces `kMax` for shorter series and computes a number.

Therefore the duplicate is not merely a latent maintenance risk. It exposes different public semantics for valid short series.

Owner-reproduced reference observations for the same deterministic series family:

| N | `packages/math` | runtime duplicate | equal |
|---:|---:|---:|:---:|
| 8 | 1.4333606480422594 | 1.5 | no |
| 12 | 1.7757321059396232 | 1.5 | no |
| 15 | 3.064197977879734 | 1.5 | no |
| 19 | 2.574918139153341 | 1.5 | no |
| 20 | 2.3490580790905344 | 2.3490580790905344 | yes |

These exact values are supporting observations until committed as a deterministic reference-vector test. The load-bearing verified fact is the guard-clause split; the table supplies a concrete falsifier and regression target.

### O4 — The divergence matches the prohibited stand-in failure mode

The runtime duplicate emits `1.5` as a sufficiency fallback. In an authority path, that converts missing method sufficiency into a fabricated metric value rather than a typed `unavailable` result.

This is precisely why ADR-20260729-02 selects typed HFD/DFA entrypoints as the target authority boundary.

## Required amendment to implementation gates

The separate implementation PR must add the following gates.

### G1 — Full runtime export inventory

Inventory all twelve exports from `runtime/src/types/fractal.ts`. For each symbol record:

```text
symbol
current consumers
current owner
proposed owner
authority status
migration action
compatibility sunset
test or receipt
```

### G2 — HFD short-series reference vectors

Commit deterministic vectors covering at least `N=5,6,8,12,15,19,20` and prove:

- the authoritative typed API returns `unavailable` below its registered sufficiency boundary;
- no authority path returns `1.5` as a fabricated stand-in;
- runtime compatibility behavior cannot be imported or re-exported as authority;
- the `N=20` computed result matches the canonical source exactly.

### G3 — Threshold ownership fence

For `D_THRESHOLDS`, `H_THRESHOLDS`, and `QUANTUM_THRESHOLDS`:

- compare values against the registered threshold source;
- bind the comparison to source hashes;
- fail CI on drift;
- prohibit use in Guard/EWS authority paths unless registry classification and eligibility are preserved.

### G4 — Remaining runtime symbols

The other six non-threshold helpers must be explicitly classified as:

```text
authoritative
compatibility-only
out-of-scope with named owner
```

No symbol remains implicitly authoritative because it is exported from `@iskra/runtime`.

## Non-claims

This supplement does not claim:

- that threshold values currently differ;
- that PR #318 acceptance occurred;
- that any runtime export has been migrated;
- that the typed API is implemented according to the ADR;
- that `iskra-metrics` is accepted or ready;
- that package-wide entropy/formula authority is active.

## Verification targets

```text
V1: all 12 runtime exports have an explicit disposition
V2: short-series HFD vectors are committed and reproducible
V3: no authority path emits 1.5/0.5 stand-ins
V4: threshold constants are registry-bound or compatibility-only
V5: ADR status remains proposed until explicit Owner acceptance
```

## ΔDΩΛ

- **Δ:** expands the runtime duplicate evidence from three fractal functions to the full twelve-symbol export surface and records the active short-series HFD split.
- **D:** runtime source/export inspection -> guard-clause comparison -> Owner reference observations -> implementation-gate amendment.
- **Ω:** 0.95 for export and guard-clause facts; 0.85 for the exact numeric table until committed as a repository test.
- **Λ:** revise if current-main source changes, a committed reference-vector test contradicts the table, or threshold ownership is superseded by a later accepted ADR.
