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
