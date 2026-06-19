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
