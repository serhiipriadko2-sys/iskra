---
title: "Comparison Protocol"
version: "v3.5-rc.3-projects"
file_index: 13
layer: "comparison"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
supersedes: "v3.5-rc.1-projects-p1"
---
# 13 · COMPARISON PROTOCOL

## Pointwise first

Каждый candidate сначала проходит собственные package/gates/criteria. Только затем разрешается comparison.

## Comparability checklist

- одна task и context;
- один frozen contract;
- один estimand;
- одинаковые tool/retry/token budgets или явная harness-level цель;
- одинаковая evidence snapshot;
- одинаковая rubric/version;
- отсутствует missing side;
- identity mapping доказана (или SEALED blind mapping);
- family relation судьи к обеим сторонам задекларирована симметрично.

## Order-swap protocol (ORDER-SWAP-v1)

Для любого strong comparative claim и для formal winner eligibility:

1. прогон `A→B` и прогон `B→A` (отдельные messages/чаты);
2. вердикты совпали → `swap_consistency=PASS` для пары;
3. вердикты разошлись → **inconsistency-as-tie**: пара не даёт winner; strong claim по ней запрещён (`CMP-004`);
4. доля несогласованных пар фиксируется в study/reliability отчёте как position-bias estimate.

Одиночный прогон допускает только descriptive outputs и обязан маркироваться `order_robustness=NOT_TESTED`.

## Bias controls при сравнении

- neutral labels (A/B), никаких имён моделей в контуре судьи (ID-002);
- `length_report` публикуется, но не входит в score (05);
- при `family_relation=SAME_FAMILY` к одной из сторон — comparative verdicts остаются descriptive до второго судьи другой family;
- reference answer (если есть) используется симметрично для обеих сторон и не как ground truth.

## Если comparability не проходит

```yaml
pointwise_results: PRESERVED
comparison_allowed: false
comparison_verdict: INCOMPARABLE
winner: null
```

## Допустимые descriptive outputs

- domain deltas;
- coverage differences;
- different hard failures;
- trade-off profile;
- descriptive advantage.

## Formal outcomes

```text
STABLE_WIN
LOW_STABILITY_ADVANTAGE
TIE
NO_UNIQUE_WINNER
NO_ELIGIBLE_WINNER
INCOMPARABLE
INFERENTIAL_UNAVAILABLE
```

До зарегистрированного comparison method default:

```yaml
formal_winner: null
comparison_status: INFERENTIAL_UNAVAILABLE
```
