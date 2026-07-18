# Supabase Metrics Compute Plane — Atom 1 (pure calculators)

First atom of the Supabase Metrics Compute Plane (`ADR-20260717-01`). Adds a
pure, deterministic calculator library at
`supabase/functions/_shared/iskra-metrics/` — no database, no network, no side
effects, nothing deployed.

Live inspection had confirmed Supabase currently *stores* caller-provided
metrics (`iskra_project_observe` validates ranges only) and the gateway is
`probe_only`. This atom supplies the missing deterministic compute as an
isolated, testable library before any wiring.

- `entropy.ts` / `fractal.ts` are 1:1 ports of `@iskra/math`
  (`packages/math/src/{entropy,fractal}.ts`), verified to produce byte-identical
  Shannon-entropy / HFD / DFA numbers to canon on fixed vectors (N=16, N=80) —
  so the compute plane cannot introduce metric drift.
- `calculator.ts` returns `{ algorithm_version, input_hash, metrics,
  unavailable }`; `input_hash` is the sha256 of canonicalized (key-order
  independent) input, so identical input → identical hash → identical output.
- Missing/short input → `unavailable: true` / `value: null`, never a fabricated
  `0.5` / `1.5` (file 09: "no inputs or method → no number").
- `iskra-metrics_test.ts` (Deno, matching the `_shared/*_test.ts` CI convention):
  determinism, canon parity, missing-data-is-null, short-signal-is-null.

Builds on the existing metrics baseline in `main` (`9bddcd5`); does not modify
`metrics_snapshots`, `statecycle_snapshots`, `runtime/`, any migration, or live
Supabase. Gateway stays `probe_only`.
