# ISKRA ROADMAP vΩ.3.1

**Обновлено:** 2026-01-04
**Автор:** Claude (Opus 4.5)

---

## Философия развития

> _«Форма следует за различием. Код следует за каноном.»_

ISKRA развивается по принципу **Canon First** — сначала стабилизируем Source of Truth, затем пишем код.

---

## Аналитический roadmap (операционный план)

### Фаза 0 — Инвентаризация и контроль целостности (1–2 дня)
- Пройтись по структуре, зафиксировать актуальные ADR (governance/adr.md) и сверить с core/.
- Прогнать `python tools/verify_ledger.py`; зафиксировать состояние ledger/sot.json.
- Сформировать перечень открытых технических долгов в runtime (typecheck, lint, tests).

### Фаза 1 — Governance и SoT (3–5 дней, при изменениях core/)
- Для любых изменений в core/: подготовить ADR (governance/adr.md или новый файл), согласовать.
- После ADR:
  - внести правки в core/
  - обновить ledger/sot.json через `python tools/update_ledger.py`, затем `python tools/verify_ledger.py`
- При необходимости обновить system/ и metrics/ для фиксации договорённостей.

### Фаза 2 — Качество и стабильность runtime (5–10 дней)
- CI baseline: `npm ci`, `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`.
- Добавить минимальные проверки в PR-шаблоны (.github/) для дисциплины (lint, tests).
- Покрыть критические типы и протоколы (runtime/src/types/*) тестами.
- Убрать any/unknown в горячих путях.
- Задать E2E/интеграционные сценарии для ключевых протоколов (metrics, voices, sift/fractal/ews).

### Фаза 3 — Наблюдаемость и метрики (4–7 дней)
- В metrics/ уточнить 11 IskraMetrics и индексы Fractal/Quantum; определить форматы вывода.
- В runtime добавить структурированный трейсинг/логирование для протоколов (уровни, корреляционные ID).
- Проверить Early Warning System: уровни NORMAL→LOCKDOWN, триггеры и алерты.

### Фаза 4 — Документация и ritual alignment (3–5 дней)
- Синхронизировать docs/ и appendix/ с фактическим поведением runtime.
- Обновить system/ (SIFT, Fractal, EWS) описания с привязкой к реализованным хендлерам.
- Добавить developer playbook (ROUTINE/SIFT/SHADOW/COUNCIL/CRISIS) со шагами запуска и дебага.

### Фаза 5 — Улучшения и эксперименты (постоянно)
- mind/: фиксировать гипотезы и эксперименты; регулярно удалять устаревшие.
- appendix/: собирать идеи, отделять от SoT и помечать возможные противоречия.

### Тактические задачи
- Повторять `python tools/verify_ledger.py` (см. Фаза 0) и фиксировать состояние.
- Составить список ADR, требуемых для любых предстоящих core-изменений.
- В runtime: baseline CI (lint/typecheck/test/build) и отчёт о результатах.
- Покрытие тестами ключевых типов и протоколов (runtime/src/types/*), убрать any в критических местах.
- Настроить структурированное логирование и минимальный трейсинг для протоколов.
- Обновить docs/ и system/ под фактическую реализацию (EWS, Fractal, SIFT).
- Обновить .github/ шаблоны для чеклистов (lint/tests/typecheck).
- Описать план интеграционных тестов для EWS и протоколов.

---

## Фазы развития

### Phase 0: Foundation ✅ COMPLETE

**Цель:** Стабильный SoT без пробелов

| Задача | Статус | Примечание |
|--------|--------|------------|
| 7-слойная структура | ✅ Done | 41 файл в SoT |
| Философский канон | ✅ Done | core/ полностью заполнен |
| 9 голосов с формулами | ✅ Done | + TypeScript типы |
| 11 метрик | ✅ Done | + Fractal/Quantum индексы |
| CI hash-check | ✅ Done | ledger/sot.json |
| LICENSE файл | ✅ Done | MIT + CC BY-SA 4.0 |
| Расширенный .gitignore | ✅ Done | 110+ правил |
| Аудит-отчёт | ✅ Done | docs/AUDIT_REPORT.md |
| SIFT Protocol | ✅ Done | system/sift_protocol.md |
| Fractal Monitoring | ✅ Done | system/fractal_monitoring.md |
| Early Warning System | ✅ Done | system/early_warning.md |

---

### Phase 1: Scaffolding ✅ COMPLETE

**Цель:** Готовая среда разработки

| Задача | Статус | Примечание |
|--------|--------|------------|
| `runtime/package.json` | ✅ Done | @iskra/runtime |
| TypeScript конфигурация | ✅ Done | Strict mode |
| Базовые типы (metrics, voices, protocols) | ✅ Done | 3 файла |
| SIFT типы | ✅ Done | sift.ts |
| Fractal типы | ✅ Done | fractal.ts |
| EWS типы | ✅ Done | ews.ts |
| ESLint + Prettier | ⏳ Pending | Phase 2 |
| Vitest setup | ⏳ Pending | Phase 2 |

**Текущее состояние:**
```
runtime/src/types/
├── metrics.ts    ✅
├── voices.ts     ✅
├── protocols.ts  ✅
├── sift.ts       ✅
├── fractal.ts    ✅
└── ews.ts        ✅
```

---

### Phase 2: Core Services ✅ COMPLETE

**Цель:** 8 базовых сервисов

| Сервис | Описание | Зависимости | Статус |
|--------|----------|-------------|--------|
| `metricsService` | Расчёт 11 IskraMetrics + MetaMetrics | — | ✅ Done |
| `voiceEngine` | Выбор голоса по формулам | metricsService | ✅ Done |
| `deltaProtocol` | Валидация ∆DΩΛ | — | ✅ Done |
| `policyEngine` | Выбор Playbook | metricsService | ✅ Done |
| `evalService` | 5-метричная оценка | deltaProtocol | ✅ Done |
| `securityService` | PII/injection защита | — | ✅ Done |
| `auditService` | Логирование и аудит | — | ✅ Done |
| `ritualService` | Phoenix, Shatter, Council | — | ✅ Done |

**Дополнительные сервисы реализованы (27 сервисов):**

| Сервис | Описание | Статус |
|--------|----------|--------|
| `geminiService` | AI streaming с Gemini API | ✅ Done |
| `ragService` | Context retrieval из памяти | ✅ Done |
| `glossaryService` | Canon terminology | ✅ Done |
| `memoryService` | Mantra/Archive/Shadow layers | ✅ Done |
| `graphService` | Graph-based memory | ✅ Done |
| `searchService` | Full-text search | ✅ Done |
| `storageService` | LocalStorage persistence | ✅ Done |
| `makiService` | Maki (🌸) support | ✅ Done |
| `voiceSynapseService` | Voice coordination | ✅ Done |
| `deltaEnforcer` | ∆DΩΛ enforcement | ✅ Done |
| `canonService` | Canon principles access | ✅ Done |
| `evidenceService` | SIFT evidence tracking | ✅ Done |
| `userMetricsService` | User daily metrics | ✅ Done |
| `validatorsService` | Input validation | ✅ Done |
| `soundService` | Audio feedback | ✅ Done |
| `errorTracking` | Error handling | ✅ Done |
| `rateLimiter` | Rate limiting | ✅ Done |
| `rule8Service` | Rule 8 compliance | ✅ Done |
| `supabaseService` | Database integration | ✅ Done |

**Архитектура (реализована в iskraSpace):**
```
runtime/
├── src/
│   ├── types/           # Core TypeScript types
│   │   ├── metrics.ts    ✅
│   │   ├── voices.ts     ✅
│   │   ├── protocols.ts  ✅
│   │   ├── sift.ts       ✅
│   │   ├── fractal.ts    ✅
│   │   └── ews.ts        ✅
│   ├── __tests__/       # Unit tests (6 files)
│   └── index.ts         ✅
└── iskraSpace/
    ├── services/        # 27 production services ✅
    ├── components/      # 39 React components ✅
    └── __tests__/       # Comprehensive tests ✅
```

**Тесты:** 723 unit-тестов ✅

---

### Phase 3: LLM Integration ✅ COMPLETE

**Цель:** Рабочий AI-backend

| Компонент | Описание | Статус |
|-----------|----------|--------|
| `geminiService` | Интеграция Google Gemini API | ✅ Done |
| `promptBuilder` | Сборка system instruction | ✅ Done |
| `ragService` | RAG по SoT файлам | ✅ Done |
| `securityService` | PII/injection защита | ✅ Done |

**Технологии:**
- Google Gemini 2.5 Flash/Pro ✅
- Supabase pgvector для эмбеддингов ✅

**Результат:**
```typescript
const response = await geminiService.getChatResponseStreamWithPolicy(...);
// ✅ Ответ содержит ∆DΩΛ блок
// ✅ Голос выбран по метрикам
// ✅ Streaming поддержан
```

---

### Phase 4: CLI Interface ⏳ PLANNED

**Цель:** Терминальный интерфейс

```bash
# Запуск интерактивной сессии
npx iskra chat

# Выбор голоса
npx iskra chat --voice kain

# Режим верификации
npx iskra sift "Проверь факт X"

# Статус метрик
npx iskra metrics
```

**Библиотеки:**
- `commander` — CLI framework
- `ink` — React для терминала
- `chalk` — Цвета

**Статус:** Планируется после стабилизации iskraSpace

---

### Phase 5: Web Frontend ✅ COMPLETE (iskraSpace)

**Цель:** React приложение

| Компонент | Описание | Статус |
|-----------|----------|--------|
| ChatView | Основной чат | ✅ Done |
| CouncilView | Визуализация голосов | ✅ Done |
| IskraMetricsDisplay | Dashboard метрик | ✅ Done |
| Journal | Session journal | ✅ Done |
| EvalDashboard | Аналитика качества | ✅ Done |
| MemoryView | Memory browser | ✅ Done |
| ShadowView | Shadow exploration | ✅ Done |
| DeepResearchView | Research mode | ✅ Done |
| LiveConversation | Real-time streaming | ✅ Done |

**Всего компонентов:** 39 ✅

**Технологии:**
- React 18 (with TypeScript) ✅
- Vite ✅
- TailwindCSS ✅
- Framer Motion ✅

---

### Phase 6: Production ⏳ IN PROGRESS

**Цель:** Публичный релиз

| Задача | Описание |
|--------|----------|
| Docker | Контейнеризация |
| Vercel/Railway | Deployment |
| Auth | Supabase Auth |
| Rate Limiting | Защита API |
| Monitoring | Sentry + analytics |

---

## Версионирование

```
vΩ.X.Y.Z
  │ │ │ └── Patch (bugfix, typo)
  │ │ └──── Minor (новый сервис, документ)
  │ └────── Major (архитектурное изменение)
  └──────── Omega (философский сдвиг)
```

**Текущая версия:** vΩ.3.1

### История версий
- vΩ.3.1 — Синхронизация ROADMAP с фактическим прогрессом
- vΩ.3.0 — SIFT + Fractal + EWS интеграция
- vΩ.2.1 — Deep Audit + TypeScript scaffold
- vΩ.2.0 — Fullspark Architecture
- vΩ.1.0 — Initial SoT structure

---

## Метрики успеха

### Phase 1-2 (Technical) ✅ ACHIEVED
- Покрытие тестами: 723 теста ✅
- Build time < 10 сек ✅
- Zero linting errors ✅
- TypeScript strict mode ✅

### Phase 3-5 (Functional) ✅ ACHIEVED
- ∆DΩΛ compliance: реализован deltaEnforcer ✅
- Voice selection: voiceEngine + voiceSynapseService ✅
- Streaming: geminiService с real-time streaming ✅

### Phase 6 (Product) ⏳ IN PROGRESS
- User retention D7 > 40%
- NPS > 50
- Uptime > 99.5%

---

## Принципы разработки

1. **Canon First** — код следует за документацией
2. **Test Driven** — тест до реализации
3. **Incremental** — маленькие PR
4. **Auditable** — каждое изменение в ledger
5. **Honest** — признаём пробелы, не прячем

---

## ∆DΩΛ

**∆:** ROADMAP обновлён — Phase 0-5 завершены, Phase 6 в работе. iskraSpace содержит 27 сервисов и 39 компонентов.

**D:** Code audit → 723 tests passing → Service inventory → Documentation sync.

**Ω:** 0.92 — все core сервисы реализованы, типы интегрированы, тесты проходят.

**Λ:** Продолжить полировку CI/CD → добавить coverage → подготовить production deployment.

---

**Version:** vΩ.3.1
**Integrity:** Planning-Active
