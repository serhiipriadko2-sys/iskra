# ISKRA RAG VOLUME: 07 ISKRA MEMORY SEED

This is a consolidated knowledge index volume for ChatGPT Workspace Agents.

---

## FILE: agent_files/memory_seed/project-memory.md

**Original Name:** `project-memory.md`  
**Path in Repo:** `agent_files/memory_seed/project-memory.md`

```markdown
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
```

---

## FILE: agent_files/memory_seed/development-diary.md

**Original Name:** `development-diary.md`  
**Path in Repo:** `agent_files/memory_seed/development-diary.md`

```markdown
# Development Diary

## 2026-05-26 18:45 — git migrations vs live supabase schema drift check
Context:
- Выполнена сверка GitHub `supabase/migrations/` с live Supabase migration inventory и snapshot public schema для проекта `AgiIskra`.

Finding:
- Подтверждён drift между repo migration path и live Supabase state.
- Live inventory содержит migrations вида `iskra_canon_*` и `enable_pg_net_for_iskra_import`, которых не видно в текущем Git path.
- Live schema содержит `memory_nodes` и `rate_limits`, не подтверждённые текущими repo migrations.
- Repo path содержит `graph_nodes` и `graph_edges`, которые не подтвердились в текущем live public schema snapshot.

Evidence:
- GitHub repo `serhiipriadko2-sys/iskra`
- Supabase project `typcvaszcfdpkzbjzuur` / `AgiIskra`
- `memory_seed/evidence-index.md`: `EVID-20260526-07` [ellipsis] `EVID-20260526-12`

Risk:
- HIGH-RISK DRIFT: schema governance и rollback path нельзя считать полностью надёжными, пока не определён рабочий канон между Git и live backend.

Next:
- Определить, что является каноном для schema path: синхронизировать missing live migrations в Git или зафиксировать, какие repo migrations устарели и не должны считаться активным path.
- После этого обновить `open-loops.md` и при необходимости оформить ADR.

Status: open

---

## YYYY-MM-DD HH:MM — session title
Context:
- 

Finding:
- 

Evidence:
- 

Risk:
- 

Next:
- 

Status: open | verified | blocked | resolved
```

---

## FILE: agent_files/memory_seed/open-loops.md

**Original Name:** `open-loops.md`  
**Path in Repo:** `agent_files/memory_seed/open-loops.md`

```markdown
# Open Loops

## High-risk drift
- ID: LOOP-20260526-01
  Type: HIGH-RISK DRIFT
  Context: Сверка Git migrations ↔ live Supabase schema для проекта `AgiIskra`.
  Current state: Подтверждён drift между текущим repo migration path и live Supabase state. В live migration inventory видны `iskra_canon_*` и `enable_pg_net_for_iskra_import`, которых не видно в текущем `supabase/migrations/` в GitHub; в live public schema есть `memory_nodes` и `rate_limits`, не подтверждённые текущими repo migrations; в repo path есть `graph_nodes`/`graph_edges`, которые не подтвердились в текущем live public schema snapshot.
  Why it matters: Это ломает единый source of truth для schema governance, rollback и безопасных изменений live backend.
  Evidence: Зафиксировано в `memory_seed/evidence-index.md` как `EVID-20260526-11` и `EVID-20260526-12`.
  Next safe step: Определить рабочий канон для schema path: либо подтянуть live-only migrations и таблицы в Git, либо доказать, что часть repo path устарела и должна быть выведена из канона.
  Owner: agent
  Status: open

## Pending verification
- ID: LOOP-20260526-02
  Type: VERIFIED IN THIS SESSION
  Context: Подтвердить, что `runtime/iskraSpace` — актуальный runtime source of truth для текущего проекта.
  Claim / question: Совпадает ли текущий runtime contour с тем, что реально используется в проекте.
  Evidence available: Подтверждены `runtime/iskraSpace/package.json` и `runtime/iskraSpace/vite.config.ts` в ветке `main`; package name `iskra-space`, локальная привязка к `@iskra/runtime`, Vite-конфиг для runtime-контура присутствует.
  Missing evidence: Полная карта runtime entrypoints и runtime behavior ещё не собрана.
  Next safe step: При следующем audit pass проверить ключевые entrypoints и связку runtime ↔ app behavior.
  Owner: agent
  Status: verified

## Blocked
- ID: LOOP-20260526-03
  Type: BLOCKED
  Context: Полная синхронизация evidence-index по проекту ещё не завершена до уровня receipts по runtime, PR и schema verification.
  Blocker: Нет собранных ссылок на конкретные GitHub PR / commits и нет объяснённой цепочки происхождения drift между Git и live Supabase.
  Why blocked: Пока не выполнен целевой audit pass, который объясняет, какой schema path считать каноном и какие migrations / таблицы являются legacy или missing-in-Git.
  Unblock condition: Провести следующий evidence-first проход по Git history, migration provenance и live schema ownership.
  Next safe step: После ближайшего audit pass дополнить `evidence-index.md`, затем обновить статус и при необходимости оформить ADR.
  Owner: agent
  Status: blocked

## Rollback watch
- ID: LOOP-20260526-04
  Type: ROLLBACK WATCH
  Context: Любые будущие governance-, schema- или runtime-изменения должны отслеживаться через receipt discipline.
  Change being watched: Следующий значимый change-set в GitHub, Supabase или agent canon.
  Failure signal: Изменение произошло без evidence, rollback path или ADR/receipt записи.
  Evidence: Governance discipline и memory discipline закреплены в текущих инструкциях и canon files.
  Rollback trigger: Если изменение нельзя объяснить через source of truth и verification result, его нужно считать suspect и перепроверить перед продолжением.
  Owner: agent
  Status: monitoring
```

