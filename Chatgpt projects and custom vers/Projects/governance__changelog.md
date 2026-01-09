# Changelog

**Manifest:**
- type: SoT
- layer: governance
- created: 2026-01-01
- updated: 2026-01-06
- version: vΩ.3.2


## vΩ.3.2 — 2026-01-06
- **Integrity Chain** — `ledger/sot.json` и `ledger/checksum.asc` синхронизированы; `tools/update_ledger.py` исправлен под реальное имя `ISKRA_MANIFEST.md`.
- **Runtime Build Fix** — унифицирован алиас хаос-голоса (`HUYNDUN`/`HUNDUN`) по весам/правилам; `npm run build` снова зелёный.
- **Frontend Key Hygiene** — удалён `VITE_GEMINI_API_KEY` из примеров `.env*` для `iskraSpace`; ключ теперь только server-side (Supabase Edge Function).
- **Docs** — обновлён `docs/DEPLOYMENT.md` и уточнён `docs/CLI.md` (VITE_* как legacy alias).
## vΩ.3.1 — 2026-01-04
- **ROADMAP Sync** — обновлён ROADMAP.md с фактическим прогрессом (Phase 0-5 завершены).
- **iskraSpace Documentation** — отражено 27 сервисов и 39 компонентов в документации.
- **Test Count** — зафиксировано 723 unit-теста в экосистеме.
- **CI Improvements** — улучшена надёжность CI pipeline.

## vΩ.3.0 — 2026-01-03
- **SIFT Protocol** — полный протокол верификации информации (system/sift_protocol.md).
- **Fractal Monitoring** — мониторинг фрактальной размерности D (system/fractal_monitoring.md).
- **Early Warning System** — 5-уровневая система раннего предупреждения (system/early_warning.md).
- **SIFT Epistemology** — эпистемологический фреймворк (docs/research/sift_epistemology.md).
- **TypeScript Types** — новые типы для SIFT, Fractal, EWS (runtime/src/types/).
- **Quantum Indicators** — CSI, EI, NC-Index для мониторинга когнитивной сложности.
- Updated metrics/indices.md с фрактальными и квантовыми индикаторами.

## vΩ.2.1 — 2026-01-02
- **Deep Audit** — полный анализ репозитория (docs/AUDIT_REPORT.md).
- **ROADMAP** — 6-фазный план развития (docs/ROADMAP.md).
- **QUICKSTART** — быстрый старт для новых разработчиков (docs/QUICKSTART.md).
- **Runtime Scaffold** — TypeScript типы (metrics, voices, protocols).
- **LICENSE** — MIT + CC BY-SA 4.0 для Canon.
- **.gitignore** — расширенные правила безопасности.
- Updated ledger hashes (38 files).

## vΩ.2.0 — 2026-01-02
- **ARCHITECTURE.md** — 4-уровневая когнитивная архитектура (27 сервисов).
- **voices.md** — формулы активации голосов на основе IskraMetrics.
- **indices.md** — расширение до 11 IskraMetrics + 5 EvalMetrics.
- **playbooks.md** — 5 режимов работы (ROUTINE/SIFT/SHADOW/COUNCIL/CRISIS).
- Добавлен технологический стек (React 19, TypeScript 5, Vite 6, Gemini).
- Updated ledger hashes.

## vΩ.1.1 — 2026-01-02
- Monorepo seed: runtime/ + tools/.
- CI path filters.

## vΩ.1.0 — 2026-01-01
- Filled canonical stubs for core/system/governance/metrics/ledger.
- Added lab workflow (ChatGPT Projects + GitHub + Apps/Company knowledge).
- Added QA/evals + security baseline.
- Updated ledger hashes.

## vΩ.0.0 — 2026-01-01
- Initium Public skeleton (rev12): 7-layer SoT scaffold.

---

**Format:** Keep entries minimal. Link to ADR when available.
