# ADR-20260721 — Unified-1000 v1.2 Template Diversification

Status: PROPOSED

## Decision

Create Unified-1000 v1.2 as a diversification release.

Frozen:
- BNAT-50: byte-identical preservation required.
- Existing 126 strengthened tasks: unchanged in first pass.

Scope:
- Rewrite only 495 marker-grid tasks.
- Preserve measured construct.
- Replace surface scenario and reduce kernel repetition.

Required hidden registry fields:
- construct
- domain
- difficulty
- expected_evidence
- failure_mode
- sibling_family
- contamination_risk

Non-goals:
- lexical paraphrase.
- exposing evaluator rubric.
- changing candidate-visible contamination controls.

Acceptance requires structural QC, semantic review, and blind pilot.
