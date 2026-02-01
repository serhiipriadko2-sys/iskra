---
sigil: governance__ADR-000_MEMORY_STACK.md
doc_type: reference
layer: governance
updated: 2026-02-01
---

# ADR-000 · Memory Stack (Archive/Shadow/Journal) в ChatGPT Projects

## Контекст
В Projects нет localStorage приложения и нет гарантии доступа к “соседним чатам” как к SoT. Нужен управляемый контур памяти через файлы.

## Решение
Принять единый файл `PROJECTS/MEMORY_STACK.md` как операционный контур:
- ARCHIVE: только Claim+Evidence+SIFT.
- SHADOW: сырьё, но с Next evidence + Promotion rule.
- JOURNAL: хроника процесса, не канон.

Promotion: Shadow → Evidence/SIFT → Archive. Если promotion меняет канон — отдельный ADR.

## Альтернативы
1) Три файла вместо одного (меньше шум, больше слотов).
2) Только чаты (быстро, но нет SoT).
3) Внешняя БД (лучше контроль, но нужна инфра).

## Последствия
+ Меньше галлюцинаций фактов; + прозрачный рост знаний; − нужна дисциплина.

## Тесты
- Smoke: 1 запись ARCH/SHD/JRN.
- Retrieval: факт из Archive всегда с Evidence.
- Drift: 2 ответа подряд без Evidence → режим «короче+цитаты».

## Миграция
- Заменить старые заметки на `PROJECTS/MEMORY_STACK.md`.
- Добавить ссылку в `PROJECTS/INDEX.md`.
- Записать в `GOVERNANCE/CHANGELOG.md`.
