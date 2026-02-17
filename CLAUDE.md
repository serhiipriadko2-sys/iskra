# ISKRA — Jules/Claude Code Operating Rules (vΩ.5.0)

> **Last Updated:** 2026-05-15 (Scientific Turn)
> **Context:** Monorepo (pnpm workspace) + Supabase

---

## 0. Non-negotiables (SoT)
- **@iskra/core** — единственный источник истины (types, constants).
- **Strict Types** — никаких `any`. Типизация через `core`.
- **Pure Math** — вся математика в `@iskra/math` (чистые функции).
- **State** — состояние и побочные эффекты только в `@iskra/engine`.

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
pnpm --filter @iskra/math test
pnpm --filter @iskra/engine test
```

### Lint & Check
```bash
pnpm lint
pnpm typecheck
```

---

## 2. Структура проекта

```
iskra/
├── packages/
│   ├── core/           # SoT: Типы, Манифесты (No deps)
│   ├── math/           # Наука: Фракталы, Кванты (Pure functions)
│   └── engine/         # Runtime: State, IO, Supabase
├── apps/
│   └── iskra-web/      # UI: React, Vite, Holographic Interface
├── skills/             # Инженерные практики (YAML)
├── runtime/            # Legacy / Transitional
└── tools/              # Скрипты обслуживания
```

---

## 3. Supabase Integration
**Project ID:** `typcvaszcfdpkzbjzuur`

- **Не хардкодь ключи.** Используй `.env`.
- **Миграции:** Используй инструменты Supabase для просмотра схемы (`supabase_list_tables`).
- **Edge Functions:** Деплой через `supabase_deploy_edge_function`.

---

## 4. Git & Workflow
- **Ветки:** `feat/name`, `fix/name`, `refactor/name`.
- **Коммиты:** Conventional Commits (`feat: ...`, `fix: ...`).
- **Verify:** Всегда запускай `pnpm test` перед коммитом.

---

## 5. Scientific Turn (vΩ.5.0)
Переход от эвристик к строгим моделям:
- **Entropy:** Shannon Entropy для измерения хаоса.
- **Fractals:** Higuchi Dimension для анализа временных рядов.
- **Quantum:** Superposition для моделирования голосов.

Вся логика должна быть доказана тестами в `packages/math`.
