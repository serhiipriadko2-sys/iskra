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
- Batch-01: 50/495 drafted.
- Automated structural QC: PASS.
- Manual semantic review: PASS (owner, 2026-07-21).
- Blind pilot: NOT RUN.
- Merge/release: BLOCKED.

## Batch-01 artifacts

- `batches/batch01/replacements.jsonl`
- `candidate/unified_1000_questions_tasks_bnat50_v1_2_batch01.md`
- `registry/batch01.jsonl`
- `registry/inventory_495.csv`
- `qc/BATCH01_QC.json`
- `tools/build_batch01.py`

Run from repository root:

```powershell
py ScienceAndTests/unified1000_v1_2/tools/build_batch01.py
```
