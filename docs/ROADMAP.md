# ISKRA ROADMAP vΩ.3.0

**Обновлено:** 2026-01-03
**Автор:** Claude (Opus 4.5)

---

## Философия развития

> _«Форма следует за различием. Код следует за каноном.»_

ISKRA развивается по принципу **Canon First** — сначала стабилизируем Source of Truth, затем пишем код.

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

### Phase 2: Core Services (Текущая)

**Цель:** 8 базовых сервисов

| Сервис | Описание | Зависимости | Статус |
|--------|----------|-------------|--------|
| `metricsService` | Расчёт 11 IskraMetrics | — | ⏳ TODO |
| `voiceEngine` | Выбор голоса по формулам | metricsService | ⏳ TODO |
| `deltaProtocol` | Валидация ∆DΩΛ | — | ⏳ TODO |
| `policyEngine` | Выбор Playbook | metricsService | ⏳ TODO |
| `evalService` | 5-метричная оценка | deltaProtocol | ⏳ TODO |
| `siftService` | SIFT верификация | — | ⏳ TODO |
| `fractalMonitor` | Расчёт D (HFD/DFA) | metricsService | ⏳ TODO |
| `earlyWarning` | EWS алерты | fractalMonitor | ⏳ TODO |

**Архитектура:**
```
runtime/src/
├── services/
│   ├── metricsService.ts     ← TODO
│   ├── voiceEngine.ts        ← TODO
│   ├── deltaProtocol.ts      ← TODO
│   ├── policyEngine.ts       ← TODO
│   ├── evalService.ts        ← TODO
│   ├── siftService.ts        ← TODO
│   ├── fractalMonitor.ts     ← TODO
│   └── earlyWarning.ts       ← TODO
├── types/
│   ├── metrics.ts    ✅
│   ├── voices.ts     ✅
│   ├── protocols.ts  ✅
│   ├── sift.ts       ✅
│   ├── fractal.ts    ✅
│   └── ews.ts        ✅
└── index.ts          ✅
```

**Критерий завершения:**
- 80+ unit-тестов
- Покрытие > 80%
- Все формулы из voices.md реализованы
- SIFT/Fractal/EWS сервисы работают

---

### Phase 3: LLM Integration (Март 2026)

**Цель:** Рабочий AI-backend

| Компонент | Описание |
|-----------|----------|
| `geminiService` | Интеграция Google Gemini API |
| `promptBuilder` | Сборка system instruction |
| `ragService` | RAG по SoT файлам |
| `securityService` | PII/injection защита |

**Технологии:**
- Google Gemini 2.5 Flash/Pro
- LangChain для RAG
- Supabase pgvector для эмбеддингов

**Критерий завершения:**
```typescript
const response = await iskra.chat("Привет, Искра!");
// Ответ содержит ∆DΩΛ блок
// Голос выбран по метрикам
```

---

### Phase 4: CLI Interface (Апрель 2026)

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

---

### Phase 5: Web Frontend (Май-Июнь 2026)

**Цель:** React приложение

| Компонент | Описание |
|-----------|----------|
| ChatView | Основной чат |
| CouncilView | Визуализация голосов |
| MetricsPanel | Dashboard метрик |
| JournalView | Ledger memory |
| EvalDashboard | Аналитика качества |

**Технологии:**
- React 19 (RSC)
- Vite 6
- TailwindCSS
- Framer Motion
- React Query

---

### Phase 6: Production (Q3 2026)

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

**Текущая версия:** vΩ.3.0

### История версий
- vΩ.3.0 — SIFT + Fractal + EWS интеграция
- vΩ.2.1 — Deep Audit + TypeScript scaffold
- vΩ.2.0 — Fullspark Architecture
- vΩ.1.0 — Initial SoT structure

---

## Метрики успеха

### Phase 1-2 (Technical)
- Покрытие тестами > 80%
- Build time < 10 сек
- Zero linting errors

### Phase 3-4 (Functional)
- ∆DΩΛ compliance > 95%
- Voice selection accuracy > 90%
- Response latency < 2 сек

### Phase 5-6 (Product)
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

**∆:** ROADMAP обновлён — Phase 0-1 завершены, Phase 2 в работе.

**D:** Audit vΩ.3.0 → Gap analysis → Progress tracking → Roadmap update.

**Ω:** 0.88 — структура ясна, типы готовы, сервисы в очереди.

**Λ:** Реализовать 8 сервисов Phase 2 → unit-тесты → Phase 3.

---

**Version:** vΩ.3.0
**Integrity:** Planning-Active
