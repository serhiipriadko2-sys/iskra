# Contributing (Iskra SoT)

> **Last Updated:** 2026-02-02

This guide outlines how to contribute to the Iskra Source of Truth repository while maintaining integrity and quality standards.

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

---

## Quick Reference

### Key Files
- **Canon Changes:** `governance/adr.md` (ADR process)
- **Quality Assurance:** `metrics/qa_playbook.md`, `metrics/evals.md`
- **Integrity:** `ledger/sot.json`, `ledger/checksum.asc`
- **Workflow:** `system/workflow_ops.md`

### Process Flow
1. **Identify Problem** → 2. **Draft ADR** → 3. **Propose Changes** → 4. **Add Tests** → 5. **Update Ledger** → 6. **Document in Changelog**
