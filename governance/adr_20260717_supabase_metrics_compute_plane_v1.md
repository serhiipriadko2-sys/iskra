# ADR-20260717-01: Supabase Metrics Compute Plane v1 / Voice Candidates v0.1

Status: proposed — awaiting owner acceptance. Not deployed. Not live-verified.

Date: 2026-07-17

Owner / Builder: Семён / Искра (Claude Code)

## Context

Live inspection of `AgiIskra / typcvaszcfdpkzbjzuur` established that
`iskra_memory.iskra_project_observe` validates and stores caller-provided
`entropy`, `metrics`, `fractals`, `dfa`, and `quantum_indicators`; it does not
calculate them. Consequently, the statement that "all Iskra calculations
currently run in Supabase" is **false** as a description of the running system —
Supabase is today a storage plane for already-computed numbers, and the
`iskra-memory-gateway` Edge Function is in `mode: 'probe_only'` (all privileged
routes return `503 gateway_security_hold`).

The platform *can* execute deterministic database and Edge calculations
(PostgreSQL + plpgsql, Edge Functions on Deno with WASM, `pg_net`, `pg_trgm`,
`vector`, and `pg_cron` for periodic recompute). A metrics baseline already
landed in `main` (commit `9bddcd5`,
`supabase/migrations/20260701000000_vomega7_1_metrics_baseline_defaults.sql`
plus `docs/repair/vomega-7-1/SUPABASE_BASELINE_SECURITY_GATE_vomega_7_1.md`).
This ADR **builds on that baseline; it does not re-create `metrics_snapshots`
defaults.**

The correct division of labour, confirmed by the live schema and by
`15_SUPABASE_MEMORY_PLANE.md` / `09_METRICS_ENGINE.md`:

- **Model / Council:** produce raw observations, evidence, and semantic
  features (`pain`, `trust`, `clarity`, `selected_voice`). Not the database's
  job.
- **Supabase compute plane:** compute *deterministic* derived values from those
  features (Shannon entropy + regime, HFD, DFA), version the formulas, persist
  `input + result + algorithm_version + input_hash`, and return a read-back
  receipt.

## Decision

Introduce a Supabase Metrics Compute Plane in small, independently reviewable
atoms. **This ADR governs Atom 1 only** (pure calculators); later atoms
(PostgreSQL persistence, gateway adapter, voice candidates) are scoped here but
land separately, each with its own acceptance.

- **Atom 1 (this landing):** a pure, deterministic calculator library at
  `supabase/functions/_shared/iskra-metrics/` — no DB, no network, no side
  effects. Atom 1 ports the Shannon entropy, HFD and DFA **functions** from
  `@iskra/math`; it does not claim to port all of `fractal.ts`. A committed
  parity gate compares those functions directly against canon so the compute
  plane cannot silently introduce metric drift. Every
  result carries `algorithm_version` + `input_hash` (sha256 of canonicalized
  input). Missing/insufficient input yields `unavailable: true` / `value: null`
  — never a fabricated placeholder (file 09: "no inputs or method → no number").
- **Atom 3 (future):** evolve the existing `public.metrics_snapshots` table;
  do not create a second canonical `metric_snapshots` table and do not modify
  `statecycle_snapshots` beyond an optional nullable link. Persisted observations
  must use `value`, `source`, `observed_at`, `algorithm_version`, and
  `input_hash`; a prior/default is not an observed user value.
- **Atom 4 (future):** voice candidates with `authority: "candidate_only"`;
  never emits `selected_voice` (Council/model authority per file 12).
- **Atom 2/5 (future):** gateway capability adapter (kept OFF while gateway is
  `probe_only`) and SoT30 package/ledger update.

No live Supabase mutation, no deployment, no gateway mode change occur in this
ADR. `runtime/` is untouched; the new code lives under `supabase/functions/`.

## Evidence

- Live boundary: `iskra_memory.iskra_project_observe` / `iskra_project_commit`
  function bodies (read via `pg_get_functiondef`) store-and-validate only;
  gateway `index.ts` pins `mode: 'probe_only'`.
- Parity: `supabase/functions/_shared/iskra-metrics/` entropy/HFD/DFA verified
  equal to `@iskra/math` on fixed vectors (N=16 and N=80 signals) — ALL PASS.
- Existing baseline dependency: `main@9bddcd5` metrics baseline migration +
  security gate doc.
- Tests: `iskra-metrics_test.ts` (Deno) — determinism, canon parity,
  missing-data-is-null, short-signal-is-null.

## Risk

- The current `public.metrics_snapshots` shape stores numeric defaults without
  observation provenance. Atom 1 does not write it. A later atom must evolve
  that one table to use `value`, `source`, `observed_at`, `algorithm_version`,
  and `input_hash`; until provenance exists, consumers must render `unknown`.

- Ports can silently drift from `@iskra/math` on a future canon change. Mitigated
  by the parity vectors and the rule: any formula change bumps
  `ALGORITHM_VERSION` in lockstep.
- HFD/DFA require an ordered point series; the persistence atom must define a
  stable `(session_ref, turn_ref)` ordering contract before DFA over history is
  reproducible. Deferred to Atom 3, flagged here so it is not forgotten.
- A future compute layer that reads history and writes results is a privileged,
  side-effecting operation and requires its own security review
  (`skills/security.yaml`), not an automatic consequence of adding a function.

## Next

1. Merge this ADR + Atom 1 (pure calculators) once reviewed.
2. Atom 3: `metric_snapshots` table + SQL contract tests + point-ordering
   contract.
3. Atom 4: voice candidates (`candidate_only`).
4. Gateway adapter (OFF) + `probe_only → enabled` only under a separate 1B
   credential ADR + security review.

## Status

`proposed` — awaiting Owner acceptance. Not canonically active. Not deployed.
Not live-verified. Gateway remains `probe_only`; live Supabase unchanged.
