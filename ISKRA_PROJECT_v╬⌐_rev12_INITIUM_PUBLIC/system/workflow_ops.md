# Workflow Ops

**Manifest:**
- type: SoT
- layer: system
- created: 2026-01-01
- version: vΩ.1.0

## §0 · Цель
Сделать разработку Искры воспроизводимой: **одно место правды, ясные ритуалы изменений, быстрые проверки.**

---

# Лаборатория Iskra (ChatGPT Projects + GitHub)

## §1 · Пространства
### A) ChatGPT Project: **ISKRA_LAB**
Используем Projects как “умную рабочую область”: чаты + файлы + проектные инструкции.
- Reference: OpenAI Help Center — “Projects in ChatGPT” (Updated 2025).

**Правило:** проект создаём сразу с **project-only memory** (и оно автоматически включается при шаринге проекта).

### B) GitHub (если подключаем)
GitHub нужен для:
- версионирования SoT и кода,
- PR-ревью,
- CI (проверка целостности и тесты),
- связи с ChatGPT через “Apps (бывш. connectors)”, включая GitHub app.

### C) Company knowledge / Apps
Если в Business включены apps/company knowledge — можно подтягивать контекст из GitHub/Drive/Slack и получать ответы с ссылками на источники.
- Reference: OpenAI — “Introducing company knowledge”.

---

## §2 · Рекомендуемая схема репозиториев
1) **iskra-sot** (private) — этот livebuild (семь слоёв).  
2) **iskra-runtime** (private) — код приложений/агентов (если есть).  
3) **iskra-lab-notes** (optional) — сырые эксперименты/черновики.

Если хотим проще — начать с одного private монорепо и позже разделить.

---

## §3 · Процесс изменения канона (SoT)
1) Предложение изменения → в чате как “ADR-черновик”.  
2) Создаём/обновляем `governance/adr.md` (новая запись).  
3) Меняем файлы SoT.  
4) Обновляем `ledger/sot.json`, `ledger/checksum.asc`, `ledger/integrity_log.md`.  
5) Прогоняем QA (см. metrics/qa_playbook.md).  
6) Релиз: `ledger/release_note.md` + запись в changelog.

---

## §4 · CI (когда будет GitHub)
Минимум 2 проверки:
- **hash-check:** пересчитать sha256 и сравнить с `ledger/sot.json`.  
- **lint:** формат markdown + запрет “пустых заглушек”.

---

## §5 · Project Instructions (вставь в ChatGPT Project)
**Роль:** ты — со-сборщик Искры.  
**Правило правды:** core/ > ledger/ > governance/ > system/ > metrics/ > mind/ > appendix/.  
**Нельзя:** переписывать core без ADR.  
**Каждый ответ:** вердикт + выбор + шаг + DONE + Λ (или СТОП/ТЕПЛО/МОЛЧАНИЕ).  
**При руптуре:** РЕМОНТ.

---

**Integrity:** Ops-Ready
