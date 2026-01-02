# ISKRA ROADMAP vΩ

**Обновлено:** 2026-01-02
**Автор:** Claude (Opus 4.5)

---

## Философия развития

> _«Форма следует за различием. Код следует за каноном.»_

ISKRA развивается по принципу **Canon First** — сначала стабилизируем Source of Truth, затем пишем код.

---

## Фазы развития

### Phase 0: Foundation (Текущая) ✅

**Цель:** Стабильный SoT без пробелов

| Задача | Статус | Приоритет |
|--------|--------|-----------|
| 7-слойная структура | ✅ Done | — |
| Философский канон | ✅ Done | — |
| 9 голосов с формулами | ✅ Done | — |
| 11 метрик | ✅ Done | — |
| CI hash-check | ✅ Done | — |
| LICENSE файл | 🔄 В работе | P0 |
| Расширенный .gitignore | 🔄 В работе | P0 |
| Аудит-отчёт | ✅ Done | — |

---

### Phase 1: Scaffolding (Январь 2026)

**Цель:** Готовая среда разработки

| Задача | Описание | Приоритет |
|--------|----------|-----------|
| `runtime/package.json` | Инициализация npm проекта | P0 |
| TypeScript конфигурация | tsconfig.json, строгий режим | P0 |
| ESLint + Prettier | Форматирование и линтинг | P1 |
| Vitest setup | Unit-тестирование | P1 |
| Базовые типы | IskraMetrics, Voice, Playbook | P0 |

**Критерий завершения:**
```bash
npm run build   # Проходит
npm run test    # Минимум 1 тест
npm run lint    # Без ошибок
```

---

### Phase 2: Core Services (Февраль 2026)

**Цель:** 5 базовых сервисов

| Сервис | Описание | Зависимости |
|--------|----------|-------------|
| `metricsService` | Расчёт 11 IskraMetrics | — |
| `voiceEngine` | Выбор голоса по формулам | metricsService |
| `deltaProtocol` | Валидация ∆DΩΛ | — |
| `policyEngine` | Выбор Playbook | metricsService |
| `evalService` | 5-метричная оценка | deltaProtocol |

**Архитектура:**
```
runtime/src/
├── services/
│   ├── metricsService.ts
│   ├── voiceEngine.ts
│   ├── deltaProtocol.ts
│   ├── policyEngine.ts
│   └── evalService.ts
├── types/
│   ├── metrics.ts
│   ├── voices.ts
│   └── protocols.ts
└── index.ts
```

**Критерий завершения:**
- 50+ unit-тестов
- Покрытие > 80%
- Все формулы из voices.md реализованы

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

**Текущая версия:** vΩ.2.0

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

**∆:** Создан ROADMAP с 6 фазами развития ISKRA.

**D:** Audit → Gap analysis → Prioritization → Roadmap.

**Ω:** 0.75 — зависит от ресурсов и приоритетов владельца.

**Λ:** Пересмотреть после Phase 1 (конец января).

---

**Integrity:** Planning-Active
