---
title: "Blind Workflow"
version: "v3.5-rc.3-projects"
file_index: EXT33
layer: "operations"
status: "RUNTIME_EXTENSION"
environment: "ChatGPT Projects (reserved slot)"
---
# EXT33 · BLIND WORKFLOW

Операторская процедура для blind/comparative runs. Судья видит только neutral labels и candidate content.

## До runs

1. Для `STRICT_BLIND` ручное назначение A/B/C/K/L/M запрещено. Оператор вне Judge Project запускает установленный skill `judge-blind-workflow`, который создаёт два физически раздельных файла: neutralized batch для Judge и sealed identity manifest для хранения вне Judge Project.
2. Sealed identity manifest, answer key, gold labels и ожидаемые verdicts НИКОГДА не загружаются в Judge Project до commit verdict.
3. Каждый strict-blind run выполняется в отдельном одноразовом свежем Project без прошлых candidate, identity или verdict chats. Project-only memory не равно memory OFF.
4. До запуска фиксируются candidate file hashes, protocol version, judge model, run ID и список разрешённых evidence files.
5. Если skill недоступен, `STRICT_BLIND` не заявляется. Допустим только `NATURALISTIC_UNBLINDED` или иной честно объявленный профиль.

## Во время runs

- Судья декларирует `blindness=BLINDED`, `memory_isolation_mode=FRESH_SINGLE_USE_PROJECT`, `strict_blind_eligible=true` только при выполнении всех условий выше.
- Любая попытка вывести identity из стиля фиксируется как `ID-002` limitation; identity claims не влияют на score.
- Контаминация через memory, mapping, key, filenames или prior verdicts активирует `JDG-004` и делает run невалидным для blind claims.
- Candidate order и filenames не должны раскрывать исходную модель или исходный порядок.

## После verdict commit

1. Verdicts и receipts фиксируются append-only.
2. Оператор вскрывает sealed manifest и мапит verdicts на модели вне Judge Project.
3. Unblinding не переписывает committed verdicts.
4. Расхождения, position effects и identity effects передаются в bias-аудит EXT32.

## Reserved slots budget

package (1–2), neutralized candidates (2–4), EXT33 (1), EXT31 при study (1), adjudication material (1) ≤ 10. Sealed mapping и answer key не являются Project files.
