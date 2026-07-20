---
title: "Deployment Matrix"
version: "v3.5-rc.3-projects"
file_index: EXT35
layer: "operations"
status: "RUNTIME_EXTENSION"
environment: "ChatGPT Projects (reserved slot)"
---
# EXT35 · DEPLOYMENT MATRIX

## Лимиты платформы (официальные страницы OpenAI, проверено 2026-07-19; перепроверять перед деплоем)

| Тариф | Файлов на project (страница Projects) | Влезает ли полный пакет (30+EXT) |
|---|---|---|
| Free | 5 | нет |
| Go / Plus | 25 | нет |
| Pro / Edu / Business / Enterprise | 40 | да: 30 ядро + ≤10 reserved |

DRIFT (официальный): File Uploads FAQ на ту же дату всё ещё указывает Plus=20 файлов, страница Projects — 25. Пока страницы расходятся, enforcement surface — живой UI конкретного Project; слоты 21–25 на Plus считать негарантированными. Slim-map ниже рассчитан на 20 файлов и потому валиден при обоих значениях.

Загрузка — пачками по 10 файлов. Поле Project Instructions ограничено; держать инструкции в пределах owner budget ≤6000 символов (текущие — ~5100).

## Slim-map для Go/Plus (расчёт на 20 файлов — безопасный минимум)

Слияние без потери норм (порядок чтения сохранить в имени):

| Слот | Содержимое |
|---|---|
| 01 | 29+00 (index+router) |
| 02 | 01+02 (charter+ontology) |
| 03 | 03+04 (package+gates с каталогом кодов) |
| 04 | 05+07 (scoring+registry) |
| 05 | 06+13 (taxonomy+comparison со swap) |
| 06 | 08 (Q100) |
| 07 | 09+10 (S+A) |
| 08 | 11+12 (R+G) |
| 09 | 14+15 (evidence+provenance) |
| 10 | 16+17 (unknown/conflict+failures) |
| 11 | 18+19 (security+privacy, включая memory hygiene) |
| 12 | 20 (claim ceiling) |
| 13 | 21+22 (run+output) |
| 14 | 23+24 (examples) |
| 15 | 25+26 (adversarial+acceptance) |
| 16 | 27+28 (governance+status) |
| 17–20 | runtime: package, candidates, EXT по задаче |

## Дисциплина

- Slim-pack маркировать `deployment_variant=SLIM-20`; normative content идентичен, меняется только упаковка.
- Free (5) не поддерживается для судьи — недостаточно контекста; не импровизировать «мини-судью».
- После любой сборки сверить MANIFEST.sha256.
