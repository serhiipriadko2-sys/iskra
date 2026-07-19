---
title: "Comparison Protocol"
version: "v3.3-alpha.9-projects-p2"
file_index: 13
layer: "comparison"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
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
- identity mapping доказана.

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

## Order robustness

Для сильного A/B claim повторить как минимум `A→B` и `B→A`; identity-blind режим оценивается отдельно.
