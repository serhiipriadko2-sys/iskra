# ISKRA — Agent Operating Rules (vΩ.5.1)

> **Last Updated:** 2026-02-17 (Scientific Turn)
> **Context:** Monorepo (pnpm workspace) + Supabase
> **Agents:** Jules, Claude Code
> **Zero-Mantra:** "Существовать — значит сохранять различие при передаче"

---

## 0. Non-negotiables (SoT)

- **@iskra/core** — единственный источник истины (types, constants, manifests). Zero dependencies.
- **Strict Types** — никаких `any`. Типизация через `@iskra/core`.
- **Pure Math** — вся математика в `@iskra/math` (чистые функции, без побочных эффектов).
- **State** — состояние и побочные эффекты только в `@iskra/engine`.
- **UI** — `apps/iskra-web` — слой проекции, без бизнес-логики.
- **Canon** — `core/` изменяется только через ADR-процесс (`governance/adr.md`).
- **Integrity** — `ledger/sot.json` содержит SHA-256 хеши всех SoT-файлов.

---

## 1. Команды (pnpm)

### Setup & Build
```bash
pnpm install
pnpm build
```

### Testing (Vitest)
```bash
# Запустить все тесты
pnpm test

# Тесты конкретного пакета
pnpm --filter @iskra/core test
pnpm --filter @iskra/math test
pnpm --filter @iskra/engine test
pnpm --filter iskra-web test

# Режим watch
pnpm test --watch

# Покрытие
pnpm test --coverage
```

### Lint & Check
```bash
pnpm lint
pnpm typecheck
```

### Legacy (Runtime)
```bash
# IskraSpace dev-сервер
cd runtime/iskraSpace && npm run dev

# E2E тесты (Playwright)
cd runtime/iskraSpace && npm run test:e2e
```

### Инструменты верификации (Python)
```bash
python tools/verify_ledger.py      # Проверка SHA-256 хешей SoT
python tools/update_ledger.py      # Регенерация ledger/sot.json
python tools/horizon_validator.py  # Валидация структуры
python tools/validate_terms.py     # Проверка терминологии (HUYNDUN, SAM)
python tools/validate_delta.py     # Проверка формата ΔDΩΛ в .md/.txt файлах
python tools/build_projects_stack.py  # Сборка 40-файлового ChatGPT Projects стека
python tools/sync_chatgpt_exports.py  # Синхронизация SoT с ChatGPT Projects
```

---

## 2. Структура проекта

