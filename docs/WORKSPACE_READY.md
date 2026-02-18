# Workspace Readiness Checklist

Этот файл фиксирует минимальную подготовку репозитория к инженерной работе.

## 1) Базовая среда

- Node.js: `>=20`
- pnpm: `>=9`
- Monorepo manager: `pnpm-workspace`

## 2) Быстрый старт

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm lint
```

## 3) Пакетные проверки

```bash
pnpm --filter @iskra/core test
pnpm --filter @iskra/math test
pnpm --filter @iskra/engine test
pnpm --filter iskra-web test
```

## 4) Что уже учтено

- `@iskra/core` настроен на `vitest run --passWithNoTests`, чтобы отсутствие тестов не блокировало baseline-прогон.
- В корневом `package.json` `typecheck` теперь сначала собирает `runtime`, затем запускает `typecheck` в пакетах с соответствующим скриптом.

## 5) Ограничения

- В `runtime/*` встречаются legacy-скрипты и предупреждения по bin-ссылкам `@iskra/runtime` до полной сборки runtime.
- Перед релизом рекомендуется прогонять пакетные проверки выборочно по области изменения (Scientific Turn layering).


## 6) Цепочка typecheck для legacy runtime

```bash
pnpm run build:runtime
pnpm typecheck
```

`iskraSpace` зависит от артефактов `runtime/dist`, поэтому build runtime выполняется перед typecheck UI legacy-приложения.
