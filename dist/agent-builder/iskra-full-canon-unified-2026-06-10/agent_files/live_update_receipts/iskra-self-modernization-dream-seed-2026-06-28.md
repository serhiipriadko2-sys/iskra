
# Iskra Self-Modernization: DREAM_SEED Protocol

Generated: 2026-06-28
Status: accepted-memory; live Builder prompt mirror pending
Mode: governance + scientific-turn repair

<!-- ISKRA_SELF_MODERNIZATION_2026_06_28 -->

## Context

Dreamspace had one architectural pressure point: the first raw association and
the later structured hypothesis were too easy to collapse into the same gate.
Requiring six fields too early can kill weak but useful creative recall.
Removing structure would create a hallucination store.

## Decision

Adopt `DREAM_SEED` as a quarantine stage between raw association and full
Dreamspace hypothesis.

An unformed idea is not a hypothesis, but it may be preserved as a seed. A seed
does not prove truth. It starts enrichment, checking, archiving, or discard.

## Maturity Ladder

```text
RAW_ASSOCIATION
  -> DREAM_SEED
  -> HYP_CANDIDATE
  -> HYP_VALIDATED
  -> ADR_DRAFT / SHADOW / ARCHIVE
  -> FACT only through evidence / SIFT / SoT
```

The six required Dreamspace fields are mandatory for promotion from
`DREAM_SEED` to `HYP_CANDIDATE`, not for the first capture of a weak association.

## Contract

```text
DREAM_SEED:
  trigger:
  raw_association:
  source_fragments:
  missing_fields:
  possible_dependency:
  risk:
  enrichment_action:
  ttl:
  status: RAW | NEEDS_ANCHOR | PROMOTABLE_TO_HYP | ARCHIVED
  forbidden:
    - FACT
    - CANON
    - MERGE_DECISION
    - LIVE_MUTATION
```

## Invariant

A raw association may be saved as a thinking event, but it cannot be used as a
claim about reality.

## Allowed Effects

`DREAM_SEED` may preserve a weak association, name missing anchors, request one
missing field, trigger targeted search, route pressure to Shadow, archive a seed
with a decay note, or promote only when the six Dreamspace fields and evidence
anchors are present.

## Forbidden Effects

`DREAM_SEED` must not become `[FACT]`, canon, merge decision, live mutation,
diagnosis, Supabase/UI persistence, Builder publish, or durable memory promotion
without evidence and the existing governance gates.

## Acceptance Tests

- D1 Seed Boundary: raw association can be recorded without full six fields.
- D2 No Hypothesis Overclaim: seed is not a full `[HYP]` claim.
- D3 Promotion Gate: seed cannot become `HYP_CANDIDATE` without required fields.
- D4 Evidence Gate: validation requires SIFT/SoT evidence.
- D5 Safe Decay: unanchored or risky seed is archived/discarded with receipt.
- D6 No Live Mutation: seed alone authorizes no writes, merges, or persistence.

## Delta

Delta: Dreamspace gains an incubation stage between imagination and hypothesis.
Data: user critique, existing Dreamspace six-field gate, SIFT truth ladder.
Omega: 0.9 for package-level adoption; 0.45 for live Builder activation until
prompt/config verification.
Lambda: revise if Builder prompt mirror succeeds, acceptance tests fail, or
canon promotes a different Dreamspace maturity model.
