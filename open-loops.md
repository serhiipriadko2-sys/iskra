# Open Loops
1. [ ] Relocate `pg_trgm` extension from `public` to `extensions` schema. Requires updating `search_path` for all roles (anon, authenticated, service_role).
2. [ ] Review the remaining ~33 Git branches (`codex/*`, `feat/*`, `fix/*`) for possible deletion or integration.
3. [ ] Independent Judge v3.5-rc.1: run live acceptance T01–T40 in a fresh single-use test Project and record the versioned anchor (`suite_version, judge_model, run_date, pass_count/40`).
4. [ ] Unified-1000/BNAT-50 study package: owner semantic acceptance; keep `evaluator_private/` outside any Judge Project until verdict commit.
5. [ ] Unified-1000/BNAT-50 v1.1: owner semantic review of the 126 authored task rewrites (`evaluator_private/answer_staleness_v1_1.json` lists the IDs).
6. [ ] Regenerate the three `aimodels/` answer sets for the 126 stale positions before any study that scores them.
7. [ ] Apply held-out rotation over the 495 templated tasks for strong claims (template redundancy is documented, not eliminated).
8. [ ] Judge v3.5-rc.2: regenerate the 126×3 model answers before scoring authored positions (study BLOCKED until then).
9. [ ] Run live T01–T40 in a fresh single-use Project and confirm judge_stack_qc CI is green on the rc.2 PR.

