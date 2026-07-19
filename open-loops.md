# Open Loops
1. [ ] Relocate `pg_trgm` extension from `public` to `extensions` schema. Requires updating `search_path` for all roles (anon, authenticated, service_role).
2. [ ] Review the remaining ~33 Git branches (`codex/*`, `feat/*`, `fix/*`) for possible deletion or integration.
3. [ ] Independent Judge v3.5-rc.1: run live acceptance T01–T40 in a fresh single-use test Project and record the versioned anchor (`suite_version, judge_model, run_date, pass_count/40`).
4. [ ] Unified-1000/BNAT-50 study package: owner semantic acceptance; keep `evaluator_private/` outside any Judge Project until verdict commit.

