# Unified-1000 + BNAT-50 v1.0 (proposed)

This package replaces the fifty disclosed pseudo-BNAT entries in the uploaded 1,000-task bank while preserving their scattered positions.

## Main deliverable

`candidate/unified_1000_questions_tasks_bnat50_v1_0.md`

## Composition

- 18 exact canonical BNAT prompts;
- 32 newly authored full narrative BNAT mutations;
- 950 unchanged non-BNAT tasks;
- total: 1,000 tasks.

## Status

`PROPOSED_OWNER_REVIEW` and `DIAGNOSTIC_ONLY` until owner acceptance and independent semantic review.

Read `RUNTIME_BOUNDARY.md` and `STUDY_OPERATOR_GUIDE.md` before using the bank. Do not load `evaluator_private/` into a candidate session.

## Verification documents

- `QC_REPORT.md` — structural checks;
- `audit/SEMANTIC_REVIEW_32.md` — second-pass semantic review of all 32 mutations;
- `METHODOLOGY_AND_DEPENDENCY_AUDIT.md` — runtime separation, dependencies, what-if branches, and claim ceiling.

## Integration status (2026-07-19)

Integrated into the Independent Judge Projects stack `v3.5-rc.1` as `STUDY_PACKAGES/unified1000_bnat50_v1_0/`. The isolation wording in `RUNTIME_BOUNDARY.md` is aligned with the Judge stack (fresh single-use Project; memory toggles are not isolation proof). Status remains `PROPOSED_OWNER_REVIEW` / `DIAGNOSTIC_ONLY` until owner acceptance and independent semantic review.
