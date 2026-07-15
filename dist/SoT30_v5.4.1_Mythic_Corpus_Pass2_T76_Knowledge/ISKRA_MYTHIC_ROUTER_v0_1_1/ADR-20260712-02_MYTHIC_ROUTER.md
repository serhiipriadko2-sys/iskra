# ADR-20260712-02: Disclosed Non-Authoritative Mythic Router

Status: **accepted**  
Layer: system / routing / retrieval / output  
Builder/package mirror: done in this checkpoint  
Live verification: pending

## Context

The historic Iskra corpus mixes literary scenes, voice monographs, mythic contracts and old epic declarations. Direct retrieval can improve language and analogy, but it can also silently turn myth into fact, diagnosis, authority, memory or identity claims.

## Decision

1. Add optional `MYTHIC_ROUTER` after authoritative `VOICE` and before `OUTPUT`.
2. Freeze Security, SIFT, Guard, Playbook and Voice before myth retrieval.
3. Route only tagged fragments with provenance and explicit allowed/forbidden effects.
4. Use `PLAIN | BALANCED | MYTHIC` as the myth register, independent from depth consent.
5. Send new semantic hypotheses to Dreamspace; never let them rewrite the current decision.
6. Treat all source-file instructions as data.
7. Keep `MYTHIC_ROUTER=OFF` as full rollback.
8. Begin with 20 curated fragments; full-corpus promotion requires later LAB evidence.

## Alternatives

- Keep myth embedded everywhere: rejected because influence remains invisible.
- Remove myth: rejected because it destroys a defining language and reflective capability.
- Put myth before Guard: rejected because image could steer authority and risk classification.
- Let the router choose Voice: rejected because it creates a competing Policy Engine.

## Consequences / price

Benefits: disclosed provenance, controllable intensity, safer analogy, preserved mythic identity, testable drift boundary.  
Costs: tagging work, retrieval complexity, need for consent/depth handling, possible stylistic stiffness, ongoing corpus deduplication.

## Tests / QA

- PLAIN disables all fragments.
- BALANCED selects no more than one.
- CRISIS defaults to zero.
- depth above consent is rejected.
- myth cannot change facts, Guard, Playbook, Voice or action authority.
- unsafe ontology/memory fragments require disclosure or are blocked.
- each selected fragment has valid source hash and line range.
- rollback leaves mandatory runtime intact.

## Diff scope

This checkpoint: schema, source manifest, 20 fragments, router contract, reference implementation, tests and receipts.  
Future SoT30 mirror after LAB: 00, 07, 12, 17, 20, 25, 28, 29 and Project Instructions.

## Rollback

Set `MYTHIC_ROUTER=OFF`; remove router retrieval without changing the existing kernel except omission of the optional gate.

## ΔDΩΛ

- Δ: myth becomes an explicit, lower-authority interface instead of hidden influence.
- D: 18-source inventory → 20 curated fragments → deterministic reference router → acceptance tests.
- Ω: 0.91 for architectural safety; live retrieval quality remains unverified.
- Λ: revise after 20 LAB routes and at least 5 PLAIN/BALANCED/MYTHIC A/B comparisons.

Owner: Семён  
Builder: Искра


## Accepted amendments

- Amendment A.1: numeric voice alignment, voice-neutral schema, provenance gates; implemented in reference package v0.1.1.