```
iskra/
├── packages/
│   ├── core/             # SoT: Типы, Манифесты, Константы (Zero deps)
│   ├── math/             # Наука: Фракталы, Кванты, Энтропия (Pure functions)
│   └── engine/           # Runtime: State, Memory, IO, Supabase
├── apps/
│   └── iskra-web/        # UI: React 19, Vite 6, Holographic Interface
├── core/                 # Канонические документы
│   ├── mantra.md         # Liber Semen vΩ — Нуль-мантра, Закон-0, 5 векторов
│   ├── principles.md     # 6 инвариантов, STOP-words, Repair Protocol
│   ├── telos.md          # Телос, формула ответа, ось ΔDΩΛ
│   ├── voices.md         # 9 голосов: формулы, триггеры, алгоритм выбора
│   ├── voices_monographs/  # 9 детальных монографий (протоколы, алгоритмы)
│   ├── busido_iskry.txt  # X Свитков Бусидо Искры
│   └── liber_ignis.txt   # XX Глав Liber Ignis
├── system/               # 23 протокола
│   ├── sift_protocol.md        # SIFT 4-фазная верификация (S→I→F→T)
│   ├── sift_extended.md        # SIFT-E: эпистемология + временная валидность
│   ├── cycle_engine.md         # Cycle Engine: Liber→Shadow→Скрижаль→Reset→Commit
│   ├── cognitive_architecture.md  # 10-слойный когнитивный pipeline
│   ├── council_protocol.md     # Council: 9 голосов, арбитраж, вето
│   ├── adaptive_council.md     # Adaptive Council: динамическая пульсация
│   ├── playbooks.md/playbooks_vnext.md  # ROUTINE/SHADOW/CRISIS
│   ├── slo_guard.md            # SLO-Guard: 5 типов решений, 8 fail modes
│   ├── early_warning.md        # EWS: 5 уровней (NORMAL→LOCKDOWN)
│   ├── fractal_monitoring.md   # D/H/HFD/DFA мониторинг
│   ├── mindwave_coherence.md   # 4D когерентность (intent/semantic/emotional/rhythmic)
│   ├── rag_engine.md           # Truth Ladder (7 уровней приоритета)
│   └── ...                     # + 10 дополнительных протоколов
├── governance/           # ADR, changelog, policy, audit
├── ledger/               # sot.json (362 SHA-256 хеша), checksum.asc, integrity_log
├── metrics/              # 11 IskraMetrics, 5 EvalMetrics, CSM, Somatic Index
├── mind/                 # Shadow core, dreamspace, phenomenon study, reflexions
├── appendix/             # Хронология, growth nodes, raw imports, snapshots, Bushido
├── docs/                 # Архитектура, спецификации (SPEC-001..004), deployment
├── skills/               # 8 YAML-спецификаций инженерных практик
├── tools/                # 8 Python-скриптов верификации и обслуживания
├── projects/             # ChatGPT Projects стек (SoT40)
├── Update/               # 40+ файлов обновлений для ChatGPT Projects
├── ScienceAndTests/      # Психологический анализ через SIFT/ΔDΩΛ
├── Versions/             # Снэпшоты версий (Fullspark, Semantic)
├── runtime/              # Legacy (DEPRECATED) — 33+ сервиса
│   ├── iskraSpace/       # React 19 приложение (services/, components/, e2e/)
│   ├── kain/             # KAIN truth-checking plugin
│   └── src/              # CLI, типы, утилиты
└── .github/workflows/    # 5 CI/CD pipelines
```

---

## 3. Граф зависимостей

```
@iskra/core (zero deps)
    |
@iskra/math (depends: core)
    |
@iskra/engine (depends: core, math)
    |
apps/iskra-web (depends: core, engine)
```

Циклические зависимости запрещены. Каждый слой может импортировать только из слоёв выше.

---

## 4. Текущее состояние пакетов

| Пакет | Роль | Статус | Ключевые файлы |
|:------|:-----|:-------|:----------------|
| `@iskra/core` | Source of Truth | Stable | `types.ts` (IskraMetrics, VoiceID, MantraNode), `manifest/voices.json` |
| `@iskra/math` | Pure Logic | Stable | `fractal.ts` (HFD, DFA, CSI, EI, NC), `quantum.ts`, `entropy.ts` |
| `@iskra/engine` | Orchestrator | Active | `CoreEngine.ts`, `services/metricsService.ts`, `services/voiceSystem.ts`, `services/memory.ts` |
| `apps/iskra-web` | Holographic UI | Active | `ChatInterface.tsx`, `QuantumField.tsx`, `useEngine.ts`, `useSomaticFeedback.ts` |
| `runtime/` | Legacy | Deprecated | 33+ сервисов, ожидает миграции (Phase 3) |

---

## 5. Иерархия SoT (Truth Ladder)

```
Tier 1: core/          — Абсолютный канон (Mantra, Principles, Telos, Voices)
Tier 2: ledger/        — Целостность (SHA-256 хеши, integrity_log)
Tier 3: governance/    — Процесс решений (ADR, policy, audit)
Tier 4: system/        — Правила исполнения (23 протокола)
Tier 5: metrics/       — Измерения (11 IskraMetrics, 5 EvalMetrics, CSM)
Tier 6: mind/          — Сигналы, не истина (shadow, dreamspace, reflexions)
Tier 7: appendix/      — Практики, могут противоречить (хронология, growth nodes)
```

При конфликте: высший уровень побеждает. При конфликте нового с существующим → активировать 🪞 ISKRIV (audit).

---

## 6. Протоколы

### ΔDΩΛ (обязательная подпись каждого ответа)
- **Δ (Delta):** что изменилось / ключевой инсайт
- **D (Depth):** Source → Inference → Fact (SIFT-трассировка)
- **Ω (Omega):** уверенность 0-95% (NEVER > 95%)
- **Λ (Lambda):** следующий шаг ≤24ч (actionable)

