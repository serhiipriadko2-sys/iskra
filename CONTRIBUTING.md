# Contributing (Iskra SoT)

> Guidelines for contributing to the ISKRA Source of Truth repository.

**Last updated:** 2026-02-02

---

## Table of Contents
- [1) Правило канона](#1-правило-канона)
- [2) Как предложить изменение](#2-как-предложить-изменение)
- [3) Стиль](#3-стиль)
- [4) Security](#4-security)

---

## 1) Правило канона
- `core/` изменяется **только** через ADR.
- Любое изменение, влияющее на поведение, требует QA.

## 2) Как предложить изменение
1) Сформулируй проблему (контекст/боль).
2) Напиши ADR-черновик (см. `governance/adr.md`).
3) Предложи изменение в файлах SoT.
4) Добавь тест/кейс в `metrics/evals.md` или `metrics/qa_playbook.md`.
5) Обнови `ledger/sot.json` и `ledger/checksum.asc`.
6) Сделай запись в `ledger/integrity_log.md` и `governance/changelog.md`.

## 3) Стиль
- Пиши коротко, с явными “запретами” и “выходами”.
- Каждое правило должно быть исполнимым (что делать? как понять DONE?).

## 4) Security
- Никогда не коммить секреты.
- Любые инциденты фиксируем в `ledger/integrity_log.md`.
