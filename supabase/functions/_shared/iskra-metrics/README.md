# iskra-metrics — Metrics Compute Plane (Atom 1)

Pure, deterministic calculator layer for Supabase Edge Functions. **No database,
no network, no side effects.** This is the first atom of the Supabase Metrics
Compute Plane (ADR-20260717-01).

## Why this exists

Live inspection of `iskra_memory.iskra_project_observe` confirmed Supabase today
**stores** caller-provided `entropy` / `metrics` / `fractals` and only validates
ranges — it does not compute them. This module is the deterministic compute the
platform was missing, kept as a pure library so it can be tested in isolation
before any gateway wiring or deployment.

## Boundary (what it does / does not do)

- **Does:** compute deterministic derived values (Shannon entropy + regime,
  Higuchi Fractal Dimension, DFA) from caller-provided text/numeric features.
- **Does not:** infer semantic state (`pain`, `trust`, `clarity`) from raw
  dialogue. Those remain the model's job; this plane only computes numbers from
  features that already carry evidence.
- **Missing input → `unavailable: true`, `value: null`.** Never a fabricated
  `0.5` / `1.5`. (The short-signal fallbacks inside HFD/DFA apply only to a
  *present-but-short* signal, matching `@iskra/math`; a *missing* signal is
  reported unavailable.)

## Parity contract

`entropy.ts` contains the canonical Shannon entropy function; `fractal.ts`
contains only the canonical HFD and DFA functions. It deliberately does **not**
claim to port all of `packages/math/src/fractal.ts`. A committed parity gate
compares those functions directly with `@iskra/math` on N=16/N=80, fallback and
error vectors. Any formula change requires bumping `ALGORITHM_VERSION` in
`contracts.ts` in lockstep.

## Reproducibility envelope

`computeMetrics()` returns `{ algorithm_version, input_hash, metrics,
unavailable }`. `input_hash` is the sha256 of the canonicalized input
(key-order independent), so the same input always yields the same hash and the
same output — the basis for storing `input + result + algorithm_version +
input_hash` in a later atom.

## Tests

`iskra-metrics_test.ts` is a Deno test (repo convention for
`supabase/functions/_shared/*_test.ts`):

```
deno test --no-lock supabase/functions/_shared/iskra-metrics/
```

Gates: determinism · canon parity · missing-data-is-null · short-signal-is-null.

## Status

Atom 1 only: pure calculators + tests. **Not wired to any gateway. Not deployed.
Live Supabase unchanged; gateway remains `probe_only`.**

Any later persistence atom must evolve `public.metrics_snapshots`, not create a
second canonical `metric_snapshots` table. Its observation boundary is
`{ value, source, observed_at, algorithm_version, input_hash }`; a prior or a
default does not become an observed user value.