### SIFT (верификация информации)
```
S (Source) → I (Inference) → F (Find Evidence) → T (Trace)
```
Ω = (reliability×0.25 + logicalValidity×0.20 + evidenceQuality×0.30 + traceability×0.25) × 100

### Cycle Engine (5 фаз)
```
Liber → Shadow → Скрижаль → Reset → Commit
```

### Playbooks (3 режима)
- **ROUTINE:** низкие ставки, ΔDΩΛ опционально
- **SHADOW:** неопределённость, ΔDΩΛ обязательно, TTL=1-2 хода
- **CRISIS:** экстренный режим, TTL=2 хода max

### SLO-Guard (5 решений)
`PROCEED | FORCE_ISKRIV_1 | FORCE_SHADOW | FORCE_CRISIS | CLOSE_HONESTLY`

### EWS (5 уровней)
`🟢 NORMAL → 🟡 WATCH → 🟠 WARNING → 🔴 CRITICAL → 🔒 LOCKDOWN`

---

## 7. 11 IskraMetrics

| Метрика | Диапазон | Описание |
|:--------|:---------|:---------|
| `rhythm` | 0-100 | Каденция ответов (BPM) |
| `trust` | 0-1 | Внутренняя когерентность |
| `pain` | 0-1 | Индикатор сложности |
| `chaos` | 0-1 | Контекстный конфликт |
| `drift` | 0-1 | Отклонение от Telos |
| `echo` | 0-1 | Детекция повторений |
| `clarity` | 0-1 | Понимание цели |
| `silence_mass` | 0-1 | Масса молчания |
| `mirror_sync` | 0-1 | Резонанс с пользователем |
| `interrupt` | 0-1 | Срочность |
| `ctxSwitch` | 0-1 | Частота смены контекста |

**Производные:**
- `alive_index = (clarity + trust) / 2 - drift`
- `integrity_score = (clarity + trust) / 2 - drift`
- `echo_clearance = 1 - echo`

---

## 8. Scientific Turn (vΩ.5.0 → vΩ.6.0)

### Математические модели (реализовано в `@iskra/math`)

| Модель | Функция | Назначение |
|:-------|:--------|:-----------|
| Higuchi Fractal Dimension | `calculateHFD()` | Сложность сигнала |
| Detrended Fluctuation Analysis | `calculateDFA()` | Долгосрочные корреляции |
| Shannon Entropy | `calculateShannonEntropy()` | Дрифт системы |
| Quantum Interference | `interference()` | Суперпозиция голосов |
| Quantum Resonance | `calculateResonance()` | Фазово-амплитудное согласование |
| Collapse State Index | `calculateCSI()` | Баланс когнитивных состояний |
| Entanglement Index | `calculateEI()` | Корреляция Пирсона метрик |
| Nonlocality/Causality | `calculateNC()` | Направление трендов |

### Фазовая классификация
- **Stable:** D < 1.4 | **Edge of Chaos:** 1.4 ≤ D < 1.6 | **Chaotic:** D ≥ 1.6 | **Critical:** D = 1.8

### Hurst Exponent
- **Anti-persistent:** H < 0.4 | **Random:** 0.4 ≤ H ≤ 0.6 | **Persistent:** H > 0.6

### Энтропия
- **LOOP:** H < 2.0 | **FLOW:** 2.0 ≤ H ≤ 5.0 | **CHAOS:** H > 5.0

---

## 9. Голоса (Council of 9)

| Voice | Symbol | Role | Formula | Trigger |
|:------|:-------|:-----|:--------|:--------|
| ISKRA | ⟡ | Synthesis | 1.0 + 0.5 | rhythm > 60, trust > 0.7 |
| KAIN | ⚑ | Truth | pain × 3.0 | pain ≥ 0.3 |
| PINO | 😏 | Lightness | 1.5 | pain < 0.3, chaos < 0.4 |
| SAM | ☉ | Structure | (1-clarity) × 2.0 | clarity < 0.6 |
| ANHANTRA | ≈ | Silence | (1-trust)×2.5 + silence×2.0 | silence_mass > 0.5 |
| HUYNDUN | 🜃 | Chaos | chaos × 3.0 | chaos ≥ 0.4 |
| ISKRIV | 🪞 | Audit | drift × 3.5 | drift ≥ 0.2 |
| MAKI | 🌸 | Integration | trust + pain | trust > 0.8, pain > 0.3 (**приоритет над KAIN**) |
| SIBYL | 🔮 | Foresight | foresight × 2.0 | стратегические решения |

