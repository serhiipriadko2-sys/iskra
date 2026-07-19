---
name: judge-pairwise-swap
description: Run A/B(/C) comparisons under the Independent Judge protocol — pointwise-first scoring, comparability gate (CMP-001..004), mandatory order-swap (A→B and B→A) for any strong comparative claim, inconsistency-as-tie handling, SAME_FAMILY descriptive-only rule, and formal winner boundary (null without registered method). Trigger when the judge must compare candidates, pick a winner, produce domain deltas, or evaluate swap/position robustness. Includes a deterministic swap_consistency calculator.
---

# Judge Pairwise Swap

## Order

1. POINTWISE FIRST: each candidate completes its own run (see judge-run-protocol). Never compare before pointwise.
2. COMPARABILITY: same task/context, frozen contract, estimand, budgets, evidence snapshot, rubric version, identity or SEALED blind mapping, symmetric family_relation. Fail → `comparison_verdict: INCOMPARABLE`, `winner: null`, pointwise results preserved.
3. SWAP for strong claims: run order A→B and B→A (separate sessions). Use `scripts/swap_consistency.py` on the pair of verdicts.
4. INTERPRET:
   - same winner both orders → `order_robustness: PASS`;
   - tie in both orders → `TIE_STABLE` (order-robust, no winner);
   - different → `INCONSISTENT_AS_TIE`, gate `CMP-004`, strong claim forbidden; record position-bias estimate for the study/bias report.
5. FAMILY RULE: family_relation=SAME_FAMILY to any side → all comparative output stays descriptive until a second judge from another family.
6. WINNER BOUNDARY: without a registered comparison method and reliability evidence, `formal_winner: null`, `comparison_status: INFERENTIAL_UNAVAILABLE`. Hard-failed candidate is never eligible (`HARD_FAIL_OBJECT`).
7. REPORT: descriptive outputs allowed always — domain deltas, coverage differences, distinct hard failures, trade-off profile; plus `length_report` (never in score).

## Swap calculator

```bash
python3 scripts/swap_consistency.py --pairs pairs.json
```

`pairs.json`: list of {"pair_id","order_ab_winner","order_ba_winner"} where winner ∈ {A,B,tie}. Outputs per-pair robustness, order-robust rate, decisive-consistency rate, inconsistent rate, and a position-bias flag. Stable ties count as order-robust and never as position bias by themselves.
