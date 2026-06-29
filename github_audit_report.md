# GitHub Audit Report: serhiipriadko2-sys/iskra
**Date:** 2026-06-29T18:08:35.696290Z
**Branch:** main

## 1. Последние 10 коммитов в main
- `ace109b` — Merge pull request #226 from serhiipriadko2-sys/codex/iskra-site-deep-tree-immersion-20260629 (2026-06-29T18:06:42Z)
- `1d277f7` — Stabilize iskra-site canon index sorting (2026-06-29T18:00:36Z)
- `a0509b6` — Match iskra-site canon index to PR merge ref (2026-06-29T18:00:01Z)
- `942624c` — Regenerate iskra-site canon index after main sync (2026-06-29T17:57:50Z)
- `7cd6d87` — Merge remote-tracking branch 'refs/remotes/origin/main' into codex/iskra-site-deep-tree-immersion-20260629 (2026-06-29T17:57:48Z)
- `c325a7f` — Sync iskra-site canon index with main (2026-06-29T17:57:32Z)
- `36a7a08` — Regenerate iskra-site canon index (2026-06-29T17:55:34Z)
- `d11313b` — Merge pull request #225 from serhiipriadko2-sys/codex/sync-workspace-agent-package-20260629 (2026-06-29T17:55:13Z)
- `e4d7e01` — Remove standalone node insight data file from indexed tree (2026-06-29T17:49:54Z)
- `ff8a215` — Remove standalone deep dive component from indexed tree (2026-06-29T17:49:51Z)

## 2. Открытые Pull Requests
**Количество:** 0

## 3. Открытые Issues (последние 20)
**Количество:** 4
- #200 — Smoke live dual-provider gemini Edge Function after deploy (labels: release-gate, supabase, iskraSpace)
- #192 — Supabase cleanup: retire diagnostic function and harden internal/support release boundary (labels: release-gate, supabase, security, iskraSpace)
- #190 — Release gate: Supabase provenance and security advisors for iskraSpace (labels: release-gate, supabase, security, iskraSpace)
- #168 — PR-1 salvage: pwa-minimal patch ready, branch creation blocked (labels: salvage, pwa, blocked)

## 4. Workflow Runs (последние 10)
- `Deploy iskra-site to Cloudflare Pages` (main): completed / success
- `iskra-site CI` (main): in_progress
- `SoT integrity` (codex/iskra-site-deep-tree-immersion-20260629): completed / success
- `iskra-site CI` (codex/iskra-site-deep-tree-immersion-20260629): completed / success
- `SoT integrity` (codex/iskra-site-deep-tree-immersion-20260629): completed / success
- `iskra-site CI` (codex/iskra-site-deep-tree-immersion-20260629): completed / failure
- `iskra-site CI` (codex/iskra-site-deep-tree-immersion-20260629): completed / failure
- `SoT integrity` (codex/iskra-site-deep-tree-immersion-20260629): completed / success
- `SoT integrity` (codex/iskra-site-deep-tree-immersion-20260629): completed / success
- `iskra-site CI` (codex/iskra-site-deep-tree-immersion-20260629): completed / failure

## 5. Релизы
**Количество:** 0

## 6. Теги
**Количество:** 0

## 7. Drift Analysis: AGENTS.md vs Реальное состояние
### AGENTS.md Last Updated: 2026-06-27
### Audit Date: 2026-06-29
- AGENTS.md был обновлен 2 дня назад. В пределах нормы.
- **HIGH-RISK DRIFT:** 3 открытых release-gate issue(s): [200, 192, 190]
- [INTERP] Agent Builder upload mirrors (dist/agent-builder/*) не проверяются через GitHub API напрямую; требуется локальный audit файловой системы.
- AGENTS.md заявляет HIGH-RISK DRIFT: Git migration path и live Supabase state не всегда совпадают. Это подтверждается открытыми issue #190 и #192.

## 8. Рекомендации
1. **Issue #190 (Release Gate)** и **#192 (Supabase Cleanup)** — критические release-gate. Требуют явного ADR или закрытия перед публичным релизом.
2. **Issue #200 (Smoke Test)** — блокирует верификацию dual-provider Edge Function. Нужен smoke-test с валидным JWT.
3. **Issue #168 (PWA Salvage)** — блокирован созданием ветки. Рекомендуется ручное создание ветки `feat-pwa-minimal` и применение patch.
4. **Workflows** — 2 запуска в статусе `in_progress` (CI и Deploy). Убедиться, что они завершаются успешно.
5. **Релизы** — отсутствуют релизы и теги. Для публичного релиза iskraSpace необходим version tag и GitHub Release.

## Status Summary
- **Commits:** [PASS] — main активно обновляется, последние коммиты от 2026-06-29.
- **PRs:** [PASS] — 0 открытых PR (все недавно merged).
- **Issues:** [BLOCKED] — 4 открытых release-gate / blocking issue.
- **Workflows:** [PARTIAL] — 2 запуска in_progress, остальные success.
- **Releases:** [BLOCKED] — 0 релизов, 0 тегов.
- **AGENTS.md Drift:** [PARTIAL] — AGENTS.md актуален, но реальное состояние не соответствует закрытию release-gate.