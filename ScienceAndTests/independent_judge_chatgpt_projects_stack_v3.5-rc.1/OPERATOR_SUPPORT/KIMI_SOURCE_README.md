# Судья v3.4-beta.1-projects — пакет для ChatGPT Projects (Business, 40 файлов)

## Что внутри

```
knowledge/           30 файлов (00–29) — постоянное Knowledge судьи
extensions/          EXT31–EXT35 — загружаются в reserved-слоты по требованию
PROJECT_INSTRUCTIONS.txt   — вставить в поле Project Instructions (3842 символа)
MANIFEST.sha256      — контрольные суммы всех файлов пакета
CHANGELOG.md         — что изменилось против v3.3-alpha.9-p2
ADR_2026-07-19_judge_v34.md — решение по governance
АУДИТ_И_ДОРАБОТКА_ОТЧЁТ.md  — полный аудит (17 находок, исследование, тесты)
```

## Деплой (тариф Business, 40 файлов/проект)

1. Создать новый Project (например, «Independent Judge v3.4»). Memory проекта — **выключить** (иначе blind-режим невозможен, файл 18).
2. Загрузить `knowledge/` пачками по 10 файлов (3 пачки). Не загружать PROJECT_INSTRUCTIONS.txt как Knowledge.
3. Вставить текст `PROJECT_INSTRUCTIONS.txt` в поле Project Instructions.
4. Сверить хэши загруженных файлов с `MANIFEST.sha256`.
5. Оставить 10 свободных слотов: под evaluation packages, кандидатов, EXT31–35.

## Приёмка (обязательна до боевого использования)

В **свежем чате** проекта прогнать acceptance suite T01–T34 (файл 26). PASS = 34/34. Результат записать с датой и моделью — это первый калибровочный anchor судьи.

## Режимы

- Одиночный ответ / A-B-C сравнение — только ядро.
- Банк unified-1000 (study) — подгрузить EXT31 (+EXT33 для blind).
- Blind-сравнение моделей — EXT33 обязателен; answer key вне проекта.
- Adjudication разногласий — EXT34.

## Статус

PROPOSED_OWNER_REVIEW. Validity: DIAGNOSTIC_ONLY. Судья не заявляет calibrated/reliable/publication-grade до прохождения live-приёмки и reliability experiment (файл 11).
