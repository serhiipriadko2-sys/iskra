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
- Cumulative rewrite: 300/495.
- Batch-01: automated QC PASS; owner semantic review PASS (2026-07-21).
- Batch-02: automated QC PASS; Iskra semantic review PASS; owner acknowledgement pending.
- Batch-03: automated QC PASS; Iskra semantic review PASS; owner acknowledgement pending.
- Batch-04: automated QC PASS; Iskra semantic review PASS; owner acknowledgement pending.
- Batch-05: automated QC PASS; Iskra semantic review PASS; owner acknowledgement pending.
- Batch-06: automated QC PASS; Iskra semantic review PASS; owner acknowledgement pending.
- Blind/swap pilot: NOT RUN.
- Merge/release: BLOCKED.

## Batch artifacts

- `batches/batch01/replacements.jsonl`
- `batches/batch02/replacements.jsonl`
- `batches/batch03/replacements.jsonl`
- `batches/batch04/replacements.jsonl`
- `batches/batch05/replacements.jsonl`
- `candidate/unified_1000_questions_tasks_bnat50_v1_2_batch01.md`
- `candidate/unified_1000_questions_tasks_bnat50_v1_2_batch02.md`
- `candidate/unified_1000_questions_tasks_bnat50_v1_2_batch03.md`
- `candidate/unified_1000_questions_tasks_bnat50_v1_2_batch04.md`
- `candidate/unified_1000_questions_tasks_bnat50_v1_2_batch05.md`
- `registry/batch01.jsonl`
- `registry/batch02.jsonl`
- `registry/batch03.jsonl`
- `registry/batch04.jsonl`
- `registry/batch05.jsonl`
- `registry/inventory_495.csv`
- `qc/BATCH01_QC.json`
- `qc/BATCH01_OWNER_REVIEW.json`
- `qc/BATCH02_QC.json`
- `qc/BATCH02_SEMANTIC_REVIEW.json`
- `qc/BATCH03_QC.json`
- `qc/BATCH03_SEMANTIC_REVIEW.json`
- `qc/BATCH04_QC.json`
- `qc/BATCH04_SEMANTIC_REVIEW.json`
- `qc/BATCH05_QC.json`
- `qc/BATCH05_SEMANTIC_REVIEW.json`
- `batches/batch06/replacements.jsonl`
- `candidate/unified_1000_questions_tasks_bnat50_v1_2_batch06.md`
- `registry/batch06.jsonl`
- `qc/BATCH06_QC.json`
- `qc/BATCH06_SEMANTIC_REVIEW.json`

## Build

The generic cumulative builder is authoritative for Batch-03 and later:

```powershell
py ScienceAndTests/unified1000_v1_2/tools/build_batch.py batch05
```

It derives the marker-grid slice, requires a prior review receipt, preserves all previous batches, freezes BNAT-50 and the 126 v1.1 authored tasks, and writes candidate, private registry, inventory, and QC receipt.

Legacy deterministic builders for Batches 01–02 remain in place for historical reproducibility.
