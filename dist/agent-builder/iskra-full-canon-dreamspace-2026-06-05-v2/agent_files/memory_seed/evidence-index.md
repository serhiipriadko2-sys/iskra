# Evidence Index

## GitHub
- EVID-20260526-01
  Type: repository metadata
  Source: GitHub repo `serhiipriadko2-sys/iskra`
  Scope: primary code source of truth
  Supports: репозиторий проекта существует, публичен и использует `main` как default branch; clone URL — `https://github.com/serhiipriadko2-sys/iskra.git`
  Last verified: 2026-05-26

- EVID-20260526-07
  Type: migration inventory (repo)
  Source: `supabase/migrations/` in GitHub repo `serhiipriadko2-sys/iskra`
  Scope: current Git migration path visible in `main`
  Supports: в текущем repo path подтверждены как минимум `20260101000000_schema.sql`, `20260305000000_graph_nodes.sql`, `20260307_fix_rls_policies.sql`; также присутствует `README_LEGACY_DATA_MIGRATION.sql`
  Last verified: 2026-05-26

- EVID-20260526-08
  Type: schema baseline migration
  Source: `supabase/migrations/20260101000000_schema.sql`
  Scope: baseline repo schema for iskraSpace app
  Supports: repo baseline создаёт `users`, `metrics_snapshots`, `journal_entries`, `tasks`, `habits`, `voice_preferences`, `chat_history`, `audit_log` и включает RLS для этих таблиц
  Last verified: 2026-05-26

- EVID-20260526-09
  Type: graph migration
  Source: `supabase/migrations/20260305000000_graph_nodes.sql`
  Scope: graph persistence path in repo
  Supports: repo migration path предполагает `graph_nodes` и `graph_edges` как часть GraphRAG persistence layer
  Last verified: 2026-05-26

## Supabase
- EVID-20260526-02
  Type: project metadata
  Source: Supabase project `typcvaszcfdpkzbjzuur` / `AgiIskra`
  Scope: primary live backend contour
  Supports: активный проект `AgiIskra` в регионе `eu-west-1`; status `ACTIVE_HEALTHY`; database host `db.typcvaszcfdpkzbjzuur.supabase.co`
  Last verified: 2026-05-26

- EVID-20260526-03
  Type: migration inventory
  Source: Supabase migrations for project `typcvaszcfdpkzbjzuur`
  Scope: current migration path visible from live project
  Supports: в live project виден migration path как минимум из 10 migrations, включая `iskra_canon_schema_1536_v2`, `iskra_canon_import_helpers`, `enable_pg_net_for_iskra_import`
  Last verified: 2026-05-26

- EVID-20260526-10
  Type: live schema snapshot
  Source: `list_tables(public)` for Supabase project `typcvaszcfdpkzbjzuur`
  Scope: visible public schema in live backend
  Supports: в live public schema подтверждены `users`, `metrics_snapshots`, `memory_nodes`, `journal_entries`, `tasks`, `habits`, `voice_preferences`, `chat_history`, `audit_log`, `rate_limits`; на момент проверки все таблицы с включённым RLS
  Last verified: 2026-05-26

## Agent files
- EVID-20260526-04
  Type: canon file set
  Source: attached folder `canon_source_files/`
  Scope: governance and operating canon inside the agent
  Supports: в agent files присутствуют ключевые canon-файлы, включая `20_GOVERNANCE_PACK.md`, `24_MEMORY_STACK.md`, `31_SECURITY.md`, `32_SIFT_PROTOCOL.md`
  Last verified: 2026-05-26

## Checks / audits
- EVID-20260526-05
  Type: contour verification
  Source: targeted verification pass across attached GitHub and Supabase connections
  Scope: current project contour in Builder
  Supports: текущий рабочий контур согласован на уровне repo `serhiipriadko2-sys/iskra` и Supabase project `AgiIskra` (`typcvaszcfdpkzbjzuur`)
  Last verified: 2026-05-26

- EVID-20260526-11
  Type: migration-vs-live comparison
  Source: comparison of GitHub `supabase/migrations/` against live Supabase migration inventory and public schema
  Scope: drift detection for schema governance
  Supports: подтверждён drift между текущим Git migration path и live Supabase state: в live migration inventory есть 10 migrations с именами вроде `iskra_canon_*` и `enable_pg_net_for_iskra_import`, которых не видно в текущем repo path; одновременно live schema содержит `memory_nodes` и `rate_limits`, не подтверждённые текущими repo migrations, а repo path содержит `graph_nodes`/`graph_edges`, которые не подтверждены в live public schema snapshot
  Last verified: 2026-05-26

## Receipts
- EVID-20260526-06
  Type: memory update receipt
  Source: update of `memory_seed/evidence-index.md`
  Scope: memory continuity for future audits
  Supports: агент теперь хранит стартовый evidence index по текущему GitHub и Supabase контуру
  Last verified: 2026-05-26

- EVID-20260526-12
  Type: drift receipt
  Source: targeted Git migrations ↔ live schema verification pass
  Scope: governance follow-up needed
  Supports: текущий контур требует отдельной синхронизации или объяснения происхождения live-only tables and migrations before его можно считать fully aligned
  Last verified: 2026-05-26
