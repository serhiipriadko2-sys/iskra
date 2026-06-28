# Project Memory

## Project identity
- [FACT] Project name: Искра vΩ.7 — Full Canon
- [FACT] Primary repo: https://github.com/serhiipriadko2-sys/iskra.git
- [FACT] Primary runtime environment: runtime/iskraSpace внутри основного репозитория
- [FACT] Primary database / Supabase project: https://typcvaszcfdpkzbjzuur.supabase.co
- [FACT] Main deployment target: iskraSpaceApp

## Canonical sources
- [FACT] Code source of truth: GitHub repo `serhiipriadko2-sys/iskra`
- [FACT] Runtime source of truth: `runtime/iskraSpace` в основном репозитории
- [FACT] Governance source of truth: `canon_source_files/` в agent files
- [FACT] Canon files / policy files: `canon_source_files/24_MEMORY_STACK.md`, `canon_source_files/20_GOVERNANCE_PACK.md`, `canon_source_files/32_SIFT_PROTOCOL.md`, `canon_source_files/31_SECURITY.md`
- [FACT] Key docs: `templates/ADR_TEMPLATE.md`, `templates/LEDGER_ENTRY_TEMPLATE.md`, `evals/ISKRA_CANON_ACCEPTANCE_TESTS.md`

## Stable constraints
- [FACT] Destructive changes require explicit approval.
- [FACT] Live changes must have a verification path.
- [FACT] Changes without rollback plan are high risk.
- [FACT] Secrets must never be stored in Memory.
- [FACT] Chat history is continuity context, not canonical truth.
- [FACT] Any live schema change without a Git migration path is HIGH-RISK DRIFT.
- [FACT] До полной синхронизации Git и live backend нельзя считать schema governance fully aligned.

## Operational defaults
- [FACT] Start from Memory for continuity, then verify against SoT.
- [FACT] Treat connected sources and attached canon files as stronger than remembered chat context.
- [INTERP] For this project, the main verification axis is GitHub repo ↔ runtime/iskraSpace ↔ Supabase live state.
- [INTERP] The best default mode is evidence-first audit before action.
- [INTERP] До полной синхронизации schema path live Supabase считается источником фактического schema state, а Git migration path — источником intended and reproducible change path.

## Confirmed drift
- HIGH-RISK DRIFT: текущий Git migration path и live Supabase state не полностью совпадают.
- [FACT] В live migration inventory видны migrations вида `iskra_canon_*` и `enable_pg_net_for_iskra_import`, которых не видно в текущем `supabase/migrations/` в GitHub.
- [FACT] В live public schema подтверждены `memory_nodes` и `rate_limits`, не подтверждённые текущими repo migrations.
- [FACT] В repo path подтверждены `graph_nodes` и `graph_edges`, которые не подтвердились в текущем live public schema snapshot.

## Working assumptions
- [FACT] `runtime/iskraSpace` подтверждён как основной рабочий runtime contour по данным из `package.json` и `vite.config.ts`.
- [HYP] Часть live-only migrations или таблиц может относиться к отдельному import / canon path, который ещё не синхронизирован обратно в Git.

## Do not forget
- [FACT] Memory stores continuity; source files, GitHub, and Supabase remain the truth layer.
- [FACT] Governance, drift findings, and verification receipts should be written back after significant audits or changes.
- [FACT] ADR по schema drift задаёт временный рабочий канон до provenance audit и полной синхронизации Git ↔ live backend.
