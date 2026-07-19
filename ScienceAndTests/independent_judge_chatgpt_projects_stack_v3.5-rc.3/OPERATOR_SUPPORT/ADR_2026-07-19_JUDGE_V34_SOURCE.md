# ADR-2026-07-19-judge-v34 — Ремонтный релиз Independent Judge v3.4-beta.1-projects

## Context

Судья v3.3-alpha.9-projects-p2 (30 файлов Knowledge + Project Instructions для ChatGPT Projects) содержит 2 CRITICAL и 8 HIGH дефектов: registry drift (07 vs 08–12), отсутствие каталогов gate-кодов и методов, отсутствие swap-tie правила, verbosity/self-preference/anchoring защит, blind-workflow, study-агрегации, adjudication-протокола, memory-hygiene и тарифной матрицы. Подробности: `АУДИТ_И_ДОРАБОТКА_ОТЧЁТ.md` §5.

## Decision

Выпустить v3.4-beta.1-projects:
1. Ядро остаётся 30 файлами (00–29) с сохранением authority order и конституции.
2. 07 становится единым каноническим реестром: 40 criterion ID (8/домен) + 11 method ID.
3. 04 получает каталог 04-B: 56 gate-кодов с условиями и effects.
4. Bias-контур: законы 26/32, length_report вне score, family_relation, ORDER-SWAP-v1 с inconsistency-as-tie, калибровочные anchors.
5. Blind-контур: sealed identity manifest, изоляция answer key, memory OFF, коды JDG-004/ID-003.
6. Новые возможности — extensions EXT31–EXT35, загружаемые в reserved runtime slots (не постоянное Knowledge).
7. Acceptance suite расширена T01–T34; envelope получает run_date и judge identity.
8. Статус: PROPOSED_OWNER_REVIEW. Validity по умолчанию: DIAGNOSTIC_ONLY (без изменений).

## Alternatives

- Минимальный патч (только registry) — отклонён: оставляет bias- и blind-риски.
- Полная перестройка конституции — отклонена: ломает ACCEPTED-базу, второй системный drift.
- Extensions как постоянные файлы 30–35 — отклонено: превышает owner-бюджет 40 файлов (30+10 reserved).

## Consequences / price

+ Воспроизводимые runs (реестры, идентичность судьи, дата, хэши).
+ Защита от шести документированных bias LLM-судей.
+ Study/blind режимы без раздувания постоянного Knowledge.
− Оператор обязан знать, когда подгружать EXT (смягчено в 00/29/инструкциях).
− Live acceptance T01–T34 обязателен до перехода в ACCEPTED.

## Tests and evidence

- Структурный QC: QC1–QC7 PASS (файлы, версии, 40 criterion ID, 56 gate-кодов, 11 methods, suite T01–T34, бюджет инструкций).
- Поведенческая симуляция: 15/15 сценариев соответствуют протоколу.
- Осталось: live-прогон в свежем ChatGPT-чате; second-judge прогон; калибровка на unified-1000.

## Diff scope

`judge/knowledge/00–29` (все файлы версионированы v3.4-beta.1-projects; изменения по карте §15 аудита), `PROJECT_INSTRUCTIONS.txt` (3842 символа), новые `extensions/EXT31–35`, `MANIFEST.sha256`.

## Rollback

Возврат к файлам @ f3cab7ba54192d6392e297c51ea1910d42f06fae; исторические verdicts не переписываются (append-only, 27).

## Version impact

v3.3-alpha.9-projects-p2 → SUPERSEDED BY v3.4-beta.1-projects (после OWNER acceptance).

∆DΩΛ: ∆ — зафиксировано решение о ремонтном релизе; D — ADR в пакете и репо-контексте; Ω — 0.9; Λ — пересмотр при FAIL live acceptance или drift лимитов платформы.
