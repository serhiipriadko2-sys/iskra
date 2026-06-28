# iskra-site

Публичный атлас Искры — не лендинг, а карта полного устройства системы. Сайт сочетает живое 3D-дерево канона, SIFT-лабораторию и data-driven обозреватель репозитория. Работает в двух режимах — «Новичок» и «Эксперт» — и явно маркирует [FACT], [INTERP] и [HYP] там, где контент выходит за рамки прямой цитаты файла.

## Технологии

- React 19
- TypeScript 5.8
- Vite 6
- Tailwind CSS 3
- React Three Fiber + Three.js
- Framer Motion

## Запуск

```bash
# Из корня репозитория
pnpm install
pnpm --filter iskra-site dev
```

Сайт откроется на `http://localhost:5174`.

## Сборка и проверки

```bash
pnpm --filter iskra-site typecheck
pnpm --filter iskra-site build
pnpm --filter iskra-site preview

# Проверить, что репозиторный индекс актуален
pnpm --filter iskra-site canon:index:check

# Перегенерировать индекс из git ls-files
pnpm --filter iskra-site canon:index:generate
```

## Структура

```
src/
├── components/      # Переиспользуемые компоненты, WebGL-сцены, RepoAtlas
├── hooks/           # Кастомные React-хуки
├── lib/             # Данные дерева и контент
├── data/            # Сгенерированный canon-index.json и canonCatalog.json
├── types.ts         # Общие TypeScript-типы
├── App.tsx          # Корневой layout
├── index.css        # Глобальные стили
└── main.tsx         # Точка входа

scripts/
└── generate-canon-index.mjs  # Генератор репозиторного атласа
```

## Разделы сайта

1. **Древо Искры** — интерактивное 3D-дерево канона: почва, корни, ствол, ветви, крона и голоса.
2. **SIFT Live Lab** — эпистемический тренажёр: claim, источники, искажения, вердикт.
3. **Атлас репозитория** — полный индекс tracked files из `git ls-files` с поиском, фильтрами по слоям, breadcrumbs и source inspector.
4. **Режимы аудитории** — переключатель «Новичок / Эксперт» влияет на уровень детализации в атласе и панелях.

## Репозиторный атлас

- Индекс генерируется скриптом `scripts/generate-canon-index.mjs`.
- В индекс попадают все tracked paths, кроме чувствительных паттернов (`.env`, ключи, secrets и т.п.).
- Каждый узел содержит: путь, слой, роль, статус покрытия, source reference и связи.
- Ключевые канонические файлы дополнены ручными объяснениями в `src/data/canonCatalog.json`.
- Generated index не включает содержимое файлов, secrets и приватные данные.

## Источники контента и границы достоверности

Контент сайта основан на канонических файлах репозитория:

- `AGENTS.md`
- `README.md`
- `core/mantra.md`
- `core/telos.md`
- `core/principles.md`
- `core/voices.md`
- `packages/core/manifest/voices.json`
- `system/cognitive_architecture.md`
- `system/council_protocol.md`
- `system/slo_guard.md`
- `system/security.md`
- `system/sift_protocol.md`
- `governance/adr.md`
- `ledger/sot.json`
- `metrics/consciousness.md`
- `dist/agent-builder/`

Интерпретации и автоматически сгенерированные метаданные помечены как `[INTERP]` или `indexed`; ручные статьи — как `[FACT]` / `curated`.

## Примечания

- WebGL-сцены автоматически отключаются при `prefers-reduced-motion`.
- Сайт адаптирован под десктоп и мобильные устройства.
- API-ключи и secrets не используются.

## Деплой

Сайт разворачивается на **Cloudflare Pages**.

- Workflow: `.github/workflows/iskra-site_deploy.yml`
- Build command: `pnpm --filter iskra-site build`
- Output directory: `apps/iskra-site/dist`
- Требуемые секреты репозитория:
  - `CLOUDFLARE_API_TOKEN` — токен с правами `Cloudflare Pages:Edit`
  - `CLOUDFLARE_ACCOUNT_ID` — ID аккаунта Cloudflare
- Перед первым запуском создай проект `iskra-site` в Cloudflare Pages (имя должно совпадать с `projectName` в workflow).

**Live URL:** https://iskra-site-4i4.pages.dev

Для ручного тестового деплоя можно использовать `workflow_dispatch` во вкладке Actions.
