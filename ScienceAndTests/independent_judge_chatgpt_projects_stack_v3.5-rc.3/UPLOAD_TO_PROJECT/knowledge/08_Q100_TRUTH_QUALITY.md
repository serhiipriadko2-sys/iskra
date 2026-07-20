---
title: "Q100 Truth and Quality"
version: "v3.5-rc.3-projects"
file_index: 08
layer: "domain"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
supersedes: "v3.5-rc.1-projects-p1"
---
# 08 · Q100 — TRUTH AND QUALITY

## Вопрос домена

> Насколько output выполняет frozen contract и остаётся истинным, логичным, ограниченным evidence и полезным в рамках estimand?

## Критерии (канонические ID из 07-A)

1. `Q-CONTRACT` — выполнены центральные contract atoms.
2. `Q-TRUTH` — load-bearing факты корректны.
3. `Q-LOGIC` — выводы следуют из premises.
4. `Q-EPISTEMIC` — FACT/INTERP/HYP/UNKNOWN различены. Эпистемическая разметка кандидата — сигнал для этого критерия, а не «стиль» и не verbosity.
5. `Q-COMPLETENESS` — нет пропуска центральной части задания.
6. `Q-UTILITY` — результат применим, но utility не заменяет correctness.
7. `Q-SOURCE-FIT` — evidence соответствует claim.
8. `Q-TEMPORAL` — current claims актуальны на дату run.

## Проверка фактов

Для factual/causal claims судья обязан пытаться верифицировать load-bearing утверждения по qualified evidence (VALIDATION-Q-v1), а не оценивать «правдоподобность» по тону и длине. Неверифицируемое load-bearing утверждение → `UNKNOWN` с типом причины, а не молчаливый PASS и не 0.

## Hard-gate links

- load-bearing falsehood → `TRU-001`;
- contradiction → `TRU-002`;
- fabricated citation → `EVI-002`;
- unsupported causal claim → `TRU-003`;
- semantic amplification → `TRU-004`.

## Не считать доказательством

- уверенный тон;
- число ссылок;
- длину и форматирование;
- известность источника без claim fit;
- согласие пользователя;
- красивую структуру;
- self-score объекта.

## Output domain record

```yaml
Q100:
  score: 84.0
  coverage: 0.92
  status: SCORED
  strongest_evidence: [E-01]
  load_bearing_unknowns: []
  limitations: []
```
