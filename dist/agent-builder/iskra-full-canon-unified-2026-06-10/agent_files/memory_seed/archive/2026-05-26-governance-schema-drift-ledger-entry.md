# Ledger Entry

- Date: 2026-05-26
- Mode: GOVERNANCE
- Request: Зафиксировать ledger-entry по governance change вокруг drift между Git migrations и live Supabase schema.
- Context: В ходе audit pass подтверждён drift между текущим Git migration path в `serhiipriadko2-sys/iskra` и live Supabase state проекта `AgiIskra` (`typcvaszcfdpkzbjzuur`). После этого были обновлены `evidence-index.md`, `open-loops.md`, `development-diary.md`, `adr-log.md` и `project-memory.md`.
- Sources checked:
  - GitHub repo `serhiipriadko2-sys/iskra`
  - Supabase project `AgiIskra` / `typcvaszcfdpkzbjzuur`
  - `templates/ADR_TEMPLATE.md`
  - `templates/LEDGER_ENTRY_TEMPLATE.md`
- Evidence:
  - `EVID-20260526-07` [ellipsis] `EVID-20260526-12` in `memory_seed/evidence-index.md`
  - ADR-001 in `memory_seed/adr-log.md`
  - HIGH-RISK DRIFT loop in `memory_seed/open-loops.md`
- Decision / finding: Принят временный рабочий канон: live Supabase считается источником фактического schema state, а Git migration path — источником intended and reproducible change path. Новые live schema changes без Git path считаются недопустимым HIGH-RISK DRIFT до полной синхронизации.
- Change-set:
  - Обновлён `memory_seed/evidence-index.md`
  - Обновлён `memory_seed/open-loops.md`
  - Обновлён `memory_seed/development-diary.md`
  - Обновлён `memory_seed/adr-log.md`
  - Обновлён `memory_seed/project-memory.md`
  - Создан этот ledger-entry
- Risk level: HIGH
- Verification:
  - Drift подтверждён сравнением GitHub `supabase/migrations/`, live Supabase migration inventory и snapshot public schema.
  - Governance decision закреплён отдельным ADR и поднят в project memory.
- Status: PASS
- Rollback note: Пересмотреть этот governance receipt, если provenance audit покажет, что live project не является главным operational backend, либо если появится полный синхронизированный Git migration path без остаточного drift.
- Next:
  - Провести provenance audit по live-only migrations и live-only tables.
  - Определить, какие migrations должны быть подтянуты в Git, а какие repo paths нужно признать устаревшими.

## Open loops created or updated

- `LOOP-20260526-01` обновлён как HIGH-RISK DRIFT по Git migrations ↔ live Supabase schema.
- `LOOP-20260526-03` сохранён как blocked до provenance audit и объяснения schema path.

## Memory files touched

- `project-memory.md`: поднят рабочий канон из ADR и подтверждённый schema drift.
- `development-diary.md`: добавлена audit-запись по drift check.
- `open-loops.md`: drift оформлен как активная high-risk петля.
- `adr-log.md`: добавлен ADR-001 по schema drift working canon.
- `evidence-index.md`: добавлены evidence по repo path, live schema snapshot и drift comparison.

## ∆DΩΛ
∆: Governance change получил отдельный receipt-след в archive.
D: Drift подтверждён evidence, оформлен через ADR, поднят в project memory и закреплён ledger-entry.
Ω: 0.90 на основе подтверждённых GitHub и Supabase артефактов и уже оформленных memory records.
Λ: Обновить ledger-entry или создать follow-up receipt после provenance audit и решения по синхронизации Git ↔ live schema.
