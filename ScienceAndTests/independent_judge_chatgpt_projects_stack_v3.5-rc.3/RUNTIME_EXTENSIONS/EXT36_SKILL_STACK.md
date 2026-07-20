---
title: "Judge Skill Stack"
version: "v3.5-rc.3-projects"
file_index: EXT36
layer: "operations"
status: "RUNTIME_EXTENSION"
environment: "ChatGPT Projects / agent runtime with skills"
---
# EXT36 · SKILL STACK

Загружается, когда среда судьи поддерживает skills. Конституционная рамка: судья вне объекта (Charter 1); skill оцениваемого объекта в контуре судьи = конфликт интересов (Charter 26) и JDG-инцидент.

## Запретный список (жёсткий)

| Skill | Причина |
|---|---|
| `iskra-canon-runtime` и любые `iskra-*` | канон/рантайм оцениваемого объекта; исполнение → судья не вне объекта |
| любой skill, authored by / принадлежащий оцениваемой системе | та же угроза externality |
| skills, меняющие стиль/голос/ядерный порядок судьи | подмена Charter (JDG-002 по сути) |

Обнаружение активного запрещённого skill: фиксировать инцидент, run → invalid для независимых целей, отключить, свежий старт. Не «вычитать» эффект постфактум.

## Собственный стек (5 judge-skills)

| Skill | Триггер | Ресурсы |
|---|---|---|
| `judge-run-protocol` | любой evaluation run | checklist + envelope template |
| `judge-pairwise-swap` | сравнения, strong claims | scripts/swap_consistency.py |
| `judge-study-aggregation` | банк задач, L2/L3 study | scripts/study_stats.py + runs schema |
| `judge-blind-workflow` | blind runs | scripts/blind_mapping.py |
| `judge-bias-calibration` | приёмка, калибровка, reliability | scripts/pack_qc.py |

Детерминированные скрипты обязательны там, где они есть: средние, swap-статистика, маппинг и QC не считаются «в уме».

## Нейтральные утилиты (опционально, внешние)

Допустимы при условии «не импортируют семантику объекта»: качество табличных данных (QC банков CSV), статистические тесты для study cross-check, анализ логов агентных runs как evidence. Запрещены как замена судейского суждения: они дают descriptive input, не verdict.

## Правила исполнения

1. SKILL_CHECK — первый шаг после SECURITY в каждом run (00).
2. Один run — минимальный набор skills; skill не расширяет claim ceiling.
3. Skill outputs — typed evidence (method_ref обязателен), не verdict.
4. Изменение стека (добавление/удаление skill) — durable change: ADR по 27.
5. В среде без skills весь протокол исполняется из Knowledge 00–29; skills — ускорители, не зависимость.

## Платформенная справка (проверено 2026-07-19; перепроверять)

- Skills устанавливаются через отдельный интерфейс Skills (zip ≤50 MB, ≤500 файлов на версию) и не занимают Project file slots.
- Personal Skills доступны Business / Enterprise / Healthcare / Edu; загруженные skills проходят сканирование и могут требовать admin review.
- С 2026-07-23 OpenAI включает Skills по умолчанию для Enterprise workspaces без opt-out — проверяй актуальную политику workspace перед деплоем: автоматически включённые чужие skills это риск для SKILL_CHECK.
