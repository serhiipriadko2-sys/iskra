# ADR-20260721 — Unified-1000 v1.2 Template Diversification

Status: ACCEPTED (owner decision, 2026-07-21)
Implementation: PARTIAL — Batches 01–05 are 250/495; no merge or release claim

## Context

Unified-1000 v1.1 removed 495 visible variant markers but retained the underlying low-diversity template grid. Treating those prompts as 495 independent measurements would overstate effective sample size and invite pattern adaptation.

The 50 BNAT positions and the 126 v1.1 authored-strengthening positions are separate controlled sets and must remain unchanged during this pass.

## Decision

Create Unified-1000 v1.2 as a construct-preserving scenario-diversification release.

- Freeze BNAT-50 byte-for-byte.
- Freeze the 126 strengthened v1.1 tasks during the first pass.
- Rewrite only the 495 marker-grid positions.
- Preserve the measured construct while replacing the operational scenario.
- Remove universal authoring tails and candidate-visible evaluator hints.
- Maintain a private registry with construct, domain, difficulty, expected evidence, failure mode, sibling family, and contamination risk.
- Work in reviewable batches; automated QC does not substitute for semantic owner review or blind pilot evidence.
- Iskra model semantic review may authorize the next draft batch, but it does not equal owner acceptance or release promotion.

## Alternatives considered

1. Keep v1.1 and use holdout rotation only — rejected as insufficient for corpus diversity.
2. Lexically paraphrase all 495 prompts — rejected because it preserves the same kernels and correlations.
3. Rewrite all 1,000 prompts — rejected because it would destroy BNAT anchors and the accepted 126-task strengthening work.

## Consequences and price

- Every rewritten position invalidates frozen model answers for that task.
- After all 495 are rewritten, 621 task positions will require regenerated answers: the prior 126 plus the new 495.
- Three model sets therefore require 1,863 regenerated answers before a full 1,000-task comparison.
- The workstream needs manual semantic review and a blind/swap-controlled pilot before publication-grade claims.

## Diff scope

Allowed in this workstream:
- `ScienceAndTests/unified1000_v1_2/**`
- this ADR
- later, explicit release manifests and ledger updates after acceptance

Not allowed:
- mutation of the frozen rc.3 package
- changes to Judge runtime, Supabase, SoT30, or BNAT source material

## Tests and QA

Each batch must prove:
- exact target-ID set
- no overlap with BNAT-50 or the 126 frozen tasks
- all non-target task bodies unchanged
- no visible variant markers or universal authoring tails
- no exact duplicates and bounded semantic/lexical similarity
- complete private metadata
- manual construct-preservation review before promotion

## Rollback

Delete the unmerged v1.2 branch or revert batch commits. The merged rc.3 baseline remains unchanged and reproducible.

## Lifecycle

accepted: yes
implemented: partial, Batches 01–05, 250/495
Batch-01 owner semantic review: PASS (2026-07-21)
Batch-02 automated structural QC: PASS
Batch-02 Iskra model semantic review: PASS; owner acknowledgement pending
Batch-03 automated structural QC: PASS
Batch-03 Iskra model semantic review: PASS; owner acknowledgement pending
Batch-04 automated structural QC: PASS
Batch-04 Iskra model semantic review: PASS; owner acknowledgement pending
Batch-05 automated structural QC: PASS
Batch-05 Iskra model semantic review: PASS; owner acknowledgement pending
merged: no
deployed: no
invoked: no
verified-live: no

## ΔDΩΛ

Δ: replace marker-grid template dependence with construct-preserving scenario diversity.
D: ADR → 50-task batches → automated gates → semantic review → blind pilot → release decision.
Ω: high for structural isolation; provisional for construct validity until review and pilot.
Λ: any construct drift, BNAT overlap, hidden-rubric leak, or failed pilot blocks promotion and triggers rollback or rewrite.
