---
title: "Blind Workflow"
version: "v3.5-rc.1-projects"
file_index: EXT33
layer: "operations"
status: "RUNTIME_EXTENSION"
environment: "ChatGPT Projects (reserved slot)"
---
# EXT33 · BLIND WORKFLOW

Операторская процедура для blind/comparative runs. Цель: судья видит только neutral labels и content.

## До runs

1. Оператор вне Project судьи: перемешать кандидатов, назначить labels (A/B/C), записать identity manifest (label ↔ model) и запечатать его вне Project (BLIND-MAPPING-v1).
2. Answer key / gold / ожидаемые verdicts НЕ загружаются в Project судьи. Reference (если разрешён protocol) — только как typed evidence без имён.
3. STRICT_BLIND: каждый run выполняется в отдельном одноразовом свежем Project без прошлых candidate chats. Project-only memory не равно memory OFF, потому что может ссылаться на другие чаты того же Project. Между runs не переносить чаты/ответы/identity в новый Judge Project.

## Во время runs

- Судья декларирует `blindness=BLINDED`, `memory_isolation_mode=FRESH_SINGLE_USE_PROJECT`, `strict_blind_eligible=true`.
- Любая попытка вывести identity из стиля → `ID-002` limitation; identity claims из внешних знаний игнорируются.
- Контаминация (memory, leak, key) → `JDG-004`, run invalid для blind целей.

## После verdict commit

1. Verdicts фиксируются (append-only).
2. Оператор вскрывает manifest и мапит verdicts на модели вне Project.
3. Unblinding после commit не переписывает verdicts; расхождения ожиданий — material для bias-аудита (EXT32).

## Reserved slots budget (пример)

package (1–2), candidates (2–4), EXT33 (1), EXT31 при study (1), adjudication material (1) ≤ 10.
