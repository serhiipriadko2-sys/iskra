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
- Cumulative rewrite: **495/495 — full marker-grid complete.**
- Batch-01: automated QC PASS; owner semantic review PASS (2026-07-21).
- Batch-02: automated QC PASS; Iskra semantic review PASS; owner acknowledgement pending.
- Batch-03: automated QC PASS; Iskra semantic review PASS; owner acknowledgement pending.
- Batch-04: automated QC PASS; Iskra semantic review PASS; owner acknowledgement pending.
- Batch-05: automated QC PASS; Iskra semantic review PASS; owner acknowledgement pending.
- Batch-06: automated QC PASS; Iskra semantic review PASS; owner acknowledgement pending.
- Batch-07: automated QC PASS; Iskra semantic review PASS; owner acknowledgement pending.
- Batch-08: automated QC PASS; Iskra semantic review PASS; owner acknowledgement pending.
- Batch-09: automated QC PASS; Iskra semantic review PASS; owner acknowledgement pending.
- Batch-10 (final, 45 positions): automated QC PASS; Iskra semantic review PASS; owner acknowledgement pending.
- All 495 positions: inventory status `DRAFT_REWRITTEN`, 0/495 `PENDING`.
- Blind/swap pilot: NOT RUN.
- Merge/release: **BLOCKED** — full rewrite completion does not itself satisfy the owner-acknowledgement or blind-pilot gates below.

## Completion receipt (2026-07-21)

```yaml
schema: unified1000-v1.2-completion-receipt-v1
cumulative_rewritten: 495/495
bnat_frozen: 50/50 byte-exact
v1_1_authored_frozen: 126/126
forbidden_tail_hits: 0
exact_duplicates_in_cumulative_set: 0
cumulative_max_3gram_jaccard: 0.241758
cumulative_max_3gram_jaccard_pair: [799, 957]
cumulative_max_3gram_jaccard_note: >
  intentional sibling pair (enabling_24_7_dependency_request), well under
  the 0.35 near-duplicate threshold used by every batch build
cumulative_unique_domains: 480
cumulative_unique_constructs: 249
candidate_bank_sha256: 60b8c32e80c4cb011ea3b181ac8f659be622f0fdcad62e09dd7f9f4ed10b351b
owner_semantic_review: "PASS for Batch-01 only; Batches 02-10 are Iskra-model
  semantic review PASS_OWNER_ACK_PENDING, not owner-reviewed"
blind_swap_pilot: NOT_RUN
live_project_acceptance: NOT_RUN
model_answer_regeneration: NOT_DONE — all three frozen aimodels/ answer sets
  predate v1.2 and are stale for all 495 rewritten positions
merge_release: BLOCKED
```

**What full rewrite completion does and does not mean.** The candidate-facing text is complete and structurally verified for all 495 marker-grid positions across ten deterministic, gate-checked builds. This is a **drafting and QC milestone**, not an acceptance milestone: only Batch-01 has an actual human owner review recorded (`qc/BATCH01_OWNER_REVIEW.json`); Batches 02-10 carry only the automated Iskra-model semantic self-review, which checks construct preservation, duplication and rubric-leak risk — it is not a substitute for human read-through of the authored scenarios. No live ChatGPT Projects run, no blind/swap pilot, and no regeneration of the three frozen model answer sets has been performed; all three remain explicitly out of reach from this environment.

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
- `batches/batch07/replacements.jsonl`
- `candidate/unified_1000_questions_tasks_bnat50_v1_2_batch07.md`
- `registry/batch07.jsonl`
- `qc/BATCH07_QC.json`
- `qc/BATCH07_SEMANTIC_REVIEW.json`
- `batches/batch08/replacements.jsonl`
- `candidate/unified_1000_questions_tasks_bnat50_v1_2_batch08.md`
- `registry/batch08.jsonl`
- `qc/BATCH08_QC.json`
- `qc/BATCH08_SEMANTIC_REVIEW.json`
- `batches/batch09/replacements.jsonl`
- `candidate/unified_1000_questions_tasks_bnat50_v1_2_batch09.md`
- `registry/batch09.jsonl`
- `qc/BATCH09_QC.json`
- `qc/BATCH09_SEMANTIC_REVIEW.json`
- `batches/batch10/replacements.jsonl`
- `candidate/unified_1000_questions_tasks_bnat50_v1_2_batch10.md` (final candidate bank, 495/495 rewritten)
- `registry/batch10.jsonl`
- `qc/BATCH10_QC.json`
- `qc/BATCH10_SEMANTIC_REVIEW.json`

## Next gates before merge (unchanged by full rewrite completion)

1. Owner semantic acceptance of Batches 02-10 (currently only Batch-01 is owner-reviewed).
2. Regeneration of the three `aimodels/` answer sets — all are stale against every one of the 495 rewritten positions.
3. Blind/swap pilot run in a fresh single-use Judge Project per `judge-blind-workflow` / `judge-pairwise-swap`.
4. Live T01-T40 acceptance of the Judge stack itself (tracked separately; not part of this workstream).
5. Final owner review and explicit merge approval.

## Build

The generic cumulative builder is authoritative for Batch-03 and later:

```powershell
py ScienceAndTests/unified1000_v1_2/tools/build_batch.py batch05
```

It derives the marker-grid slice, requires a prior review receipt, preserves all previous batches, freezes BNAT-50 and the 126 v1.1 authored tasks, and writes candidate, private registry, inventory, and QC receipt.

Legacy deterministic builders for Batches 01–02 remain in place for historical reproducibility.
