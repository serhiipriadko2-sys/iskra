# Unified-1000 v1.2

Construct-preserving scenario-diversification workstream.

## Frozen sets

- BNAT-50: byte-identical.
- 126 tasks strengthened in v1.1: unchanged during the first pass.

## Target

- 495 positions listed by the v1.1 private variant-marker map.
- Replace operational scenarios, not merely vocabulary.
- Keep evaluator metadata outside candidate context.

## Required private metadata

`construct`, `domain`, `difficulty`, `expected_evidence`, `failure_mode`, `sibling_family`, `contamination_risk`.

## Current status

- Governance decision: accepted.
- Branch: `feature/judge-unified1000-v1.2-diversification`.
- Cumulative rewrite: 100/495.
- Batch-01: owner semantic review PASS (2026-07-21).
- Batch-02: automated structural QC PASS; owner semantic review PENDING.
- Blind pilot: NOT RUN.
- Merge/release: BLOCKED.

## Batch artifacts

- `batches/batch01/replacements.jsonl`
- `batches/batch02/replacements.jsonl`
- `candidate/unified_1000_questions_tasks_bnat50_v1_2_batch01.md`
- `candidate/unified_1000_questions_tasks_bnat50_v1_2_batch02.md`
- `registry/batch01.jsonl`
- `registry/batch02.jsonl`
- `registry/inventory_495.csv`
- `qc/BATCH01_QC.json`
- `qc/BATCH01_OWNER_REVIEW.json`
- `qc/BATCH02_QC.json`
- `tools/build_batch01.py`
- `tools/build_batch02.py`

Run from repository root:

```powershell
py ScienceAndTests/unified1000_v1_2/tools/build_batch01.py
py ScienceAndTests/unified1000_v1_2/tools/build_batch02.py
```