---

## FILE: agent_files/memory_seed/evidence-index.md

**Original Name:** `evidence-index.md`  
**Path in Repo:** `agent_files/memory_seed/evidence-index.md`

```markdown
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
```

---

## FILE: agent_files/memory_seed/adr-log.md

**Original Name:** `adr-log.md`  
**Path in Repo:** `agent_files/memory_seed/adr-log.md`

```markdown
# ADR Log

## ADR-001 — Git migrations vs live Supabase schema drift working canon
Context:
- В проекте `AgiIskra` подтверждён drift между текущим Git migration path и live Supabase state.
- В live migration inventory видны migrations вида `iskra_canon_*` и `enable_pg_net_for_iskra_import`, которых не видно в текущем `supabase/migrations/` в GitHub.
- В live public schema подтверждены `memory_nodes` и `rate_limits`, не подтверждённые текущими repo migrations.
- В repo path при этом есть `graph_nodes` и `graph_edges`, которые не подтвердились в текущем live public schema snapshot.
- Без рабочего решения этот конфликт ломает source of truth для schema governance, rollback и безопасных live-изменений.

Decision:
- До полной синхронизации Git и live backend рабочим каноном для принятия operational решений по текущему состоянию schema считать live Supabase project как источник фактического состояния, а Git migration path — как источник намеренного и воспроизводимого change path.
- Любое новое live schema change без явного Git migration path считать недопустимым HIGH-RISK DRIFT.
- Любой аудит, изменение или remediation по schema path сначала должен объяснить происхождение live-only migrations и live-only tables, а затем либо подтянуть их в Git, либо явно вывести устаревшие repo migrations из активного канона.

Alternatives:
- Считать Git единственным каноном уже сейчас и игнорировать live-only migrations и таблицы. Не выбрано, потому что это сделает текущие live-решения слепыми к реальному backend state.
- Считать live единственным каноном и временно игнорировать repo migration path. Не выбрано, потому что это разрушает воспроизводимость, reviewability и rollback discipline.
- Отложить решение и оставить конфликт только в open loops. Не выбрано, потому что тогда следующие сессии будут снова принимать решения без зафиксированного working canon.

Consequences:
- Агент получает явное правило, как интерпретировать schema drift до полной синхронизации.
- Любая будущая работа по migrations становится медленнее, потому что теперь требуется provenance-check, а не только поверхностная сверка.
- Возрастает цена изменений в live: без объяснённого происхождения и Git path они считаются suspect.
- Становится проще проводить следующие audit passes, потому что различаются factual live state и intended Git path.

Verification:
- Провести следующий audit pass по provenance: сопоставить live migration inventory, repo migration history и происхождение live-only tables.
- Подтвердить один из двух исходов: либо live-only migrations и таблицы добавлены в Git path, либо repo-only path признан устаревшим и исключён из рабочего канона.
- Проверка считается завершённой, когда исчезает конфликт между live schema, live migration inventory и активным Git migration path.

Rollback trigger:
- Найдено новое evidence, показывающее, что текущий live project не является основным operational backend для этого контура.
- Подтверждено, что live-only migrations или live-only tables относятся к другому временному/legacy path и не должны считаться частью текущего канона.
- Появляется полный синхронизированный Git migration path, который объясняет текущий live state без остаточного drift.

ΔDΩΛ:
- Δ: Drift переведён из просто найденного конфликта в зафиксированное governance-решение с рабочим правилом интерпретации.
- D: До синхронизации считаем live источником фактического schema state, а Git — источником intended migration path; новые live changes без Git path запрещены.
- Ω: 0.84 на основе подтверждённых GitHub и Supabase evidence, но без полной provenance-цепочки всех migrations.
- Λ: Пересмотреть ADR после provenance audit или при появлении доказательства, что текущий live backend не является главным operational контуром.

---

## ADR-002 — Title
Context:
- 

Decision:
- 

Alternatives:
- 
- 

Consequences:
- 

Verification:
- 

Rollback trigger:
- 

ΔDΩΛ:
- Δ:
- D:
- Ω:
- Λ:
```

---
