# Release Note

**Manifest:**
- type: SoT
- layer: ledger
- created: 2026-01-01
- version: vΩ.1.0

## vΩ.1.0 (rev12a) — 2026-01-01
### Что сделано
- Заполнены все SoT-заглушки.
- Добавлены протоколы: STOP/REPAIR/WARM, режимы 0–3, Council.
- Описана лаборатория: ChatGPT Projects + GitHub + Apps/Company knowledge.
- Добавлены evals/qa/security baseline.
- Обновлены sha256 и checksum.

### Риски
- Увеличился объём канона → возможна “перегруженность”.  
  Λ: пересмотреть после 10 LAB-сессий.

### Следующий шаг
- Подключить GitHub app и завести репозиторий (private).
- Запустить 4 базовых теста (Mirror/Drift/Repair/RAG).

---

**Integrity:** Release-Primary


## vΩ.1.1 (rev12b-monorepo-seed) — 2026-01-02
### Что сделано
- Принято решение монорепо: SoT + runtime в одном репозитории.
- Добавлены `runtime/` (каркас) и `tools/` (скрипты обновления/проверки ledger).
- CI SoT ограничен path-фильтрами (не гоняется на изменения runtime).

### Риски
- Возможен рассинхрон “канон ↔ код”, если менять runtime без ADR.
  Λ: правило — любое изменение, влияющее на поведение Искры, фиксировать ADR.

### Следующий шаг
- Создать private GitHub repo и залить этот монорепо-seed.
- Подключить GitHub app в ChatGPT Business.


## vΩ.2.0 (Fullspark Integration) — 2026-01-02
### Что сделано
- Интеграция 4-уровневой когнитивной архитектуры Fullspark.
- Переписан `system/architecture.md` с полным описанием 10-шагового pipeline.
- Создан `system/playbooks.md` с 5 режимами работы (ROUTINE/SIFT/SHADOW/COUNCIL/CRISIS).
- Обновлён `core/voices.md` с формулами активации голосов на основе метрик.
- Расширен `metrics/indices.md` до 11 IskraMetrics.

### Ω: 0.85
### Λ: Калибровать после 20 LAB-сессий.

---

## vΩ.2.1 (Deep Audit & Setup) — 2026-01-02
### Что сделано
- Полный аудит репозитория и документирование.
- Созданы: `docs/AUDIT_REPORT.md`, `docs/ROADMAP.md`, `docs/QUICKSTART.md`.
- TypeScript scaffold: `runtime/src/types/` с metrics, voices, protocols.
- Добавлены LICENSE (MIT + CC BY-SA 4.0), расширен `.gitignore`.

### Ω: 0.88
### Λ: Реализовать Phase 1 scaffolding → npm install → build.

---

## vΩ.3.0 (Research Integration) — 2026-01-03
### Что сделано
- Интеграция исследований: SIFT протокол, фрактальный мониторинг, EWS.
- Создан `docs/research/sift_epistemology.md` — эпистемологический фреймворк.
- Созданы: `system/sift_protocol.md`, `system/fractal_monitoring.md`, `system/early_warning.md`.
- TypeScript типы: `sift.ts`, `fractal.ts`, `ews.ts` в runtime.
- Обновлён `metrics/indices.md` с фрактальными индикаторами.

### Ω: 0.80
### Λ: Имплементировать сервисы в runtime/src/services/.

---

## vΩ.3.1 (iskraSpace Documentation) — 2026-01-04
### Что сделано
- Документация iskraSpace: ARCHITECTURE.md, SERVICES.md (27 сервисов, 42 компонента).
- Синхронизация ROADMAP.md с текущим состоянием.
- 723 unit-теста (Vitest), улучшения CI.

---

## vΩ.3.2 (Integrity Chain Sync) — 2026-01-06
### Что сделано
- Приведена в соответствие цепочка целостности: обновлён `tools/update_ledger.py`, регенерирован `ledger/sot.json` (55 объектов) и `ledger/checksum.asc`.
- Полировка безопасности: удалены LLM ключи из примеров Vite `.env*` для `iskraSpace`, добавлены явные указания использовать `GEMINI_API_KEY` только на сервере (Supabase Edge Function).
- Runtime: исправлен алиас голоса хаоса (`HUYNDUN` / `HUNDUN`) во всех weight-map/правилах, чтобы `npm run build` проходил.

### Проверки
- `python tools/verify_ledger.py` → OK.
- `runtime`: `npm test` → OK.
- `runtime`: `npm run build` → OK.

### Риски
- Наличие двух имён голоса хаоса может порождать дубли в интеграциях.
  Λ: нормализовывать ввод (`HUNDUN` → `HUYNDUN`) на границе API/интерфейсов.

---

## vΩ.3.3 (PWA & Council Enhancement) — 2026-01-10
### Что сделано
- Council параллелизация: запросы ко всем 9 голосам теперь выполняются через `Promise.allSettled`, сокращая время ~9x → ~1x.
- Council UI: добавлены VOICE_TELOS с описанием роли каждого голоса, улучшенные карточки (увеличенный аватар, тег "Синтез" для Искры).
- PWA: обновлён `manifest.json` (ярлыки, русские названия), создан `service-worker.js` (cache-first стратегия).
- Исправлены TypeScript-ошибки в тестах (`ragServiceExtended.test.ts`, `geminiService.test.ts`).

### Проверки
- `npm run typecheck` → OK.
- `npm run test` → OK.

### Ω: 0.88
### Λ: Добавить notification API для PWA push-уведомлений.

---

## vΩ.3.4 (UX Improvements) — 2026-01-11
### Что сделано
- ∆DΩΛ Tooltips: создан `Tooltip.tsx` с предустановленными тултипами для символов протокола.
- DeltaReport обновлён для использования Tooltip-компонентов.
- Response Mode: добавлен переключатель режима ответа (Simple/Deep/Debate) в настройках.
- MoodTracker: создан виджет быстрого чек-ина настроения с историей.
- storageService: расширен для хранения ResponseMode и экспорта/импорта.
- types.ts: добавлен тип `ResponseMode`.

### Проверки
- `npm run typecheck` → OK.

### Ω: 0.85
### Λ: Подключить MoodTracker в DayPulse view.

---

## vΩ.3.5 (ResponseMode Integration) — 2026-01-11
### Что сделано
- geminiService: интеграция ResponseMode в `getChatResponseStream`
- Добавлены инструкции для трёх режимов (simple/deep/debate)
- В режиме 'simple' отключается блок ∆DΩΛ для кратких ответов
- Экспортирована функция `getResponseModeInstruction()` для внешнего использования

### Проверки
- `npm run typecheck` → OK

### Ω: 0.88
### Λ: Добавить визуальный индикатор текущего режима в ChatView.

---

## vΩ.3.6 (Security Config Extraction) — 2026-01-11
### Что сделано
- Создан `config/securityPatterns.json` с паттернами PII, injection, danger
- securityService: загрузка паттернов из JSON-конфига вместо hardcoded
- Добавлены новые паттерны: google_api_key, password_field, forget_instructions, pretend_to_be, developer_mode
- Расширены dangerous topics: EN keywords добавлены к RU

### Проверки
- `npm run typecheck` → OK
- `npm run test -- securityService` → 38 tests passed

### Ω: 0.90
### Λ: Добавить возможность hot-reload паттернов без перезапуска.
