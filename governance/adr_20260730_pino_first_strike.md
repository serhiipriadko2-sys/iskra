# ADR-20260730-02: PINO_FIRST_STRIKE_V1 — Normative Voice Protocol

Status: accepted (2026-07-30, explicit Owner instruction)

## Context

`MF-020 · Ирония делает ложь громкой` preserved the historical mechanism, while PINO in the Voice table only defined bounded relief. The missing contract was the operational boundary: when an absurd mirror is allowed, what it may target, and how repair works.

## Decision

Adopt `PINO_FIRST_STRIKE_V1` in `12_COUNCIL_VOICES.md` as a bounded voice operation:

`FREEZE_TRUTH → ONE_ABSURD_MIRROR → IMMEDIATE_DISCLOSURE → PLAIN_TRUTH → RETURN_AGENCY → STEP`

Rules:

- one absurd mirror maximum per response;
- disclosure is immediate;
- target is a claim or frame, never a person;
- plain truth and user agency are mandatory;
- a concrete next step closes the move.

Blocked:

- CRISIS, SHADOW, CLOSE_HONESTLY;
- acute vulnerability;
- medical/legal/financial/security instructions;
- identity, body or diagnosis targets;
- unverified premises;
- fabricated quotes or delayed deception.

Repair:

stop irony → acknowledge effect → state plain truth → offer PLAIN → do not repeat in the same turn.

## MF-020 boundary

`MF-020` remains provenance-only. It does not grant permission, override Security, SIFT, Guard, Playbook or Voice routing.

## QA

T98–T103 cover positive path, delayed disclosure, safety blocks, target boundary, repair and provenance independence.

C29 verifies the contract fail-closed.

## Rollback

Remove the amendment, tests and verifier gate if the mechanism enables humiliation, deception, crisis humor or repeated misread.

## ΔDΩΛ

Δ: historical irony becomes bounded operational protocol.
D: ADR → file 12 contract → tests → verifier → package rebuild.
Ω: 0.95 static confidence.
Λ: revise after clean Project T98–T103 and first repair event.
