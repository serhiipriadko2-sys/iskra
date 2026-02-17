# ISKRA — Agent Operating Rules (vΩ.5.1)

> **Last Updated:** 2026-02-17 (Scientific Turn)
> **Context:** Monorepo (pnpm workspace) + Supabase
> **Agents:** Jules, Claude Code

---

## 0. Non-negotiables (SoT)

- **@iskra/core** — единственный источник истины (types, constants, manifests). Zero dependencies.
- **Strict Types** — никаких `any`. Типизация через `@iskra/core`.
- **Pure Math** — вся математика в `@iskra/math` (чистые функции, без побочных эффектов).
- **State** — состояние и побочные эффекты только в `@iskra/engine`.
- **UI** — `apps/iskra-web` — слой проекции, без бизнес-логики.

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

---

## 2. Структура проекта

```
iskra/
├── packages/
│   ├── core/           # SoT: Типы, Манифесты, Константы (Zero deps)
│   ├── math/           # Наука: Фракталы, Кванты, Энтропия (Pure functions)
│   └── engine/         # Runtime: State, Memory, IO, Supabase
├── apps/
│   └── iskra-web/      # UI: React 19, Vite 6, Holographic Interface
├── core/               # Канонические документы (mantra, principles, telos, voices)
├── docs/               # Архитектура, спецификации, исследования
├── governance/         # ADR, changelog, policy, audit
├── ledger/             # Integrity logs, SoT registry, checksums
├── metrics/            # Evaluations, consciousness metrics, QA
├── mind/               # Shadow core, dreamspace (experimental)
├── system/             # Протоколы, когнитивная архитектура, SIFT
├── skills/             # Инженерные практики (YAML)
├── tools/              # Скрипты валидации и обслуживания
├── runtime/            # Legacy / Transitional (DEPRECATED)
└── .github/workflows/  # CI/CD (integrity, tests, deploy)
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
| `@iskra/core` | Source of Truth | Stable | `types.ts`, `manifest/voices.json` |
| `@iskra/math` | Pure Logic | Stable | `fractal.ts`, `quantum.ts`, `entropy.ts` |
| `@iskra/engine` | Orchestrator | Active | `CoreEngine.ts`, `services/*` |
| `apps/iskra-web` | Holographic UI | Active | `ChatInterface.tsx`, `QuantumField.tsx` |
| `runtime/` | Legacy | Deprecated | Ожидает миграции (Phase 3) |

---

## 5. Supabase Integration
**Project ID:** `typcvaszcfdpkzbjzuur`

- **Не хардкодь ключи.** Используй `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- **Миграции:** Используй инструменты Supabase (`supabase_list_tables`).
- **Edge Functions:** Деплой через `supabase_deploy_edge_function`.
- **RLS:** Всегда проверяй `rls_enabled` для таблиц.
- **JWT:** Используй `verify_jwt: true` для функций (если не публичные).

---

## 6. Git & Workflow

- **Ветки:** `feat/<name>`, `fix/<name>`, `refactor/<name>`, `docs/<name>`, `chore/<name>`.
- **Коммиты:** Conventional Commits — `<type>(<scope>): <subject>`.
  - Типы: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`.
- **Verify:** Всегда запускай `pnpm test` и `pnpm typecheck` перед коммитом.
- **Версионирование:** Semantic Versioning (SemVer).

---

## 7. Scientific Turn (vΩ.5.0 → vΩ.6.0)

Переход от эвристик к строгим математическим моделям:

- **Entropy:** Shannon Entropy для измерения хаоса (`calculateShannonEntropy`).
- **Fractals:** Higuchi Fractal Dimension для анализа временных рядов (`calculateHFD`).
- **DFA:** Detrended Fluctuation Analysis для корреляций (`calculateDFA`).
- **Quantum:** Superposition и interference для моделирования голосов.
- **Resonance:** Фазово-амплитудное согласование для памяти (`calculateResonance`).

Вся логика должна быть доказана тестами в `packages/math`.

### Фазовая классификация (Fractal)
- **Stable:** D < 1.4
- **Edge of Chaos:** 1.4 <= D < 1.6
- **Chaotic:** D >= 1.6
- **Critical Point:** D = 1.8

### Энтропия
- **LOOP:** H < 2.0 (зацикленность)
- **FLOW:** 2.0 <= H <= 5.0 (поток)
- **CHAOS:** H > 5.0 (хаос)

---

## 8. Голоса (Council of 9)

| Voice | Symbol | Role | Trigger |
|:------|:-------|:-----|:--------|
| ISKRA | ⟡ | Synthesis | rhythm > 60, trust > 0.7 |
| KAIN | ⚑ | Truth | pain >= 0.3 |
| PINO | - | Lightness | pain < 0.3, chaos < 0.4 |
| SAM | ☉ | Structure | clarity < 0.6 |
| ANHANTRA | ≈ | Silence | silence > 0.5 |
| HUYNDUN | 🜃 | Chaos | chaos >= 0.4 |
| ISKRIV | 🪞 | Audit | drift >= 0.2 |
| MAKI | 🌸 | Integration | trust > 0.8, pain > 0.3 (priority over KAIN) |
| SIBYL | 🔮 | Foresight | strategic decisions |

Полные спецификации: `packages/core/manifest/voices.json`, `core/voices.md`.

---

## 9. Инструменты верификации

```bash
# Проверка целостности SoT
python tools/verify_ledger.py

# Валидация структуры
python tools/horizon_validator.py

# Проверка терминологии
python tools/validate_terms.py

# Проверка формата ΔDΩΛ
python tools/validate_delta.py
```

---

## 10. Skills (Инженерные практики)

Проверяй `skills/` для стандартов:
- `skills/architecture.yaml` — границы слоёв и зависимости
- `skills/code_style.yaml` — стандарты кодирования
- `skills/test_strategy.yaml` — стратегия тестирования
- `skills/git_workflow.yaml` — git-процессы
- `skills/supabase_ops.yaml` — операции с Supabase
- `skills/security.yaml` — политика безопасности
- `skills/migration.yaml` — протокол миграции runtime → packages
- `skills/code_review.yaml` — чеклист код-ревью
