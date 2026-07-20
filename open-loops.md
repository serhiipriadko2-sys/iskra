# Open Loops
1. [ ] Relocate `pg_trgm` extension from `public` to `extensions` schema. Requires updating `search_path` for all roles (anon, authenticated, service_role).
2. [ ] Review the remaining ~33 Git branches (`codex/*`, `feat/*`, `fix/*`) for possible deletion or integration.
3. [ ] Independent Judge v3.5-rc.3: run live acceptance T01–T40 in a fresh single-use test Project and record the anchor (`suite_version, judge_model, run_date, pass_count/40`).
4. [ ] Unified-1000/BNAT-50: owner semantic acceptance; keep all `evaluator_private/` files and sealed mappings outside every Judge Project until verdict commit.
5. [ ] Owner semantic review of the 126 authored v1.1 task rewrites listed in `evaluator_private/answer_staleness_v1_1.json`.
6. [ ] Regenerate all three `aimodels/` answer sets for the 126 stale positions before those positions are scored.
7. [ ] Apply held-out rotation over the 495 templated tasks before any strong benchmark-local claim.
8. [ ] Owner review of exact rc.3 ZIP + external sidecar and green `Judge Stack QC` on the rc.3 PR head.
9. [ ] After live acceptance, run a supervised schema-valid pilot with neutral labels, isolated L1 runs, swap control, and committed records only.
