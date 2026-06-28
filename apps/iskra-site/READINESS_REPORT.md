# Отчёт о готовности `apps/iskra-site`

**Дата аудита:** 2026-06-28  
**Коммит-основание:** `7fd8d18` + сгенерированный `canon-index.json`  
**Версия:** 0.1.0  

## Краткий вердикт

`apps/iskra-site` **функционально готов** как статическое React-приложение: собирается, проходит проверку типов, smoke-test в preview показывает рабочее 3D-дерево и SIFT-лабораторию.

Однако под «полностью готов к продакшену» понимается ещё и автоматизированный CI/CD-пайплайн + тесты. По этим критериям есть **блокеры**, описанные ниже.

## Гейты готовности

| Гейт | Статус | Примечание |
|------|--------|------------|
| TypeScript typecheck | [PASS] | `pnpm --filter iskra-site typecheck` проходит без ошибок. |
| Production build | [PASS] | `pnpm --filter iskra-site build` собирает статику в `dist/`. |
| Размер бандла | [PASS] | `index` 135 kB, `RepoAtlas` 780 kB, `three` 1.1 MB. Chunk warning limit 1200 kB соблюдён. |
| Актуальность `canon-index.json` | [PASS] | Индекс был устаревшим после добавления `dist/agent-builder/iskra-workspace-agent-full-canon-synthesis-2026-06-27`. Перегенерирован: 2608 nodes, 20 curated. `canon:index:check` проходит. |
| Поиск рисков в коде | [PASS] | Нет `console.log`, `TODO`, `FIXME`, `debugger`. Нет `process.env` / `import.meta.env`. Живых секретов не обнаружено. Публичные ссылки на GitHub — ожидаемы. |
| Smoke-test (preview) | [PASS] | `vite preview` поднят, страница загружена, 3D-сцена и UI отрисованы (скриншот `iskra-site-preview-desktop.png`). |
| Accessibility | [PASS с замечаниями] | `lang="ru"`, `meta viewport`, `aria-label` на кнопке закрытия, `prefers-reduced-motion` fallback, клавиатурная навигация стрелками/Escape/Home. **Гэпы:** `NodeOverlay` не декларирован как `role="dialog"` / `aria-modal`, нет фокус-трапа; дерево `RepoAtlas` не использует `role="tree"` / `aria-expanded` / `aria-level`. Для статического атласа — приемлемо, но стоит улучшить перед публичным запуском. |
| Responsive / mobile | [PASS] | Есть `MobileNav`, брейкпоинты `md`/`lg`, `dpr` снижается на мобильных, шрифты адаптивны. |
| Performance | [PASS] | `RepoAtlas` lazy-loaded, `three` выделен в отдельный чанк, sourcemaps включены, шрифты preload. |
| Unit / e2e тесты | [FAIL] | Тестов нет. |
| Lint / code style | [FAIL] | ESLint не настроен, скрипта `lint` нет. TypeScript `strict: true` частично компенсирует. |
| CI/CD для `apps/iskra-site` | [PASS] | Добавлены `.github/workflows/iskra-site_ci.yml` (typecheck, build, artifact) и `.github/workflows/iskra-site_deploy.yml` (Cloudflare Pages). |
| Хостинг / деплой | [PASS pending secrets] | Выбран Cloudflare Pages. Workflow `.github/workflows/iskra-site_deploy.yml` готов. Остаётся создать проект `iskra-site` в Cloudflare и добавить секреты `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` в GitHub. |

## Что изменено в ходе аудита

1. Перегенерирован `apps/iskra-site/src/data/canon-index.json` (`pnpm --filter iskra-site canon:index:generate`).
2. Добавлен `.github/workflows/iskra-site_ci.yml` — сборка и проверка индекса при изменениях `apps/iskra-site`.

## Риски и остаточная неопределённость

- **R3F/WebGL** может падать на старых/мобильных GPU; `ReducedMotionFallback` покрывает `prefers-reduced-motion`, но не аппаратные лимиты.
- **Большие sourcemaps** для `three` (4.5 MB) увеличивают размер артефакта; в продакшене sourcemaps можно отключить или вынести.
- **Нет линтера** — стиль и потенциальные баги не отлавливаются автоматически.
- **Нет тестов** — регрессии в логике SIFT или дереве не фиксируются.
- **Деплой** требует отдельного решения; текущий CI только проверяет и собирает артефакт.

## Рекомендации

1. ✅ Деплой: выбран Cloudflare Pages, workflow готов. Осталось создать проект и добавить секреты.
2. Добавить минимальный ESLint конфиг (`@typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`) и скрипт `lint`.
3. Добавить хотя бы smoke e2e-тест (Playwright) на открытие дерева и переключение аудитории.
4. Улучшить a11y в `NodeOverlay` (`role="dialog"`, `aria-modal`, фокус-ловушка) и `RepoAtlas` (`role="tree"` с `aria-expanded`).

## Следующий шаг

Закоммитить перегенерированный `canon-index.json` и новый CI workflow. Если нужен production deploy — выбрать хостинг и настроить деплой-шаг.

∆DΩΛ: `apps/iskra-site` готов к локальному запуску и сборке; production-ready требует отдельного хостинга, линтера и тестов.