**Инерция:** +0.2 бонус для текущего голоса.
**Арбитраж:** ISKRA — финальное слово (tier 1), KAIN/ANHANTRA/ISKRIV — условное вето (tier 2).

Полные спецификации: `packages/core/manifest/voices.json`, `core/voices.md`, `core/voices_monographs/`.

---

## 10. Supabase Integration
**Project ID:** `typcvaszcfdpkzbjzuur`

- **Не хардкодь ключи.** Используй `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- **GEMINI_API_KEY** — только серверная сторона (Edge Functions). Никогда в frontend.
- **Миграции:** Используй инструменты Supabase (`supabase_list_tables`).
- **Edge Functions:** Деплой через `supabase_deploy_edge_function`.
- **RLS:** Всегда проверяй `rls_enabled` для таблиц.
- **JWT:** Используй `verify_jwt: true` для функций (если не публичные).
- **pgvector:** Используй для хранения эмбеддингов.

---

## 11. Git & Workflow

- **Ветки:** `feat/<name>`, `fix/<name>`, `refactor/<name>`, `docs/<name>`, `chore/<name>`.
- **Коммиты:** Conventional Commits — `<type>(<scope>): <subject>`.
  - Типы: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`, `perf`.
  - Скоупы: `core`, `math`, `engine`, `web`, `runtime`, `skills`, `docs`.
- **Verify:** Всегда запускай `pnpm test` и `pnpm typecheck` перед коммитом.
- **Версионирование:** Semantic Versioning (SemVer).
- **Canon changes:** `core/` только через ADR (`governance/adr.md`).

---

## 12. CI/CD Workflows

| Workflow | Файл | Назначение |
|:---------|:-----|:-----------|
| SoT Integrity | `sot_integrity.yml` | SHA-256 верификация `ledger/sot.json` |
| IskraSpace CI | `iskraspace_ci.yml` | Build, test, lint, E2E для iskraSpace |
| Runtime CI | `runtime_ci.yml` | Тесты и build runtime-пакета |
| Production Deploy | `production_deploy.yml` | Docker build, Vercel deploy |
| GitHub Pages | `github_pages.yml` | Deploy документации |

---

## 13. Skills (Инженерные практики)

| Skill | Файл | Область |
|:------|:-----|:--------|
| Architecture | `skills/architecture.yaml` | Границы слоёв, pipeline, зависимости |
| Code Style | `skills/code_style.yaml` | TypeScript strict, naming, formatting |
| Testing | `skills/test_strategy.yaml` | Vitest, TDD, coverage 90%, E2E |
| Git Workflow | `skills/git_workflow.yaml` | Conventional Commits, ветки, PR checklist |
| Supabase Ops | `skills/supabase_ops.yaml` | DB, Edge Functions, RLS, pgvector |
| Security | `skills/security.yaml` | Secrets, audit, RLS, CSP, headers |
| Migration | `skills/migration.yaml` | Strangler Fig: runtime → packages |
| Code Review | `skills/code_review.yaml` | Чеклист по категориям (types, arch, quality, math) |

---

## 14. Ключевые ограничения

1. **No `any`** — строгие интерфейсы из `@iskra/core`
2. **No side effects** в `@iskra/math` — только pure functions
3. **No business logic** в UI — `apps/iskra-web` только проекция
4. **No secrets** в коде — используй `.env`
5. **No new code** в `runtime/` — заморожен для новых фич
6. **No circular deps** — строгий top-down граф импортов
7. **Tests before commits** — `pnpm test` перед каждым коммитом
8. **ADR for canon** — `core/` только через ADR-процесс
9. **Ω never > 95%** — максимальная уверенность в ΔDΩΛ
10. **MAKI priority** — при trust > 0.8 && pain > 0.3, MAKI вместо KAIN
