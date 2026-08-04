# SPEC-001 — Typed HFD/DFA Authority Boundary

**Lifecycle:** implementation candidate under ADR-20260729-02.
**Authority:** accepted and implementation-authorized; not merged, not activated, not deployed.
**Canonical implementation:** `packages/math/src/fractal-authority*.ts`.

## 1. Purpose

The v1 result union is `computed | unavailable | invalid | numerical_failure`.
The boundary removes missing-data numeric stand-ins from authority paths. HFD and DFA return typed outcomes:

- `computed` — finite scalar plus provenance;
- `unavailable` — valid signal, insufficient samples;
- `invalid` — malformed signal or explicit parameter request;
- `numerical_failure` — validated finite input produced unusable numerical output.

Raw `calculateHFD()`, `calculateDFA()` and `calculateFractalIndicators()` remain compatibility-only and are not formula authority.

## 2. Fixed v1 methods

| Method | Sufficiency | Effective parameters |
|---|---:|---|
| `calculateHFDMetric` | `N >= 20` | `kMax = 5` |
| `calculateDFAMetric` | `N >= 50` | `minBox = 4`, `maxBox = min(16, floor(N/2))` |

Omission and an explicitly supplied exact default are equivalent. Non-default parameters fail closed as `invalid_parameter`; they are never clamped.

## 3. Evaluation order

1. Validate signal container, numeric values and finiteness.
2. Validate explicitly supplied options.
3. Return `unavailable` when the valid signal is too short.
4. Derive fixed effective defaults.
5. Compute.
6. Reject non-finite or invariant-breaking output as `numerical_failure`.

Signal failure has precedence when both signal and options are malformed.

## 4. Provenance and generation

Every result binds algorithm version, requested/effective parameters, sample count, canonical source hash, generator version, generated bundle hash and parity corpus hash. The generator normalizes LF before hashing and deterministically regenerates runtime and Supabase Edge mirrors.

The registered corpus is `packages/math/src/fractal-authority-corpus.json`. Tests load this exact file, verify its SHA-256, execute every case, and compare Node with generated Edge output.

## 5. Consumer boundary

Primary typed consumers:

- `packages/engine/src/services/metricsService.ts`;
- `runtime/src/index.ts`;
- `supabase/functions/_shared/iskra-metrics/calculator.ts`.

Compatibility consumers must import raw APIs only through `fractalCompatibility`. Typed failures must not be converted into `1.5`, `0.5`, or another state-changing scalar.

## 6. CI and lifecycle

`.github/workflows/fractal_authority.yml` is read-only. It checks mirrors, import/export fences, corpus parity, package/runtime/Edge tests and committed ledger freshness. It does not commit, push, post PR comments, merge, activate or deploy.

Passing CI proves implementation bytes only. Scoped activation requires merge plus a separate activation receipt with immutable timestamps and the 30-day compatibility sunset.

## 7. Non-claims

This specification does not activate entropy authority, package-wide formula authority, the `iskra-metrics` Skill, Supabase production deployment, or verified-live behavior.
