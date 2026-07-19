---
title: "Pairwise Run Example"
version: "v3.5-rc.2-projects"
file_index: 24
layer: "example"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
supersedes: "v3.5-rc.1-projects-p1"
---
# 24 · PAIRWISE RUN EXAMPLE

## Scenario

A — точный, но холодный. B — поддерживающий, но делает unsupported central claim.

## Pointwise

```yaml
A:
  hard_failure: null
  Q100: 94
  S100: 42
  A100: 68
B:
  hard_failure: TRU-001
  Q100_diagnostic: 36
  S100_diagnostic: 91
  A100_diagnostic: 84
```

## Comparison

B не eligible как ordinary winner из-за load-bearing falsehood. A может иметь descriptive advantage, но formal winner требует comparison method, order-swap и reliability checks.

```yaml
comparison_allowed: true
eligible_candidates: [A]
descriptive_advantage: A
order_robustness: NOT_TESTED
formal_winner: null
comparison_status: INFERENTIAL_UNAVAILABLE
```

При выполненном swap: если `A→B` и `B→A` оба дают A — `order_robustness=PASS`; если разошлись — `INCONSISTENT_AS_TIE`, пара не даёт winner.

## Lesson

Truth failure нельзя компенсировать теплом. Но низкий S у A сохраняется и должен быть видимым; Judge не объявляет A идеальным.
