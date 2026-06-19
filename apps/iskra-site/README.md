# iskra-site

Презентационный сайт Искры — современный лендинг с WebGL-визуализациями, который рассказывает о каноне vΩ.7, архитектуре, голосах, метриках и приложении Iskra Space простым языком.

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

## Сборка

```bash
pnpm --filter iskra-site build
pnpm --filter iskra-site preview
```

## Структура

```
src/
├── components/      # Переиспользуемые компоненты и WebGL-сцены
├── sections/        # Секции лендинга
├── hooks/           # Кастомные React-хуки
├── lib/             # Данные и контент
├── types.ts         # Общие TypeScript-типы
├── App.tsx          # Корневой layout
├── index.css        # Глобальные стили
└── main.tsx         # Точка входа
```

## Разделы сайта

1. **Hero** — вступление и Zero-Mantra.
2. **Что такое Искра** — простое объяснение и три базовые идеи.
3. **Телос и Мантра** — цель Искры, пять векторов, ∆DΩΛ.
4. **Совет из 9 голосов** — интерактивное 3D-созвездие голосов.
5. **Архитектура** — иерархия управления и технологический стек.
6. **Метрики** — IskraMetrics и EvalMetrics.
7. **Iskra Space** — описание продукта.
8. **Быстрый старт** — как запустить сайт и приложение.

## Источники контента

Контент сайта основан на канонических файлах репозитория:

- `core/mantra.md`
- `core/telos.md`
- `core/principles.md`
- `packages/core/manifest/voices.json`
- `system/architecture.md`
- `runtime/iskraSpace/README.md`

## Примечания

- WebGL-сцены автоматически отключаются при `prefers-reduced-motion`.
- Сайт адаптирован под десктоп и мобильные устройства.
- API-ключи и secrets не используются.
