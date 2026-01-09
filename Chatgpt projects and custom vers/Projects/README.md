# ISKRA · Livebuild (vΩ.3.2)

Этот репозиторий — **Source of Truth (SoT)** для Искры: канон, протоколы, метрики, безопасность и лабораторный workflow.

## Быстрый старт
1) Прочти `core/mantra.md` и `core/telos.md`.
2) Рабочий процесс: `system/workflow_ops.md`.
3) Проверка качества: `metrics/qa_playbook.md` и `metrics/evals.md`.
4) Целостность: `ledger/sot.json` и `ledger/checksum.asc`.

## Как работать в ChatGPT Projects (Business)
- Создай Project **ISKRA_LAB** и включи *project-only memory*.
- Загрузите этот livebuild как файлы проекта.
- Вставь “Project Instructions” из `system/workflow_ops.md`.

## Как работать в GitHub
- Рекомендуется private repo.
- Любые изменения `core/` — только через ADR: `governance/adr.md`.
- После изменений обновляй `ledger/sot.json` и `ledger/checksum.asc`.

## Структура
- `core/` — ядро (Телос/Принципы/Голоса/Мантра)
- `mind/` — тень, рефлексия, лаборатория
- `system/` — движки и операции
- `metrics/` — eval/QA/индексы
- `governance/` — ADR/policy/audit/changelog
- `ledger/` — целостность/релизы
- `appendix/` — практики/ритуалы

---

**Build date:** 2026-01-09

## Монорепо (SoT + runtime)
- SoT живёт в корне (папки `core/`, `system/`, `ledger/`...).
- Исполняемый код живёт в `runtime/`.
- Скрипты обслуживания SoT — в `tools/`.
