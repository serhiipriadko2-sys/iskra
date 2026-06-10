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
